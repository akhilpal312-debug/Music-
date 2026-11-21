import {
  Download,
  Headphones,
  ListMusic,
  Mic2,
  Palette,
  Play,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { features } from "@/lib/site";
import { Reveal } from "@/components/Reveal";

const icons = {
  play: Play,
  download: Download,
  sliders: SlidersHorizontal,
  headphones: Headphones,
  sparkles: Sparkles,
  mic: Mic2,
  list: ListMusic,
  palette: Palette,
} as const;

export function FeatureSection() {
  return (
    <section id="features" className="relative py-20 lg:py-28">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">Features</span>
          <h2 className="section-title mt-5">
            Everything <span className="gradient-text">you need</span>
          </h2>
          <p className="section-sub">Simple. Elegant. Powerful. That&apos;s Comfort.</p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = icons[feature.icon];
            return (
              <Reveal key={feature.title} delay={i * 0.05}>
                <article className="group h-full rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-6 transition duration-300 hover:-translate-y-1 hover:border-champagne/25 hover:from-white/[0.08]">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-champagne/20 bg-champagne/10 text-champagne transition group-hover:bg-champagne/15">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-5 text-base font-medium text-pearl">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-silver">{feature.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
