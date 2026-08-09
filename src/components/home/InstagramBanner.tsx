import { Instagram, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/seo";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";

// Replaces the old image-grid "Follow Along" gallery (placeholder tiles, not
// real Instagram photos) with a single thin banner — same destination link,
// none of the visual weight a full section of fake imagery was adding.
export function InstagramBanner() {
  return (
    <section className="container-wide py-12">
      <AnimatedReveal>
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noreferrer"
          className="group flex flex-wrap items-center justify-center gap-2.5 rounded-2xl bg-beige px-6 py-5 text-center transition-colors hover:bg-beige-dark sm:gap-3"
        >
          <Instagram className="h-4 w-4 shrink-0 text-tangerine-600 sm:h-5 sm:w-5" />
          <span className="text-sm font-medium text-charcoal sm:text-base">
            Follow <span className="text-tangerine-600">@tangerinetwist.studio</span> on Instagram
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-charcoal" />
        </a>
      </AnimatedReveal>
    </section>
  );
}
