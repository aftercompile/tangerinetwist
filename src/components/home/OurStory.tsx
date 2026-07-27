import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { Button } from "@/components/ui/button";

export function OurStory() {
  return (
    <section className="bg-beige py-24">
      <div className="container-wide grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <AnimatedReveal className="order-2 grid grid-cols-2 gap-4 lg:order-1">
          <ProductImagePlaceholder icon="Sparkles" tone="warm" className="mt-8 aspect-[3/4] rounded-3xl shadow-lift" />
          <ProductImagePlaceholder icon="Lamp" tone="cool" className="aspect-[3/4] rounded-3xl shadow-lift" />
        </AnimatedReveal>
        <AnimatedReveal className="order-1 lg:order-2" delay={0.1}>
          <p className="eyebrow mb-4">Our Story</p>
          <h2 className="h-display text-3xl leading-[1.1] md:text-4xl">
            Started in a small studio, obsessed with one question.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted">
            What if precision manufacturing could feel as warm as something handmade? TangerineTwist
            began with that question — combining industrial 3D printing technology with the patience
            of a craft studio, piece by piece, layer by layer.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Today, every lamp, idol and desk accessory that leaves our studio has been designed,
            printed, sanded and inspected by hand — built to outlast trends, not just seasons.
          </p>
          <Button variant="outline" size="lg" className="mt-8" asChild>
            <Link href="/about">
              Read Our Full Story <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </AnimatedReveal>
      </div>
    </section>
  );
}
