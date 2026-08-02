import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Price({
  price,
  compareAtPrice,
  size = "md",
  tone = "dark",
  className,
}: {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  // "light" for overlaying on a dark scrim — see RatingStars' tone prop for why this
  // can't just be handled by passing a className to the wrapper.
  tone?: "dark" | "light";
  className?: string;
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold", tone === "light" ? "text-white" : "text-charcoal", sizes[size])}>
        {formatINR(price)}
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <span className={cn("text-xs line-through", tone === "light" ? "text-white/60" : "text-muted")}>
          {formatINR(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
