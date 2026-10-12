import type { Metadata, Viewport } from "next";
import { Manrope, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ogImage, siteConfig } from "@/lib/seo";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

// Wordmark only (see components/shared/Logo.tsx) — closest Google Font to the
// supplied TangerineTwist logo lettering. Variable, so the light 300 weight
// used on large lockups and the slightly heavier nav weight share one file.
const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Premium 3D-Printed Home Décor & Workspace Essentials`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  // Declared explicitly: a `icons` config here replaces any file-based icon.png /
  // apple-icon.png, so those would never be linked from the page head.
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/icon-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [ogImage.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF8F3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jakarta.variable} ${outfit.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        {/* Organization + LocalBusiness combined on one entity (schema.org allows a
            type array) rather than two separate script tags that could read as
            conflicting entities. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Organization", "LocalBusiness"],
              name: siteConfig.name,
              url: siteConfig.url,
              logo: `${siteConfig.url}/brand/logo-512.png`,
              image: `${siteConfig.url}/brand/logo-512.png`,
              description: siteConfig.description,
              email: "hello@tangerinetwist.in",
              telephone: "+91-63539-08104",
              sameAs: [siteConfig.social.instagram],
              address: {
                "@type": "PostalAddress",
                // No public street-level address exists on the Contact page —
                // this mirrors what's actually displayed there rather than
                // inventing precision that isn't public.
                streetAddress: "TangerineTwist Design Studio",
                addressLocality: "Vadodara",
                addressRegion: "Gujarat",
                addressCountry: "IN",
              },
            }),
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
