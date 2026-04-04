import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ML_DEFAULTS } from "@/lib/ml-defaults";
import { FormatType } from "@prisma/client";

export async function GET() {
  const configs = await prisma.formatConfig.findMany();
  const map: Partial<Record<FormatType, number>> = Object.fromEntries(
    configs.map((c) => [c.format, c.mlDefault])
  );
  // Fill defaults for formats not in DB
  const result = { ...ML_DEFAULTS, ...map };
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const body = await req.json() as Partial<Record<FormatType, number>>;
  const updates = await Promise.all(
    Object.entries(body).map(([format, mlDefault]) =>
      prisma.formatConfig.upsert({
        where: { format: format as FormatType },
        create: { format: format as FormatType, mlDefault: mlDefault as number },
        update: { mlDefault: mlDefault as number },
      })
    )
  );
  return NextResponse.json(updates);
}
