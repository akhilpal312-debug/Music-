import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  glare?: boolean;
};

/**
 * A phone frame that shows a real Comfort screenshot, never a redrawn UI.
 */
export function PhoneMockup({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 60vw, 300px",
  glare = true,
}: Props) {
  return (
    <div
      className={`relative rounded-[2.4rem] border border-white/[0.12] bg-gradient-to-b from-[#26262b] to-[#131316] p-[7px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95),0_0_60px_-30px_rgba(233,203,163,0.35)] ${className}`}
    >
      <div className="relative aspect-[9/19.6] overflow-hidden rounded-[2rem] bg-ink-900">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          className="h-full w-full object-cover object-top"
        />
        {glare ? (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.14]" />
        ) : null}
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[14px] h-[5px] w-[62px] -translate-x-1/2 rounded-full bg-white/[0.15]" />
    </div>
  );
}
