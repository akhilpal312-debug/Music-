"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { screenshots } from "@/lib/site";

type Props = {
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function Lightbox({ index, onClose, onChange }: Props) {
  const reduce = useReducedMotion();
  const open = index !== null;

  const step = useCallback(
    (dir: number) => {
      if (index === null) return;
      onChange((index + dir + screenshots.length) % screenshots.length);
    },
    [index, onChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, step]);

  const shot = index !== null ? screenshots[index] : null;

  return (
    <AnimatePresence>
      {open && shot ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${shot.title} screenshot`}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="absolute right-4 top-4 rounded-full border border-white/[0.15] bg-white/5 p-3 text-pearl transition hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous screenshot"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/[0.15] bg-white/5 p-3 text-pearl transition hover:bg-white/10 sm:left-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            className="flex max-h-[88vh] flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={shot.src}
                alt={`Comfort ${shot.title} screen`}
                width={shot.width}
                height={shot.height}
                className="max-h-[74vh] w-auto object-contain"
                sizes="(max-width: 768px) 90vw, 420px"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-pearl">{shot.title}</p>
              <p className="mt-1 max-w-md text-xs text-silver">{shot.caption}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next screenshot"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/[0.15] bg-white/5 p-3 text-pearl transition hover:bg-white/10 sm:right-8"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
