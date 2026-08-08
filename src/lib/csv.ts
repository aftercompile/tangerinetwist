// Quotes a field per RFC 4180: wrap in quotes (doubling any internal quotes) whenever it
// contains a comma, quote, or newline — otherwise leave it bare.
function csvField(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

// RFC 4180-aware: handles quoted fields containing commas/newlines and doubled-quote
// escaping — a naive text.split(",").split("\n") breaks on any marketplace export whose
// address column contains a comma, which is essentially all of them. Handles both \n and
// \r\n line endings. Trailing blank line (common in exported CSVs) is dropped.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

export function toCsv<T extends object>(rows: T[], columns: { key: keyof T; label: string }[]): string {
  const header = columns.map((c) => csvField(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => csvField(row[c.key])).join(","));
  return [header, ...body].join("\n");
}

// Only ever called from a client component's onClick — triggers a browser download via a
// throwaway anchor rather than navigating, since there's no server endpoint to hit (the
// data's already on the page).
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
