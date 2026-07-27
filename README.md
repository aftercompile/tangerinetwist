# TangerineTwist

A premium D2C e-commerce website for **TangerineTwist** — a modern design studio crafting
3D-printed home décor and workspace essentials: designer lamps, decorative idols, and desk
organizers.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- Tailwind CSS with a bespoke design system (warm cream/beige/charcoal palette, tangerine accent)
- Radix UI primitives, styled shadcn-style, in `src/components/ui`
- Framer Motion for scroll reveals and micro-interactions
- Lucide icons
- Client-side cart, wishlist and recently-viewed state, persisted to `localStorage`

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

```bash
npm run build   # production build
npm run lint    # eslint
```

## Structure

- `src/app` — routes (home, category pages, product detail, cart, wishlist, checkout, about, contact)
- `src/components` — `layout/`, `home/`, `category/`, `product/`, `shared/`, `ui/`
- `src/context` — Cart / Wishlist / Recently Viewed providers
- `src/data` — product catalog, categories, homepage content (edit here to add/change products)
- `src/lib` — types, utils, SEO helpers

## Notes for production launch

- Product photography is currently represented by an original, brand-consistent "studio" placeholder
  system (`src/components/shared/ProductImagePlaceholder.tsx`) rather than photographed assets —
  swap in real product photography before public launch for full visual fidelity.
- Checkout is a UI-only flow (no payment gateway wired up yet); `src/app/checkout/page.tsx` is the
  integration point for a real payment provider.
- Contact form and newsletter signup are front-end only; wire to a backend/ESP before launch.
