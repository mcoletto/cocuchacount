interface WeeklySummaryProps {
  weekTotal: number;
  monthTotal: number;
  countryBreakdown: Array<{ country: string; total: number }>;
}

export function WeeklySummary({ weekTotal, monthTotal, countryBreakdown }: WeeklySummaryProps) {
  const top3 = countryBreakdown.slice(0, 3);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/60">
        <p className="text-xs text-muted-foreground font-medium">Esta semana</p>
        <p className="text-3xl font-black text-foreground mt-1">{weekTotal}</p>
        <p className="text-xs text-muted-foreground">cocas</p>
      </div>
      <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/60">
        <p className="text-xs text-muted-foreground font-medium">Este mes</p>
        <p className="text-3xl font-black text-foreground mt-1">{monthTotal}</p>
        <p className="text-xs text-muted-foreground">cocas</p>
      </div>
      {top3.length > 0 && (
        <div className="col-span-2 bg-card rounded-2xl p-4 shadow-soft border border-border/60">
          <p className="text-xs text-muted-foreground font-medium mb-3">Por país</p>
          <div className="space-y-2">
            {top3.map(({ country, total }) => {
              const max = top3[0].total;
              const pct = max > 0 ? (total / max) * 100 : 0;
              return (
                <div key={country} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">{country}</span>
                    <span className="text-muted-foreground font-semibold">{total}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-coca-red rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
