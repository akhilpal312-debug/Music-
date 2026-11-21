# Comfort — QA Report

**Application:** Comfort (internal package `dev.lelonio.square`, versionName `2.10.4`, versionCode 70)
**Build date:** 2026-11-21 (logo/branding rebuild)
**Report scope:** everything that was actually executed, plus an explicit list of what could not be executed.

---

## 1. Environment and constraints (read this first)

| Item | Status |
|---|---|
| Build host | Linux x86_64 cloud VM, **no root / no sudo** ("no new privileges" flag set) |
| JDK | Temurin 21.0.13.1+2 (portable, `toolchain/jdk-21.0.13.1+2`) |
| Android SDK | `compileSdk 37`, build-tools 37.0.0, platform-tools r37.0.3 (portable, `toolchain/android-sdk`) |
| NDK / CMake | NDK 28.2.13676358, CMake 3.22.1 |
| Rust | `aarch64-linux-android` + `armv7-linux-androideabi`, cargo-ndk 4.1.2 |
| Gradle / AGP | Gradle 9.3.0, AGP 8.13.2 |
| **Physical device** | **None available** |
| **Emulator** | **Not usable** — no KVM in this VM, and the produced native ABIs are `arm64-v8a` / `armeabi-v7a` only |

**Consequence:** every runtime/on-device test item below is reported as **NOT RUN — no device**. Nothing in this report claims a device test passed. Where a behaviour was checked, it was checked by reading the shipped source, by the Kotlin compiler, by the unit test suite, or by inspecting the built APK contents — and each item says which.

---

## 2. Checks that actually ran

### 2.1 Kotlin compilation
```
./gradlew :app:compileDebugKotlin --no-daemon
→ BUILD SUCCESSFUL
```
All Kotlin edits (branding, developer section, preferences default) compile. Only warnings, no errors. Log: `gradle-compile3.log`.

### 2.2 Debug APKs
```
./gradlew :app:assembleDebug --no-daemon
→ BUILD SUCCESSFUL in 2m 37s  (66 tasks; cargoBuild rebuilt libsquarecore for both ABIs)
```
| Artifact | Size |
|---|---|
| `app-arm64-v8a-debug.apk` | 52,008,996 B (≈49.6 MiB) |
| `app-armeabi-v7a-debug.apk` | 48,550,732 B (≈46.3 MiB) |
| `app-universal-debug.apk` | 60,986,504 B (≈58.2 MiB) |

Both `cargoBuild` (Rust `libsquarecore.so`, 9.8 MB) and the CMake `Bungee` target ran as part of this build, and `libsquarecore.so`, `libspotstretch.so`, `libffmpegJNI.so` are present in the APKs. Log: `gradle-apk.log`.

### 2.3 Unit tests
```
./gradlew :app:testDebugUnitTest --no-daemon
→ BUILD SUCCESSFUL
```
Parsed from `app/build/test-results/testDebugUnitTest/*.xml`:

```
suites = 15   tests = 62   failures = 0   errors = 0   skipped = 0
```

These are the project's existing JVM unit tests. They cover pure-Kotlin logic; **they do not and cannot exercise Android audio focus, service lifecycles, or media sessions.**

### 2.4 Release APK + AAB
```
./gradlew :app:testDebugUnitTest :app:assembleRelease -PdisableAbiSplits=true --no-daemon
→ BUILD SUCCESSFUL in 4m 45s   (121 tasks)
./gradlew :app:bundleRelease -PdisableAbiSplits=true --no-daemon
→ BUILD SUCCESSFUL in 18s
./gradlew :app:assembleRelease --no-daemon        # per-ABI release APKs
→ see build/logs/release-splits.log
```
Logs: `build/logs/assembleDebug.log`, `build/logs/release.log`, `build/logs/bundle.log`, `build/logs/release-splits.log`.

| Artifact | Size | SHA-256 |
|---|---|---|
| `Comfort-2.10.4-universal-release.apk` | 27,365,971 B (≈26.1 MiB) | `07f77de0bad46bc8f0adea0c470d4d8d15d808e99eb14f57500f672c1ce03fae` |
| `Comfort-2.10.4-release.aab` | 25,094,504 B (≈23.9 MiB) | `622fe38f1f7618202964b8b159677755d98da4224fed141b1fc3d7627520d40c` |
| `Comfort-2.10.4-universal-debug.apk` | 60,986,504 B (≈58.2 MiB) | — |

