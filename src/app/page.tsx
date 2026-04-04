import { prisma } from "@/lib/prisma";
import { TodayCounter } from "@/components/home/TodayCounter";
import { AddConsumoSheet } from "@/components/home/AddConsumoSheet";
import { QuickFormats } from "@/components/home/QuickFormats";
import { RecentConsumos } from "@/components/home/RecentConsumos";
import { WeeklySummary } from "@/components/home/WeeklySummary";
import {
  consumosHoy,
  consumosSemana,
  consumosMes,
  calcTotalQuantity,
  calcTotalMl,
  consumosPorPais,
} from "@/lib/stats";
import { ML_DEFAULTS } from "@/lib/ml-defaults";
import type { FormatType } from "@prisma/client";

async function getConfigMap(): Promise<Partial<Record<FormatType, number>>> {
  const configs = await prisma.formatConfig.findMany();
  return Object.fromEntries(configs.map((c) => [c.format, c.mlDefault]));
}

export default async function HomePage() {
  const [allConsumos, configMap, recentConsumos] = await Promise.all([
    prisma.consumo.findMany({
      include: { sharedWith: true },
      orderBy: [
        { consumedAt: "desc" },
        { createdAt: "desc" },
      ],
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

  return (
    <div className="px-4 pt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            🥤 CocuchaCount
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* Contador hoy */}
      <TodayCounter total={totalHoy} mlTotal={mlHoy} />

      {/* Botón principal */}
      <AddConsumoSheet />

      {/* Accesos rápidos */}
      <QuickFormats />

      {/* Mini resumen */}
      <WeeklySummary
        weekTotal={totalSemana}
        monthTotal={totalMes}
        countryBreakdown={byCountry}
      />

      {/* Últimos consumos */}
      <RecentConsumos consumos={recentConsumos} />
    </div>
  );
}
