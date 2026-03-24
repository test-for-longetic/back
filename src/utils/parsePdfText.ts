type ExtractedBiomarker = {
  name: string;
  normalizedName: string;
  value: number;
  unit?: string;
  referenceMin?: number;
  referenceMax?: number;
  status?: string;
};

const KNOWN_BIOMARKERS = [
  "Glucose",
  "Hemoglobin",
  "Vitamin D",
  "Cholesterol",
  "Platelets",
  "Ferritin",
  "Iron",
  "Vitamin B12",
];

function normalizeName(name: string) {
  return name.toLowerCase().replace(/\s+/g, "_");
}

function inferStatus(
  value?: number,
  referenceMin?: number,
  referenceMax?: number
) {
  if (value == null || referenceMin == null || referenceMax == null) {
    return "normal";
  }

  if (value < referenceMin) return "low";
  if (value > referenceMax) return "high";
  return "normal";
}

export function parsePdfText(text: string): ExtractedBiomarker[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const results: ExtractedBiomarker[] = [];

  for (const line of lines) {
    for (const biomarker of KNOWN_BIOMARKERS) {
      if (!line.toLowerCase().includes(biomarker.toLowerCase())) continue;

      // Приклад очікуваного рядка:
      // Glucose 5.8 mmol/L 3.9 5.5
      const numberMatches = line.match(/-?\d+(\.\d+)?/g) ?? [];

      if (numberMatches.length === 0) continue;

      const value = Number(numberMatches[0]);
      const referenceMin =
        numberMatches.length > 1 ? Number(numberMatches[1]) : undefined;
      const referenceMax =
        numberMatches.length > 2 ? Number(numberMatches[2]) : undefined;

      const unitMatch = line.match(
        /(mmol\/L|g\/L|ng\/mL|pg\/mL|mg\/dL|10\^9\/L|µg\/L|ug\/L)/i
      );

      const unit = unitMatch?.[0];

      results.push({
        name: biomarker,
        normalizedName: normalizeName(biomarker),
        value,
        unit,
        referenceMin,
        referenceMax,
        status: inferStatus(value, referenceMin, referenceMax),
      });

      break;
    }
  }

  return results;
}