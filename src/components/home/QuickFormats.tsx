import { AddConsumoSheet } from "./AddConsumoSheet";
import type { FormatType } from "@prisma/client";

const QUICK_FORMATS: Array<{ format: FormatType; emoji: string; label: string }> = [
  { format: "VASO", emoji: "🥤", label: "Vaso" },
  { format: "BOTELLA_VIDRIO", emoji: "🍾", label: "Vidrio" },
  { format: "MC", emoji: "🍔", label: "Mc" },
  { format: "MAQUINA", emoji: "🏪", label: "Máquina" },
  { format: "BOTELLA_PLASTICA", emoji: "🧴", label: "Plástica" },
  { format: "OTRO", emoji: "💧", label: "Otro" },
];

export function QuickFormats() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
        Acceso rápido
      </p>
      <div className="grid grid-cols-3 gap-2">
        {QUICK_FORMATS.map(({ format, emoji, label }) => (
          <AddConsumoSheet key={format} defaultFormat={format}>
            <button className="bg-card rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-soft border border-border/60 active:scale-95 transition-transform">
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-medium text-foreground">{label}</span>
            </button>
          </AddConsumoSheet>
        ))}
      </div>
    </div>
  );
}
