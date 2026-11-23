## What's new in 0.0.8

- **The update actually installs now.** When the download finished, the app
  handed the file to Android through an API whose reply it never showed, so a
  refusal looked exactly like a download that had done nothing: the sheet came
  back and asked again. The file now goes to the system installer directly, and
  the confirmation you see is Android's own.
- **Pressing Update again no longer downloads twenty megabytes again.** A
  finished download is kept and reused, and an interrupted one continues from
  where it stopped instead of starting over.
- **A failure says what failed.** Wrong signature, a file that is not this
  release, an unfinished download or a refusal by the installer are each named
  on the sheet, in the line above the buttons.
- **No more nagging once the update is in.** The app compares the version it is
  running with the release it found, so after an update the sheet does not come
  back. Cancel the confirmation and it returns at the next opening — with the
  APK already on disk, one tap from done.

## Update information

- Version: 0.0.8 (versionCode 77)
- Signed with the project's release key, certificate SHA-256
  `9b3e6267f6617c4a623bd281d3e4093629fbb58c377828497a67a5f18ac920fb` — the same
  key as 0.0.6 and 0.0.7, so it installs straight over either
- This release installs the same way as the one before it: download, then
  Android's confirmation. That one tap cannot be skipped by any app outside the
  Play Store, and it is the whole reason the dialog appears at all.
- The notes you are reading are shown in the app's update sheet, under the
  version number

## If the phone is still on 0.0.1, 0.1, 0.2 or 0.3

Those builds were signed with keys that no longer exist, so Android refuses to
install anything else over them — `INSTALL_FAILED_UPDATE_INCOMPATIBLE`. There is
no way around that check: an update must carry the same signing certificate as
the installed app, and only a rooted device can override it. Uninstall the old
copy once, install 0.0.6 or newer, and every release after that updates in place
with no uninstall again.
