import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: `Terms for downloading and using ${site.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
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

        <h1 className="mt-8 font-display text-4xl tracking-tight sm:text-5xl">
          Terms and Conditions
        </h1>
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-silver/60">
          Last updated 21 November 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-silver">
          <section>
            <h2 className="text-base font-medium text-pearl">The software</h2>
            <p className="mt-3">
              Comfort is free Android software released under the {site.license} license. The source
              code is published in the{" "}
              <a
                href={site.repo}
                target="_blank"
                rel="noreferrer"
                className="text-champagne/90 underline-offset-4 hover:underline"
              >
                public repository
              </a>{" "}
              and you may use, study, modify and redistribute it under that license. The app is
              distributed in the hope that it will be useful, but without any warranty, without even
              the implied warranty of merchantability or fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-pearl">Downloading and installing</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Comfort is distributed as an APK from this website and the project repository. It is
                not published on Google Play.
              </li>
              <li>
                Android will ask you to allow installs from your browser or file manager before the
                first install. Only install builds you downloaded from the official links.
              </li>
              <li>
                A build signed with a different key cannot be installed over an existing copy;
                uninstall the old build first. Doing so removes local app data such as playlists and
                downloads.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-pearl">Your responsibilities</h2>
            <p className="mt-3">
              You are responsible for how you use the app and for the content you access with it.
              Respect the terms of the music services Comfort connects to and the copyright of the
              music you listen to. Do not use the app to redistribute content you do not have the
              right to share.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-pearl">Attribution and affiliation</h2>
            <p className="mt-3">
              Comfort is a modified fork of the open-source Square player, licensed under the{" "}
              {site.license} license; the inherited source and its third-party credits are kept in
              the repository. Comfort is not affiliated with, endorsed by or sponsored by Google,
              YouTube, Spotify or any music service, and all trademarks belong to their respective
              owners.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-pearl">Changes</h2>
            <p className="mt-3">
              The app and these terms may change as the project develops. Updated terms are published
              on this page with a new date.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
