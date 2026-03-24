import { parse } from "csv-parse/sync";

export function parseCsv(content: string) {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((row: any) => ({
    name: row.name || row.biomarker || "",
    normalizedName:
      (row.name || row.biomarker || "")
        .toLowerCase()
        .replace(/\s+/g, "_") || "",
    value: Number(row.value),
    unit: row.unit || "",
    referenceMin: row.referenceMin
      ? Number(row.referenceMin)
      : undefined,
    referenceMax: row.referenceMax
      ? Number(row.referenceMax)
      : undefined,
    status: row.status || "normal",
  }));
}