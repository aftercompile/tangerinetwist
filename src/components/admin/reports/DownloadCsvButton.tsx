"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toCsv, downloadCsv } from "@/lib/csv";

// The reports page itself is a server component (it does the DB reads), so each card's
// already-fetched row data is handed down as a prop to this small client button rather than
// the page re-fetching anything on click.
export function DownloadCsvButton<T extends object>({
  filename,
  rows,
  columns,
}: {
  filename: string;
  rows: T[];
  columns: { key: keyof T; label: string }[];
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(filename, toCsv(rows, columns))}
    >
      <Download className="h-3.5 w-3.5" /> Download CSV
    </Button>
  );
}