Release APK contains exactly two native ABIs, 4 `.so` files each (`arm64-v8a`, `armeabi-v7a`).

`aapt2 dump badging` on the release APK: `application-label:'Comfort'` in **all 85 locale variants**, `application: label='Comfort'`, `launchable-activity: dev.lelonio.square.ui.MainActivity`, `versionCode 70`, `versionName 2.10.4`, `minSdk 26`, `targetSdk 35`.

`apksigner verify --print-certs`: `CN=Android Debug` — consistent with the signing caveat below.

**Signing caveat:** the project has no `keystore.properties`, so the release build falls back to the **debug signing key**. The APK installs and runs on a device, but it is **not Play-Store-distributable**. A real upload key must be configured before publishing to Google Play.

---

## 3. Branding — verification performed

Verified by grepping the built source (commands and results below), not by screenshot.

| Check | Method | Result |
|---|---|---|
| Settings footer text | `grep -n VERSION_NAME .../SettingsScreen.kt` | `940: "Comfort ${BuildConfig.VERSION_NAME}"`, `1275: "Comfort ${BuildConfig.VERSION_NAME}"` — **both footers fixed** |
| `app_name` | `grep app_name values/strings.xml` | `<string name="app_name">Comfort</string>` |
| `Square` in any `strings.xml` (all 12 locales) | `grep -rn Square app/src/main/res/values*/strings.xml` | **0 matches** |
| Developer name | `grep DEVELOPER_NAME` | `private const val DEVELOPER_NAME = "Akhil"` |
| Instagram URL | `grep INSTAGRAM_URL` | `"https://www.instagram.com/iamakhil_yt/"`, opened via `uriHandler.openUri(...)` |
| Developer portrait | `grep dev_akhil` | `painterResource(R.drawable.dev_akhil)` in the existing `Image(...)` slot, `contentDescription = DEVELOPER_NAME` |
| Remaining `Square` literals in Kotlin | `grep '"[^"]*Square[^"]*"'` | Only **log tags** (`"SquarePlayer"`, `"SquareNetwork"`, `"SquareStretch"`, `"SquareSession"`, …). These are internal technical identifiers and were intentionally preserved. |

### 3.1 Supplied Comfort logo and launcher icon — verified in the shipped APK

The launcher icon, adaptive foreground, round icon, monochrome icon, in-app `ic_app_mark` and `ic_notification` were all regenerated from the single supplied asset `logo_no_watermark.png` (the white C-wave mark on `#181C1D`), copied into the project as `app/icon-src/comfort-logo.png`. No artwork was invented, traced, generated or recoloured; the mark was only cropped from its plate and scaled per density.

| Check | Method | Result |
|---|---|---|
| Release APK ships the new artwork | extracted every `res/*.png` from `app-release.apk`, decoded each and compared pixels with the generated sources | `ic_launcher`, `ic_app_mark`, `ic_notification` each matched a packaged resource **pixel-for-pixel** (`res/o-.png`, `res/hJ.png`, `res/Kf.png`) |
| Adaptive icon layers | `aapt2 dump resources` | `mipmap/ic_launcher` + `ic_launcher_foreground` present for mdpi→xxxhdpi, `mipmap/ic_launcher_background` = `#181C1D`, `monochrome` → `drawable/ic_launcher_monochrome` |
| Mark is a proper alpha mask | alpha histogram of the generated PNGs | `ic_launcher_foreground` 11.0 % opaque / 88.2 % transparent; `ic_app_mark` 34.1 % opaque; `ic_notification` 29.9 % opaque — so `Icon(tint = Ink)` recolours cleanly |
| Legacy / round icons | `mipmap-*/ic_launcher_round.png` regenerated per density (circle plate) | present mdpi→xxxhdpi |
| Notifications | `drawable-*/ic_notification.png` regenerated (white mark, alpha) | present mdpi→xxxhdpi |
| Launcher label | `aapt2 dump badging` | `Comfort` (all locales) |
| Old Square icon artwork | `git status` + resource tree | old green-wave vector drawables `ic_app_mark.xml`, `ic_notification.xml`, `ic_launcher_monochrome.xml` deleted and replaced by the new PNGs at the same resource IDs |

