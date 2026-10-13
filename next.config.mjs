/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // The design-thumbnail route reads these font files from disk at request time, which
    // Next's file tracing can't see, so Vercel would otherwise leave them out of the bundle.
    outputFileTracingIncludes: {
      "/api/design-image": ["./src/assets/fonts/**/*"],
    },
  },
};

export default nextConfig;
