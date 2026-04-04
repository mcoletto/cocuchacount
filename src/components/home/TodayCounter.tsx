import { quantityDisplay } from "@/lib/utils";

interface TodayCounterProps {
  total: number;
  mlTotal: number;
}

export function TodayCounter({ total, mlTotal }: TodayCounterProps) {
  return (
    <div className="text-center py-6">
      <div className="inline-flex flex-col items-center gap-1">
        <div className="text-7xl font-black text-coca-red leading-none tracking-tighter">
          {quantityDisplay(total)}
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {total === 1 ? "coca hoy" : "cocas hoy"}
        </div>
        {mlTotal > 0 && (
          <div className="text-xs text-muted-foreground/70 mt-1">
            ≈ {(mlTotal / 1000).toFixed(2)} L
          </div>
        )}
      </div>
    </div>
  );
}
