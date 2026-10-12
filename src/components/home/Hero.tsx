"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/shared/TextReveal";
import { DURATION, EASE_PREMIUM } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Scene {
  src: string;
  label: string;
  /** Keeps the subject in frame when `object-cover` crops hard on portrait phones. */
  position: string;
}

// Finished pieces in real rooms — the product is the hero, not how it's made.
// Lamps lead because a lit lamp is the strongest first impression; order after
// that mirrors the collections section below.
const SCENES: Scene[] = [
  { src: "/images/hero/hero-lamps.jpg", label: "Lamps", position: "50% 50%" },
  { src: "/images/hero/hero-idols.jpg", label: "Idols", position: "55% 50%" },
  { src: "/images/hero/hero-accents.jpg", label: "Home accents", position: "68% 50%" },
  { src: "/images/hero/hero-desk-organizers.jpg", label: "Desk organizers", position: "52% 50%" },
];

/** How long each scene holds, and how long the crossfade between scenes takes. */
const HOLD_MS = 6000;
const FADE_S = 1.4;
/** The slow push-in runs a little longer than the hold so it never visibly stops. */
const ZOOM_S = HOLD_MS / 1000 + FADE_S;
const ZOOM_TO = 1.07;

/**
 * Deliberately spare: one headline, one line of copy, two CTAs over slowly
 * crossfading room scenes. The stats row, eyebrow label, magnetic button and
 * scroll cue that used to live here were the "ecommerce banner" tells — a
 * magazine cover doesn't annotate itself.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(0);
  // False until after mount. Anything that moves (the zoom, the cycling) is
  // gated on this instead of on `reduced` directly: useReducedMotion() can
  // report false during SSR and flip true on the client's first render, so
  // reading it while rendering would give those users a different DOM than
  // the server sent. Every scene renders identical markup on the first pass
  // either way; motion is switched on (or left off) once we're mounted.
  const [motionOk, setMotionOk] = React.useState(false);

  React.useEffect(() => {
    setMotionOk(!reduced);
    if (reduced) setActive(0);
  }, [reduced]);

  React.useEffect(() => {
    if (!motionOk) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SCENES.length);
    }, HOLD_MS);
    return () => window.clearInterval(id);
    // `active` is deliberately a dependency: picking a scene by hand restarts
    // the hold timer so it isn't cut short right after a tap.
  }, [motionOk, active]);

  // One shared timeline so copy and CTAs feel like a single entrance rather
  // than components that happen to animate at once.
  const fade = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.slow, delay: reduced ? 0 : delay, ease: EASE_PREMIUM },
  });

  return (
    <section className="relative flex min-h-[92dvh] items-end overflow-hidden bg-charcoal sm:min-h-[82dvh] sm:items-center lg:min-h-[88vh]">
      {/* All scenes stay mounted and stacked; only opacity changes, so a
          crossfade never waits on a network request. bg-charcoal on the
          section is the fallback for the instant before the first paint.
          The scenes are ultra-wide, so on a phone `object-cover` would crop
          them to a thin slice with the copy sitting on the product — instead
          the scene fills the top of the section and fades into charcoal, with
          the copy below it. From `sm` up it's a full-bleed backdrop. */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[62%] sm:inset-0 sm:h-auto">
        {SCENES.map((scene, i) => {
          const isActive = i === active;
          return (
            <motion.div
              key={scene.src}
              initial={false}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: motionOk ? FADE_S : 0, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <motion.div
                className="absolute inset-0 will-change-transform"
                initial={{ scale: 1 }}
                animate={{ scale: isActive && motionOk ? ZOOM_TO : 1 }}
                // Leaving scenes hold their zoom until the fade finishes, then
                // snap back unseen — resetting immediately would visibly jump.
                transition={
                  isActive
                    ? { duration: ZOOM_S, ease: "linear" }
                    : { duration: 0, delay: FADE_S }
                }
              >
                <Image
                  src={scene.src}
                  alt=""
                  fill
                  sizes="100vw"
                  quality={80}
                  priority={i === 0}
                  className="object-cover"
                  style={{ objectPosition: scene.position }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Phone: the scene dissolves into the charcoal the copy sits on. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-[24%] h-[40%] bg-gradient-to-b from-transparent to-charcoal sm:hidden"
      />
      {/* sm+: one directional scrim, darkest behind the text column, plus a
          light flat wash as insurance against the brighter rooms — kept as
          thin as legibility allows so the lamp glow still reads. */}
      <div aria-hidden className="absolute inset-0 bg-charcoal/15 sm:bg-charcoal/20" />
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-gradient-to-r from-charcoal/85 via-charcoal/40 to-transparent sm:block lg:via-charcoal/25"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 hidden h-32 bg-gradient-to-t from-charcoal/50 to-transparent sm:block"
      />

      <div className="container-wide relative z-[1] pb-16 pt-20 sm:py-24">
        <div className="max-w-xl">
          <TextReveal
            immediate
            text={"Objects worth\nkeeping."}
            delay={0.1}
            className="h-display text-5xl leading-[1.02] text-white sm:text-6xl lg:text-[4.75rem]"
          />

          <motion.p
            {...fade(0.4)}
            className="mt-6 max-w-md text-base leading-relaxed text-white/80 lg:text-lg"
          >
            3D printed pieces designed for everyday spaces.
          </motion.p>

          <motion.div {...fade(0.52)} className="mt-9 flex flex-wrap items-center gap-4">
            <Button variant="accent" size="lg" asChild>
              <Link href="/products" className="group">
                Shop all
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="light" size="lg" asChild>
              <Link href="/about">Our story</Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scene markers: tells people what they're looking at and lets them
          pick one. The active label is plain text; the rest are just ticks so
          the corner stays quiet. */}
      <div className="container-wide absolute inset-x-0 bottom-6 z-[1] sm:bottom-8">
        <div role="group" aria-label="Hero scenes" className="flex items-center gap-2.5">
          {SCENES.map((scene, i) => (
            <button
              key={scene.src}
              type="button"
              aria-label={`Show ${scene.label}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className="group flex h-6 items-center focus-visible:outline-none"
            >
              <span
                className={cn(
                  "block h-[3px] rounded-full bg-white transition-all duration-500 ease-premium group-focus-visible:ring-2 group-focus-visible:ring-white/80 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-charcoal",
                  i === active ? "w-10 opacity-100" : "w-5 opacity-40 group-hover:opacity-70",
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-xs tracking-wide text-white/75">
            {SCENES[active].label}
          </span>
        </div>
      </div>
    </section>
  );
}
