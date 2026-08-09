import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryMeta } from "@/lib/types";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { staggerDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";

const tones: Record<string, "warm" | "charcoal" | "cool"> = {
  lamps: "warm",
  idols: "charcoal",
  "desk-organizers": "cool",
  "home-accents": "cool",
};

const images: Record<string, string> = {
  lamps: "/images/collections/collections-lamps.jpg",
  idols: "/images/collections/collections-idols.jpg",
  "desk-organizers": "/images/collections/collections-desk-organizers.jpg",
  "home-accents": "/images/collections/collections-home-accents.jpg",
};

const heroIconToLucide: Record<string, string> = {
  lamp: "Lamp",
  sparkles: "Sparkles",
  "layout-grid": "LayoutGrid",
  watch: "Watch",
};

/**
 * One editorial composition instead of an even grid: the first category is the
 * full-height feature, the second gets a wide card beside it, and the rest sit
 * as a pair beneath — so a fourth category is part of the arrangement, not a
 * leftover wrapping under a 3-column row. Order comes from the live category
 * list, same as the nav.
 *
 * Layout is positional (feature / second / rest), so a future fifth category
 * flows into the bottom pair row rather than breaking the grid.
 */
export function CollectionsSection({ categories }: { categories: CategoryMeta[] }) {
  if (categories.length === 0) return null;
  const [feature, second, ...rest] = categories;

  return (
    <section id="collections" className="container-wide pt-20 lg:pt-28">
      <AnimatedReveal className="max-w-2xl">
        <h2 className="h-display text-3xl leading-[1.1] md:text-4xl lg:text-[2.75rem]">
          Made for your space.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Objects designed to bring a little more character to the spaces you live and work in.
        </p>
      </AnimatedReveal>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:mt-14 lg:grid-cols-10 lg:gap-6">
        <AnimatedReveal className="col-span-2 lg:col-span-6 lg:row-span-2">
          <CollectionCard
            category={feature}
            tagline
            className="aspect-[4/3] lg:aspect-auto lg:h-full"
            imgSizes="(max-width: 1024px) 100vw, 60vw"
          />
        </AnimatedReveal>

        {second && (
          <AnimatedReveal delay={staggerDelay(1, 0.08)} className="col-span-2 lg:col-span-4">
            <CollectionCard
              category={second}
              className="aspect-[16/10]"
              imgSizes="(max-width: 1024px) 100vw, 40vw"
            />
          </AnimatedReveal>
        )}

        {rest.map((category, i) => (
          <AnimatedReveal
            key={category.slug}
            delay={staggerDelay(i + 2, 0.08)}
            className="col-span-1 lg:col-span-2"
          >
            <CollectionCard
              category={category}
              compact
              className="aspect-square"
              imgSizes="(max-width: 1024px) 50vw, 20vw"
            />
          </AnimatedReveal>
        ))}
      </div>
    </section>
  );
}

function CollectionCard({
  category,
  className,
  imgSizes,
  tagline = false,
  compact = false,
}: {
  category: CategoryMeta;
  className?: string;
  imgSizes: string;
  /** Feature card only — the smaller cards stay name + Explore. */
  tagline?: boolean;
  /** Tightens padding and type on the small square cards. */
  compact?: boolean;
}) {
  return (
    <Link
      href={`/${category.slug}`}
      className={cn("group relative block overflow-hidden rounded-xl", className)}
    >
      <ProductImagePlaceholder
        icon={heroIconToLucide[category.heroIcon] ?? "Sparkles"}
        tone={tones[category.slug] ?? "beige"}
        src={images[category.slug]}
        alt={category.name}
        sizes={imgSizes}
        className="absolute inset-0 h-full w-full transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
      />
      {/* Just enough scrim for the copy — the photograph carries the card. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/5 to-transparent"
      />

      <div className={cn("absolute inset-x-0 bottom-0", compact ? "p-4 sm:p-5" : "p-6 sm:p-7")}>
        <h3
          className={cn(
            "font-display text-white",
            compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"
          )}
        >
          {category.name}
        </h3>
        {tagline && <p className="mt-1.5 hidden text-sm text-white/75 sm:block">{category.tagline}</p>}
        {/* Kept deliberately quiet — the card itself is the link; this is a cue,
            not a button. Brightens and nudges on hover. */}
        <span
          className={cn(
            "mt-2.5 inline-flex items-center gap-1 font-medium text-white/70 transition-colors duration-300 ease-premium group-hover:text-white",
            compact ? "text-xs" : "text-sm"
          )}
        >
          Explore
          <ArrowRight
            className={cn(
              "transition-transform duration-300 ease-premium group-hover:translate-x-1",
              compact ? "h-3 w-3" : "h-3.5 w-3.5"
            )}
          />
        </span>
      </div>
    </Link>
  );
}
