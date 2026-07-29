"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const reduced = useReducedMotion();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    // Brief pending state so the button confirms the tap before the toast fires.
    setTimeout(() => {
      toast.success("Welcome to the studio list — check your inbox soon.");
      setEmail("");
      setSubmitting(false);
    }, 450);
  }

  return (
    <section className="relative overflow-hidden bg-tangerine-500 py-20">
      {/* Wash always renders (it's part of the visual design); only the drift is
          dropped under reduced motion, which also keeps hydration consistent. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #FFFFFF 0%, transparent 70%)" }}
        {...(reduced
          ? {}
          : {
              animate: { x: [0, 60, 0] },
              transition: { duration: 24, repeat: Infinity, ease: "easeInOut" as const },
            })}
      />

      <div className="container-wide relative">
        <AnimatedReveal className="mx-auto max-w-xl text-center">
          <h2 className="h-display text-3xl text-white md:text-4xl">Join the studio list</h2>
          <p className="mt-4 text-sm text-white/85">
            New drops, studio stories and early access — no spam, just design we&apos;re proud of.
          </p>
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md gap-2">
            <Input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/30 bg-white/10 text-white transition-colors placeholder:text-white/60 focus:border-white focus:bg-white/15"
              aria-label="Email address"
            />
            <Button type="submit" variant="light" size="md" className="shrink-0" disabled={submitting}>
              {submitting ? "Joining..." : "Subscribe"}
            </Button>
          </form>
        </AnimatedReveal>
      </div>
    </section>
  );
}
