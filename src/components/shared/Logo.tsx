import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoVariant = "horizontal" | "stacked" | "mark";
type LogoTone = "dark" | "light";

interface LogoProps {
  /** horizontal: nav bars. stacked: footer / cards. mark: the vase alone. */
  variant?: LogoVariant;
  /** `dark` ink for light backgrounds, `light` ink for charcoal backgrounds. */
  tone?: LogoTone;
  className?: string;
  /** Override the default mark size, e.g. "h-12 w-auto". */
  markClassName?: string;
  /** Override the default wordmark size, e.g. "text-2xl". */
  wordmarkClassName?: string;
  priority?: boolean;
  /**
   * Phones narrower than 380px don't have room for the wordmark beside the nav
   * icons, so drop to the vase alone there. Only meaningful for `horizontal`.
   */
  compact?: boolean;
}

const MARK_SRC: Record<LogoTone, string> = {
  dark: "/brand/mark.svg",
  light: "/brand/mark-light.svg",
};

// The mark's intrinsic size (its viewBox is ~132 x 168). Only the aspect ratio
// matters: the rendered size always comes from the h-* class.
const MARK_W = 132;
const MARK_H = 168;

/**
 * The wordmark is live text in Outfit (the closest Google Font to the supplied
 * artwork), not an image, so it stays sharp at every size and inherits the
 * surrounding colour. The first "i" in "Tangerine" carries an orange dot in
 * the original logo — it's drawn here as a dotless ı plus a positioned dot,
 * sized in em so it scales with the text.
 */
function Wordmark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      // leading-none goes last: tailwind-merge treats a later text-[size] class
      // as overriding an earlier leading-*, and the dot below is positioned
      // against a 1em-tall line box.
      className={cn("font-logo font-light tracking-[0.03em] whitespace-nowrap", className, "leading-none")}
    >
      Tanger
      <span className="relative inline-block">
        ı
        {/* Offsets measured from Outfit's own dotted i: dot top edge 0.19em
            from the line-box top, ~0.11em across, centred on the stem. */}
        <span className="absolute left-1/2 top-[0.19em] h-[0.11em] w-[0.11em] -translate-x-1/2 rounded-full bg-tangerine-500" />
      </span>
      neTwist
    </span>
  );
}

export function Logo({
  variant = "horizontal",
  tone = "dark",
  className,
  markClassName,
  wordmarkClassName,
  priority = false,
  compact = false,
}: LogoProps) {
  const color = tone === "light" ? "text-cream" : "text-charcoal";

  const mark = (defaultSize: string) => (
    <Image
      src={MARK_SRC[tone]}
      alt=""
      width={MARK_W}
      height={MARK_H}
      unoptimized
      priority={priority}
      className={cn("w-auto shrink-0", defaultSize, markClassName)}
    />
  );

  if (variant === "mark") {
    return (
      <span role="img" aria-label="TangerineTwist" className={cn("inline-flex", className)}>
        {mark("h-10")}
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span
        role="img"
        aria-label="TangerineTwist Studio"
        className={cn("inline-flex flex-col items-center", color, className)}
      >
        {mark("h-20")}
        <Wordmark className={cn("mt-4 text-[1.7rem]", wordmarkClassName)} />
        <span aria-hidden className="mt-3 flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.42em]">
          <span className="h-px w-8 bg-current opacity-40" />
          <span className="font-logo font-normal opacity-70">Studio</span>
          <span className="h-px w-8 bg-current opacity-40" />
        </span>
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label="TangerineTwist"
      className={cn("inline-flex items-center gap-2 sm:gap-3", color, className)}
    >
      {mark("h-7 sm:h-10")}
      <Wordmark
        className={cn(
          "text-[0.875rem] font-[350] tracking-[0.02em] sm:text-[1.4rem] sm:tracking-[0.03em]",
          compact && "max-[379px]:hidden",
          wordmarkClassName,
        )}
      />
    </span>
  );
}
