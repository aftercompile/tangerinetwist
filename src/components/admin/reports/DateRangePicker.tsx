"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Native date inputs, not a Calendar/react-day-picker widget — this repo has no date-picker
// primitive yet and two plain fields don't warrant adding one. URL is the source of truth
// (?from=&to=), same "Link-driven" approach the dashboard's period pills use, just with
// arbitrary dates instead of a fixed list.
export function DateRangePicker({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftFrom, setDraftFrom] = React.useState(from);
  const [draftTo, setDraftTo] = React.useState(to);

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", draftFrom);
    params.set("to", draftTo);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-warm-white p-3">
      <div>
        <Label htmlFor="report-from">From</Label>
        <Input
          id="report-from"
          type="date"
          value={draftFrom}
          max={draftTo}
          onChange={(e) => setDraftFrom(e.target.value)}
          className="w-40"
        />
      </div>
      <div>
        <Label htmlFor="report-to">To</Label>
        <Input
          id="report-to"
          type="date"
          value={draftTo}
          min={draftFrom}
          onChange={(e) => setDraftTo(e.target.value)}
          className="w-40"
        />
      </div>
      <Button type="button" variant="accent" size="sm" onClick={apply}>
        Apply
      </Button>
    </div>
  );
}
