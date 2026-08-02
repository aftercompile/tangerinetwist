import { headers } from "next/headers";
import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { ADMIN_HOST } from "@/lib/auth/admin-routes";

export default function robots(): MetadataRoute.Robots {
  // The admin panel lives on its own subdomain and is entirely session-gated
  // already, but there's no reason to let it appear in search results at
  // all — a blanket disallow here is a free extra layer.
  if (headers().get("host") === ADMIN_HOST) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/cart", "/wishlist", "/account", "/api"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
