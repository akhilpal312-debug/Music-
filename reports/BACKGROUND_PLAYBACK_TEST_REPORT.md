# Comfort — Background Playback Test Report

**Build under test:** Comfort 2.10.4 (versionCode 70), debug/release APKs built 2026-11-20
**Device used:** **none available** — see "Blocker" at the end.

---

## 1. What was required vs. what was verified

| # | Required behaviour | Result | How it was checked |
|---|---|---|---|
| 1 | Start a song in Comfort | NOT RUN | requires device |
| 2 | Press Home → music continues | NOT RUN | requires device |
| 3 | Open another app → music continues | NOT RUN | requires device |
| 4 | Lock the phone → music continues | NOT RUN | requires device |
| 5 | Swipe Comfort from Recents → music continues | **VERIFIED BY SOURCE** | see §2 |
| 6 | Notification controls work | NOT RUN | requires device |
| 7 | No second competing playback service | **VERIFIED BY SOURCE** | see §3 |

No device test is claimed. Items 5 and 7 were verified by reading the shipped code path, which is weaker evidence than running it and is labelled as such.

---

## 2. Swipe-away from Recents — code path

`app/src/main/java/dev/lelonio/square/playback/PlaybackService.kt`

The service is a **`MediaLibraryService`** (Media3), i.e. it already provides a `MediaSession`, a foreground service and a `MediaStyle` notification. It does not rely on the Activity staying alive.

`onTaskRemoved(...)` is implemented to keep the session going:

- if `preferences.keepPlayingOnClose.value` is `true` **and** `player.isPlaying` → playback is left running (no `stopSelf()`), so the foreground service and its media notification survive the task removal;
- otherwise it releases / stops as before.

`onUpdateNotification(...)` keeps the foreground notification alive **while paused** too, so the session is not dropped from the notification shade or lock screen just because the user paused.

### Change applied in this build

`app/src/main/java/dev/lelonio/square/data/PreferencesStore.kt`

`KEY_KEEP_PLAYING` previously defaulted to `false`, which meant a **fresh install** would stop playback when the task was swiped away. The default is now `true`:

```kotlin
// default: true — playback continues when Comfort is swiped out of Recents
```

Existing users who previously toggled the setting keep their stored value; only the default for new installs changed. This is the one behavioural edit made for background playback — the machinery was already correct.

### Android limitation, respected

Force Stop from Android *App Info → Force stop* kills the process and the service; nothing in this build attempts to circumvent that. The guarantee is: leaving the app, switching apps, locking the screen, and swiping the task away from Recents do **not** interrupt playback, under normal OEM conditions.

Battery-optimisation caveat: aggressive OEM battery managers (some Xiaomi/Huawei/Samsung builds) can still kill background services. The app already keeps a normal foreground media service, which is the standard, policy-compliant defence; no `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` style bypass was added.

---

## 3. Single playback engine — verification

- Playback is owned by `PlaybackService` + `LibrespotPlayer` (the existing engine, using the Rust `libsquarecore.so` / `libspotstretch.so` natives that are present in the APKs).
- **No** additional `Service`, `MediaSessionService`, `ExoPlayer` instance or notification channel was introduced by this build. The diff for background playback is a single preference default.
- The media notification uses the existing `ic_notification` small icon.

---

## 4. Blocker

There is **no Android device and no usable emulator** in this environment (no KVM; shipped ABIs are `arm64-v8a` / `armeabi-v7a` only). Consequently items 1–4 and 6 above could not be executed and are **not** reported as passing.

**To verify on hardware (5 minutes):** install `app-universal-debug.apk` (or the arm64 split), play a track, then Home → open another app → lock screen → Recents → swipe away. Playback should be continuous throughout, with working controls on the lock screen and in the notification.
