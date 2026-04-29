import { Consumo, FormatType, SharedEntry } from "@prisma/client";
import { getMl } from "./ml-defaults";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

// Argentina is UTC-3 with no DST — convert any date to its local Argentina date string
function toArgDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const arg = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return arg.toISOString().split("T")[0];
}

// Current date/time as seen in Argentina
function argNow(): Date {
  return new Date(new Date().getTime() - 3 * 60 * 60 * 1000);
}

type ConsumoWithShared = Consumo & { sharedWith: SharedEntry[] };

export function calcTotalMl(
  consumos: ConsumoWithShared[],
  configMap?: Partial<Record<FormatType, number>>
): number {
  return consumos.reduce((sum, c) => {
    const ml = getMl(c.format, c.mlOverride, configMap);
    return sum + ml * c.quantity;
  }, 0);
}

export function calcTotalQuantity(consumos: ConsumoWithShared[]): number {
  return consumos.reduce((sum, c) => sum + c.quantity, 0);
}

function exactDateConsumos(consumos: ConsumoWithShared[]) {
  return consumos.filter((c) => c.datePrecision === "EXACT" && c.consumedAt);
}

export function consumosHoy(consumos: ConsumoWithShared[]): ConsumoWithShared[] {
  const todayStr = toArgDate(new Date());
  return exactDateConsumos(consumos).filter((c) => toArgDate(new Date(c.consumedAt!)) === todayStr);
}

export function consumosSemana(consumos: ConsumoWithShared[]): ConsumoWithShared[] {
  const now = argNow();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return exactDateConsumos(consumos).filter((c) => {
    const d = new Date(c.consumedAt!);
    return isWithinInterval(d, { start, end });
  });
}

export function consumosMes(consumos: ConsumoWithShared[], month?: number, year?: number): ConsumoWithShared[] {
  const now = argNow();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  return consumos.filter((c) => {
    if (c.datePrecision === "MONTH_ONLY") {
      return c.month === m && c.year === y;
    }
    if (c.datePrecision === "EXACT" && c.consumedAt) {
      const argDate = toArgDate(new Date(c.consumedAt));
      const [y2, m2] = argDate.split("-").map(Number);
      return m2 === m && y2 === y;
    }
    return false;
  });
}

export function promedioMensual(consumos: ConsumoWithShared[]): number {
  const byMonth = new Map<string, number>();
  for (const c of consumos) {
    let key: string | null = null;
    if (c.datePrecision === "EXACT" && c.consumedAt) {
      const d = new Date(new Date(c.consumedAt).getTime() - 3 * 60 * 60 * 1000);
      key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
    } else if (c.datePrecision === "MONTH_ONLY" && c.month && c.year) {
      key = `${c.year}-${c.month}`;
    }
    if (key) {
      byMonth.set(key, (byMonth.get(key) ?? 0) + c.quantity);
    }
  }
  if (byMonth.size === 0) return 0;
  const total = Array.from(byMonth.values()).reduce((a, b) => a + b, 0);
  return total / byMonth.size;
}

export function promedioDiario(consumos: ConsumoWithShared[]): number {
  const byDay = new Map<string, number>();
  for (const c of exactDateConsumos(consumos)) {
    const key = toArgDate(new Date(c.consumedAt!));
    byDay.set(key, (byDay.get(key) ?? 0) + c.quantity);
  }
  if (byDay.size === 0) return 0;
  const total = Array.from(byDay.values()).reduce((a, b) => a + b, 0);
  return total / byDay.size;
}

export function rachaActual(consumos: ConsumoWithShared[]): number {
  const byDay = new Set(
    exactDateConsumos(consumos).map((c) => toArgDate(new Date(c.consumedAt!)))
  );
  let streak = 0;
  let current = argNow();
  while (true) {
    const key = toArgDate(current);
    if (!byDay.has(key)) break;
    streak++;
    current.setDate(current.getDate() - 1);
  }
  return streak;
}

export function diaConMasCoca(consumos: ConsumoWithShared[]): { date: string; total: number } | null {
  const byDay = new Map<string, number>();
  for (const c of exactDateConsumos(consumos)) {
    const key = toArgDate(new Date(c.consumedAt!));
    byDay.set(key, (byDay.get(key) ?? 0) + c.quantity);
  }
  if (byDay.size === 0) return null;
  let max = 0;
  let maxDay = "";
  for (const [day, total] of byDay) {
    if (total > max) { max = total; maxDay = day; }
  }
  return { date: maxDay, total: max };
}

