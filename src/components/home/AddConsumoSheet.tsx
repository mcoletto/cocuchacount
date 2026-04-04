"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FORMAT_LABELS, DRINK_LABELS, COUNTRIES, SHARED_PRESETS } from "@/lib/ml-defaults";
import type { FormatType, DrinkType } from "@prisma/client";

const FORMATS = Object.entries(FORMAT_LABELS) as [FormatType, string][];
const DRINK_TYPES = Object.entries(DRINK_LABELS) as [DrinkType, string][];

interface AddConsumoSheetProps {
  defaultFormat?: FormatType;
  children?: React.ReactNode;
}

export function AddConsumoSheet({ defaultFormat = "LATA", children }: AddConsumoSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [quantity, setQuantity] = useState("1");
  const [format, setFormat] = useState<FormatType>(defaultFormat);
  const [formatOther, setFormatOther] = useState("");
  const [drinkType, setDrinkType] = useState<DrinkType>("COMUN");
  const [drinkTypeOther, setDrinkTypeOther] = useState("");
  const [country, setCountry] = useState("Argentina");
  const [countryOther, setCountryOther] = useState("");
  const [place, setPlace] = useState("");
  const [shared, setShared] = useState<string[]>([]);
  const [customPerson, setCustomPerson] = useState("");
  const [dateMode, setDateMode] = useState<"today" | "month">("today");
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(
    () => `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  );

  function toggleShared(name: string) {
    if (name === "sola") {
      setShared([]);
      return;
    }
    setShared((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  function addCustomPerson() {
    const name = customPerson.trim().toLowerCase();
    if (name && !shared.includes(name)) {
      setShared((prev) => [...prev, name]);
    }
    setCustomPerson("");
  }

  async function handleSubmit() {
    const finalCountry = country === "otro" ? countryOther || "otro" : country;

    let datePrecision: "EXACT" | "MONTH_ONLY";
    let consumedAt: string | undefined;
    let month: number | undefined;
    let year: number | undefined;

    if (dateMode === "today") {
      datePrecision = "EXACT";
      consumedAt = new Date(selectedDate + "T12:00:00").toISOString();
    } else {
      datePrecision = "MONTH_ONLY";
      const [y, m] = selectedMonth.split("-");
      month = parseInt(m);
      year = parseInt(y);
    }

    const body = {
      quantity: parseFloat(quantity) || 1,
      format,
      formatOther: format === "OTRO" ? formatOther : undefined,
      drinkType,
      drinkTypeOther: drinkType === "OTRA" ? drinkTypeOther : undefined,
      datePrecision,
      consumedAt,
      month,
      year,
      country: finalCountry,
      place: format === "MAQUINA" ? place : undefined,
      sharedWith: shared,
    };

    startTransition(async () => {
      await fetch("/api/consumos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setOpen(false);
      router.refresh();
    });
  }

  const trigger = children ?? (
    <button className="w-full">
      <div className="bg-coca-red text-white rounded-3xl py-5 px-6 flex items-center justify-center gap-3 shadow-card active:scale-95 transition-transform">
        <Plus size={28} strokeWidth={2.5} />
        <span className="text-xl font-bold tracking-tight">+1 coca</span>
      </div>
    </button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Registrar consumo</SheetTitle>
        </SheetHeader>

        <div className="px-5 pb-8 space-y-5">
          {/* Cantidad */}
          <div className="space-y-2">
            <Label>Cantidad</Label>
            <div className="flex gap-2">
              {["0.5", "1", "2", "3", "4"].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={cn(
                    "flex-1 h-11 rounded-xl border text-sm font-semibold transition-all",
                    quantity === q
                      ? "bg-coca-red text-white border-coca-red"
                      : "border-input bg-background text-foreground"
                  )}
                >
                  {q === "0.5" ? "½" : q}
                </button>
              ))}
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-16 text-center"
                placeholder="N"
              />
            </div>
          </div>

          {/* Formato */}
          <div className="space-y-2">
            <Label>Formato</Label>
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFormat(value)}
                  className={cn(
                    "h-11 rounded-xl border text-sm font-medium transition-all px-3 text-left",
                    format === value
                      ? "bg-coca-red text-white border-coca-red"
                      : "border-input bg-background text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {format === "OTRO" && (
              <Input
                placeholder="¿Qué formato?"
                value={formatOther}
                onChange={(e) => setFormatOther(e.target.value)}
              />
            )}
          </div>

          {/* Tipo bebida */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex gap-2 flex-wrap">
              {DRINK_TYPES.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setDrinkType(value)}
                  className={cn(
                    "h-9 rounded-xl border text-sm font-medium px-4 transition-all",
                    drinkType === value
                      ? "bg-coca-red text-white border-coca-red"
                      : "border-input bg-background text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {drinkType === "OTRA" && (
              <Input
                placeholder="¿Qué bebida?"
                value={drinkTypeOther}
                onChange={(e) => setDrinkTypeOther(e.target.value)}
              />
            )}
          </div>

          {/* Lugar (solo máquina) */}
          {format === "MAQUINA" && (
            <div className="space-y-2">
              <Label>Lugar</Label>
              <Input
                placeholder="¿Dónde?"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
            </div>
          )}

          {/* País */}
          <div className="space-y-2">
            <Label>País</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "otro" ? "Otro..." : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {country === "otro" && (
              <Input
                placeholder="¿Qué país?"
                value={countryOther}
                onChange={(e) => setCountryOther(e.target.value)}
              />
            )}
          </div>

          {/* Compartido con */}
          <div className="space-y-2">
            <Label>Compartido con</Label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setShared([]); }}
                className={cn(
                  "h-9 rounded-xl border text-sm font-medium px-4 transition-all",
                  shared.length === 0
                    ? "bg-coca-red text-white border-coca-red"
                    : "border-input bg-background"
                )}
              >
                Sola
              </button>
              {SHARED_PRESETS.map((name) => (
                <button
                  key={name}
                  onClick={() => toggleShared(name)}
                  className={cn(
                    "h-9 rounded-xl border text-sm font-medium px-4 transition-all capitalize",
                    shared.includes(name)
                      ? "bg-coca-red text-white border-coca-red"
                      : "border-input bg-background"
                  )}
                >
                  {name}
                </button>
              ))}
              {shared.filter((n) => !SHARED_PRESETS.includes(n)).map((name) => (
                <button
                  key={name}
                  onClick={() => toggleShared(name)}
                  className="h-9 rounded-xl border bg-coca-red text-white border-coca-red text-sm font-medium px-3 flex items-center gap-1 capitalize"
                >
                  {name}
                  <X size={12} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Otro nombre..."
                value={customPerson}
                onChange={(e) => setCustomPerson(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomPerson()}
              />
              <Button variant="outline" size="sm" onClick={addCustomPerson}>
                +
              </Button>
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label>Fecha</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setDateMode("today")}
                className={cn(
                  "flex-1 h-10 rounded-xl border text-sm font-medium transition-all",
                  dateMode === "today"
                    ? "bg-coca-red text-white border-coca-red"
                    : "border-input bg-background"
                )}
              >
                Fecha exacta
              </button>
              <button
                onClick={() => setDateMode("month")}
                className={cn(
                  "flex-1 h-10 rounded-xl border text-sm font-medium transition-all",
                  dateMode === "month"
                    ? "bg-coca-red text-white border-coca-red"
                    : "border-input bg-background"
                )}
              >
                Solo mes
              </button>
            </div>
            {dateMode === "today" ? (
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            ) : (
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            )}
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
