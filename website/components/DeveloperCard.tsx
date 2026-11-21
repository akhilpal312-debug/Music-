import Image from "next/image";
import { Github, Instagram } from "lucide-react";
import { site } from "@/lib/site";
import { Reveal } from "@/components/Reveal";

export function DeveloperCard() {
  return (
    <section className="relative pb-4 pt-8 lg:pb-10">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-ink-800/60 p-6 backdrop-blur-xl sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(223,168,146,0.22),transparent_70%)] blur-2xl"
            />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/[0.15]">
                  <Image
                    src={site.developer.image}
                    alt={`${site.developer.name}, developer of Comfort`}
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-champagne/80">
                    Developer
                  </p>
                  <h3 className="mt-1 font-display text-3xl tracking-tight">
                    {site.developer.name}
                  </h3>
                  <p className="text-sm text-silver">{site.developer.role}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={site.developer.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost px-5 py-2.5 text-xs"
                >
                  <Instagram className="h-4 w-4" />
                  {site.developer.instagramHandle}
                </a>
                <a
                  href={site.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost px-5 py-2.5 text-xs"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
