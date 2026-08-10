"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

// Replaces the shadcn <Select>. Single-select, so a single shared layoutId
// pill can safely slide between options (unlike FilterChips, which is
// multi-select and can't rely on there being exactly one active element).
export function SortSegmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    // flex-wrap previously let this fall to a second row on narrow screens —
    // a rounded-full pill only reads correctly as one line, so two rows
    // rendered as a distorted, overflowing blob (same class of bug as the
    // product-card badges). Kept as one row and made horizontally
    // scrollable instead, with min-w-0 so it can actually shrink below its
    // content width inside the flex row above it — without that, a flex
    // item never shrinks past its content size and the whole row would
    // overflow the viewport rather than this control scrolling internally.
    <div
      role="radiogroup"
      aria-label="Sort products"
      className="flex min-w-0 flex-nowrap gap-1 overflow-x-auto rounded-full border border-border bg-warm-white p-1 scrollbar-none"
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              isActive ? "text-cream" : "text-charcoal/70 hover:text-charcoal"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="sort-active-pill"
                className="absolute inset-0 rounded-full bg-charcoal"
                transition={{ type: "spring", stiffness: 350, damping: 32 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
