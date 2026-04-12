export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { TodayCounter } from "@/components/home/TodayCounter";
import { AddConsumoSheet } from "@/components/home/AddConsumoSheet";
import { QuickFormats } from "@/components/home/QuickFormats";
import { RecentConsumos } from "@/components/home/RecentConsumos";
import { WeeklySummary } from "@/components/home/WeeklySummary";
import Image from "next/image";
import {
  consumosHoy, consumosSemana, consumosMes,
  calcTotalQuantity, calcTotalMl, consumosPorPais, rachaActual, tendenciaMensual,
} from "@/lib/stats";
import type { FormatType } from "@prisma/client";

async function getConfigMap(): Promise<Partial<Record<FormatType, number>>> {
  const configs = await prisma.formatConfig.findMany();
  return Object.fromEntries(configs.map((c) => [c.format, c.mlDefault]));
}

export default async function HomePage() {
  const [allConsumos, configMap, recentConsumos] = await Promise.all([
    prisma.consumo.findMany({
      include: { sharedWith: true },
      orderBy: [{ consumedAt: "desc" }, { createdAt: "desc" }],
    }),
    getConfigMap(),
    prisma.consumo.findMany({
      include: { sharedWith: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const hoy = consumosHoy(allConsumos);
  const semana = consumosSemana(allConsumos);
  const mes = consumosMes(allConsumos);

  const totalHoy = calcTotalQuantity(hoy);
  const mlHoy = calcTotalMl(hoy, configMap);
  const totalSemana = calcTotalQuantity(semana);
  const totalMes = calcTotalQuantity(mes);
  const byCountry = consumosPorPais(allConsumos);
  const streak = rachaActual(allConsumos);
  const tendencia = tendenciaMensual(allConsumos);

  return (
    <div className="px-4 pt-8 space-y-6">
      <div className="flex flex-col items-center gap-2 pt-2 pb-2">
        <Image src="/logo.png" alt="CocuchaCount" width={200} height={60} priority className="h-16 w-auto" />
        <p className="text-xs text-muted-foreground capitalize">
          {new Date().toLocaleDateString("es-AR", {
            weekday: "long", day: "numeric", month: "long",
          })}
        </p>
      </div>

      <TodayCounter total={totalHoy} mlTotal={mlHoy} streak={streak} />

      <AddConsumoSheet />

      <QuickFormats />

      {tendencia && (
        <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/60">
          <p className="text-xs text-muted-foreground font-medium mb-1">Tendencia este mes</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{tendencia.proyectado}</span>
            <span className="text-sm text-muted-foreground">cocas proyectadas</span>
            {tendencia.proyectado > tendencia.promedio ? (
              <span className="ml-auto text-xs font-semibold text-coca-red">↑ por encima del promedio</span>
            ) : tendencia.proyectado < tendencia.promedio ? (
              <span className="ml-auto text-xs font-semibold text-green-600 dark:text-green-400">↓ por debajo del promedio</span>
            ) : (
              <span className="ml-auto text-xs font-semibold text-muted-foreground">= en el promedio</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">promedio histórico: {tendencia.promedio} cocas/mes</p>
        </div>
      )}

      <WeeklySummary weekTotal={totalSemana} monthTotal={totalMes} countryBreakdown={byCountry} />

      <RecentConsumos consumos={recentConsumos} />
    </div>
  );
}
