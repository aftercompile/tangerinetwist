import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        bestseller: "bg-charcoal text-cream",
        new: "bg-tangerine-500 text-white",
        limited: "bg-beige-dark text-charcoal",
        outline: "border border-border text-charcoal",
        soft: "bg-tangerine-50 text-tangerine-700",
        // Richer editorial labels for the category-page redesign — assigned sparingly to
        // standout products, not a replacement for the three core badges above.
        "artist-pick": "bg-tangerine-100 text-tangerine-800",
        "hand-finished": "border border-beige-dark bg-beige text-charcoal",
        signature: "bg-tangerine-800 text-cream",
        "premium-finish": "border border-tangerine-300 bg-tangerine-50 text-tangerine-700",
      },
    },
    defaultVariants: { variant: "outline" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
