import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-wide flex min-h-screen flex-col items-center justify-center gap-5 text-center">
      <p className="eyebrow">404</p>
      <h1 className="h-display text-3xl md:text-4xl">This page wandered off</h1>
      <p className="max-w-sm text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button variant="accent" size="lg" asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
