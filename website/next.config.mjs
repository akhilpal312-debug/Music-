/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/downloads/:file*",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Comfort-v0.0.1.apk"',
          },
          { key: "Content-Type", value: "application/vnd.android.package-archive" },
        ],
      },
    ];
  },
};

export default nextConfig;
