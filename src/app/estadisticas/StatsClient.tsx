"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { FORMAT_LABELS, DRINK_LABELS } from "@/lib/ml-defaults";
import type { FormatType } from "@prisma/client";

interface Stats {
  totalHoy: number;
  totalSemana: number;
  totalMes: number;
  totalHistorico: number;
  mlTotal: number;
  promedioDiario: number;
  promedioMensual: number;
  rachaActual: number;
  diaConMasCoca: { date: string; total: number } | null;
  rankingFormatos: Array<{ format: FormatType; total: number }>;
  rankingPersonas: Array<{ name: string; total: number }>;
  porPais: Array<{ country: string; total: number }>;
  porMes: Array<{ label: string; total: number; key: string }>;
  porTipo: Array<{ type: string; total: number }>;
}

const COLORS = ["#E8192C", "#FF6B7A", "#FFB3BB", "#FFDDE0", "#FFE8EA", "#FFF0F1"];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-2xl font-black text-foreground mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
      {children}
    </p>
  );
}

export function StatsClient({ stats }: { stats: Stats }) {
  const {
    totalHoy, totalSemana, totalMes, totalHistorico, mlTotal,
    promedioDiario, promedioMensual, rachaActual, diaConMasCoca,
    rankingFormatos, rankingPersonas, porPais, porMes, porTipo,
  } = stats;

  const drinkTypeLabel = (type: string) => {
    return DRINK_LABELS[type as keyof typeof DRINK_LABELS] ?? type;
  };

  return (
    <div className="px-4 pt-8 space-y-6 pb-8">
      <h1 className="text-2xl font-black tracking-tight">Estadísticas</h1>

      {/* Totales */}
      <div className="space-y-2">
        <SectionTitle>Totales</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Hoy" value={totalHoy} sub="cocas" />
          <StatCard label="Esta semana" value={totalSemana} sub="cocas" />
          <StatCard label="Este mes" value={totalMes} sub="cocas" />
          <StatCard label="Histórico" value={totalHistorico} sub="cocas totales" />
        </div>
      </div>

      {/* Promedios */}
      <div className="space-y-2">
        <SectionTitle>Promedios</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Promedio diario"
            value={promedioDiario.toFixed(1)}
            sub="cocas / día"
          />
          <StatCard
            label="Promedio mensual"
            value={promedioMensual.toFixed(1)}
            sub="cocas / mes"
          />
          <StatCard
            label="ML totales"
            value={`${(mlTotal / 1000).toFixed(1)}L`}
            sub="estimado"
          />
          <StatCard
            label="Racha actual"
            value={`${rachaActual}d`}
            sub={rachaActual > 0 ? "días seguidos" : "sin racha"}
          />
        </div>
      </div>

      {/* Día top */}
      {diaConMasCoca && (
        <div className="space-y-2">
          <SectionTitle>Récord</SectionTitle>
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60">
            <p className="text-xs text-muted-foreground">Día con más cocas</p>
            <p className="text-xl font-bold mt-1">
              {new Date(diaConMasCoca.date + "T12:00:00").toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="text-coca-red font-black text-2xl">{diaConMasCoca.total} cocas</p>
          </div>
        </div>
      )}

      {/* Por mes */}
      {porMes.length > 0 && (
        <div className="space-y-2">
          <SectionTitle>Por mes</SectionTitle>
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={porMes} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#888" }}
                  tickFormatter={(v) => v.split(" ")[0]}
                />
                <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                <Tooltip
                  formatter={(v) => [`${v} cocas`, ""]}
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #eee" }}
                />
                <Bar dataKey="total" fill="#E8192C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Por tipo */}
      {porTipo.length > 0 && (
        <div className="space-y-2">
          <SectionTitle>Por tipo de bebida</SectionTitle>
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={porTipo}
                  dataKey="total"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ type, percent }) =>
                    `${drinkTypeLabel(type)} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {porTipo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v}`, drinkTypeLabel(name as string)]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Ranking formatos */}
      {rankingFormatos.length > 0 && (
        <div className="space-y-2">
          <SectionTitle>Ranking formatos</SectionTitle>
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60 space-y-3">
            {rankingFormatos.map(({ format, total }, i) => {
              const max = rankingFormatos[0].total;
              return (
                <div key={format} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : `${i + 1}. `}
                      {FORMAT_LABELS[format]}
                    </span>
                    <span className="text-muted-foreground font-semibold">{total}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-coca-red rounded-full"
                      style={{ width: `${(total / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Por país */}
      {porPais.length > 0 && (
        <div className="space-y-2">
          <SectionTitle>Por país</SectionTitle>
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60 space-y-3">
            {porPais.map(({ country, total }) => {
              const max = porPais[0].total;
              return (
                <div key={country} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{country}</span>
                    <span className="text-muted-foreground font-semibold">{total}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-coca-red rounded-full"
                      style={{ width: `${(total / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ranking personas */}
      {rankingPersonas.length > 0 && (
        <div className="space-y-2">
          <SectionTitle>Ranking compañía</SectionTitle>
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60 space-y-2">
            {rankingPersonas.map(({ name, total }, i) => (
              <div key={name} className="flex justify-between items-center py-1">
                <span className="text-sm font-medium capitalize">
                  {i === 0 ? "🥇 " : i === 1 ? "🥈 " : ""}{name}
                </span>
                <span className="text-sm font-bold text-coca-red">{total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
