import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTxt } from "@/lib/parser";
import type { FormatType, DrinkType, DatePrecision } from "@prisma/client";

export async function POST(req: NextRequest) {
  const { text, year } = await req.json();
  if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

  const { entries, skipped } = parseTxt(text, year ?? 2026);

  const results = { created: 0, errors: 0, skipped: skipped.length, dubious: 0 };

  for (const entry of entries) {
    if (entry.dubious) results.dubious++;
    try {
      await prisma.consumo.create({
        data: {
          quantity: entry.quantity,
          format: entry.format as FormatType,
          formatOther: entry.formatOther ?? null,
          drinkType: entry.drinkType as DrinkType,
          drinkTypeOther: entry.drinkTypeOther ?? null,
          mlOverride: entry.mlOverride ?? null,
          datePrecision: entry.datePrecision as DatePrecision,
          consumedAt: null,
          month: entry.month ?? null,
          year: entry.year ?? null,
          country: entry.country,
          place: entry.place ?? null,
          notes: entry.rawLine,
          sharedWith: { create: entry.sharedWith.map((name) => ({ name })) },
        },
      });
      results.created++;
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json(results);
}
