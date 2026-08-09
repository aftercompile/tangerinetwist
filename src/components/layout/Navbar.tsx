"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Heart, ShoppingBag, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { CategoryMeta } from "@/lib/types";
import type { CurrentCustomer } from "@/lib/auth/customer-guard";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchOverlay } from "./SearchOverlay";

export function Navbar({ categories, customer }: { categories: CategoryMeta[]; customer: CurrentCustomer | null }) {
  // Built from the live categories list (not hardcoded) so a newly added category
  // shows up in both the desktop and mobile nav without a code change.
  const navLinks = [
    { href: "/", label: "Home" },
    ...categories.map((c) => ({ href: `/${c.slug}`, label: c.name })),
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const { itemCount, setOpen: setCartOpen } = useCart();
  const { slugs } = useWishlist();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled ? "border-b border-border bg-warm-white/90 backdrop-blur-md" : "bg-transparent"
      )}
    >
      <div className="container-wide flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="TangerineTwist home">
          <span className="h-2 w-2 rounded-full bg-tangerine-500" />
          <span className="h-display text-xl tracking-tight">TangerineTwist</span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "link-underline text-[15px] font-medium text-charcoal/80 transition-colors hover:text-charcoal",
                pathname === link.href && "text-charcoal after:w-full"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition hover:bg-beige"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${slugs.length} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition hover:bg-beige"
          >
            <Heart className="h-[18px] w-[18px]" />
            {slugs.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-tangerine-500 text-[10px] font-semibold text-white">
                {slugs.length}
              </span>
            )}
          </Link>
          <Link
            href={customer ? "/account" : "/account/login"}
            aria-label={customer ? `Account, signed in as ${customer.fullName}` : "Sign in"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition hover:bg-beige"
          >
            <User className="h-[18px] w-[18px]" />
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Cart, ${itemCount} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition hover:bg-beige"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-tangerine-500 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition hover:bg-beige lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent title="Site menu" side="left" className="max-w-xs">
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <span className="h-display text-lg">Menu</span>
              </div>
              <nav className="flex flex-col gap-1 px-4 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-3 text-base font-medium text-charcoal transition hover:bg-beige"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
