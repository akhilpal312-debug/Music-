package dev.lelonio.square.data

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit

/**
 * The app's one ask of its own: a star on the repository it is published from.
 *
 * Square cannot be listed in a store, so there is no listing to rate and no
 * ranking to climb — the repository is the whole of its shopfront, and a star
 * is what puts it in front of the next person looking for it.
 *
 * Everything about the ask is read from a file in that repository
 * ([CONFIG_URL]), not from the APK: whether it is on at all, after how many
 * openings, how long "later" lasts, and the words and page it uses. Changing
 * that file changes the ask in every installed copy within [CONFIG_TTL_MS],
 * with no release cut and nothing to install. The compiled defaults below are
 * what a phone uses when the file cannot be read, so the feature never depends
 * on the network answering.
 *
 * Once answered it is answered: a star is written down and never asked for
 * again, and "later" keeps quiet for the interval the file names. Nothing here
 * asks twice inside one interval, which is the difference between a request and
 * a nag.
 */
class StarPromptStore(context: Context) {

    private val app = context.applicationContext
    private val prefs = app.getSharedPreferences(FILE_NAME, Context.MODE_PRIVATE)
    private val json = Json { ignoreUnknownKeys = true }

    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    /**
     * What the ask looks like, as the repository describes it.
     *
     * Empty [title] and [body] mean "use the app's own words": the strings are
     * shipped with the app so the ask reads in its own voice, and the file only
     * has to say something when the wording should change without a release.
     */
    data class Config(
        val enabled: Boolean = true,
        val minLaunches: Int = 3,
        val intervalDays: Int = 7,
        val repo: String = "akhilpal312-debug/Music-",
        val title: String = "",
        val body: String = "",
    ) {
        /** The page the star button opens. */
        val url: String get() = "https://github.com/$repo"
    }

    /** One more opening of the app, counted towards [Config.minLaunches]. */
    fun noteLaunch() {
        prefs.edit().putInt(KEY_LAUNCHES, launches() + 1).apply()
    }

    fun launches(): Int = prefs.getInt(KEY_LAUNCHES, 0)

    /**
     * Whether this opening is one to ask on.
     *
     * Not on the first openings, which are somebody setting the app up, and not
     * while a "later" is still running. A star already given or a permanent
     * "no" ends it for good.
     */
    fun shouldAsk(now: Long, config: Config): Boolean {
        if (!config.enabled) return false
        if (prefs.getBoolean(KEY_STARRED, false)) return false
        if (prefs.getBoolean(KEY_NEVER, false)) return false
        if (launches() < config.minLaunches) return false
        return now >= prefs.getLong(KEY_SNOOZED_UNTIL, 0L)
    }

    /** The star was given, or the button that leads to it was taken: done. */
    fun starred() {
        prefs.edit().putBoolean(KEY_STARRED, true).apply()
    }

    /** "No" without a star, which is also an answer and is kept as one. */
    fun never() {
        prefs.edit().putBoolean(KEY_NEVER, true).apply()
    }

    /** Put away for [days], counted from [now]. */
    fun later(now: Long, days: Int) {
        val until = now + days.coerceIn(1, 365) * DAY_MS
        prefs.edit().putLong(KEY_SNOOZED_UNTIL, until).apply()
    }

    /**
     * The ask's current settings.
     *
     * [CONFIG_URL] is read at most once per [CONFIG_TTL_MS] and the last answer
     * is kept, so an offline phone keeps the wording it last saw rather than
     * falling back to the compiled defaults mid-way. Anything unreadable is
     * simply the defaults: a config file is not worth an error on screen.
     */
    suspend fun config(now: Long = System.currentTimeMillis()): Config {
        val cachedRaw = prefs.getString(KEY_CONFIG, null)
        val cached = parse(cachedRaw)
        val fresh = now - prefs.getLong(KEY_CONFIG_FETCHED, 0L) < CONFIG_TTL_MS
        if (cached != null && fresh) return cached

        val raw = fetchConfig()
        if (raw.isNullOrBlank()) return cached ?: Config()
        val fetched = parse(raw) ?: return cached ?: Config()
        prefs.edit()
            .putString(KEY_CONFIG, raw)
            .putLong(KEY_CONFIG_FETCHED, now)
            .apply()
        return fetched
    }

    private suspend fun fetchConfig(): String? = withContext(Dispatchers.IO) {
        runCatching {
            val request = Request.Builder()
                .url(CONFIG_URL)
                // The raw host serves a cached copy; the CDN's own cache is
                // short, and the TTL here is what actually paces the reads.
                .build()
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return@use null
                response.body?.string()
            }
        }.getOrNull()
    }

    private fun parse(raw: String?): Config? {
        if (raw.isNullOrBlank()) return null
        return runCatching {
            val obj = json.parseToJsonElement(raw) as? JsonObject ?: return@runCatching null
            Config(
                enabled = obj["enabled"]?.jsonPrimitive?.booleanOrNull ?: true,
                minLaunches = obj["minLaunches"]?.jsonPrimitive?.intOrNull
                    ?.coerceIn(1, 100) ?: 3,
                intervalDays = obj["intervalDays"]?.jsonPrimitive?.intOrNull
                    ?.coerceIn(1, 365) ?: 7,
                repo = obj["repo"]?.jsonPrimitive?.contentOrNull
                    ?.takeIf { it.isNotBlank() } ?: "akhilpal312-debug/Music-",
                title = obj["title"]?.jsonPrimitive?.contentOrNull.orEmpty().trim(),
                body = obj["body"]?.jsonPrimitive?.contentOrNull.orEmpty().trim(),
            )
        }.getOrNull()
    }

    companion object {
        private const val FILE_NAME = "square_star"

        private const val KEY_LAUNCHES = "launches"
        private const val KEY_STARRED = "starred"
        private const val KEY_NEVER = "never"
        private const val KEY_SNOOZED_UNTIL = "snoozed_until"
        private const val KEY_CONFIG = "config"
        private const val KEY_CONFIG_FETCHED = "config_fetched"

        /** The repository the app is published from, and its star page. */
        const val REPO = "akhilpal312-debug/Music-"
        const val REPO_URL = "https://github.com/$REPO"

        /**
         * The file that decides how the ask behaves.
         *
         * Editing it on the repository's main branch is the whole release
         * process for a change of wording, timing or an off switch: installed
         * copies pick it up on their own within [CONFIG_TTL_MS].
         */
        const val CONFIG_URL = "https://raw.githubusercontent.com/$REPO/main/docs/star.json"

        /** How long a read of [CONFIG_URL] is trusted before it is asked again. */
        private const val CONFIG_TTL_MS = 6 * 60 * 60 * 1000L

        private const val DAY_MS = 24 * 60 * 60 * 1000L
    }
}
