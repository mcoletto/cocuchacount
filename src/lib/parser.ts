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
  argentina: "Argentina", arg: "Argentina", arge: "Argentina",
  uruguay: "Uruguay", uru: "Uruguay", urug: "Uruguay",
  brasil: "Brasil", brazil: "Brasil", bra: "Brasil",
  "estados unidos": "Estados Unidos", usa: "Estados Unidos",
  us: "Estados Unidos", eeuu: "Estados Unidos",
};

function normalizeText(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
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
  if (/\bmc\b|\bmcd\b|\bmcdonalds\b/.test(norm)) return { format: "MC" };
  if (/\bvidri(o|a|e)\b|\bvidiro\b|\bcocs?\b/.test(norm)) return { format: "BOTELLA_VIDRIO" };
  // lata/latas + typos
  if (/\blatas?\b|\bcixa\b|\bcoxa\b/.test(norm)) return { format: "LATA" };
  if (/\bvasos?\b|\bvasoa\b|\bcopas?\b/.test(norm)) return { format: "VASO" };
  if (/\bbotellas?\b/.test(norm)) {
    if (/\bchiqu?i?t?a\b|\bchica\b|\bpeque/.test(norm)) return { format: "BOTELLA_PLASTICA" };
    if (/\bplastic(a|o)\b/.test(norm)) return { format: "BOTELLA_PLASTICA" };
    return { format: "BOTELLA_VIDRIO" };
  }
  if (/\bslushi\b|\bfrozen\b/.test(norm)) return { format: "OTRO", formatOther: "frozen slushi" };
  return null;
}

function detectDrinkType(norm: string): { drinkType: DrinkType; drinkTypeOther?: string } {
  if (/\bzero\b/.test(norm)) return { drinkType: "ZERO" };
  if (/\bpepsi\b/.test(norm)) return { drinkType: "PEPSI" };
  if (/\bfanta\b|\bsprite\b|\b7up\b/.test(norm)) {
    const m = norm.match(/\b(fanta|sprite|7up)\b/);
    return { drinkType: "OTRA", drinkTypeOther: m?.[0] };
  }
  return { drinkType: "COMUN" };
}

function extractSharedWith(norm: string): string[] {
  const shared: string[] = [];
  const conMatch = norm.match(/\bcon\s+(.+?)(?:\s+en\b|$)/);
  if (!conMatch) return shared;
  const afterCon = conMatch[1];
  const rawNames = afterCon.split(/\s+y\s+|\s*,\s*/);
  const knownNames = ["fede", "vicu", "nacho"];
  const ignored = new Set(["el", "la", "los", "las", "un", "una"]);
  for (const raw of rawNames) {
    const n = raw.trim();
    if (!n || ignored.has(n)) continue;
    shared.push(n);
  }
  return [...new Set(shared)];
}

function extractPlace(norm: string): string | undefined {
  const atMatch = norm.match(/\ben\s+(.+?)(?:\s+con\b|$)/);
  if (!atMatch) return undefined;
  const place = atMatch[1].trim();
  const irrelevant = ["el", "la", "los", "las", "un", "el avion", "avion", "rf"];
  if (irrelevant.includes(place)) return undefined;
  return place;
}

export function parseTxt(
  text: string,
  defaultYear = 2026
): { entries: ParsedEntry[]; skipped: string[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const entries: ParsedEntry[] = [];
  const skipped: string[] = [];

  let currentMonth: number | null = null;
  let currentCountry = "Uruguay";

  for (const rawLine of lines) {
    const norm = normalizeText(rawLine);

    if (norm === "oca" || norm === "coca") continue;
    if (MONTH_MAP[norm] !== undefined) { currentMonth = MONTH_MAP[norm]; continue; }
    if (COUNTRY_MAP[norm] !== undefined) { currentCountry = COUNTRY_MAP[norm]; continue; }

    // Normalize spaceless patterns like "1cocA" → "1 coca", "vaso decoca" → "vaso de coca"
    const cleaned = norm.replace(/(\d)(coca|lata|vaso)/gi, "$1 $2").replace(/decoca/, "de coca");

    const tokens = cleaned.split(/\s+/);
    const qty = parseQuantity(tokens[0]);
    if (qty === null) { skipped.push(rawLine); continue; }

    const mlOverride = extractMlOverride(norm);
    const drinkInfo = detectDrinkType(norm);
    let formatResult = detectFormat(cleaned);

    // Special case: pepsi/otra bebida + chica/pequeña sin formato → BOTELLA_PLASTICA
    if (!formatResult && drinkInfo.drinkType !== "COMUN" && /\bchica\b|\bpeque/.test(norm)) {
      formatResult = { format: "BOTELLA_PLASTICA" };
    }

    // Fallback: if "coca" keyword present, assume LATA
    if (!formatResult) {
      if (/\bcoca\b|\bcoxa\b|\bcixa\b/.test(norm)) {
        entries.push({
          quantity: qty, format: "LATA", drinkType: drinkInfo.drinkType,
          drinkTypeOther: drinkInfo.drinkTypeOther,
          datePrecision: "MONTH_ONLY",
          month: currentMonth ?? undefined, year: defaultYear,
          country: currentCountry,
          sharedWith: extractSharedWith(norm),
          notes: rawLine, rawLine,
          dubious: true, dubiousReason: "formato no detectado, asumido LATA",
        });
      } else {
        skipped.push(rawLine);
      }
      continue;
    }

    const sharedWith = extractSharedWith(norm);
    let place: string | undefined;
    if (formatResult.format === "MAQUINA") place = extractPlace(norm);

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
