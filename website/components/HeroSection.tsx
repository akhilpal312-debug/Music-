"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Play, Sparkles } from "lucide-react";
import { PhoneMockup } from "@/components/PhoneMockup";
import { Lightbox } from "@/components/Lightbox";
import { site } from "@/lib/site";

const indicators = ["Fast & smooth", "100% free", "Open source"];

export function HeroSection() {
  const [demo, setDemo] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-20 sm:pt-36 lg:pb-28">
      {/* soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(233,203,163,0.16),transparent_65%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-15%] top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(223,168,146,0.12),transparent_65%)] blur-2xl"
      />
      {/* elegant curved lines */}
      <svg
        aria-hidden
        viewBox="0 0 1440 900"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="arc" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#e9cba3" stopOpacity="0" />
            <stop offset="45%" stopColor="#e9cba3" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#dfa892" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M-80 620 C 320 420, 700 300, 1520 120" fill="none" stroke="url(#arc)" strokeWidth="1" />
        <path d="M-120 720 C 300 540, 760 420, 1540 260" fill="none" stroke="url(#arc)" strokeWidth="0.7" />
        <path d="M980 980 C 1080 700, 1260 520, 1520 440" fill="none" stroke="url(#arc)" strokeWidth="0.7" />
      </svg>

      <div className="container-x relative grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <motion.span {...enter(0)} className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Music Player
          </motion.span>

          <motion.h1
            {...enter(0.05)}
            className="mt-6 font-display text-[4.25rem] leading-[0.88] tracking-tight sm:text-[5.5rem] lg:text-[7rem]"
          >
            <span className="gradient-text">Comfort</span>
          </motion.h1>

          <motion.p
            {...enter(0.12)}
            className="mt-5 font-display text-2xl italic text-pearl/90 sm:text-[1.75rem]"
          >
            {site.tagline}
          </motion.p>

          <motion.p {...enter(0.18)} className="mt-5 max-w-xl text-sm leading-relaxed text-silver sm:text-base">
            A premium music player for everyone. Stream, play and enjoy your favourite songs with a
            smooth and elegant experience.
          </motion.p>

          <motion.div {...enter(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#download" className="btn-primary group px-7 py-3.5">
              Download App
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <button type="button" onClick={() => setDemo(2)} className="btn-ghost px-6 py-3.5">
              <Play className="h-4 w-4" />
              Watch Demo
            </button>
          </motion.div>

          <motion.ul {...enter(0.3)} className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {indicators.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-silver">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-champagne/30 bg-champagne/10">
                  <Check className="h-3 w-3 text-champagne" />
                </span>
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          {...(reduce
            ? {}
            : {
                initial: { opacity: 0, scale: 0.94 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const },
              })}
          className="relative mx-auto flex w-full max-w-[460px] items-center justify-center"
        >
          <div
            aria-hidden
            className="absolute inset-6 rounded-[999px] bg-[radial-gradient(circle,rgba(233,203,163,0.18),transparent_70%)] blur-2xl"
          />
          <div className="relative w-[52%] translate-x-4 sm:translate-x-6">
            <div className="animate-float">
              <PhoneMockup
                src="/img/lyrics.png"
                alt="Comfort lyrics screen with time-synced lyrics"
                width={1080}
                height={2392}
                priority
                sizes="(max-width: 768px) 30vw, 210px"
                className="rotate-[-7deg] opacity-95"
              />
            </div>
          </div>
          <div className="relative -ml-8 w-[58%] sm:-ml-10">
            <div className="animate-float [animation-delay:-3s]">
              <PhoneMockup
                src="/img/player.png"
                alt="Comfort now playing screen with album artwork and controls"
                width={1080}
                height={2392}
                priority
                sizes="(max-width: 768px) 34vw, 240px"
                className="rotate-[5deg]"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <Lightbox index={demo} onClose={() => setDemo(null)} onChange={setDemo} />
    </section>
  );
}
