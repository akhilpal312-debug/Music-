"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { screenshots } from "@/lib/site";
import { Reveal } from "@/components/Reveal";
import { Lightbox } from "@/components/Lightbox";

export function ScreenshotGallery() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="screenshots" className="relative py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(233,203,163,0.09),transparent_70%)] blur-2xl"
      />
      <div className="container-x relative">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">Screenshots</span>
          <h2 className="section-title mt-5">
            Experience <span className="gradient-text">Comfort</span>
          </h2>
          <p className="section-sub">Every detail designed around your music.</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {screenshots.map((shot, i) => (
            <Reveal key={shot.title} delay={i * 0.06}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-800 text-left transition duration-300 hover:-translate-y-1 hover:border-champagne/30"
                aria-label={`Open ${shot.title} screenshot`}
              >
                <div className="relative aspect-[9/16]">
                  <Image
                    src={shot.src}
                    alt={`Comfort ${shot.title} screen`}
                    width={shot.width}
                    height={shot.height}
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 260px"
                    className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent" />
                  <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/30 text-pearl opacity-0 backdrop-blur transition group-hover:opacity-100">
                    <Maximize2 className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-sm font-medium text-pearl">{shot.title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-silver/90">
                    {shot.caption}
                  </p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Lightbox index={open} onClose={() => setOpen(null)} onChange={setOpen} />
    </section>
  );
}
