import { FormatType, DrinkType, DatePrecision } from "@prisma/client";

export interface ParsedEntry {
  quantity: number;
  format: FormatType;
  formatOther?: string;
  drinkType: DrinkType;
  drinkTypeOther?: string;
  mlOverride?: number;
  datePrecision: DatePrecision;
  month?: number;
  year?: number;
  country: string;
  place?: string;
  sharedWith: string[];
  notes: string;
  rawLine: string;
  dubious?: boolean;
  dubiousReason?: string;
}

const MONTH_MAP: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

const COUNTRY_MAP: Record<string, string> = {
  argentina: "Argentina",
  arg: "Argentina",
  arge: "Argentina",
  uruguay: "Uruguay",
  uru: "Uruguay",
  urug: "Uruguay",
  brasil: "Brasil",
  brazil: "Brasil",
  bra: "Brasil",
  "estados unidos": "Estados Unidos",
  "estados_unidos": "Estados Unidos",
  usa: "Estados Unidos",
  us: "Estados Unidos",
  eeuu: "Estados Unidos",
};

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseQuantity(token: string): number | null {
  if (token === "1/2" || token === "½") return 0.5;
  const n = parseFloat(token);
  if (!isNaN(n) && n > 0) return n;
  return null;
}

function extractMlOverride(line: string): number | null {
  const match = line.match(/(\d{2,4})\s*ml/i);
  if (match) {
    const ml = parseInt(match[1]);
    if (ml >= 50 && ml <= 3000) return ml;
  }
  return null;
}

function detectFormat(norm: string): { format: FormatType; formatOther?: string } | null {
  if (/\bmaquina\b|\bmaquinta\b/.test(norm)) return { format: "MAQUINA" };
  if (/\bmc\b|\bMc\b|\bmcd\b|\bmcdonalds\b/.test(norm)) return { format: "MC" };
  if (/\bvidri(o|a|e)\b|\bvidiro\b/.test(norm)) return { format: "BOTELLA_VIDRIO" };
  if (/\blata\b|\blata\b|\bcixa\b|\bcoxa\b/.test(norm)) return { format: "LATA" };
  if (/\bvaso(s)?\b|\bvasos\b|\bvasoa\b/.test(norm)) return { format: "VASO" };
  if (/\bbotella\b|\bbotellas\b/.test(norm)) {
    if (/\bchiqu?i?t?a\b/.test(norm)) return { format: "BOTELLA_PLASTICA" };
    if (/\bplastic(a|o)\b/.test(norm)) return { format: "BOTELLA_PLASTICA" };
    return { format: "BOTELLA_VIDRIO" };
  }
  if (/\bcopa(s)?\b/.test(norm)) return { format: "VASO" };
  if (/\bslushi\b|\bfrozen\b/.test(norm)) return { format: "OTRO", formatOther: "frozen slushi" };
  return null;
}

function detectDrinkType(norm: string): { drinkType: DrinkType; drinkTypeOther?: string } {
  if (/\bzero\b/.test(norm)) return { drinkType: "ZERO" };
  if (/\bpepsi\b/.test(norm)) return { drinkType: "PEPSI" };
  if (/\bfanta\b|\bsprite\b|\b7up\b/.test(norm)) return { drinkType: "OTRA", drinkTypeOther: norm.match(/\b(fanta|sprite|7up)\b/)?.[0] };
  return { drinkType: "COMUN" };
}

function extractSharedWith(norm: string): string[] {
  const shared: string[] = [];
  const conMatch = norm.match(/\bcon\s+(.+)$/);
  if (!conMatch) return shared;
  const afterCon = conMatch[1];
  const rawNames = afterCon.split(/\s+y\s+|\s*,\s*/);
  const ignored = new Set(["el", "la", "los", "las", "un", "una", "fede", "vicu", "nacho"]);
  const knownNames = ["fede", "vicu", "nacho"];
  for (const raw of rawNames) {
    const n = raw.trim();
    if (!n) continue;
    if (knownNames.includes(n)) {
      shared.push(n);
    } else if (!ignored.has(n) && n.length > 1) {
      shared.push(n);
    }
  }
  return [...new Set(shared)];
}

function extractPlace(norm: string): string | undefined {
  const atMatch = norm.match(/\ben\s+(.+?)(?:\s+con\b|$)/);
  if (!atMatch) return undefined;
  const place = atMatch[1].trim();
  const irrelevant = ["el", "la", "los", "las", "un", "avion", "el avion"];
  if (irrelevant.includes(place)) return undefined;
  return place;
}

function isHeader(line: string): boolean {
  const norm = normalizeText(line);
  if (MONTH_MAP[norm] !== undefined) return true;
  if (COUNTRY_MAP[norm] !== undefined) return true;
  if (norm === "oca" || norm === "coca") return true;
  return false;
}

export function parseTxt(
  text: string,
  defaultYear = 2026
): { entries: ParsedEntry[]; skipped: string[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const entries: ParsedEntry[] = [];
  const skipped: string[] = [];

  let currentMonth: number | null = null;
  let currentCountry = "Uruguay"; // default from dataset context
  let lastCountrySet = false;

  for (const rawLine of lines) {
    const norm = normalizeText(rawLine);

    // Skip headers like "OCA"
    if (norm === "oca" || norm === "coca") continue;

    // Month detection
    if (MONTH_MAP[norm] !== undefined) {
      currentMonth = MONTH_MAP[norm];
      lastCountrySet = false;
      continue;
    }

    // Country detection
    if (COUNTRY_MAP[norm] !== undefined) {
      currentCountry = COUNTRY_MAP[norm];
      lastCountrySet = true;
      continue;
    }

    // Try to parse as a consumption line
    // Extract quantity first
    const tokens = norm.split(/\s+/);
    const qty = parseQuantity(tokens[0]);

    if (qty === null) {
      skipped.push(rawLine);
      continue;
    }

    const mlOverride = extractMlOverride(norm);
    const formatResult = detectFormat(norm);

    if (!formatResult) {
      // Try to guess - if it mentions "coca" generically, treat as LATA
      if (/\bcoca\b|\bcoxa\b|\bcixa\b/.test(norm)) {
        entries.push({
          quantity: qty,
          format: "LATA",
          drinkType: "COMUN",
          datePrecision: "MONTH_ONLY",
          month: currentMonth ?? undefined,
          year: defaultYear,
          country: currentCountry,
          sharedWith: extractSharedWith(norm),
          notes: rawLine,
          rawLine,
          dubious: true,
          dubiousReason: "formato no detectado, asumido LATA",
        });
        continue;
      }
      skipped.push(rawLine);
      continue;
    }

    const drinkInfo = detectDrinkType(norm);
    const sharedWith = extractSharedWith(norm);

    let place: string | undefined;
    if (formatResult.format === "MAQUINA") {
      place = extractPlace(norm);
    }

    entries.push({
      quantity: qty,
      format: formatResult.format,
      formatOther: formatResult.formatOther,
      drinkType: drinkInfo.drinkType,
      drinkTypeOther: drinkInfo.drinkTypeOther,
      mlOverride: mlOverride ?? undefined,
      datePrecision: "MONTH_ONLY",
      month: currentMonth ?? undefined,
      year: defaultYear,
      country: currentCountry,
      place,
      sharedWith,
      notes: rawLine,
      rawLine,
    });
  }

  return { entries, skipped };
}
