package dev.lelonio.square.playback

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import androidx.core.content.ContextCompat

/**
 * Audio focus and the "becoming noisy" broadcast.
 *
 * ExoPlayer does this for you; [SimpleBasePlayer][androidx.media3.common.SimpleBasePlayer]
 * does not, so a custom engine has to handle it or it will talk over phone calls
 * and keep playing out loud after the headphones are unplugged.
 *
 * Everything here runs on the main thread, which is where the player lives.
 */
class AudioFocusController(
    context: Context,
    private val onPause: () -> Unit,
    private val onResume: () -> Unit,
    private val onDuck: (ducked: Boolean) -> Unit,
    /** Whether to stop for another app taking the sound for good; see PreferencesStore. */
    private val pauseOnLoss: () -> Boolean = { true },
) {

    private val appContext = context.applicationContext
    private val audioManager = appContext.getSystemService(AudioManager::class.java)
    private val handler = Handler(Looper.getMainLooper())

    /** True when we paused ourselves and should resume once focus returns. */
    private var pausedByFocusLoss = false

    /** When to stop waiting for the other app to finish; see [watchQuiet]. */
    private var quietDeadline = 0L
    private var holdsFocus = false
    private var noisyReceiverRegistered = false

    private val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
        .setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build(),
        )
        // Told rather than ducked. The app still ducks rather than pauses for
        // a notification (onDuck, not onPause, on CAN_DUCK), but does it
        // itself: the reverb is an auxiliary effect on the output mix, which
        // the system's own ducking does not reach, so a song ducked by the
        // system came back as mostly room. Ducking here lowers both.
        .setWillPauseWhenDucked(true)
        .setOnAudioFocusChangeListener(::onFocusChange)
        .build()

    private val noisyReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action != AudioManager.ACTION_AUDIO_BECOMING_NOISY) return
            // A deliberate disconnect: do not resume when focus comes back.
            pausedByFocusLoss = false
            stopWatching()
            onPause()
        }
    }

    /**
     * Ask for focus before starting playback.
     *
     * @return false when the system refuses, in which case playback must not
     *   start — something else owns the output.
     */
    fun requestFocus(): Boolean {
        if (holdsFocus) return true

        val granted = audioManager.requestAudioFocus(request) ==
            AudioManager.AUDIOFOCUS_REQUEST_GRANTED
        if (granted) {
            holdsFocus = true
            registerNoisyReceiver()
        }
        return granted
    }

    /**
     * Release focus when playback stops or the user pauses.
     *
     * A pause the listener asked for, so nothing is expected to bring the song
     * back: the flag that would resume it goes, and with it any wait.
     */
    fun abandonFocus() {
        pausedByFocusLoss = false
        stopWatching()
        releaseFocus()
    }

    /** Lets go of the focus without deciding anything about resuming. */
    private fun releaseFocus() {
        if (!holdsFocus) return
        audioManager.abandonAudioFocusRequest(request)
        holdsFocus = false
        unregisterNoisyReceiver()
    }

    private fun onFocusChange(change: Int) {
        when (change) {
            AudioManager.AUDIOFOCUS_GAIN -> {
                onDuck(false)
                if (pausedByFocusLoss) {
                    pausedByFocusLoss = false
                    stopWatching()
                    onResume()
                }
            }

            // Someone took the output for good — a different player started.
            // Stop, and pick the song back up when they are finished: that is
            // what "paused because something else made a sound" means to a
            // listener, and without this half the song simply never came back.
            AudioManager.AUDIOFOCUS_LOSS -> {
                if (pauseOnLoss()) {
                    pausedByFocusLoss = true
                    onPause()
                    // The focus is theirs and abandoned here, so the next play
                    // asks for it again; the wait below is for the sound to
                    // stop, not for the focus to be handed back.
                    releaseFocus()
                    watchQuiet()
                } else {
                    android.util.Log.i("SquareFocus", "focus lost for good, playing on as asked")
                    abandonFocus()
                }
            }

            // A call, or another app that will hand focus back.
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> {
                pausedByFocusLoss = true
                // A call asks for the focus back itself, so nothing is polled
                // for it: the GAIN above is the signal, and it arrives.
                stopWatching()
                onPause()
            }

            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> onDuck(true)
        }
    }

    /**
     * Waits for whatever else was playing to stop, then resumes.
     *
     * An app that took the focus for good does not hand it back: it was not a
     * call that ends, it is another player with a queue of its own, and the
     * system's only answer for us afterwards is "ask again". Asking again
     * straight away would cut them off mid-song, which is exactly what the
     * focus rule was there to prevent — so this asks nothing until
     * [AudioManager.isMusicActive] says the output is quiet, and then asks once.
     *
     * Bounded, because a listener who moved to another app for an hour has not
     * asked for a song to start under them when they close it.
     */
    private fun watchQuiet() {
        quietDeadline = SystemClock.uptimeMillis() + QUIET_WATCH_MS
        handler.removeCallbacks(watcher)
        handler.postDelayed(watcher, QUIET_POLL_MS)
    }

    private fun stopWatching() = handler.removeCallbacks(watcher)

    private val watcher = object : Runnable {
        override fun run() {
            if (!pausedByFocusLoss) return
            if (SystemClock.uptimeMillis() > quietDeadline) {
                android.util.Log.i("SquareFocus", "nothing came back to hand over; staying paused")
                return
            }
            // Still somebody playing — us being paused means it is not us.
            if (audioManager.isMusicActive || !requestFocus()) {
                handler.postDelayed(this, QUIET_POLL_MS)
                return
            }
            pausedByFocusLoss = false
            onResume()
        }
    }

    private fun registerNoisyReceiver() {
        if (noisyReceiverRegistered) return
        ContextCompat.registerReceiver(
            appContext,
            noisyReceiver,
            IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY),
            ContextCompat.RECEIVER_NOT_EXPORTED,
        )
        noisyReceiverRegistered = true
    }

    private fun unregisterNoisyReceiver() {
        if (!noisyReceiverRegistered) return
        runCatching { appContext.unregisterReceiver(noisyReceiver) }
        noisyReceiverRegistered = false
    }

    /** Call from the service's onDestroy. */
    fun release() = abandonFocus()

    private companion object {
        /** How often the wait looks at whether the output has gone quiet. */
        const val QUIET_POLL_MS = 1_000L

        /** How long a song stays ready to resume after something else played. */
        const val QUIET_WATCH_MS = 10L * 60L * 1000L
    }
}
