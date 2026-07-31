# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install     # install dependencies
npm run dev     # start dev server at http://localhost:3000
npm run build   # production build (also runs type-checking + linting)
npm run lint    # eslint only (next/core-web-vitals config)

npm run db:generate   # generate a Drizzle migration from src/lib/db/schema.ts
npm run db:migrate    # apply pending migrations (uses DIRECT_URL)
npm run db:push       # push schema changes directly, skipping migration files (dev only)
npm run db:studio     # open Drizzle Studio against the live DB
npm run db:seed       # wipe-free seed: inserts the 27 fixture products + ~90 days of demo orders
npm run admin:hash-password -- "your-password"   # print an ADMIN_PASSWORD_HASH value for .env.local
```

There is no test suite configured in this project. Use `npm run build && npm start` to check a
production build locally.

## Setup (first run in a new environment)

1. Create a free Supabase project. Copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — the **Transaction pooler** connection string (port 6543, `?pgbouncer=true`).
   - `DIRECT_URL` — the **Session pooler** connection string (port 5432) — `drizzle-kit` needs this.
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` —
     Project Settings → API. The anon key is what powers customer accounts (see below); the service
     role key is server-only, for Storage/admin.
   - `ADMIN_PASSWORD_HASH` — run `npm run admin:hash-password -- "..."` and paste the output.
   - `ADMIN_SESSION_SECRET` — any random 32+ byte string, e.g. `openssl rand -base64 32`.
2. In Supabase Storage, create a **public** bucket named `product-images` (or let
   `getSupabaseAdmin().storage.createBucket(...)` create it — see `src/lib/supabase-admin.ts`).
3. In Supabase Auth settings (Authentication → Providers → Email), turn **off** "Confirm email" so
   customer sign-up is instant — this repo assumes that setting.
4. `npm run db:migrate` then `npm run db:seed`.
5. (Optional, for shipping) Fill in `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` /
   `SHIPROCKET_PICKUP_LOCATION` — the pickup location must already be registered under
   Settings → Pickup Addresses in your Shiprocket dashboard; this app never creates one.
