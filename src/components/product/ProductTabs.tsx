"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Product } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Check } from "lucide-react";
import { DURATION, EASE_PREMIUM } from "@/lib/motion";

export function ProductTabs({ product }: { product: Product }) {
  const reduced = useReducedMotion();

  // Radix mounts only the active TabsContent, so there's no exit to animate — this
  // fades and lifts each panel in on mount, which is what actually reads as a crossfade
  // once the previous panel has already unmounted in the same commit.
  const enter = {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.base, ease: EASE_PREMIUM },
  };

  return (
    <Tabs defaultValue="description" className="mt-20">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        <TabsTrigger value="care">Care</TabsTrigger>
        <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
        <TabsTrigger value="faq">FAQs</TabsTrigger>
      </TabsList>

      <TabsContent value="description">
        <motion.div {...enter} className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <p className="text-sm leading-relaxed text-muted">{product.story}</p>
          <ul className="flex flex-col gap-3">
            {product.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-charcoal">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-tangerine-600" />
                {f}
              </li>
            ))}
          </ul>
        </motion.div>
      </TabsContent>

      <TabsContent value="specs">
        <motion.dl {...enter} className="grid max-w-xl grid-cols-1 divide-y divide-border text-sm sm:grid-cols-2 sm:divide-y-0">
          <SpecRow label="Material" value={product.material} />
          <SpecRow label="Colorway" value={product.colorway} />
          <SpecRow label="Dimensions" value={product.dimensions} />
          <SpecRow label="Weight" value={product.weight} />
          <SpecRow label="Finish" value={product.finishTime} />
          <SpecRow label="Availability" value={product.stock.replace("-", " ")} />
        </motion.dl>
      </TabsContent>

      <TabsContent value="care">
        <motion.ul {...enter} className="flex max-w-xl flex-col gap-3">
          {product.careInstructions.map((c) => (
            <li key={c} className="flex items-start gap-3 text-sm text-muted">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-tangerine-600" />
              {c}
            </li>
          ))}
        </motion.ul>
      </TabsContent>

      <TabsContent value="shipping">
        <motion.div {...enter} className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h4 className="mb-3 text-sm font-medium text-charcoal">Shipping</h4>
            <ul className="flex flex-col gap-3">
              {product.shippingInfo.map((s) => (
                <li key={s} className="text-sm leading-relaxed text-muted">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-medium text-charcoal">Returns</h4>
            <ul className="flex flex-col gap-3">
              {product.returnPolicy.map((r) => (
                <li key={r} className="text-sm leading-relaxed text-muted">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </TabsContent>

      <TabsContent value="faq">
        <motion.div {...enter}>
          <Accordion type="single" collapsible className="max-w-2xl">
            {product.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 sm:block sm:py-0 sm:pb-4">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0 text-charcoal sm:mt-1 capitalize">{value}</dd>
    </div>
  );
}
