import { Download, Github, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";
import { Reveal } from "@/components/Reveal";

const meta = [
  { k: "App name", v: site.name },
  { k: "Version", v: `${site.apk.versionName} (build ${site.apk.versionCode})` },
  { k: "Android package", v: site.apk.packageId, mono: true },
  { k: "File format", v: site.apk.format },
  { k: "File size", v: site.apk.sizeLabel },
  { k: "Release date", v: site.apk.releaseDate },
  { k: "Requires", v: "Android 8.0 or newer" },
  { k: "Architectures", v: site.apk.architectures },
];

export function DownloadSection() {
  return (
    <section id="download" className="relative py-20 lg:py-28">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-7 sm:p-10 lg:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(233,203,163,0.2),transparent_65%)] blur-2xl"
            />
            <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
              <div>
                <span className="eyebrow">Download</span>
                <h2 className="section-title mt-5">
                  Download Comfort <span className="gradient-text">today</span>
                </h2>
                <p className="section-sub">
                  Start your musical journey now — completely free!
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href={site.apk.path}
                    download={site.apk.fileName}
                    className="btn-primary group px-7 py-3.5"
                  >
                    <Download className="h-4 w-4" />
                    Download APK
                  </a>
                  <a
                    href={site.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost px-5 py-3.5"
                  >
                    <Github className="h-4 w-4" />
                    View source
                  </a>
                </div>

                <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-silver/85">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne/80" />
                  Direct download of {site.apk.fileName} — {site.apk.sizeLabel}, signed with the
                  Comfort release key. If you are upgrading from an older build signed with a
                  different key, uninstall it once before installing this APK.
                </p>
              </div>

              <div>
                <dl className="grid grid-cols-2 gap-3">
                  {meta.map((item) => (
                    <div
                      key={item.k}
                      className="rounded-2xl border border-white/[0.07] bg-ink-950/40 px-4 py-3"
                    >
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-silver/70">
                        {item.k}
                      </dt>
                      <dd
                        className={`mt-1 break-words text-sm text-pearl ${
                          item.mono ? "font-mono text-[12px]" : ""
                        }`}
                      >
                        {item.v}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-3 rounded-2xl border border-white/[0.07] bg-ink-950/40 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-silver/70">
                    SHA-256 checksum
                  </p>
                  <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-champagne/90">
                    {site.apk.sha256}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