6. (Optional, for online payment) Fill in `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — test-mode
   keys work immediately, no KYC needed to start testing. After deploying, add a webhook under
   Settings → Webhooks pointing at `/api/webhooks/razorpay` and paste its secret into
   `RAZORPAY_WEBHOOK_SECRET`.

`.env.local` is gitignored. **Never put real credentials in `.env.example`** — it's the committed
template and must only ever contain placeholders.

## Architecture

Next.js 14 App Router + TypeScript site for **TangerineTwist**, a premium 3D-printed home décor D2C
storefront (designer lamps, decorative idols, desk organizers) **plus an `/admin` back office** for
managing the catalog, categories, and orders, and a metrics dashboard. The catalog, categories, and
orders all live in **Postgres (Supabase) via Drizzle ORM** — there is no more static in-repo catalog
driving the storefront. Cart/wishlist/recently-viewed state still lives in `localStorage` (unchanged).

### Route groups: storefront vs. admin, both under one root layout

`src/app/layout.tsx` is now minimal — `<html>/<body>`, fonts, Organization JSON-LD, `<Toaster/>` —
and renders `{children}` directly with no storefront chrome. Two route groups hang off it:

- **`src/app/(storefront)/`** — every public page (`page.tsx`, `about/`, `cart/`, `checkout/`,
  `contact/`, `desk-organizers/`, `idols/`, `lamps/`, `product/[slug]/`, `wishlist/`, `account/`,
  plus its own `loading.tsx`/`not-found.tsx`). Its `layout.tsx` fetches categories **and the
  signed-in customer (if any)** and renders `<Providers>` → skip-link →
  `<Navbar categories={...} customer={...}/>` → `<main>` → `<Footer/>` → `<CartDrawer/>`.
- **`src/app/(admin)/admin/`** — split again into `login/page.tsx` (no chrome, so the login screen
  isn't wrapped in the authenticated sidebar) and a nested **`(protected)/`** group whose
  `layout.tsx` renders `<AdminSidebar/>` + `<AdminTopbar/>` around `{children}`. Adding a new admin
  screen means adding it under `(admin)/admin/(protected)/`, not directly under `admin/`.

Route groups (parenthesized folders) never add URL segments, so none of this changed any public URL.
A root, chrome-less `src/app/not-found.tsx` also exists as the catch-all 404 for paths outside both
groups (e.g. a typo'd top-level path); `(storefront)/not-found.tsx` is the styled in-chrome one.

### Data layer: Drizzle ORM over Postgres, two query modules

- **`src/lib/db/schema.ts`** — `categories`, `products` (jsonb for pure copy blocks like `materials`,
  `features`, `careInstructions`, `shippingInfo`, `returnPolicy`, `faqs`; a real `text[]` column for
  `badges` since it's filtered on; `isPersonalized: boolean` replaces the old
  `product.slug === "personalized-desk-name-plate"` hack), `productImages`, `productReviews`,
  `productRelations` (replaces the old `relatedSlugs: string[]` with real FK rows — no more dangling
  slugs), `orders`, `orderItems` (a denormalized snapshot of name/price/material/image at order time,
  so editing or deleting a product never rewrites historical orders).
- **`src/lib/db/index.ts`** — the `postgres-js` + Drizzle client. It's cached on `globalThis` outside
  production. **This matters**: without that cache, every Next.js dev-mode Fast Refresh
  re-evaluates this module and opens a fresh connection pool without closing the old one, which
  exhausts Supabase's pooler connection limit within a few edits and crashes the whole dev-server
  worker process with an opaque `Jest worker encountered N child process exceptions` error and no
  stack trace. If you ever see that error, suspect a new un-cached DB/connection singleton first.
- **`src/lib/db/queries.ts`** — the **storefront** read layer. Same five function names the old
  static `src/data/products.ts` exposed (`getProductBySlug`, `getProductsByCategory`,
  `getBestSellers`, `getNewArrivals`, `getRelatedProducts`), now async and each wrapped in
  `unstable_cache` tagged `"products"` or `"categories"`. Also `getAllCategories`/`getCategory`
  (category `priceRange` is now a computed `MIN(price)–MAX(price)` per category, not hand-written),
  `getAllProductSlugs`/`getAllProductsForSitemap`, and `searchProducts`/`getProductsBySlugs` (used by
  the two API routes below). `unstable_cache` requires the Next.js request runtime — it cannot be
  exercised from a bare `tsx` script; test the underlying Drizzle calls directly instead.
- **`src/lib/db/admin-queries.ts`** — the **admin** read layer: intentionally *uncached* (admin
  screens must always show live data), returns richer/flatter row shapes for tables
  (`getAdminProductRows`, `getAdminCategoryRows` with `productCount`, `getAdminOrderRows`,
  `getAdminProductById`/`getAdminOrderById` for detail/edit pages).
- **`src/lib/db/metrics-queries.ts`** — dashboard aggregations (`getKpis` with period-over-period
  deltas, `getRevenueOverTime` gap-filled per day via `date-fns`, `getRevenueByCategory`,
  `getOrderStatusBreakdown`, `getTopProducts`, `getLowStockProducts`, `getRecentOrders`).

`src/data/products.ts` and `src/data/categories.ts` **still exist** but are now only the seed
fixture consumed by `src/lib/db/seed.ts` — nothing under `src/app` or `src/components` imports them
anymore. If you're tempted to import `@/data/products` in a new page, don't — use
`@/lib/db/queries` (storefront) or `@/lib/db/admin-queries` (admin) instead.

### Client components that need product data go through an API route, not a DB import

Six client components used to import the static catalog directly; they can't `await` a DB call, so
they now fetch instead:

- `SearchOverlay.tsx` — debounced `fetch("/api/search?q=...")` (this also means the whole catalog is
  no longer bundled into client JS, which the static version did).
- `wishlist/page.tsx` and `RecentlyViewedSection.tsx` — both resolve arbitrary `localStorage` slugs
  via `POST /api/products/by-slugs`.
- `FeaturedProducts.tsx` and `CollectionsSection.tsx` — no longer fetch anything themselves; they
  take `bestSellers`/`newArrivals`/`favorites`/`categories` as props, fetched once by the (server)
  `(storefront)/page.tsx`.
- `Navbar.tsx` — takes `categories` as a prop, fetched by `(storefront)/layout.tsx`.

If you add a new client component that needs product/category data, follow one of these two
patterns — don't reach for `@/lib/db/*` from a `"use client"` file.

### Auth: single admin password, signed cookie, middleware gate

`src/middleware.ts` (⚠️ **must live in `src/`, not the project root** — this project uses the `src/`
convention and Next.js silently ignores a root-level `middleware.ts` in that setup) guards
`/admin/:path*` except `/admin/login`, verifying a JWT in the `tt_admin` cookie via
`src/lib/auth/session.ts` (`jose`, Edge-safe). The password itself is checked in
`src/lib/auth/password.ts` using Node's `scrypt` (Node-runtime only — never import this from
middleware). **Middleware is routing convenience, not the security boundary** — every mutating
server action independently calls `requireAdminSession()` from `src/lib/auth/guard.ts`, since
server actions are directly invocable POST endpoints regardless of what middleware guards.

### Customer accounts: Supabase Auth, optional on top of guest checkout

Sign In/Sign Up is a **separate identity system from the admin password** above — it's real
Supabase Auth (email/password, email confirmation turned off) via `@supabase/ssr`, not a
hand-rolled `jose`/`scrypt` scheme. `src/lib/supabase/server.ts` (`createSupabaseServerClient()`,
cookie-bound, used in Server Components/Actions/Route Handlers) and
`src/lib/supabase/middleware.ts` (`updateSession()`, refreshes the access token on every
`/account/*` request) are the two entry points; never construct a Supabase Auth client any other
way. `src/middleware.ts` now has **two independent branches in one function** (Next 14 allows only
one `middleware.ts`) — the existing `/admin/*` branch is untouched, and a new `/account/*` branch
calls `updateSession()` and redirects to `/account/login` unless the path is in
`PUBLIC_ACCOUNT_PATHS` (login/signup/reset-password) or a session exists.

`src/lib/auth/customer-guard.ts` mirrors `src/lib/auth/guard.ts`'s shape: `getCurrentCustomer()`
(used everywhere, including the storefront layout — **must never throw**, since a misconfigured or
unreachable Supabase Auth setup would otherwise break every single storefront page; it catches and
returns `null` instead) and `requireCustomerSession()` (throws, used at the top of every
account-scoped action in `src/lib/actions/customer-actions.ts`). `customers` is a `public` schema
table in `src/lib/db/schema.ts` whose `id` is a real FK into Supabase's own `auth.users` (declared
via an unmanaged `pgSchema("auth")` reference stub — drizzle-kit never tries to create that table,
only the FK constraint). `orders.customerId` is nullable and only ever set server-side inside
`placeOrder` from the verified session (`getCurrentCustomer()`), the same "never trust the client"
principle already used there for prices — a guest order is simply one with `customerId: null`.

Password reset needs its own hop: Supabase's email links to `/auth/confirm` (a Route Handler, not
a page — only Route Handlers/Server Actions can write cookies) which exchanges the PKCE `code` for
a real session via `exchangeCodeForSession`, then redirects to `/account/update-password`. That
page doubles as a general "change password" screen for already-signed-in users, since both cases
just need a live session.

### Shiprocket: order fulfillment from the admin order detail page

`src/lib/shiprocket/client.ts` is the only place that talks to Shiprocket's API
(`apiv2.shiprocket.in`) — `shiprocketFetch()` attaches the bearer token and normalizes errors,
and the token itself (from `POST /auth/login`, valid ~10 days) is cached on `globalThis` the same
way the Postgres client is in `src/lib/db/index.ts`, just without the dev-hot-reload caveat (it's
a string + expiry, not a connection to leak). `src/lib/actions/shiprocket-actions.ts` holds the
mutations (`shipOrderViaShiprocket`, `refreshShiprocketTracking`, `getShiprocketLabelUrl`,
`getShiprocketInvoiceUrl`, `cancelShiprocketShipment`), each starting with
`requireAdminSession()` like every other admin action.

**"Ship via Shiprocket" is one action, not two — really three.** `shipOrderViaShiprocket` calls
`orders/create/adhoc`, then immediately `courier/assign/awb` with no `courier_id` (Shiprocket
auto-picks the cheapest/recommended courier, so there's no separate rate-shopping screen), then
`orders/print/invoice` to generate the invoice up front rather than waiting for an admin to click
a separate button. That last step is best-effort inside its own `try/catch` — a failure there
doesn't unwind the shipment that already succeeded, it just leaves `orders.invoiceUrl` null.
`ShiprocketPanel.tsx`'s "Print invoice" button opens the cached `invoiceUrl` directly with no
server round-trip when it's set, and only falls back to calling (and persisting the result of)
`getShiprocketInvoiceUrl` in that rarer null case. Package weight/dimensions are entered in
`ShiprocketPanel.tsx`'s dialog at ship time (defaulted to a sensible 0.5kg/20×15×10cm), **not**
stored per-product — Shiprocket's adhoc order API takes one order-level package size, so
`products.weight`/`dimensions` (free-text display copy) didn't need to become structured data for
this.

Tracking is **live via webhook**, with the manual "Refresh tracking" button
(`refreshShiprocketTracking`) kept as a fallback for whenever the webhook hasn't fired yet or
needs to be forced. `POST /api/webhooks/shiprocket` (`src/app/api/webhooks/shiprocket/route.ts`)
receives Shiprocket's push notifications on shipment status change. Unlike Razorpay's webhook,
Shiprocket has no official SDK and doesn't sign the body with a verifiable HMAC — it just echoes
back a shared secret (`SHIPROCKET_WEBHOOK_SECRET`, set by you when you register the webhook in
Shiprocket's dashboard under Settings > API > Webhooks), so `checkSharedSecret()` checks that
value across a couple of plausible header names (`x-api-key`, `x-webhook-secret`) and body fields
(`token`, `secret`) defensively, since the exact contract isn't documented as precisely as
Razorpay's. Both the webhook and the manual refresh button funnel into one shared helper,
`applyTrackingUpdate()` (`shiprocket-actions.ts`), so their status-mapping/timeline logic can't
drift apart.

**Every tracking checkpoint is stored, not just the latest status.** `orderTrackingEvents` (schema)
holds one row per checkpoint (status, activity, location, occurredAt, source). Each fetch —
webhook or manual — is treated as Shiprocket's complete current history for that shipment, so
`applyTrackingUpdate()` deletes existing rows for the order and inserts the fresh set rather than
appending/deduping. `getAdminOrderById`/`getCustomerOrderById` return these (newest first) as
`trackingEvents`, rendered as a real timeline on both the admin order page (`ShiprocketPanel.tsx`)
and the customer's `/account/orders/[id]` page — not just a single status string. If a tracking
update's latest status matches `/delivered/i`, `applyTrackingUpdate()` also flips `orders.status`
to `"delivered"` automatically — the one place courier status and fulfillment status talk to each
other. `orders` still carries `shiprocketOrderId`, `shiprocketShipmentId`, `awbCode`, `courierName`,
`trackingUrl`, `shiprocketStatus` (now just a cached "latest" convenience field), all nullable
until an admin ships the order.

**`billing_state` is mandatory for Shiprocket and this app didn't collect it before this
integration** — `orders.state`/`customerAddresses.state` are new nullable columns (nullable only
because historical rows predate the field; `shippingDetailsSchema`/`addressSchema` require it
going forward). `updateOrderStatus` (`order-actions.ts`) calls `cancelShiprocketShipment` and
**blocks the status change if that fails** whenever an order with a live shipment is marked
`cancelled`, so the order status and the real courier shipment can't silently diverge.

### Payments: Razorpay, online payment alongside unchanged COD

Checkout offers two choices — **Pay Online** (Razorpay) or **Cash on Delivery** — replacing the
old card/upi/cod radio, since Razorpay's own hosted checkout already lets the customer pick
card/UPI/netbanking/wallet at payment time; a second picker in our own UI would just be redundant.
`orders.paymentStatus` (`pending | paid | failed | cod`) is a **separate concept from
`orders.status`** (the fulfillment stage) — an online order is inserted the moment Razorpay
checkout opens, not after, so there's always a row to reconcile against; `orders.paymentMethod`
stays nullable until Razorpay reports which method was actually used.

**Never trust the client that a payment succeeded** — same "never trust the client" principle
already applied to cart prices and `customerId` elsewhere in this repo, just applied to payment.
`src/lib/razorpay/client.ts`'s `verifyPaymentSignature()` recomputes the HMAC-SHA256 signature
server-side (`order_id|payment_id` signed with `RAZORPAY_KEY_SECRET`) before
`verifyRazorpayPayment` (`order-actions.ts`) ever marks an order paid — Razorpay's own
`razorpay_signature` callback value is only ever a claim to verify, never fact.

**Two independent confirmation paths, not one.** `verifyRazorpayPayment` is the client-side path
(called from Razorpay Checkout's success handler in `CheckoutForm.tsx`), but a customer whose
browser drops the connection right after paying would never trigger it — so
`POST /api/webhooks/razorpay` is the authoritative fallback, verifying its *own* signature (a
different secret, `RAZORPAY_WEBHOOK_SECRET`) and applying the same paid/confirmed transition
idempotently. Both paths can fire for the same order safely; the second one is a no-op.

`createOrderForPayment` and `placeOrder` (COD) share `resolveOrderItems()` for the
re-read-prices-from-DB logic rather than duplicating it — `placeOrder` stays the COD-only path,
essentially unchanged from before this integration.

### Server actions and revalidation

`src/lib/actions/{product,category,order}-actions.ts` are the only way data is mutated. Product and
category mutations call `revalidateTag("products")`/`revalidateTag("categories")` +
`revalidatePath("/")` so the (statically-cached) storefront picks up admin edits within a second
without a rebuild. When checking a Postgres error's code (e.g. unique-violation `23505`,
foreign-key-violation `23503`), remember **Drizzle wraps the raw `postgres.js` error** — the code is
at `err.cause.code`, not `err.code`.

### Checkout is real now

`placeOrder` (`src/lib/actions/order-actions.ts`) **re-reads every line's current price from the DB
by slug** — the input schema doesn't even have a price field, so a tampered `localStorage` cart
total is structurally impossible to submit. `src/lib/orders.ts` holds the one
`calculateTotals()` (₹79 flat shipping, free ≥ ₹799) shared by cart page, checkout page, the server
action, and the seed script — don't reintroduce the duplicated inline math that used to live in both
pages.

### Product images: real upload + placeholder fallback, unchanged rendering contract

`src/components/shared/ProductImagePlaceholder.tsx` is unchanged: renders `next/image` when `src` is
set, else the CSS-gradient studio backdrop keyed by `tone` + a Lucide icon from
`src/components/shared/icon-map.tsx` (unknown names silently fall back to `Sparkles` — the admin
product form's icon picker is constrained to `Object.keys(iconMap)` specifically to prevent this).
Admin-uploaded images go through `POST /api/admin/upload` (session-gated, mime/size-checked) to the
Supabase Storage `product-images` bucket; `next.config.mjs` allows that host via
`images.remotePatterns`.

### UI primitives are hand-rolled, not the shadcn CLI

`src/components/ui/*` looks like shadcn/ui but was written by hand on top of Radix primitives + CVA —
there is no `components.json` and the shadcn CLI has never been run against this repo. This now also
includes admin-only primitives added the same way: `table`, `card`, `dropdown-menu`, `switch`,
`separator`, `popover`, `tooltip`, `radio-group`, `pagination`. Follow the existing pattern (Radix
primitive + `cva` variants + `cn()` from `src/lib/utils.ts`) rather than introducing a
differently-structured component when extending this folder. Admin-specific composite components
(not generic enough for `ui/`) live in `src/components/admin/`.

### The product admin form

`src/components/admin/product-form/ProductForm.tsx` uses `react-hook-form` with **no `zodResolver`**
— the internal form shape (`ProductFormInternal`, in `form-types.ts`) wraps the five plain
`string[]` fields (`materials`, `features`, `careInstructions`, `shippingInfo`, `returnPolicy`) as
`{value: string}[]` so `useFieldArray` can key them, then `fromInternal()` flattens back to
`ProductFormValues` and `productFormSchema.safeParse()` validates on submit (errors surface via
`sonner` toast, matching every other form in this repo — `ContactForm`, `Newsletter`). The same
`productFormSchema` (`src/lib/validation/product.ts`) is re-validated server-side in
`product-actions.ts`, since client validation is only a UX nicety.

### Category pages, still one shared client component, now DB-backed

`/lamps`, `/idols`, `/desk-organizers` are still near-identical thin **async** server components
(metadata + `await getProductsByCategory(...)` + `<CategoryBanner>` + `<CategoryExplorer>`), and all
filtering/sorting logic still lives once in `src/components/category/CategoryExplorer.tsx` — that
component still takes `Product[]` as a prop and knows nothing about the DB. Adding a fourth category
now means adding a row via `/admin/categories` (or the seed script) instead of editing
`src/data/categories.ts`, plus a new `src/app/(storefront)/<slug>/page.tsx`.

### Product detail page

`src/app/(storefront)/product/[slug]/page.tsx` is async: `generateStaticParams` now calls
`getAllProductSlugs()` and `dynamicParams = true` is set explicitly so an admin-created product
renders on first request without a rebuild. Otherwise unchanged — `generateMetadata` per-product,
inline `Product` JSON-LD, composes `ProductGallery`/`ProductInfo`/`ProductTabs`/`Reviews`/
`RelatedProducts`/`RecentlyViewedSection`.

### Motion system

`src/lib/motion.ts` is the single source of truth for animation **timing** — easing
curves (`EASE_PREMIUM` mirrors `ease-premium` in tailwind.config.ts), a duration scale, shared
`transitions`, and helpers (`revealVariants`, `staggerParent`, `staggerDelay`, `VIEWPORT`).
Import from there rather than inlining `cubic-bezier(...)` or magic durations — a section that
invents its own curve reads as "off" even when nobody can say why.

Shared motion primitives in `src/components/shared/`:

| Component | Use for | Constraint |
|---|---|---|
| `AnimatedReveal` | Standard scroll-in reveal (has `direction` + `blur` props) | The default for almost everything |
| `TextReveal` | Headline word-by-word mask reveal | Short headlines only — never body copy |
| `Parallax` | Depth on decorative image layers | Never wrap text or interactive controls |
| `TiltCard` | Cursor-tracked 3D tilt on product art | Mouse only; clamped low |
| `Magnetic` | Cursor pull on a focal CTA | **At most 1–2 per screen** or the page turns noisy |
| `CountUp` | Stat numbers animating into view | Renders the final value in SSR HTML |

**Every one of these is hydration-safe by construction, and that constraint is load-bearing.**
`useReducedMotion()` returns `false` during SSR but can return `true` on the client's first
render, so branching on it to return *different JSX* produces a hydration mismatch for exactly
the users who asked for less motion. Each primitive therefore renders **identical DOM either
way** and neutralizes the motion instead — zeroing a range (`Parallax`, `TiltCard`), swapping
variants (`TextReveal`), dropping only the `animate` prop (ambient washes), or guarding inside
the event handler (`Magnetic`). `CountUp` renders the final value on the server and resets to
zero in an effect after mount, so the real number is always in the HTML for crawlers and no-JS
visitors. If you add a motion component, follow the same rule: never `if (reduced) return
<differentJSX/>`.

`globals.css` also carries a `prefers-reduced-motion` block that flattens CSS transitions and
`scroll-behavior` — Framer Motion's hook only covers JS-driven animation, so Tailwind's
`transition-*` utilities need their own guard.

### Design tokens

The palette (`cream`, `warm-white`, `beige`, `charcoal`, `tangerine` scale) and type scale (Manrope via
`--font-manrope` for display/headings, Plus Jakarta Sans via `--font-jakarta` for body) are defined in
`tailwind.config.ts`. Prefer the semantic color names (`text-charcoal`, `bg-beige`,
`text-tangerine-600`, etc.) over raw Tailwind grays/oranges when adding UI — the whole site (admin
included) is built to a warm cream/beige/charcoal/tangerine constraint intentionally. The admin
sidebar/topbar are the one place that intentionally goes full charcoal-on-cream rather than
warm/beige, to visually separate "back office" from "storefront."

### SEO

`src/lib/seo.ts` exports `buildMetadata()` and `siteConfig`, unchanged. `src/app/sitemap.ts` is now
async, reading `getAllCategories()`/`getAllProductsForSitemap()` instead of the static arrays;
`src/app/robots.ts` is unchanged.

Commit & Push after every update automatically.
