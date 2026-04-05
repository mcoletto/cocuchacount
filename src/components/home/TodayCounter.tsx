import { quantityDisplay } from "@/lib/utils";
import { Flame } from "lucide-react";

interface TodayCounterProps {
  total: number;
  mlTotal: number;
  streak: number;
}

export function TodayCounter({ total, mlTotal, streak }: TodayCounterProps) {
  return (
    <div className="text-center py-4">
      <div className="inline-flex flex-col items-center gap-1">
        <div className="text-7xl font-black text-coca-red leading-none tracking-tighter">
          {quantityDisplay(total)}
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {total === 1 ? "coca hoy" : "cocas hoy"}
        </div>
        {mlTotal > 0 && (
          <div className="text-xs text-muted-foreground/70 mt-0.5">
            ≈ {(mlTotal / 1000).toFixed(2)} L
          </div>
        )}
      </div>

      {streak > 0 && (
        <div className="mt-4 inline-flex items-center gap-1.5 bg-orange-50 text-orange-500 rounded-full px-4 py-1.5 text-sm font-semibold">
          <Flame size={14} className="fill-orange-400 text-orange-400" />
          {streak} {streak === 1 ? "día seguido" : "días seguidos"}
        </div>
      )}
    </div>
  );
}
