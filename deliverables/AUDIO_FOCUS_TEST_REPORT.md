# Comfort — Audio Focus Test Report

**Build under test:** Comfort 2.10.4 (versionCode 70)
**Device used:** **none available** — see "Blocker".

---

## 1. Result summary

| Scenario | Result |
|---|---|
| A. Comfort plays normally | NOT RUN on device |
| B. Other app takes audio focus → Comfort pauses, position preserved | **VERIFIED BY SOURCE** |
| C. Other app releases focus → Comfort resumes from saved position | **VERIFIED BY SOURCE**, gated on interruption type |
| Manual pause is never overridden by auto-resume | **VERIFIED BY SOURCE** |
| Phone call handling | **VERIFIED BY SOURCE** (transient loss path) |
| Navigation prompts (duck) | **VERIFIED BY SOURCE** |
| Permanent focus loss | **VERIFIED BY SOURCE** |
| Real-app interop (YouTube / Instagram / browser) | NOT RUN on device |

---

## 2. Implementation audited

`app/src/main/java/dev/lelonio/square/playback/AudioFocusController.kt`

The existing controller already implements the full matrix requested, using the Android `AudioManager` focus APIs:

| Focus event | Behaviour | Auto-resume? |
|---|---|---|
| `AUDIOFOCUS_LOSS_TRANSIENT` (call, navigation takeover, another media app grabbing focus) | pause playback, set `pausedByFocusLoss = true` | yes, on `GAIN` |
| `AUDIOFOCUS_GAIN` | resume **only if** `pausedByFocusLoss` is set | only after an interruption-induced pause |
| `AUDIOFOCUS_LOSS` (permanent) | abandon focus, treat as a real stop; user resumes manually | **no** |
| `AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK` | duck volume instead of pausing | n/a (no pause) |
| Noisy receiver (`ACTION_AUDIO_BECOMING_NOISY` — headphones unplugged / Bluetooth disconnect) | pause | **no** — unplugging is treated as a user intent, not an interruption |

### Why the position and queue are preserved

- The pause path calls the player's normal pause — it does **not** call `stop()`, clear the queue, seek to zero, or reload the media item. Position, queue, repeat/shuffle and playlist context stay in the single existing player instance.
- There is no "restart from the beginning" fallback anywhere in the resume path; resume is a plain `play()` on the still-loaded item.
- There is no track advancement on interruption, so no song skipping and no playlist reset.

### Manual, user-initiated pause

`pausedByFocusLoss` is only ever set by the focus-loss callback. A user tapping pause in the app, the notification, the lock screen or a headset button goes through the ordinary pause path, leaving the flag `false`. When focus later returns, the resume branch is not taken — the app stays paused, exactly as the requirement demands.

### Change applied in this build

**None.** `AudioFocusController.kt` was audited and found already compliant with Section 4 of the prompt; editing it would have risked regressing working behaviour, which the prompt forbids ("preserve existing functionality"). The file is unmodified from the source the user supplied.

---

## 3. Blocker and how to verify

No Android device and no usable emulator in this environment (no KVM; ARM-only ABIs). Therefore **no interop test with real third-party apps was executed**, and nothing here is claimed as a passed device test.

**On-device script (3 minutes):**
1. Play a track in Comfort; note the position (e.g. 1:15).
2. Open YouTube and play any video → Comfort must pause, and the Comfort notification must still show the same track at ~1:15.
3. Watch 30 s of video, then pause/close YouTube → Comfort must resume at the paused position (not from 0:00, not the next track).
4. In Comfort press pause manually, then start and stop other audio → Comfort must **remain paused**.
5. Take a phone call (or simulate with a second device) → pause during the call, resume after the call ends.
6. Unplug headphones mid-playback → pauses, and does **not** auto-resume on re-plug.
