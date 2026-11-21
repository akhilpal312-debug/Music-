export const site = {
  name: "Comfort",
  tagline: "Feel the Music, Live in Comfort",
  description:
    "Comfort is a premium Android music player. Stream, play and enjoy your favourite songs with a smooth, elegant experience — free and open source.",
  url: "https://comfort-music-app.vercel.app",
  developer: {
    name: "Akhil",
    role: "Developer & Creator",
    instagramHandle: "@iamakhil_yt",
    instagramUrl: "https://www.instagram.com/iamakhil_yt/",
    image: "/img/akhil.png",
  },
  repo: "https://github.com/akhilpal312-debug/Music-",
  issues: "https://github.com/akhilpal312-debug/Music-/issues",
  upstream: "https://github.com/Lelonio/Square",
  license: "GPL-3.0",
  apk: {
    versionName: "0.0.1",
    versionCode: 70,
    packageId: "dev.lelonio.square",
    format: "APK",
    fileName: "Comfort-v0.0.1.apk",
    path: "/downloads/Comfort-v0.0.1.apk",
    sizeBytes: 27411198,
    sizeLabel: "26.1 MB",
    sha256: "19a4c51d68ec5b3e82edc67bd961fa8de49fc4f6a30ac01c9d3218376a35c285",
    releaseDate: "21 November 2026",
    minSdk: 26,
    targetSdk: 35,
    architectures: "arm64-v8a · armeabi-v7a",
  },
} as const;

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Screenshots", href: "#screenshots" },
  { label: "Download", href: "#download" },
  { label: "About", href: "#about" },
] as const;

export const features = [
  {
    icon: "play",
    title: "Music Player",
    body: "A calm now-playing screen with artwork, queue, shuffle, repeat and instant seek — the controls you need, nothing more.",
  },
  {
    icon: "download",
    title: "Offline Mode",
    body: "Keep the tracks you love on your phone and keep listening when the signal drops, with a real offline library behind it.",
  },
  {
    icon: "sliders",
    title: "Custom Effects",
    body: "Playback speed, pitch and reverb with quick presets, plus a sleep timer that stops the music when you drift off.",
  },
  {
    icon: "headphones",
    title: "Background Playback",
    body: "Leave the app, lock the screen or open something else — your music keeps playing from a foreground service.",
  },
  {
    icon: "sparkles",
    title: "Personalised Music",
    body: "A home feed built around new releases, artists and the songs you already return to, refreshed as you listen.",
  },
  {
    icon: "mic",
    title: "Synchronised Lyrics",
    body: "Time-synced lyrics scroll with the song, with translation and karaoke views when you want to sing along.",
  },
  {
    icon: "list",
    title: "Playlists & Library",
    body: "Build playlists, save songs, albums and artists, and move through your library from one quiet place.",
  },
  {
    icon: "palette",
    title: "Glass Appearance",
    body: "Tune the colour, frost and tint of the interface until the whole app feels like it belongs to you.",
  },
] as const;

export const screenshots = [
  {
    src: "/img/home.png",
    title: "Home",
    caption: "New releases and fresh songs, organised the moment you open the app.",
    width: 1080,
    height: 2276,
  },
  {
    src: "/img/lyrics.png",
    title: "Lyrics",
    caption: "Synced lyrics that follow the beat, with translation and karaoke options.",
    width: 1080,
    height: 2392,
  },
  {
    src: "/img/player.png",
    title: "Now Playing",
    caption: "A full-screen player built around the artwork, the queue and the song.",
    width: 1080,
    height: 2392,
  },
  {
    src: "/img/settings.png",
    title: "Appearance",
    caption: "Glass, colour and frost controls for a look that matches your taste.",
    width: 540,
    height: 1136,
  },
] as const;
