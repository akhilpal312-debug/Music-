package dev.lelonio.square.update

import android.app.PendingIntent
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import dev.lelonio.square.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.security.MessageDigest

/**
 * Updates the app from its own GitHub releases.
 *
 * Square cannot go on the Play Store — it re-implements a protocol whose terms
 * forbid it — so there is nothing to deliver an update but the app itself. The
 * releases page is already the distribution channel; this reads it.
 *
 * Nothing here has to verify what it downloads against a hash published
 * somewhere else. Android refuses an update signed with a different key than
 * the installed copy, so an APK that is not the one built with the project's
 * keystore simply fails to install. What it does check is that the file is the
 * package and the key it claims to be, so a broken or half-fetched download is
 * said out loud instead of being handed to the installer to fail silently.
 */
class Updater(context: Context) {

    private val app = context.applicationContext
    private val json = Json { ignoreUnknownKeys = true }

    /**
     * Read and write timeouts long enough for a phone connection.
     *
     * OkHttp's defaults are ten seconds, which is a stall, not a slow network:
     * a release is fetched over mobile data on the other side of the world, and
     * a timeout in the middle of it is exactly the "downloaded a little, asked
     * again" this app used to show.
     */
    private val client = OkHttpClient.Builder()
        .connectTimeout(20, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
        .writeTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    /** Where the fetched APK waits, and the half files that lead to it. */
    private fun dir(): File = File(app.cacheDir, UPDATE_DIR).apply { mkdirs() }

    private fun apkFile(): File = File(dir(), UPDATE_APK)

    private fun partFile(): File = File(dir(), PART_APK)

    private fun partSourceFile(): File = File(dir(), PART_SOURCE)

    /** The last whole percent handed to the notification; see [download]. */
    private var lastReported = -1

    private val _state = MutableStateFlow<State>(State.Idle)
    val state: StateFlow<State> = _state.asStateFlow()

    sealed interface State {
        data object Idle : State
        data object Checking : State
        data object UpToDate : State
        data class Available(
            val version: String,
            val url: String,
            val bytes: Long,
            /**
             * What the release says about itself, as written on the releases
             * page.
             *
             * An update is a thing being asked for rather than announced, and
             * "there is a new version" is not enough to answer with. Empty when
             * the release carries no text, which is a release worth showing
             * anyway.
             */
            val notes: String = "",
        ) : State
        /** 0f..1f, or null while the server sends no length to measure against. */
        data class Downloading(val progress: Float?) : State
        /**
         * The new version is on disk and the installer has not been called yet.
         *
         * Kept as a state rather than committed straight from the service: the
         * confirmation Android puts up is an activity, and a background app
         * may not start one. The app commits this the moment it is actually in
         * front, so the dialog appears instead of being dropped on the floor.
         */
        data class Ready(val update: Available) : State
        /** Handed to the system installer; the dialog is Android's, not ours. */
        data object Installing : State
        /**
         * Something did not work, and [reason] is which of the constants below.
         *
         * Said on the sheet rather than kept to the log. The old silence is why
         * a signature mismatch and a dropped connection looked identical from
         * outside: the sheet simply came back, so pressing Update again was the
         * only thing to try and it did the same thing again.
         */
        data class Failed(val reason: String) : State
    }

    /**
     * Asks GitHub what the latest release is.
     *
     * [REPO] is this project's own repository, not the one the app was forked
     * from: an update has to be signed with the same key as the copy on the
     * phone, and only the builds published here are.
     *
     * Unauthenticated, which allows sixty requests an hour per address — far
     * more than the ten-minute check can spend.
     */
    suspend fun check() {
        _state.value = State.Checking
        val result = runCatching { withContext(Dispatchers.IO) { latestRelease() } }
            .getOrElse {
                android.util.Log.w(TAG, "check failed: $it")
                _state.value = State.Failed(REASON_NETWORK)
                return
            }

        if (result == null || !isNewer(result.version, BuildConfig.VERSION_NAME)) {
            // Nothing to install, so whatever a previous attempt left behind is
            // dead weight: twenty megabytes in a cache nobody will look at
            // again.
            clearDownload()
            _state.value = State.UpToDate
            return
        }
        _state.value =
            State.Available(result.version, result.url, result.bytes, result.notes)
    }

    /**
     * Checks, and installs whatever it finds, as one action.
     *
     * Split in two internally but never in the interface: "there is an update"
     * is not a decision the user has anything to decide with — they pressed a
     * row that says update, and being asked again is a step, not a safeguard.
     * The safeguard is Android's own dialog, which no app can skip.
     *
     * @return the update it could not install without permission, so the caller
     *   can ask for it and come back here rather than starting over.
     */
    suspend fun checkAndInstall(): State.Available? {
        check()
        val update = _state.value as? State.Available ?: return null
        if (!canInstall()) {
            _state.value = State.Failed(REASON_PERMISSION)
            return update
        }
        install(update)
        // Already on disk from an earlier attempt: nothing to wait for.
        if (_state.value is State.Ready) commit()
        return null
    }

    private data class Release(
        val version: String,
        val url: String,
        val bytes: Long,
        val notes: String,
    )

    private fun latestRelease(): Release? {
        val request = Request.Builder()
            .url("https://api.github.com/repos/$REPO/releases/latest")
            .header("Accept", "application/vnd.github+json")
            .build()

        client.newCall(request).execute().use { response ->
            // No release published yet is not a failure: there is simply
            // nothing to offer, which is the same answer as being current.
            if (response.code == 404) return null
            if (!response.isSuccessful) error("HTTP ${response.code}")
            val body = json.parseToJsonElement(response.body?.string().orEmpty()) as? JsonObject
                ?: return null
            val tag = body["tag_name"]?.jsonPrimitive?.content?.removePrefix("v") ?: return null
            val apks = (body["assets"] as? JsonArray)
                ?.filterIsInstance<JsonObject>()
                ?.filter { it["name"]?.jsonPrimitive?.content?.endsWith(".apk") == true }
                .orEmpty()
            // One APK per ABI and a universal one: the phone's own first, in
            // the order it prefers them, then the universal, then whatever
            // there is, for a release that ships a single APK.
            fun named(part: String) = apks.firstOrNull {
                it["name"]?.jsonPrimitive?.content?.contains(part) == true
            }
            val asset = android.os.Build.SUPPORTED_ABIS.firstNotNullOfOrNull(::named)
                ?: named("universal")
                ?: apks.firstOrNull()
                ?: return null
            val url = asset["browser_download_url"]?.jsonPrimitive?.content ?: return null
            val size = asset["size"]?.jsonPrimitive?.content?.toLongOrNull() ?: 0L
            val notes = body["body"]?.jsonPrimitive?.content.orEmpty().trim()
            return Release(tag, url, size, notes)
        }
    }

    /**
     * Starts bringing the update in: the fetch if there is one to do, the
     * installer if the APK is already here.
     *
     * The APK on disk is what makes the difference. Every press of Update used
     * to start the download from zero, so a phone whose download had finished
     * but whose install had not gone in spent twenty megabytes again to reach
     * the same place — which reads, exactly, as "it downloads and then asks me
     * again".
     */
    fun install(update: State.Available) {
        // A second press while the first is still running is a tap, not an
        // instruction.
        if (_state.value is State.Downloading || _state.value is State.Installing) return
        lastOffered = update
        if (!canInstall()) {
            _state.value = State.Failed(REASON_PERMISSION)
            return
        }
        if (cachedApk(update.version) != null) {
            _state.value = State.Ready(update)
            return
        }
        // Handed to a service rather than done here.
        //
        // This used to run in whatever scope the screen gave it, so leaving the
        // app — or merely opening the player — cancelled the download halfway
        // with nothing to show for it. See UpdateService.
        _state.value = State.Downloading(null)
        UpdateService.start(app, update)
    }

    /**
     * The download itself, called by the service that is allowed to finish it.
     *
     * @param onProgress told as often as the bytes arrive, so the notification
     *   can say how far along it is; null while the server sends no length.
     */
    suspend fun fetch(
        url: String,
        version: String,
        bytes: Long,
        onProgress: (Float?) -> Unit,
    ) {
        val update = State.Available(version, url, bytes)
        _state.value = State.Downloading(null)
        onProgress(null)

        val file = runCatching {
            withContext(Dispatchers.IO) { download(update, onProgress) }
        }.getOrElse {
            android.util.Log.w(TAG, "download failed: $it")
            _state.value = State.Failed(REASON_NETWORK)
            return
        }

        // Checked before the installer sees it, so a half file or an APK from
        // somewhere else is named here rather than being refused by Android
        // with a dialog that says nothing.
        val problem = verify(file, update)
        if (problem != null) {
            file.delete()
            _state.value = State.Failed(problem)
            return
        }
        _state.value = State.Ready(update)
    }

    /**
     * Hands the fetched APK to the system installer.
     *
     * Called by the app once it is in front, because the confirmation Android
     * puts up is an activity of its own and a background app cannot open one.
     * Nothing is asked of the listener here: the dialog is the only step left,
     * and it is the platform's, not ours.
     */
    suspend fun commit() {
        val ready = _state.value as? State.Ready ?: return
        if (!canInstall()) {
            _state.value = State.Failed(REASON_PERMISSION)
            return
        }
        val apk = apkFile()
        if (!apk.exists()) {
            // The system reclaimed the cache between the download and now.
            // Offered again rather than left with nothing to install.
            _state.value = ready.update
            return
        }
        runCatching { withContext(Dispatchers.IO) { handOver(apk) } }
            .onSuccess { _state.value = State.Installing }
            .onFailure {
                android.util.Log.w(TAG, "install failed: $it")
                _state.value = State.Failed(REASON_INSTALL)
            }
    }

    /**
     * Opens the system installer on the fetched file.
     *
     * An ordinary view intent on an `application/vnd.android.package-archive`
     * URI, which is how every app that lives outside a store installs itself.
     * It went through [PackageInstaller] before, and that is the more correct
     * API — but it reports back by broadcast, the dialog only appears when that
     * broadcast is handled, and a session that failed at any point in between
     * left nothing on screen at all. The intent always has somewhere to land,
     * and its refusals are Android's own words rather than silence.
     */
    private fun handOver(apk: File) {
        val uri: Uri = FileProvider.getUriForFile(app, "${app.packageName}.reports", apk)
        val intent = Intent(Intent.ACTION_VIEW)
            .setDataAndType(uri, "application/vnd.android.package-archive")
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        runCatching { app.startActivity(intent) }
            .getOrElse { thrown ->
                if (thrown !is ActivityNotFoundException) throw thrown
                // No file manager on the phone accepts an APK view: fall back to
                // the session API, which needs nothing installed to show its
                // dialog.
                commitSession(apk)
            }
    }

    /** The [PackageInstaller] route, used only when no installer activity resolves. */
    private fun commitSession(apk: File) {
        val installer = app.packageManager.packageInstaller
        val params = PackageInstaller.SessionParams(
            PackageInstaller.SessionParams.MODE_FULL_INSTALL,
        )
        val sessionId = installer.createSession(params)
        installer.openSession(sessionId).use { session ->
            session.openWrite("square", 0, apk.length()).use { output ->
                apk.inputStream().use { it.copyTo(output) }
                session.fsync(output)
            }
            session.commit(
                PendingIntent.getBroadcast(
                    app,
                    0,
                    Intent(app, InstallReceiver::class.java)
                        .setPackage(app.packageName),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE,
                ).intentSender,
            )
        }
    }

    /**
     * Fetches the APK, continuing a file a previous attempt left half done.
     *
     * The `Range` header is what makes a retry cheaper than the first attempt
     * rather than identical to it: a twenty-megabyte download that dies at
     * ninety percent should cost the last ten, not the whole thing again.
     */
    private fun download(update: State.Available, onProgress: (Float?) -> Unit): File {
        val part = partFile()
        // What the half file belongs to. A part file continued for a different
        // release would end at the wrong length at best and be a mixture of two
        // downloads at worst, so a part that is not this release's starts over.
        val source = partSourceFile()
        val wanted = "${update.version}|${update.url}"
        if (source.readTextOrNull() != wanted) {
            part.delete()
            runCatching { source.writeText(wanted) }
        }
        // Longer than the release is a stale file from another release.
        if (update.bytes > 0 && part.length() > update.bytes) part.delete()
        val already = part.length()
        lastReported = -1

        val request = Request.Builder()
            .url(update.url)
            .apply { if (already > 0) header("Range", "bytes=$already-") }
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) error("HTTP ${response.code}")
            val body = response.body ?: error("empty body")
            // 206 is the server agreeing to continue; anything else means the
            // whole file, so what is on disk is thrown away rather than
            // appended to.
            val resuming = response.code == 206 && already > 0
            if (!resuming) part.delete()
            var written = if (resuming) part.length() else 0L
            val remaining = body.contentLength()
            val total = when {
                remaining > 0 -> written + remaining
                update.bytes > 0 -> update.bytes
                else -> 0L
            }

            body.byteStream().use { input ->
                FileOutputStream(part, resuming).use { output ->
                    val buffer = ByteArray(64 * 1024)
                    while (true) {
                        val read = input.read(buffer)
                        if (read < 0) break
                        output.write(buffer, 0, read)
                        written += read
                        if (total > 0) {
                            val progress = (written.toFloat() / total).coerceIn(0f, 1f)
                            _state.value = State.Downloading(progress)
                            // Rounded to a percent before it is reported: a
                            // notification redrawn on every sixty-fourth
                            // kilobyte is three hundred redraws for a number
                            // that changed a hundred times.
                            val step = (progress * 100).toInt()
                            if (step != lastReported) {
                                lastReported = step
                                onProgress(progress)
                            }
                        }
                    }
                }
            }

            if (total > 0 && part.length() != total) {
                error("incomplete: ${part.length()} of $total bytes")
            }
        }

