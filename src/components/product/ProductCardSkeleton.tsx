import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full rounded-2xl md:rounded-[28px]" />
      <div className="mt-2.5 space-y-1.5 md:hidden">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}
