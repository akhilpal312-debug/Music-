## What's new in 0.0.9

- **The app as 0.0.8 left it**, with a version number above it. Nothing in the
  player behaves differently.
- **It is here so the fixed updater has something to install.** 0.0.8 is the
  release that puts the file into Android's own installer instead of handing it
  to an API whose answer it never showed; a phone on 0.0.6 or 0.0.7 cannot take
  that fix from inside the app, because the code doing the installing is the
  code that is broken. From 0.0.8 onwards the flow is the one described below.
- Opening the app brings up the update sheet on its own. The download runs, then
  Android asks you to confirm, and the install is done. One tap, and it is the
  platform's dialog rather than anything this app draws.

## Update information

- Version: 0.0.9 (versionCode 78)
- Signed with the project's release key, certificate SHA-256
  `9b3e6267f6617c4a623bd281d3e4093629fbb58c377828497a67a5f18ac920fb` — the same
  key as every release since 0.0.4, which is what lets one install over another
  without an uninstall
- After this one, no uninstall and no manual download: each new release is
  offered at opening, fetched once, verified, and handed to the installer
- If a download stops, the next attempt continues from where it stopped; if a
  step fails, the sheet says which one instead of asking you again with no
  explanation
- The sheet does not come back once the version you are running is the one it
  was offering

## If the phone is still on 0.0.1, 0.1, 0.2 or 0.3

Those builds were signed with keys that no longer exist, so Android refuses to
install anything else over them — `INSTALL_FAILED_UPDATE_INCOMPATIBLE`. There is
no way around that check: an update must carry the same signing certificate as
the installed app, and only a rooted device can override it. Uninstall the old
copy once, install 0.0.6 or newer, and every release after that updates in place
with no uninstall again.
