# Comfort website

The official site for Comfort, the Android music player in this repository. It is a
Next.js app that lives beside the Android project and deploys to Vercel from the
`website` root directory.

- Production: <https://comfort-akhilpal312-9636.vercel.app>
- APK download: `/downloads/Comfort-v0.0.1.apk` (served by the same deployment)

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide icons.

## Run locally

```bash
cd website
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Where things live

| Path | Purpose |
| --- | --- |
| `lib/site.ts` | Single source of truth: brand copy, developer links, APK metadata, features, screenshots |
| `components/` | Navbar, HeroSection, PhoneMockup, FeatureSection, ScreenshotGallery, Lightbox, AboutSection, DeveloperCard, DownloadSection, Footer |
| `app/page.tsx` | Page composition plus `SoftwareApplication` JSON-LD |
| `app/privacy`, `app/terms` | Legal pages |
| `public/img/` | Logo, developer photo and real app screenshots |
| `public/downloads/` | The released APK that the download button serves |

## Releasing a new version

1. Build the APK and copy it to `public/downloads/Comfort-v<version>.apk`.
2. Update `site.apk` in `lib/site.ts`: `versionName`, `versionCode`, `fileName`,
   `path`, `sizeBytes`, `sizeLabel`, `sha256`, `releaseDate`.
3. Keep the `Content-Disposition` header in `next.config.mjs` in step with the file name.
4. Commit and push `main`; the Vercel project `comfort` builds the `website` directory.

## Attribution

Comfort is a GPL-3.0 fork of [Square](https://github.com/Lelonio/Square) by Lelonio.
The footer and legal pages keep that attribution; the site does not claim the
inherited source was written by this project.
