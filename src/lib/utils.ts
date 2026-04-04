import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { DatePrecision } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatConsumoDate(
  datePrecision: DatePrecision,
  consumedAt?: string | Date | null,
  month?: number | null,
  year?: number | null
): string {
  if (datePrecision === "EXACT" && consumedAt) {
    const d = typeof consumedAt === "string" ? parseISO(consumedAt) : consumedAt;
    return format(d, "d MMM yyyy", { locale: es });
  }
  if (month && year) {
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    return `${monthNames[month - 1]} ${year}`;
  }
  return "Fecha desconocida";
}

export function quantityDisplay(q: number): string {
  if (q === 0.5) return "½";
  if (Number.isInteger(q)) return String(q);
  return String(q);
}