**Not verified:** how the icon looks under each OEM launcher mask (circle, squircle, teardrop), on a light launcher wallpaper, on the splash screen and in the app drawer — these require a device.

The user-supplied portrait was resized from its original 1254×1254 to 512×512 (aspect ratio preserved, no crop, no watermark, no generation) and written to `app/src/main/res/drawable-nodpi/dev_akhil.png`. The original full-resolution file is preserved at `assets/dev_akhil.png`.

Mandatory copyright / open-source attributions were **not** removed: the `Licences()` entry and the Ko-fi row remain in the legal section. Only the upstream project's GitHub profile row was replaced by the Akhil/Instagram row, as requested.

---

## 4. Feature QA matrix

Legend: **PASS (static)** = verified by source inspection + successful compilation; **NOT RUN** = requires a device.

| # | Requirement | Status | Basis |
|---|---|---|---|
| 1 | Settings footer reads `Comfort 2.10.4` | **PASS (static)** | both literals use `BuildConfig.VERSION_NAME`, `versionName = "2.10.4"` |
| 1 | No user-facing `Square` remains | **PASS (static)** | zero matches in all `strings.xml`; remaining literals are log tags |
| 2 | Developer image / name / Instagram | **PASS (static)** | resource present, row opens `INSTAGRAM_URL` |
| 2 | Image proportions preserved | **PASS (static)** | 1254×1254 → 512×512 square-to-square |
| 3 | Foreground media service + MediaSession + MediaStyle notification | **PASS (static)** | `PlaybackService : MediaLibraryService`; `onUpdateNotification` keeps the foreground notification while paused; `ic_notification` small icon |
| 3 | Playback survives swipe-away from Recents | **PASS (static)** | `onTaskRemoved` keeps playing when `keepPlayingOnClose && player.isPlaying`; default flipped to `true` |
| 3 | Home / other app / lock screen playback | **NOT RUN** | no device |
| 3 | Notification controls | **NOT RUN** | no device |
| 4 | Audio focus pause/resume matrix | **PASS (static)** | `AudioFocusController` handles `LOSS_TRANSIENT` (pause + `pausedByFocusLoss`), `GAIN` (resume only if it was focus-induced), `LOSS` (abandon), `LOSS_TRANSIENT_CAN_DUCK` (duck), noisy receiver (pause, no auto-resume) |
| 4 | Never auto-resume after manual pause | **PASS (static)** | resume is gated on `pausedByFocusLoss`, which manual pause never sets |
| 4 | Real-world focus interop (YouTube/Instagram/calls) | **NOT RUN** | no device |
| 5 | Automatic next track / repeat / shuffle | **PASS (static)** | existing queue engine (`LibrespotPlayer`) advances on completion, honours repeat-one/all/shuffle, single player instance, no duplicate engine introduced |
| 6 | Guest / no-login access | **PASS (static)** | Onboarding exposes a Skip/Close path; login is not mandatory. Provider-gated features still show their own sign-in requirement — no auth was faked |
| 7 | Offline cache / download subsystem | **PASS (static)** | pre-existing `download/` subsystem (`DownloadQueue`, `DownloadService`, `YouTubeDownloads`, `DownloadEvents`, `DownloadExtras`); `OfflineMode.kt` reasons = MANUAL / NO_SESSION / SLOW; a track is only marked downloaded when a real local file exists |
| 7 | Cache is only written where the source permits | **PASS (static)** | downloads route through the project's existing permitted-source path; no extraction of protected streams was added |
| 8 | Offline playlist playback | **PASS (static)** | downloaded tracks resolve from disk inside the same queue engine, so next/prev/shuffle/repeat keep working offline; unavailable online tracks are not marked playable offline |
| 9 | Playback state persistence | **PASS (static)** | `savePlayback()` / `resumption()` persist track, position, queue, repeat/shuffle and playlist context; no second media session is created |
| 10 | No new wake locks / polling / duplicate engines / leaks | **PASS (static)** | no new service, no new wake lock, no new polling loop was added; the only behavioural change is one preference default |
| 11–12 | On-device test matrix, fix-and-retest loop | **PARTIALLY RUN** | build + compile + 62 unit tests ran and pass; device matrix **NOT RUN** |

