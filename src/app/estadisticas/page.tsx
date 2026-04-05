export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { StatsClient } from "./StatsClient";
import {
  consumosHoy, consumosSemana, consumosMes,
  calcTotalQuantity, calcTotalMl,
  promedioMensual, promedioDiario, rachaActual, diaConMasCoca,
  rankingFormatos, rankingPersonas, consumosPorPais, consumosPorMes, consumosPorTipo,
} from "@/lib/stats";
import type { FormatType } from "@prisma/client";

export default async function EstadisticasPage() {
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

  const stats = {
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
  };

  return <StatsClient stats={stats} />;
}
