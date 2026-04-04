"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FormatType } from "@prisma/client";
import { FORMAT_LABELS } from "@/lib/ml-defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

interface ConfigClientProps {
  mlValues: Record<FormatType, number>;
}

export function ConfigClient({ mlValues }: ConfigClientProps) {
  const router = useRouter();
  const [values, setValues] = useState(mlValues);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const FORMATS = Object.keys(FORMAT_LABELS) as FormatType[];

  async function handleSave() {
    startTransition(async () => {
      await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  return (
    <div className="px-4 pt-8 space-y-6">
      <h1 className="text-2xl font-black tracking-tight">Configuración</h1>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
          ML estimados por formato
        </p>
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60 space-y-4">
          {FORMATS.map((format) => (
            <div key={format} className="space-y-1.5">
              <Label>{FORMAT_LABELS[format]}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="50"
                  max="3000"
                  step="1"
                  value={values[format]}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [format]: parseInt(e.target.value) || 0 }))
                  }
                  className="w-28"
                />
                <span className="text-sm text-muted-foreground">ml</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleSave}
        disabled={isPending}
      >
        {saved ? (
          <>
            <Check size={16} /> Guardado
          </>
        ) : (
          "Guardar cambios"
        )}
      </Button>

      <div className="bg-muted/50 rounded-2xl p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold">Sobre los ML</p>
        <p>Estos valores se usan para calcular el total de mililitros consumidos en las estadísticas. No afectan el registro de consumos.</p>
      </div>
    </div>
  );
}
