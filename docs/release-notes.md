## What's new in 0.0.11

- **The app asks for a star, once.** Comfort lives in one GitHub repository
  instead of a store, so there is no listing to rate and no ranking to climb —
  a star on the repository is what puts it in front of the next person looking
  for it. After a few openings, a sheet asks for one. Press **Star on GitHub**
  and the repository opens in the browser; press **Later** and the question goes
  away for a week.
- **Asked once, not repeatedly.** Once you have been taken to the repository the
  sheet stops for good, and a dismissed one stays quiet for the whole interval.
  It never appears over the update sheet, and never in the first opening, which
  belongs to setting the app up.
- **Changeable without an update.** How the ask behaves — on or off, after how
  many openings, how long "later" lasts, and its wording and page — is read
  from `docs/star.json` in this repository. Editing that file changes every
  installed copy within a few hours; nothing has to be built or installed for
  it.
- **Everything 0.0.10 fixed, unchanged.** The updater, the download that
  resumes, the verification and the named failure reasons all work exactly as
  before.

## Update information

- Version: 0.0.11 (versionCode 80)
- Signed with the project's release key, certificate SHA-256
  `9b3e6267f6617c4a623bd281d3e4093629fbb58c377828497a67a5f18ac920fb` — the same
  key as every release since 0.0.4, so it installs over any of them without an
  uninstall
- The notes you are reading are the ones the update sheet shows, under the
  version number

## What's new in 0.0.10

- **Same app as 0.0.8 and 0.0.9, with the updater's last rough edge filed off.**
  The fetched APK now sits in its own folder, which is the one folder the app
  shares with Android's installer — a single file is a narrower thing than the
  sharing mechanism states cleanly, and this is the path that decides whether
  the install goes in.
- **How an update goes from here on.** The sheet comes up when the app is
  opened and a newer release exists. The download runs in the background with a
  progress bar. Then Android's own confirmation appears — that one tap is the
  platform's, and no app outside the Play Store can skip it. Press Install and
  the app is replaced, with its data intact.
- **Nothing is fetched twice.** A finished download is kept until it is
  installed, and one that stopped continues from where it stopped.
- **Nothing comes back after it is done.** The app compares the version it is
  running with the release it found, so once you are on it the sheet stops.
  If the confirmation is put away, it returns at the next opening — with the
  APK already on disk, one tap from done — and never re-opens by itself the
  moment you come back from the dialog.
- **A failure is named.** An unfinished download, a file signed with another
  key, a file that is not this release, or a refusal by the installer each has
  its own line above the buttons.

## Update information

- Version: 0.0.10 (versionCode 79)
- Signed with the project's release key, certificate SHA-256
  `9b3e6267f6617c4a623bd281d3e4093629fbb58c377828497a67a5f18ac920fb` — the same
  key as every release since 0.0.4, so it installs over any of them without an
  uninstall
- The notes you are reading are the ones the update sheet shows, under the
  version number

## If the phone is still on 0.0.1, 0.1, 0.2 or 0.3

Those builds were signed with keys that no longer exist, so Android refuses to
install anything else over them — `INSTALL_FAILED_UPDATE_INCOMPATIBLE`. There is
no way around that check: an update must carry the same signing certificate as
the installed app, and only a rooted device can override it. Uninstall the old
copy once, install 0.0.6 or newer, and every release after that updates in place
with no uninstall again.
