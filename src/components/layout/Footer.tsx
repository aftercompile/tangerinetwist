"use client";

import * as React from "react";
import Link from "next/link";
import { Instagram, Facebook, Youtube, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const shopLinks = [
  { href: "/lamps", label: "Designer Lamps" },
  { href: "/idols", label: "Decorative Idols" },
  { href: "/desk-organizers", label: "Desk Organizers" },
  { href: "/wishlist", label: "Wishlist" },
];

const companyLinks = [
  { href: "/about", label: "Our Story" },
  { href: "/about#craftsmanship", label: "Craftsmanship" },
  { href: "/contact", label: "Contact" },
];

const helpLinks = [
  { href: "/contact", label: "Shipping Information" },
  { href: "/contact", label: "Returns & Exchanges" },
  { href: "/contact", label: "FAQs" },
];

export function Footer() {
  const [email, setEmail] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("You're on the list. Welcome to TangerineTwist.");
    setEmail("");
  }

  return (
    <footer className="mt-32 border-t border-border bg-warm-white">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-tangerine-500" />
              <span className="h-display text-xl">TangerineTwist</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              A modern design studio crafting premium 3D-printed home décor and workspace
              essentials — designed, printed and hand-finished in India.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 flex max-w-sm gap-2">
              <Input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <Button type="submit" variant="primary" size="md" className="shrink-0" aria-label="Subscribe">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TangerineTwist on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-charcoal transition hover:bg-beige"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TangerineTwist on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-charcoal transition hover:bg-beige"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TangerineTwist on YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-charcoal transition hover:bg-beige"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Studio" links={companyLinks} />
          <FooterColumn title="Support" links={helpLinks} />
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} TangerineTwist Design Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Made with precision in India</span>
            <span>Premium PLA · 8K Resin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-charcoal">{title}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-sm text-muted transition hover:text-charcoal">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
