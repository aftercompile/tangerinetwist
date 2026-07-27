# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install     # install dependencies
npm run dev     # start dev server at http://localhost:3000
npm run build   # production build (also runs type-checking + linting)
npm run lint    # eslint only (next/core-web-vitals config)
```

There is no test suite configured in this project. There's no `next start` usage documented beyond the standard script — use `npm run build && npm start` to check a production build locally.

## Architecture

Next.js 14 App Router + TypeScript site for **TangerineTwist**, a premium 3D-printed home décor
D2C storefront (designer lamps, decorative idols, desk organizers). Everything is client-rendered
commerce logic on top of statically-generated pages — there is no backend/API/database; all product
data is a static in-repo catalog and cart/wishlist state lives in `localStorage`.

### Data-driven catalog (`src/data`)

`src/data/products.ts` is the single source of truth for the product catalog — a hand-written array
of `Product` objects (typed in `src/lib/types.ts`) covering all three categories (`lamps`, `idols`,
`desk-organizers`). Each product carries its own description, pricing, materials, care/shipping/return
copy, FAQs, and reviews inline (no CMS). Helper functions in that file (`getProductBySlug`,
`getProductsByCategory`, `getBestSellers`, `getNewArrivals`, `getRelatedProducts`) are the query layer
every page uses instead of filtering the array directly. `src/data/categories.ts` holds per-category
metadata (name, tagline, price range) and `src/data/content.ts` holds homepage-only content
(testimonials, Instagram post captions, "Why TangerineTwist" copy, craftsmanship steps, materials).
**To add or edit a product, category, or homepage copy block, edit these three files — not the
components that render them.**

### No product photography — generated "studio" placeholder art

There are no image assets. `src/components/shared/ProductImagePlaceholder.tsx` renders a
CSS/SVG-gradient "studio backdrop" with a centered Lucide icon per product, keyed by an `icon` name
(a Lucide component name, e.g. `"Lamp"`, `"Sparkles"`) and a `tone` (`warm | cool | charcoal | beige`)
stored directly on each `Product`/`ProductImage` in the catalog. `src/components/shared/icon-map.tsx`
is the allowlist mapping icon-name strings to actual Lucide components — **any new icon name used in
`src/data/products.ts` must be added to `iconMap` there too, or it silently falls back to `Sparkles`.**
This placeholder system stands in for real product photography (see README "Notes for production
launch") and is used everywhere a product image would normally go: product cards, galleries, cart
lines, quick view, collections, Instagram gallery.

### State: React Context + localStorage, no server round-trips

`src/context/CartContext.tsx`, `WishlistContext.tsx`, and `RecentlyViewedContext.tsx` each manage
their own slice of state, hydrate from `localStorage` on mount, and persist back on every change (see
the `hydrated` guard pattern in each — don't write to `localStorage` before the initial read completes,
or you'll clobber persisted state with the empty initial value). All three are composed in
`src/context/Providers.tsx` and wrapped around the whole app in `src/app/layout.tsx`. `useCart()` /
`useWishlist()` / `useRecentlyViewed()` throw if called outside their provider — every consumer is a
client component (`"use client"`).

Cart drawer visibility is also owned by `CartContext` (`isOpen`/`setOpen`), not local component state —
`addItem` auto-opens the drawer, so any code that adds to cart gets the drawer for free.

### UI primitives are hand-rolled, not the shadcn CLI

`src/components/ui/*` looks like shadcn/ui but was written by hand on top of Radix primitives + CVA —
there is no `components.json` and the shadcn CLI has never been run against this repo. Follow the
existing pattern (Radix primitive + `cva` variants + `cn()` from `src/lib/utils.ts`) rather than
introducing a differently-structured component when extending this folder.

### Category pages share one client component

`/lamps`, `/idols`, `/desk-organizers` are near-identical thin server components (metadata +
`getProductsByCategory` + `<CategoryBanner>` + `<CategoryExplorer>`). All filtering/sorting logic
(material checkboxes, sort dropdown, mobile filter drawer, skeleton loading) lives once in
`src/components/category/CategoryExplorer.tsx`. Add a fourth category by adding a `CategoryMeta` to
`src/data/categories.ts`, products with that `category` slug to `src/data/products.ts`, and a new
`src/app/<slug>/page.tsx` following the existing three — no changes needed to `CategoryExplorer`.

### Product detail page

`src/app/product/[slug]/page.tsx` uses `generateStaticParams` to prerender every product from the
catalog and `generateMetadata` per-product, and emits inline `Product` JSON-LD. It composes
`ProductGallery` (hover-zoom), `ProductInfo` (quantity/cart/wishlist/buy-now), `ProductTabs`
(description/specs/care/shipping/FAQ), `Reviews`, `RelatedProducts` (from `relatedSlugs` on the
product), and `RecentlyViewedSection` — the latter reads from `RecentlyViewedContext`, which
`RecordRecentlyViewed` (a client-only effect, rendered invisibly on the page) writes to on mount.

### Design tokens

The palette (`cream`, `warm-white`, `beige`, `charcoal`, `tangerine` scale) and type scale (Manrope via
`--font-manrope` for display/headings, Plus Jakarta Sans via `--font-jakarta` for body) are defined in
`tailwind.config.ts` and wired up as fonts in `src/app/layout.tsx`. Prefer the semantic color names
(`text-charcoal`, `bg-beige`, `text-tangerine-600`, etc.) over raw Tailwind grays/oranges when adding
UI — the whole site is built to a warm cream/beige/charcoal/tangerine constraint intentionally (see
README design intent).

### SEO

`src/lib/seo.ts` exports `buildMetadata()` (used by every route's `generateMetadata`/`metadata` export)
and `siteConfig` (canonical domain + default keyword list). `src/app/sitemap.ts` and `src/app/robots.ts`
are generated from the same product/category data rather than hand-maintained.

Commit & Push after every update automatically.