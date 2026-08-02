import type { Metadata, Viewport } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/lib/seo";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Premium 3D-Printed Home Décor & Workspace Essentials`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF8F3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jakarta.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        {/* Organization + LocalBusiness combined on one entity (schema.org allows a
            type array) rather than two separate script tags that could read as
            conflicting entities. No `sameAs` — TangerineTwist doesn't have public
            social profiles live yet; a placeholder link to instagram.com's own
            homepage (the previous state here) is worse than no field at all. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Organization", "LocalBusiness"],
              name: siteConfig.name,
              url: siteConfig.url,
              description: siteConfig.description,
              email: "hello@tangerinetwist.in",
              telephone: "+91-63539-08104",
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
