import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Price({
  price,
  compareAtPrice,
  size = "md",
  className,
}: {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold text-charcoal", sizes[size])}>{formatINR(price)}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-xs text-muted line-through">{formatINR(compareAtPrice)}</span>
      )}
    </div>
  );
}
