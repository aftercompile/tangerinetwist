"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DURATION, EASE_PREMIUM } from "@/lib/motion";
import { formatINR } from "@/lib/utils";
import { scrollToBuilder } from "./NameKeychainHero";

/**
 * Phones only: ordering is never more than one tap away, wherever the story has scrolled
 * to. Hidden while the hero's own button is on screen and once the builder itself is.
 */
export function MakeYoursBar({ fromPrice }: { fromPrice: number }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const builder = document.getElementById("make-yours");
    if (!builder) return;
    let builderInView = false;
    let pastHero = false;
    const update = () => setVisible(pastHero && !builderInView);
    const builderObserver = new IntersectionObserver(([e]) => {
      builderInView = e.isIntersecting;
      update();
    }, { rootMargin: "0px 0px -30% 0px" });
    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.6;
      update();
    };
    builderObserver.observe(builder);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      builderObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: reduced ? 0 : 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduced ? 0 : 96, opacity: 0 }}
          transition={{ duration: DURATION.fast, ease: EASE_PREMIUM }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-warm-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm lg:hidden"
        >
          <Button variant="accent" size="lg" className="w-full" onClick={scrollToBuilder}>
            Make yours — from {formatINR(fromPrice)}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
