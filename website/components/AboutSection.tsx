import Image from "next/image";
import { Check } from "lucide-react";
import { site } from "@/lib/site";
import { Reveal } from "@/components/Reveal";
import { PhoneMockup } from "@/components/PhoneMockup";

const points = [
  "Built on the open-source Square player, refined for Comfort",
  "No account needed to start listening",
  "Free to download, free to use",
];

export function AboutSection() {
  return (
    <section id="about" className="relative py-20 lg:py-28">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className="eyebrow">About</span>
          <h2 className="section-title mt-5">
            A music experience <span className="gradient-text">like never before</span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-silver sm:text-base">
            Comfort is designed to bring your music closer, with a beautiful interface, powerful
            features and a seamless listening experience. Every screen stays quiet so the artwork,
            the lyrics and the song can speak.
          </p>

          <ul className="mt-8 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-silver">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-champagne/30 bg-champagne/10">
                  <Check className="h-3 w-3 text-champagne" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <dl className="mt-9 grid grid-cols-3 gap-3">
            {[
              { k: "Version", v: site.apk.versionName },
              { k: "License", v: site.license },
              { k: "Price", v: "Free" },
            ].map((stat) => (
              <div key={stat.k} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <dt className="text-[10px] uppercase tracking-[0.16em] text-silver/70">{stat.k}</dt>
                <dd className="mt-1 font-display text-xl text-pearl">{stat.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.1} className="relative">
          <div
            aria-hidden
            className="absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(223,168,146,0.16),transparent_70%)] blur-2xl"
          />
          <div className="relative mx-auto flex max-w-[420px] items-center justify-center">
            <PhoneMockup
              src="/img/effects.png"
              alt="Comfort effects screen with speed, pitch, reverb and sleep timer controls"
              width={1080}
              height={2392}
              sizes="(max-width: 768px) 60vw, 300px"
              className="w-[62%] rotate-[-6deg]"
            />
            <div className="glass-strong -ml-10 w-[46%] p-4">
              <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/img/settings.png"
                  alt="Comfort appearance settings for glass, colour and frost"
                  fill
                  sizes="160px"
                  className="object-cover object-top"
                />
              </div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-champagne/80">Glass UI</p>
              <p className="mt-1 text-xs leading-relaxed text-silver">
                Colour, frost and tint controls built into the app.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
