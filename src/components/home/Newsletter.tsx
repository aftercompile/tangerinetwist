"use client";

import * as React from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";

export function Newsletter() {
  const [email, setEmail] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Welcome to the studio list — check your inbox soon.");
    setEmail("");
  }

  return (
    <section className="bg-tangerine-500 py-20">
      <div className="container-wide">
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
              className="border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:border-white"
              aria-label="Email address"
            />
            <Button type="submit" variant="light" size="md" className="shrink-0">
              Subscribe
            </Button>
          </form>
        </AnimatedReveal>
      </div>
    </section>
  );
}
