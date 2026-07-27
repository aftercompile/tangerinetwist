"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="container-wide grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="eyebrow mb-5"
          >
            Premium 3D-Printed Design Studio
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="h-display text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[4rem]"
          >
            Everyday living,
            <br />
            beautifully engineered.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-md text-base leading-relaxed text-muted lg:text-lg"
          >
            Designer lamps, decorative idols and desk essentials — precision 3D printed and
            hand-finished in India, made for homes and workspaces that pay attention to detail.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button variant="accent" size="lg" asChild>
              <Link href="/lamps">
                Shop the Collection <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Our Story</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-14 flex items-center gap-8 border-t border-border pt-8"
          >
            <Stat value="8K" label="Resin Detail" />
            <Stat value="4.8/5" label="Average Rating" />
            <Stat value="3–4" label="Days to Dispatch" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative grid grid-cols-2 gap-4"
        >
          <ProductImagePlaceholder
            icon="Lamp"
            tone="warm"
            className="col-span-2 aspect-[16/10] rounded-3xl shadow-lift"
          />
          <ProductImagePlaceholder icon="Sparkles" tone="charcoal" className="aspect-square rounded-3xl shadow-lift" />
          <ProductImagePlaceholder icon="LayoutGrid" tone="cool" className="aspect-square rounded-3xl shadow-lift" />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="h-display text-xl">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
