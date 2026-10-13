"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import type { BuilderConfig, BuilderFormatId } from "@/lib/letter-builder/types";
import { derivePieces, initialState, startingPrice } from "@/lib/letter-builder/design";
import { formatINR } from "@/lib/utils";
import { Charm } from "./Charm";

// Example names the showpiece cycles through — each a different style, colour pattern and
// format, so the hero itself demonstrates "every letter is your choice".
const SHOWCASE: { text: string; style: string; preset: string; format: BuilderFormatId }[] = [
  { text: "ANYA", style: "rounded", preset: "pastel", format: "keychain" },
  { text: "KABIR", style: "block", preset: "ocean", format: "keychain" },
  { text: "MOM♥", style: "playful", preset: "sunset", format: "keychain" },
  { text: "ZOYA", style: "rounded", preset: "rainbow", format: "clicker" },
];
const HOLD_MS = 3200;

export function scrollToBuilder() {
  document.getElementById("make-yours")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function NameKeychainHero({ config }: { config: BuilderConfig }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = React.useState(0);

  // Cycling starts after mount (and never for reduced motion), so the server HTML and the
  // first client render are the same first name.
  React.useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SHOWCASE.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  const example = SHOWCASE[index];
  const pieces = derivePieces(config, {
    ...initialState(config, example.text),
    style: example.style,
    preset: example.preset,
  });

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_70%_40%,#FBE3D2_0%,transparent_70%),radial-gradient(40%_40%_at_15%_80%,#F1E9DC_0%,transparent_70%)]"
      />
      <div className="container-wide relative grid min-h-[calc(100dvh-5rem)] grid-cols-1 items-center gap-10 py-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-16">
        <div className="order-2 lg:order-1">
          <AnimatedReveal>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-tangerine-600">Personalised · 3D printed</p>
          </AnimatedReveal>
          <AnimatedReveal delay={0.08}>
            <h1 className="h-display mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Your name,
              <br />
              in your colours.
            </h1>
          </AnimatedReveal>
          <AnimatedReveal delay={0.16}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted lg:text-lg">
              Pick every letter — its colour, its style — and we print it piece by piece into a keychain, or a clicker
              you can&apos;t stop pressing.
            </p>
          </AnimatedReveal>
          <AnimatedReveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button variant="accent" size="lg" onClick={scrollToBuilder}>
                Make yours — from {formatINR(startingPrice(config))}
                <ArrowDown className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted">Made to order · Ships in 3–4 days</span>
            </div>
          </AnimatedReveal>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl rounded-[2.5rem] bg-warm-white/70 shadow-soft">
            <div className="absolute inset-0 flex items-center px-6 sm:px-10">
              <Charm
                pieces={pieces}
                format={example.format}
                config={config}
                maxSize="7rem"
                pieceKey={(i, p) => `${index}-${i}-${p.char}`}
              />
            </div>
            <p className="absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.18em] text-muted">
              {example.format === "clicker" ? "Clicker" : "Keychain"} ·{" "}
              {config.styles.find((s) => s.id === example.style)?.label} ·{" "}
              {config.presets.find((p) => p.id === example.preset)?.label}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