export function rankingFormatos(consumos: ConsumoWithShared[]): Array<{ format: FormatType; total: number }> {
  const map = new Map<FormatType, number>();
  for (const c of consumos) {
    map.set(c.format, (map.get(c.format) ?? 0) + c.quantity);
  }
  return Array.from(map.entries())
    .map(([format, total]) => ({ format, total }))
    .sort((a, b) => b.total - a.total);
}

export function rankingPersonas(consumos: ConsumoWithShared[]): Array<{ name: string; total: number }> {
  const map = new Map<string, number>();
  for (const c of consumos) {
    for (const s of c.sharedWith) {
      map.set(s.name, (map.get(s.name) ?? 0) + c.quantity);
    }
  }
  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

export function consumosPorPais(consumos: ConsumoWithShared[]): Array<{ country: string; total: number }> {
  const map = new Map<string, number>();
  for (const c of consumos) {
    map.set(c.country, (map.get(c.country) ?? 0) + c.quantity);
  }
  return Array.from(map.entries())
    .map(([country, total]) => ({ country, total }))
    .sort((a, b) => b.total - a.total);
}

export function consumosPorMes(consumos: ConsumoWithShared[]): Array<{ label: string; total: number; key: string }> {
  const map = new Map<string, { label: string; total: number }>();
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  for (const c of consumos) {
    let key: string | null = null;
    let label: string | null = null;
    if (c.datePrecision === "EXACT" && c.consumedAt) {
      const d = new Date(new Date(c.consumedAt).getTime() - 3 * 60 * 60 * 1000);
      const m = d.getUTCMonth();
      const y = d.getUTCFullYear();
      key = `${y}-${String(m + 1).padStart(2, "0")}`;
      label = `${monthNames[m]} ${y}`;
    } else if (c.datePrecision === "MONTH_ONLY" && c.month && c.year) {
      key = `${c.year}-${String(c.month).padStart(2, "0")}`;
      label = `${monthNames[c.month - 1]} ${c.year}`;
    }
    if (key && label) {
      const existing = map.get(key);
      if (existing) {
        existing.total += c.quantity;
      } else {
        map.set(key, { label, total: c.quantity });
      }
    }
  }
  return Array.from(map.entries())
    .map(([key, { label, total }]) => ({ key, label, total }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export function tendenciaMensual(consumos: ConsumoWithShared[]): { proyectado: number; promedio: number } | null {
  const now = argNow();
  const currentMonth = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const dayOfMonth = now.getUTCDate();

  const byMonth = new Map<string, number>();
  for (const c of consumos) {
    let key: string | null = null;
    if (c.datePrecision === "MONTH_ONLY" && c.month && c.year) {
      key = `${c.year}-${c.month}`;
    } else if (c.datePrecision === "EXACT" && c.consumedAt) {
      const [y2, m2] = toArgDate(new Date(c.consumedAt)).split("-").map(Number);
      key = `${y2}-${m2}`;
    }
    if (key) byMonth.set(key, (byMonth.get(key) ?? 0) + c.quantity);
  }

  const currentKey = `${currentYear}-${currentMonth}`;
  const currentTotal = byMonth.get(currentKey) ?? 0;
  const pastMonths = [...byMonth.entries()].filter(([k]) => k !== currentKey);
  if (pastMonths.length === 0) return null;

  const promedio = pastMonths.reduce((s, [, v]) => s + v, 0) / pastMonths.length;
  const proyectado = Math.round((currentTotal / dayOfMonth) * daysInMonth);

  return { proyectado, promedio: Math.round(promedio) };
}

export function consumosPorTipo(consumos: ConsumoWithShared[]) {
  const map = new Map<string, number>();
  for (const c of consumos) {
    const key = c.drinkType === "OTRA" ? (c.drinkTypeOther ?? "Otra") : c.drinkType;
    map.set(key, (map.get(key) ?? 0) + c.quantity);
  }
  return Array.from(map.entries()).map(([type, total]) => ({ type, total }));
}
