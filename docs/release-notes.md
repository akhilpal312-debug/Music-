## What's new in 0.0.6

- **The update sheet now comes back at every app opening.** The 10-minute check
  limit is still there, but the release it found is written down, so opening the
  app again inside that window still shows the update instead of nothing.
- **Fewer wasted downloads.** The APK is fetched once per release; putting the
  sheet away no longer means downloading twenty megabytes again next time.
- **The fetched APK waits for the app to be in front** before Android's installer
  is called, so the confirmation dialog appears instead of being dropped.
- Everything else is unchanged: same player, same library, same settings.

## Update information

- Version: 0.0.6 (versionCode 75)
- Signed with the project's release key, certificate SHA-256
  `9b3e6267f6617c4a623bd281d3e4093629fbb58c377828497a67a5f18ac920fb`
- Size: 18.9 MB (arm64-v8a), 15.7 MB (armeabi-v7a), 27.3 MB (universal)
- Updates arrive from this repository's latest published release; the app checks
  on opening and offers whatever is newer than the installed copy.

## One-time step, only for a phone still on 0.0.1, 0.1, 0.2 or 0.3

Those builds were signed with keys that no longer exist, so Android refuses to
install anything else over them — `INSTALL_FAILED_UPDATE_INCOMPATIBLE`. There is
no way around that check: an update must carry the same signing certificate as
the installed app, and only a rooted device can override it. Uninstall the old
copy once, install 0.0.6, and every release after this one updates in place with
no uninstall again.
