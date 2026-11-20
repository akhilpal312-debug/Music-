# Comfort — Offline Functionality Test Report

**Build under test:** Comfort 2.10.4 (versionCode 70)
**Device used:** **none available** — see "Blocker".

---

## 1. Result summary

| Requirement | Result |
|---|---|
| Previously played/downloaded songs playable without internet | **VERIFIED BY SOURCE** (existing subsystem) |
| Permitted sources only; no extraction of protected streams | **VERIFIED BY SOURCE** — no extraction code added |
| A song is never shown as downloaded without a real local file | **VERIFIED BY SOURCE** |
| Playlist usable offline for locally available tracks | **VERIFIED BY SOURCE** |
| Next / Previous / Shuffle / Repeat offline | **VERIFIED BY SOURCE** (same queue engine) |
| Unavailable online tracks clearly not claimed as offline-playable | **VERIFIED BY SOURCE** |
| Runtime test with airplane mode | **NOT RUN** — requires device |
| SQL cache metadata database | **NOT IMPLEMENTED** — see §4 |

---

## 2. Existing subsystem that provides this

`app/src/main/java/dev/lelonio/square/download/`

| File | Role |
|---|---|
| `DownloadQueue.kt` (37 KB) | queue, on-disk layout, sidecar metadata, integrity/validation, integrity checks, cleanup |
| `DownloadService.kt` | foreground service that performs downloads |
| `YouTubeDownloads.kt` | source-specific download path (where that source permits it) |
| `DownloadEvents.kt` | progress / completion events to the UI |
| `DownloadExtras.kt` | artwork, lyrics and extra asset capture |

`app/src/main/java/dev/lelonio/square/playback/OfflineMode.kt` defines the offline gating reasons:

- `MANUAL` — the user switched to offline mode,
- `NO_SESSION` — there is no authenticated session for an online source,
- `SLOW` — the network is too slow to stream.

When offline mode is active, tracks that exist locally play from disk through the **same** player/queue as online playback, which is why next/previous/shuffle/repeat behave identically with no network.

---

## 3. Metadata, integrity and honesty guarantees

From `DownloadQueue.kt`, each downloaded track has a **JSON sidecar** next to its audio file, written at download time and read back on load:

```
format, trackId, bytes, downloadedAt
```

plus lyrics captured as JSON (`Lyrics.serializer()`). This gives stable track identifiers, file size, source format and download time — the practical content of the "cache manager" the prompt asks for.

- **Duplicate avoidance:** the store is keyed by `trackId`, so re-downloading the same track replaces rather than duplicates the file.
- **Integrity:** the sidecar is parsed with `runCatching { JSONObject(sidecar) }.getOrNull()`, and a missing/zero-byte file is treated as not downloaded. There is no path that reports "downloaded" without a usable local file.
- **Corrupt sidecar** falls back to sane defaults (`downloadedAt = now`, `bytes = 0`) rather than crashing the library.
- **Cleanup:** the existing store exposes removal, and storage is freed when a download is deleted — no new unbounded cache was added.
- **Protected audio:** this build adds **no** code that captures, extracts or retains a protected streaming stream. Anything that becomes local goes through the project's existing permitted download path (which is the source's own offered download mechanism). Where a source restricts persistent offline storage, Comfort still requires that source's entitlement, as before.

---

## 4. Deliberate deviation: no new Room/SQLite cache DB

Section 7 of the prompt asks for "a database to maintain cache metadata". This delivery does **not** introduce a new Room/SQLite database, and here is the reasoning, stated plainly:

- The project already persists per-track download metadata in sidecars keyed by stable `trackId`, and it already resolves offline playback from those files. The project contains **no Room/SQLite** anywhere.
- Adding a second, parallel index would create two sources of truth for "is this track downloaded?", which is exactly how you produce the bug the prompt forbids: a song shown as downloaded with no playable file (index says yes, file is gone).
- The prompt also forbids redesigning existing architecture. Introducing an ORM + schema + migrations into a shipping app to duplicate an existing working index is a redesign.

**If you want the DB anyway**, it is a clean follow-up: add Room, backfill from existing sidecars on first run, make the DB a *cache* of the filesystem (never the authority), and keep "file exists and is non-zero" as the final gate. Say the word and I'll do it as its own change.

---

## 5. Blocker and on-device script

No Android device and no usable emulator (no KVM; ARM-only ABIs), so no airplane-mode test was executed. Nothing here is claimed as a passed runtime test.

**On-device script (~5 minutes):**
1. Online: play a track to completion, or tap Download on it; confirm it appears as downloaded and that a file exists in the app's files dir.
2. Enable airplane mode (or disable Wi-Fi + mobile data).
3. Reopen Comfort → the downloaded track must be listed and must play from the start, with artwork and lyrics intact.
4. Open a playlist containing both downloaded and non-downloaded tracks → downloaded ones must play; the others must be visibly unavailable, not silently "playable".
5. With the playlist playing offline, test Next, Previous, Shuffle and Repeat.
6. Swipe the app away and reopen → the queue and position must be restored, still offline.
