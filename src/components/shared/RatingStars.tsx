import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
  className,
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              className={cn(starSize, filled ? "fill-tangerine-500 text-tangerine-500" : "fill-none text-border")}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      {reviewCount !== undefined && (
        <span className="text-xs text-muted">
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>
  );
}
