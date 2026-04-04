import Link from "next/link";
import { formatConsumoDate, quantityDisplay } from "@/lib/utils";
import { FORMAT_LABELS, DRINK_LABELS } from "@/lib/ml-defaults";
import type { Consumo, SharedEntry } from "@prisma/client";
import { ChevronRight } from "lucide-react";

type ConsumoWithShared = Consumo & { sharedWith: SharedEntry[] };

interface RecentConsumoProps {
  consumos: ConsumoWithShared[];
}

export function RecentConsumos({ consumos }: RecentConsumoProps) {
  if (consumos.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Aún no hay registros
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Últimos registros
        </p>
        <Link href="/historial" className="text-xs text-coca-red font-medium flex items-center gap-0.5">
          Ver todos <ChevronRight size={12} />
        </Link>
      </div>
      <div className="space-y-2">
        {consumos.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-soft border border-border/60"
          >
            <div className="w-10 h-10 rounded-xl bg-coca-red-pale flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-coca-red">
                {quantityDisplay(c.quantity)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {FORMAT_LABELS[c.format]}
                {c.drinkType !== "COMUN" && (
                  <span className="text-muted-foreground font-normal"> · {DRINK_LABELS[c.drinkType]}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {formatConsumoDate(c.datePrecision, c.consumedAt, c.month, c.year)}
                {" · "}
                {c.country}
                {c.sharedWith.length > 0 && (
                  <span> · con {c.sharedWith.map((s) => s.name).join(", ")}</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
