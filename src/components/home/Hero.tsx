"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/shared/TextReveal";
import { Magnetic } from "@/components/shared/Magnetic";
import { DURATION, EASE_PREMIUM } from "@/lib/motion";
import { AmbientField } from "./hero/AmbientField";
import { ScrollCue } from "./hero/ScrollCue";
import { LampPoster } from "./hero/LampPoster";

/**
 * Scroll-assembled lamp hero.
 *
 * The section is a tall track (see `.hero-scroll-track` in globals.css) whose inner
 * content is pinned with `position: sticky`. Scrolling through the track doesn't move
 * the content — it drives a 3D lamp that builds itself part by part, then lights.
 * Scrub back up and it disassembles, because the whole animation is a pure function
 * of scroll progress (see hero/choreography.ts).
 *
 * three.js can't server-render, so the canvas is loaded via `next/dynamic` with
 * `ssr: false` and gated behind an idle callback. All the copy — headline, paragraph,
 * CTA — is plain server-rendered HTML that never waits on it.
 */

// Must be declared at module scope in a "use client" file; Next 14 rejects
// `ssr: false` inside a Server Component.
const LampCanvas = dynamic(() => import("./hero/LampCanvas").then((m) => m.LampCanvas), {
  ssr: false,
  // The poster below is always mounted and does the placeholder job, so there's
  // deliberately nothing to render here.
  loading: () => null,
});

export function Hero() {
  const reduced = useReducedMotion();
  const trackRef = React.useRef<HTMLElement>(null);
  const pausedRef = React.useRef(false);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    // Track is 250vh with a 100vh sticky child, so this maps 0 -> 1 across
    // exactly the 150vh of scroll during which the lamp is pinned on screen.
    offset: ["start start", "end end"],
  });

  /**
   * Hold the canvas back until the browser is idle.
   *
   * `armed` is false on the server *and* on the client's first render, so the
   * hydrated HTML matches byte for byte — the same technique CountUp uses. The
   * effect of that is the ~220KB three chunk is fetched only after hydration
   * settles, and never competes with the headline for LCP.
   */
  const [armed, setArmed] = React.useState(false);
  React.useEffect(() => {
    const schedule = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = schedule(() => setArmed(true));
    return () => cancel(id as number);
  }, []);

  // Stop the frame loop entirely once the hero is well off screen. A ref, not
  // state, so flipping it can never trigger a re-render mid-scroll.
  React.useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        pausedRef.current = !entry.isIntersecting;
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const fade = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.slow, delay: reduced ? 0 : delay, ease: EASE_PREMIUM },
  });

  return (
    <section
      ref={trackRef}
      aria-labelledby="hero-title"
      // No `overflow-hidden` here, and no z-index. An overflow-hidden ancestor
      // becomes the sticky child's scroll container and silently kills the pin
      // with no error; the z-index would fight the navbar's z-40.
      className="hero-scroll-track relative bg-cream"
    >
      {/* pt-20 clears the 80px sticky navbar so the lamp never sits under it */}
      <div className="sticky top-0 flex h-screen h-svh items-center overflow-hidden pt-20">
        <AmbientField progress={scrollYProgress} />

        <div className="container-wide relative grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div className="relative z-10 order-2 lg:order-1">
            <motion.p {...fade(0)} className="eyebrow mb-5 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-tangerine-500" />
              Premium 3D-Printed Design Studio
            </motion.p>

            <TextReveal
              immediate
              text={"Built light,\nlayer by layer."}
              delay={0.12}
              as="h1"
              id="hero-title"
              className="h-display text-[2.25rem] leading-[1.05] sm:text-5xl lg:text-[4.25rem]"
            />

            <motion.p
              {...fade(0.45)}
              className="mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base lg:mt-6 lg:text-lg"
            >
              Designer lamps, decorative idols and desk essentials — precision 3D printed and
              hand-finished in India, made for homes and workspaces that pay attention to detail.
            </motion.p>

            <motion.div
              {...fade(0.56)}
              className="mt-7 flex flex-wrap items-center gap-4 lg:mt-9"
            >
              <Magnetic>
                <Button variant="accent" size="lg" asChild>
                  <Link href="/lamps" className="group">
                    Shop the Collection
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
                  </Link>
                </Button>
              </Magnetic>
              {/* Hidden by CSS rather than unmounted, so the DOM is identical at every breakpoint */}
              <Button variant="outline" size="lg" className="hidden sm:inline-flex" asChild>
                <Link href="/about">Our Story</Link>
              </Button>
            </motion.div>
          </div>

          {/*
            The stage owns its height in CSS. The canvas fills it absolutely and
            never contributes layout, which is what makes CLS structurally zero
            rather than merely unlikely.
          */}
          <div role="presentation" className="hero-stage relative order-1 lg:order-2">
            <LampPoster />
            {armed && (
              <LampCanvas
                progress={scrollYProgress}
                reduced={!!reduced}
                pausedRef={pausedRef}
              />
            )}
          </div>
        </div>

        <ScrollCue progress={scrollYProgress} />
      </div>
    </section>
  );
}
