export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ConsumoSchema = z.object({
  quantity: z.number().positive().default(1),
  format: z.enum(["LATA", "VASO", "BOTELLA_VIDRIO", "BOTELLA_PLASTICA", "MC", "MAQUINA", "OTRO"]),
  formatOther: z.string().optional(),
  drinkType: z.enum(["COMUN", "ZERO", "PEPSI", "OTRA"]).default("COMUN"),
  drinkTypeOther: z.string().optional(),
  mlOverride: z.number().int().positive().optional(),
  datePrecision: z.enum(["EXACT", "MONTH_ONLY"]).default("EXACT"),
  consumedAt: z.string().datetime().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
  country: z.string().default("Argentina"),
  place: z.string().optional(),
  notes: z.string().optional(),
  sharedWith: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const where: Record<string, unknown> = {};

  const country = searchParams.get("country");
  if (country) where.country = country;

  const format = searchParams.get("format");
  if (format) where.format = format;

  const drinkType = searchParams.get("drinkType");
  if (drinkType) where.drinkType = drinkType;

  const month = searchParams.get("month");
  const year = searchParams.get("year");
  if (month && year) {
    where.OR = [
      { datePrecision: "MONTH_ONLY", month: parseInt(month), year: parseInt(year) },
      {
        datePrecision: "EXACT",
        consumedAt: {
          gte: new Date(`${year}-${month.padStart(2, "0")}-01`),
          lt: new Date(`${year}-${String(parseInt(month) + 1).padStart(2, "0")}-01`),
        },
      },
    ];
  }

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from || to) {
    where.consumedAt = {};
    if (from) (where.consumedAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.consumedAt as Record<string, unknown>).lte = new Date(to);
  }

  const shared = searchParams.get("shared");
  if (shared === "true") {
    where.sharedWith = { some: {} };
  } else if (shared === "false") {
    where.sharedWith = { none: {} };
  }

  const consumos = await prisma.consumo.findMany({
    where,
    include: { sharedWith: true },
    orderBy: [{ consumedAt: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(consumos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = ConsumoSchema.parse(body);

  const { sharedWith, ...rest } = data;

  const consumo = await prisma.consumo.create({
    data: {
      ...rest,
      consumedAt: rest.consumedAt ? new Date(rest.consumedAt) : undefined,
      sharedWith: {
        create: sharedWith.map((name) => ({ name })),
      },
    },
    include: { sharedWith: true },
  });

  return NextResponse.json(consumo, { status: 201 });
}
