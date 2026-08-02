import { Skeleton } from "@/components/ui/skeleton";

// Matches ProductCard's current shape — info now overlays the image rather
// than stacking below it, so the skeleton is just the one card-sized block.
export function ProductCardSkeleton() {
  return <Skeleton className="aspect-[4/5] w-full rounded-[28px]" />;
}