        val target = apkFile()
        target.delete()
        if (!part.renameTo(target)) {
            part.copyTo(target, overwrite = true)
            part.delete()
        }
        return target
    }

    /**
     * What is wrong with [file], or null when it is what it should be.
     *
     * The signature is compared with the installed app's rather than with a
     * hash kept in the sources: the platform will refuse a different key
     * anyway, and the useful thing to say beforehand is that this file is not
     * signed by the key this app was installed with.
     */
    private fun verify(file: File, update: State.Available): String? {
        if (!file.exists() || file.length() == 0L) return REASON_NETWORK
        if (update.bytes > 0 && file.length() != update.bytes) return REASON_NETWORK

        val archive = runCatching {
            app.packageManager.getPackageArchiveInfo(file.absolutePath, signingFlags())
        }.getOrNull() ?: return REASON_PACKAGE

        if (archive.packageName != app.packageName) return REASON_PACKAGE
        if (archive.versionName != update.version) return REASON_VERSION

        val theirs = certificates(archive)
        val ours = runCatching {
            certificates(app.packageManager.getPackageInfo(app.packageName, signingFlags()))
        }.getOrNull().orEmpty()
        if (ours.isNotEmpty() && theirs != ours) return REASON_SIGNATURE
        return null
    }

    /**
     * The APK on disk, if it is the release being offered and it passes the
     * same checks a fresh download would.
     */
    private fun cachedApk(version: String): File? {
        val apk = apkFile()
        if (!apk.exists()) return null
        val update = State.Available(version, "", apk.length())
        if (verify(apk, update) != null) {
            apk.delete()
            return null
        }
        return apk
    }

    /**
     * Whether a fetched APK is waiting to be installed.
     *
     * The sheet asks this before starting a fetch it has already done: an
     * update that is downloaded but not yet installed is opened straight at
     * Android's confirmation at every launch, without twenty megabytes being
     * fetched again to reach the same dialog.
     */
    fun hasCachedApk(): Boolean = apkFile().exists()

    /** Whether the user has allowed this app to install packages at all. */
    fun canInstall(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.O || app.packageManager.canRequestPackageInstalls()

    /**
     * The settings page where that permission is granted.
     *
     * No `NEW_TASK` flag: it is started for a result, so the caller is told when
     * the user comes back and can carry on with the install they already asked
     * for rather than making them press the row a second time.
     */
    fun permissionIntent(): Intent =
        Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES)
            .setData(Uri.parse("package:${app.packageName}"))

    fun dismiss() {
        _state.value = State.Idle
    }

    /**
     * After a trip to the installer: done, or still waiting.
     *
     * Nothing moves the state off [State.Installing] on the intent route — the
     * installer's answer never comes back to us — so the app asks itself the
     * only question that matters when it comes to the front again: is the
     * version running the one that was offered? If it is, the update is over
     * and the sheet must not come back. If it is not, the confirmation was put
     * away, and the release is still waiting with its APK already on disk.
     */
    fun reconcile() {
        if (_state.value !is State.Installing) return
        val offered = lastOffered
        if (offered != null && !isNewer(offered.version, installedVersion())) {
            clearDownload()
            _state.value = State.Idle
            return
        }
        _state.value = offered ?: State.Idle
    }

    /** Deleting the fetched APK: it has been installed, or it is not wanted. */
    fun clearDownload() {
        apkFile().delete()
        partFile().delete()
        partSourceFile().delete()
    }

    private fun installedVersion(): String = runCatching {
        app.packageManager.getPackageInfo(app.packageName, 0).versionName
    }.getOrNull().orEmpty()

    /** What was last sent to the installer, to offer again if it did not go in. */
    private var lastOffered: State.Available? = null

    /**
     * The installer did not install it: its dialog cancelled, or the install
     * refused.
     *
     * Offered again rather than left at [State.Installing]. Nothing else moves
     * the state on from there on the session route, so a dialog cancelled by
     * mistake hid the update until the next release came out (#151).
     */
    fun installAbandoned() {
        if (_state.value !is State.Installing) return
        _state.value = lastOffered ?: State.Idle
    }

    companion object {
        private const val TAG = "Updater"

        const val REPO = "akhilpal312-debug/Music-"

        /** Where the fetched APK waits until the app is in front to install it. */
        private const val UPDATE_APK = "update.apk"

        /**
         * The folder it waits in.
         *
         * Its own directory rather than the cache root, because it is the one
         * folder named in the FileProvider's paths: Android's installer reads
         * the APK through a content URI, and a root that is a single file is a
         * narrower thing than the provider can express reliably.
         */
        private const val UPDATE_DIR = "updates"

        /** A download in progress, kept so a retry continues instead of restarting. */
        private const val PART_APK = "update.apk.part"

        /** Which release [PART_APK] is a part of, so another one does not resume it. */
        private const val PART_SOURCE = "update.apk.part.source"

        private fun File.readTextOrNull(): String? =
            runCatching { takeIf { it.exists() }?.readText() }.getOrNull()

        /** Told apart from a network failure so the UI can offer the way out. */
        const val REASON_PERMISSION = "permission"

        /** Anything that stopped the file arriving whole. */
        const val REASON_NETWORK = "network"

        /** The file is not this app: another package name, or not an APK. */
        const val REASON_PACKAGE = "package"

        /** The file is this app but not the release it was fetched for. */
        const val REASON_VERSION = "version"

        /** Signed with a key other than the one this copy was installed with. */
        const val REASON_SIGNATURE = "signature"

        /** The installer itself refused, or nothing on the phone could open it. */
        const val REASON_INSTALL = "install"

        /** The signing certificates of a package, installed or from an APK file. */
        private fun certificates(info: android.content.pm.PackageInfo): Set<String> {
            val signers = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                info.signingInfo?.apkContentsSigners
            } else {
                @Suppress("DEPRECATION")
                info.signatures
            }
            val digest = MessageDigest.getInstance("SHA-256")
            return signers.orEmpty().map { signature ->
                digest.reset()
                digest.digest(signature.toByteArray()).joinToString("") { "%02x".format(it) }
            }.toSet()
        }

        /** Which certificates to read: the 28+ field, or the old `signatures` below it. */
        private fun signingFlags(): Int =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                PackageManager.GET_SIGNING_CERTIFICATES
            } else {
                @Suppress("DEPRECATION")
                PackageManager.GET_SIGNATURES
            }

        /**
         * Compares two dotted versions numerically.
         *
         * String comparison would put 1.10.0 before 1.9.0, which is exactly the
         * release where a self-updater stops offering updates and nobody
         * notices for a month.
         */
        fun isNewer(candidate: String, installed: String): Boolean {
            val a = candidate.split('.').map { it.takeWhile(Char::isDigit).toIntOrNull() ?: 0 }
            val b = installed.split('.').map { it.takeWhile(Char::isDigit).toIntOrNull() ?: 0 }
            for (i in 0 until maxOf(a.size, b.size)) {
                val left = a.getOrElse(i) { 0 }
                val right = b.getOrElse(i) { 0 }
                if (left != right) return left > right
            }
            return false
        }
    }
}
