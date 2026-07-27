import { Instagram } from "lucide-react";
import { instagramPosts } from "@/data/content";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { SectionHeading } from "@/components/shared/SectionHeading";

const tones: Array<"warm" | "cool" | "charcoal" | "beige"> = ["warm", "beige", "cool", "charcoal", "warm", "beige"];

export function InstagramGallery() {
  return (
    <section className="container-wide py-24">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <SectionHeading eyebrow="Follow Along" title="@tangerinetwist.studio" className="mb-0" />
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-charcoal link-underline"
        >
          <Instagram className="h-4 w-4" /> Follow us
        </a>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-3 md:grid-cols-6">
        {instagramPosts.map((post, i) => (
          <a
            key={post.id}
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden rounded-xl"
            aria-label={post.caption}
          >
            <ProductImagePlaceholder
              icon={post.icon}
              tone={tones[i % tones.length]}
              className="h-full w-full transition-transform duration-500 ease-premium group-hover:scale-110"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
