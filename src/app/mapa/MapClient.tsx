"use client";

const FLAG: Record<string, string> = {
  Argentina: "🇦🇷",
  Uruguay: "🇺🇾",
  Brasil: "🇧🇷",
  "Estados Unidos": "🇺🇸",
};

interface MapClientProps {
  byCountry: Array<{ country: string; total: number }>;
}

export function MapClient({ byCountry }: MapClientProps) {
  const maxTotal = byCountry.length > 0 ? byCountry[0].total : 1;

  return (
    <div className="px-4 pt-8 space-y-4 pb-8">
      <h1 className="text-2xl font-black tracking-tight">Mapa</h1>

      {byCountry.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          No hay datos de países aún
        </p>
      )}

      <div className="space-y-3">
        {byCountry.map(({ country, total }) => {
          const pct = (total / maxTotal) * 100;
          const flag = FLAG[country] ?? "🌍";
          return (
            <div
              key={country}
              className="bg-white rounded-2xl p-4 shadow-soft border border-border/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{flag}</span>
                  <span className="font-semibold text-foreground">{country}</span>
                </div>
                <span className="text-coca-red font-black text-xl">{total}</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-coca-red rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {((total / byCountry.reduce((s, c) => s + c.total, 0)) * 100).toFixed(1)}% del total
              </p>
            </div>
          );
        })}
      </div>

      {byCountry.length > 1 && (
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Total global
          </p>
          <p className="text-3xl font-black text-foreground">
            {byCountry.reduce((s, c) => s + c.total, 0)}
            <span className="text-base font-normal text-muted-foreground ml-2">cocas</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            en {byCountry.length} {byCountry.length === 1 ? "país" : "países"}
          </p>
        </div>
      )}
    </div>
  );
}
