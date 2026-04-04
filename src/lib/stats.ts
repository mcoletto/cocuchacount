import { Consumo, FormatType, SharedEntry } from "@prisma/client";
import { getMl, ML_DEFAULTS } from "./ml-defaults";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

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
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  return exactDateConsumos(consumos).filter((c) => {
    const d = c.consumedAt!;
    return new Date(d).toISOString().split("T")[0] === todayStr;
  });
}

export function consumosSemana(consumos: ConsumoWithShared[]): ConsumoWithShared[] {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return exactDateConsumos(consumos).filter((c) => {
    const d = new Date(c.consumedAt!);
    return isWithinInterval(d, { start, end });
  });
}

export function consumosMes(consumos: ConsumoWithShared[], month?: number, year?: number): ConsumoWithShared[] {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  return consumos.filter((c) => {
    if (c.datePrecision === "MONTH_ONLY") {
      return c.month === m && c.year === y;
    }
    if (c.datePrecision === "EXACT" && c.consumedAt) {
      const d = new Date(c.consumedAt);
      return d.getMonth() + 1 === m && d.getFullYear() === y;
    }
    return false;
  });
}

export function promedioMensual(consumos: ConsumoWithShared[]): number {
  const byMonth = new Map<string, number>();
  for (const c of consumos) {
    let key: string | null = null;
    if (c.datePrecision === "EXACT" && c.consumedAt) {
      const d = new Date(c.consumedAt);
      key = `${d.getFullYear()}-${d.getMonth() + 1}`;
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
    const key = new Date(c.consumedAt!).toISOString().split("T")[0];
    byDay.set(key, (byDay.get(key) ?? 0) + c.quantity);
  }
  if (byDay.size === 0) return 0;
  const total = Array.from(byDay.values()).reduce((a, b) => a + b, 0);
  return total / byDay.size;
}

export function rachaActual(consumos: ConsumoWithShared[]): number {
  const byDay = new Set(
    exactDateConsumos(consumos).map((c) =>
      new Date(c.consumedAt!).toISOString().split("T")[0]
    )
  );
  let streak = 0;
  const today = new Date();
  let current = new Date(today);
  while (true) {
    const key = current.toISOString().split("T")[0];
    if (!byDay.has(key)) break;
    streak++;
    current.setDate(current.getDate() - 1);
  }
  return streak;
}

export function diaConMasCoca(consumos: ConsumoWithShared[]): { date: string; total: number } | null {
  const byDay = new Map<string, number>();
  for (const c of exactDateConsumos(consumos)) {
    const key = new Date(c.consumedAt!).toISOString().split("T")[0];
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
      const d = new Date(c.consumedAt);
      const m = d.getMonth();
      const y = d.getFullYear();
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

export function consumosPorTipo(consumos: ConsumoWithShared[]) {
  const map = new Map<string, number>();
  for (const c of consumos) {
    const key = c.drinkType === "OTRA" ? (c.drinkTypeOther ?? "Otra") : c.drinkType;
    map.set(key, (map.get(key) ?? 0) + c.quantity);
  }
  return Array.from(map.entries()).map(([type, total]) => ({ type, total }));
}
