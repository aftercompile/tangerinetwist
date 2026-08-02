import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
  tone = "dark",
  className,
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  // "light" for overlaying on a dark scrim (e.g. the product card image overlay) —
  // Tailwind classes on the star/count elements are explicit, so an external
  // className on the wrapper can't cascade a color override into them.
  tone?: "dark" | "light";
  className?: string;
}) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const emptyStarClass = tone === "light" ? "fill-none text-white/40" : "fill-none text-border";
  const countClass = tone === "light" ? "text-white/80" : "text-muted";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              className={cn(starSize, filled ? "fill-tangerine-500 text-tangerine-500" : emptyStarClass)}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      {reviewCount !== undefined && (
        <span className={cn("text-xs", countClass)}>
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>
  );
}
