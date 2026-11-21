import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How the ${site.name} website and Android app handle data.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <main className="container-x max-w-3xl pt-28 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-silver transition hover:text-pearl"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {site.name}
        </Link>

        <h1 className="mt-8 font-display text-4xl tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-silver/60">
          Last updated 21 November 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-silver">
          <p>
            This policy covers two things: this website and the Comfort Android application. It
            describes only what is actually implemented — nothing here is a description of data
            collection that does not exist.
          </p>

          <section>
            <h2 className="text-base font-medium text-pearl">This website</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>No account, sign-up or email address is required to browse or download.</li>
              <li>
                The site sets no advertising or analytics cookies and loads no third-party tracking
                scripts.
              </li>
              <li>
                Downloads are served directly as static files. We do not gate the APK behind a form
                or an email list.
              </li>
              <li>
                Like any web host, the hosting provider records standard technical request logs
                (IP address, user agent, requested path) for security and reliability.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-pearl">The Comfort app</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Comfort requires the internet permission to search for and stream music, artwork and
                lyrics from the music sources it supports.
              </li>
              <li>
                There is no Comfort account and no Comfort server that stores your listening
                history. Your library, playlists, downloads and preferences are stored on your own
                device.
              </li>
              <li>
                When you play a track, the request goes to the music service that provides it (for
                example YouTube Music), and that service&apos;s own privacy policy applies to that
                request.
              </li>
              <li>
                Files you download for offline listening stay in the app&apos;s storage on your
                device.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-pearl">Contact</h2>
            <p className="mt-3">
              Questions about this policy can be raised through the{" "}
              <a
                href={site.issues}
                target="_blank"
                rel="noreferrer"
                className="text-champagne/90 underline-offset-4 hover:underline"
              >
                public issue tracker
              </a>{" "}
              or on Instagram{" "}
              <a
                href={site.developer.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-champagne/90 underline-offset-4 hover:underline"
              >
                {site.developer.instagramHandle}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
