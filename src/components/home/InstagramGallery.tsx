import { Instagram, ArrowUpRight } from "lucide-react";
import { instagramPosts } from "@/data/content";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { staggerDelay } from "@/lib/motion";

const tones: Array<"warm" | "cool" | "charcoal" | "beige"> = [
  "warm",
  "beige",
  "cool",
  "charcoal",
  "warm",
  "beige",
];

export function InstagramGallery() {
  return (
    <section className="container-wide py-24">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <SectionHeading eyebrow="Follow Along" title="@tangerinetwist.studio" className="mb-0" />
        <AnimatedReveal delay={0.1}>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="link-underline group flex items-center gap-2 text-sm font-medium text-charcoal"
          >
            <Instagram className="h-4 w-4" /> Follow us
          </a>
        </AnimatedReveal>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-3 md:grid-cols-6">
        {instagramPosts.map((post, i) => (
          <AnimatedReveal key={post.id} delay={staggerDelay(i, 0.05)}>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-xl"
              aria-label={post.caption}
            >
              <ProductImagePlaceholder
                icon={post.icon}
                tone={tones[i % tones.length]}
                className="h-full w-full transition-transform duration-900 ease-premium group-hover:scale-110"
              />
              {/* Overlay only appears on hover so the grid stays calm at rest. */}
              <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 opacity-0 transition-all duration-500 ease-premium group-hover:bg-charcoal/35 group-hover:opacity-100">
                <ArrowUpRight className="h-5 w-5 text-white" />
              </span>
            </a>
          </AnimatedReveal>
        ))}
      </div>
    </section>
  );
}
