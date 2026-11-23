## What's new in 0.0.7

- **Nothing the player does has changed.** This release is the app exactly as
  0.0.6 left it: same player, same library, same settings.
- **It exists so the update itself can be seen working.** A phone on 0.0.6 opens
  the app, the sheet comes up on its own, the APK is fetched in the background
  and Android's own confirmation finishes the install. That is the whole of what
  changed between the two versions: a newer version number to be offered.

## Update information

- Version: 0.0.7 (versionCode 76)
- Signed with the project's release key, certificate SHA-256
  `9b3e6267f6617c4a623bd281d3e4093629fbb58c377828497a67a5f18ac920fb` — the same
  key as 0.0.6, which is what lets it install straight over it
- Updates arrive from this repository's latest published release; the app checks
  on opening and offers whatever is newer than the installed copy
- The notes you are reading are shown in the app's update sheet, under the
  version number

## If the phone is still on 0.0.1, 0.1, 0.2 or 0.3

Those builds were signed with keys that no longer exist, so Android refuses to
install anything else over them — `INSTALL_FAILED_UPDATE_INCOMPATIBLE`. There is
no way around that check: an update must carry the same signing certificate as
the installed app, and only a rooted device can override it. Uninstall the old
copy once, install 0.0.6 or newer, and every release after that updates in place
with no uninstall again.
