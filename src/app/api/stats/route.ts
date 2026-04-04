import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  consumosHoy,
  consumosSemana,
  consumosMes,
  calcTotalQuantity,
  calcTotalMl,
  promedioMensual,
  promedioDiario,
  rachaActual,
  diaConMasCoca,
  rankingFormatos,
  rankingPersonas,
  consumosPorPais,
  consumosPorMes,
  consumosPorTipo,
} from "@/lib/stats";
import { ML_DEFAULTS } from "@/lib/ml-defaults";
import type { FormatType } from "@prisma/client";

export async function GET() {
  const [allConsumos, configs] = await Promise.all([
    prisma.consumo.findMany({ include: { sharedWith: true } }),
    prisma.formatConfig.findMany(),
  ]);

  const configMap: Partial<Record<FormatType, number>> = Object.fromEntries(
    configs.map((c) => [c.format, c.mlDefault])
  );

  const hoy = consumosHoy(allConsumos);
  const semana = consumosSemana(allConsumos);
  const mes = consumosMes(allConsumos);

  return NextResponse.json({
    totalHoy: calcTotalQuantity(hoy),
    totalSemana: calcTotalQuantity(semana),
    totalMes: calcTotalQuantity(mes),
    totalHistorico: calcTotalQuantity(allConsumos),
    mlTotal: calcTotalMl(allConsumos, configMap),
    promedioDiario: promedioDiario(allConsumos),
    promedioMensual: promedioMensual(allConsumos),
    rachaActual: rachaActual(allConsumos),
    diaConMasCoca: diaConMasCoca(allConsumos),
    rankingFormatos: rankingFormatos(allConsumos),
    rankingPersonas: rankingPersonas(allConsumos),
    porPais: consumosPorPais(allConsumos),
    porMes: consumosPorMes(allConsumos),
    porTipo: consumosPorTipo(allConsumos),
  });
}
