"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { craftsmanshipSteps } from "@/data/content";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { DURATION, EASE_PREMIUM, VIEWPORT } from "@/lib/motion";

export function Craftsmanship() {
  const reduced = useReducedMotion();
  const trackRef = React.useRef<HTMLDivElement>(null);

  // The rule draws itself as the section passes through the viewport, turning
  // four separate cards into one continuous process.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 80%", "end 60%"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="craftsmanship" className="container-wide py-24">
      <SectionHeading
        eyebrow="Craftsmanship"
        title="From file to finished object"
        description="Precision technology is only half the story. Every piece passes through human hands before it reaches yours."
      />

      <div ref={trackRef} className="relative mt-14">
        <div aria-hidden className="absolute left-0 right-0 top-7 hidden h-px bg-border lg:block">
          <motion.div
            className="h-full origin-left bg-tangerine-500"
            style={reduced ? { scaleX: 1 } : { scaleX }}
          />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {craftsmanshipSteps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{
                duration: DURATION.slow,
                delay: reduced ? 0 : i * 0.1,
                ease: EASE_PREMIUM,
              }}
              className="group relative"
            >
              <div className="relative mb-4 hidden lg:block">
                <span className="block h-3.5 w-3.5 rounded-full border-2 border-tangerine-500 bg-cream transition-colors duration-300 ease-premium group-hover:bg-tangerine-500" />
              </div>

              <span className="font-display text-4xl text-beige-dark transition-colors duration-500 ease-premium group-hover:text-tangerine-300">
                {step.step}
              </span>
              <h3 className="mt-4 text-lg font-medium text-charcoal">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
