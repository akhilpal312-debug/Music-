import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeatureSection } from "@/components/FeatureSection";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { AboutSection } from "@/components/AboutSection";
import { DeveloperCard } from "@/components/DeveloperCard";
import { DownloadSection } from "@/components/DownloadSection";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.name,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Android 8.0+",
    softwareVersion: site.apk.versionName,
    fileSize: `${site.apk.sizeBytes} B`,
    downloadUrl: `${site.url}${site.apk.path}`,
    author: { "@type": "Person", name: site.developer.name, url: site.developer.instagramUrl },
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    license: "https://www.gnu.org/licenses/gpl-3.0.html",
    description: site.description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeatureSection />
        <ScreenshotGallery />
        <AboutSection />
        <DeveloperCard />
        <DownloadSection />
      </main>
      <Footer />
    </>
  );
}
