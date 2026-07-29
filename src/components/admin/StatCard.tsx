import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  deltaPct,
}: {
  label: string;
  value: string;
  deltaPct?: number;
}) {
  const hasDelta = typeof deltaPct === "number" && Number.isFinite(deltaPct);
  const positive = hasDelta && deltaPct! >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-2 font-display text-3xl text-charcoal">{value}</p>
        {hasDelta && (
          <p
            className={cn(
              "mt-2 flex items-center gap-1 text-xs font-medium",
              positive ? "text-emerald-600" : "text-red-600"
            )}
          >
            {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(deltaPct!).toFixed(1)}% vs previous period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