---

## 5. What this build does and does not change

To be explicit about the engineering scope — most of the requested runtime behaviour already existed in this Comfort source and was **audited rather than rewritten**, because rewriting it would have violated "preserve the existing UI/UX and functionality".

**Changed in this build**
1. `SettingsScreen.kt` — two footer strings now read `Comfort ${BuildConfig.VERSION_NAME}`.
2. `SettingsScreen.kt` — developer row rewritten: local portrait, name "Akhil", opens the Instagram profile; upstream GitHub row removed (attributions retained elsewhere).
3. `app/src/main/res/values*/strings.xml` (12 locales) — user-facing `Square` → `Comfort`; `app_name` = Comfort.
4. `app/src/main/res/drawable-nodpi/dev_akhil.png` — new, from the supplied image.
5. `PreferencesStore.kt` — `KEY_KEEP_PLAYING` default `false` → `true`, so swipe-away continues playback out of the box.
6. `tools/icon.py` — rewritten to generate every icon resource from the supplied Comfort logo instead of the older green-wave artwork (single source of truth, reproducible with `python3 tools/icon.py`).
7. `app/src/main/res/mipmap-*/` + `drawable-*/` — `ic_launcher`, `ic_launcher_round`, `ic_launcher_background`, `ic_launcher_foreground`, `ic_app_mark`, `ic_notification`, `ic_launcher_monochrome` regenerated from that logo; `values/colors.xml` `ic_launcher_background` = `#181C1D`.
8. `app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`, `ic_launcher_round.xml` — stale comments (which still described the old `icona.png` / `wave-glow.png` pipeline) corrected; layer structure unchanged.

**Audited, found already correct, left intact**
- Foreground `MediaLibraryService`, MediaSession, MediaStyle notification, lock-screen controls.
- `AudioFocusController` full focus matrix including manual-pause protection.
- Queue engine with repeat/shuffle/auto-advance and single-player guarantee.
- Download/offline subsystem and `OfflineMode`.
- `savePlayback()` / `resumption()` session persistence.
- Onboarding skip path (guest access).

---

## 6. Honest blockers

1. **No Android device or usable emulator** → no runtime verification of background playback, swipe-away, audio focus, autoplay, guest browsing, or offline playback; **no runtime screenshots** of the Settings footer or the developer profile.
2. **No release keystore** → the release APK/AAB is debug-signed; not Play-distributable.
3. **Provider credentials** (e.g. Spotify/YouTube Music accounts) are not present in this environment, so provider-gated guest access could not be exercised.
4. **No KVM** → even a software emulator with x86_64 system image was out of reach (and the shipped ABIs are ARM-only).

Screenshots were requested as a deliverable. They are **not** in this delivery as captured app screenshots, because producing them would have required running the app, which this environment cannot do. What is delivered instead is the exact source evidence (section 3), plus the user's own supplied reference montage at `assets/dev2.png`.

---

## 7. Delivery status of this rebuild

| Item | Location in this workspace |
|---|---|
| Universal release APK (27.4 MB) | `deliverables/Comfort-2.10.4-universal-release.apk` |
| Per-ABI release APKs | `deliverables/Comfort-2.10.4-arm64-v8a-release.apk`, `Comfort-2.10.4-armeabi-v7a-release.apk` |
| Android App Bundle (25.1 MB) | `deliverables/Comfort-2.10.4-release.aab` |
| Universal debug APK | `deliverables/Comfort-2.10.4-universal-debug.apk` |
| Build logs | `build/logs/assembleDebug.log`, `release.log`, `bundle.log`, `release-splits.log` |
| This report | `deliverables/QA_REPORT.md` |

**Google Drive:** the build host can read the connected `Comfort` folder but cannot write new bytes into it. The Drive integration only accepts uploads of files already staged in the chat session's storage, and files produced inside this VM are not staged there — every upload attempt was rejected with `HTTP 403: The file key does not belong to this project or session`. Nothing was uploaded and nothing in the Drive folder was modified or overwritten.

To place these builds in Drive, either download them from the workspace paths above and drop them into `Comfort/Final APK`, `Comfort/Final AAB` and `Comfort/QA Reports`, or attach them to a chat message so they can be staged and then written to Drive from here.
