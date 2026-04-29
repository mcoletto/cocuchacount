export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  quantity: z.number().positive().optional(),
  format: z.enum(["LATA", "VASO", "BOTELLA_VIDRIO", "BOTELLA_PLASTICA", "MC", "MAQUINA", "OTRO"]).optional(),
  formatOther: z.string().optional(),
  drinkType: z.enum(["COMUN", "ZERO", "PEPSI", "OTRA"]).optional(),
  drinkTypeOther: z.string().optional(),
  mlOverride: z.number().int().positive().nullable().optional(),
  datePrecision: z.enum(["EXACT", "MONTH_ONLY"]).optional(),
  consumedAt: z.string().datetime().nullable().optional(),
  month: z.number().int().min(1).max(12).nullable().optional(),
  year: z.number().int().nullable().optional(),
  country: z.string().optional(),
  place: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  sharedWith: z.array(z.string()).optional(),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const consumo = await prisma.consumo.findUnique({
    where: { id },
    include: { sharedWith: true },
  });
  if (!consumo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(consumo);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = UpdateSchema.parse(body);
  const { sharedWith, ...rest } = data;

  const updateData: Record<string, unknown> = { ...rest };
  if (rest.consumedAt !== undefined) {
    updateData.consumedAt = rest.consumedAt ? new Date(rest.consumedAt) : null;
  }

  if (sharedWith !== undefined) {
    await prisma.sharedEntry.deleteMany({ where: { consumoId: id } });
    updateData.sharedWith = { create: sharedWith.map((name) => ({ name })) };
  }

  const consumo = await prisma.consumo.update({
    where: { id },
    data: updateData,
    include: { sharedWith: true },
  });

  revalidatePath("/");
  revalidatePath("/historial");
  revalidatePath("/estadisticas");
  return NextResponse.json(consumo);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.consumo.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/historial");
  revalidatePath("/estadisticas");
  return NextResponse.json({ ok: true });
}
