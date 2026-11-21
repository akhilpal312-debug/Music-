import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { navLinks, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/[0.07] bg-ink-950/80">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10">
              <Image src="/img/logo.png" alt="" fill sizes="40px" className="object-cover" />
            </span>
            <span className="font-display text-2xl tracking-tight">{site.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-silver">
            {site.tagline}. A free, open-source music player for Android, built and maintained by{" "}
            {site.developer.name}.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href={site.developer.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-silver transition hover:text-pearl"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={site.repo}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-silver transition hover:text-pearl"
            >
              Source code
            </a>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-silver/60">Explore</p>
          <ul className="mt-4 space-y-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-silver transition hover:text-pearl">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-silver/60">Legal</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/privacy" className="text-sm text-silver transition hover:text-pearl">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-sm text-silver transition hover:text-pearl">
                Terms and Conditions
              </Link>
            </li>
            <li>
              <a
                href={site.upstream}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-silver transition hover:text-pearl"
              >
                Upstream project
              </a>
            </li>
            <li>
              <a
                href={site.issues}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-silver transition hover:text-pearl"
              >
                Report a problem
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.07]">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-silver/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.developer.name}. Comfort is released under the{" "}
            {site.license} license.
          </p>
          <p className="max-w-xl leading-relaxed">
            Comfort is a modified fork of Square, originally created by Lelonio and licensed under{" "}
            {site.license}. Original source and attribution are preserved in the{" "}
            <a href={site.repo} target="_blank" rel="noreferrer" className="text-champagne/90 underline-offset-4 hover:underline">
              public repository
            </a>
            . Comfort is not affiliated with Google, YouTube or Spotify; all trademarks belong to
            their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
