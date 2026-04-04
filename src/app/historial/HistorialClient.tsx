"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Consumo, SharedEntry, FormatType, DrinkType } from "@prisma/client";
import { FORMAT_LABELS, DRINK_LABELS, COUNTRIES } from "@/lib/ml-defaults";
import { formatConsumoDate, quantityDisplay, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, X, Check, Filter, ChevronDown } from "lucide-react";

type ConsumoWithShared = Consumo & { sharedWith: SharedEntry[] };

interface HistorialClientProps {
  initialConsumos: ConsumoWithShared[];
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function HistorialClient({ initialConsumos }: HistorialClientProps) {
  const router = useRouter();
  const [consumos, setConsumos] = useState(initialConsumos);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterFormat, setFilterFormat] = useState("");
  const [filterDrinkType, setFilterDrinkType] = useState("");
  const [filterShared, setFilterShared] = useState<"all" | "solo" | "shared">("all");

  // Edit state
  const [editData, setEditData] = useState<Partial<ConsumoWithShared & { sharedNames: string[] }>>({});

  const filtered = consumos.filter((c) => {
    if (filterMonth && filterYear) {
      const m = parseInt(filterMonth);
      const y = parseInt(filterYear);
      const matchMonth =
        (c.datePrecision === "MONTH_ONLY" && c.month === m && c.year === y) ||
        (c.datePrecision === "EXACT" && c.consumedAt &&
          new Date(c.consumedAt).getMonth() + 1 === m &&
          new Date(c.consumedAt).getFullYear() === y);
      if (!matchMonth) return false;
    } else if (filterMonth) {
      const m = parseInt(filterMonth);
      const matchMonth =
        (c.datePrecision === "MONTH_ONLY" && c.month === m) ||
        (c.datePrecision === "EXACT" && c.consumedAt && new Date(c.consumedAt).getMonth() + 1 === m);
      if (!matchMonth) return false;
    } else if (filterYear) {
      const y = parseInt(filterYear);
      const matchYear =
        (c.datePrecision === "MONTH_ONLY" && c.year === y) ||
        (c.datePrecision === "EXACT" && c.consumedAt && new Date(c.consumedAt).getFullYear() === y);
      if (!matchYear) return false;
    }
    if (filterCountry && c.country !== filterCountry) return false;
    if (filterFormat && c.format !== filterFormat) return false;
    if (filterDrinkType && c.drinkType !== filterDrinkType) return false;
    if (filterShared === "solo" && c.sharedWith.length > 0) return false;
    if (filterShared === "shared" && c.sharedWith.length === 0) return false;
    return true;
  });

  function clearFilters() {
    setFilterMonth("");
    setFilterYear("");
    setFilterCountry("");
    setFilterFormat("");
    setFilterDrinkType("");
    setFilterShared("all");
  }

  const hasFilters = filterMonth || filterYear || filterCountry || filterFormat || filterDrinkType || filterShared !== "all";

  async function handleDelete(id: string) {
    if (!confirm("¿Borrar este registro?")) return;
    await fetch(`/api/consumos/${id}`, { method: "DELETE" });
    setConsumos((prev) => prev.filter((c) => c.id !== id));
  }

  function startEdit(c: ConsumoWithShared) {
    setEditingId(c.id);
    setEditData({
      ...c,
      sharedNames: c.sharedWith.map((s) => s.name),
    });
  }

  async function saveEdit(id: string) {
    const { sharedNames, sharedWith, ...rest } = editData as ConsumoWithShared & { sharedNames: string[] };
    const body = {
      ...rest,
      consumedAt: rest.consumedAt ? new Date(rest.consumedAt).toISOString() : null,
      sharedWith: sharedNames ?? [],
    };
    const res = await fetch(`/api/consumos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const updated = await res.json();
    setConsumos((prev) => prev.map((c) => (c.id === id ? updated : c)));
    setEditingId(null);
    setEditData({});
  }

  return (
    <div className="px-4 pt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">Historial</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-xl border transition-all",
            hasFilters ? "bg-coca-red text-white border-coca-red" : "border-input text-foreground"
          )}
        >
          <Filter size={14} />
          Filtros
          {hasFilters && <span className="bg-white/30 rounded-full w-4 h-4 text-xs flex items-center justify-center">!</span>}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los meses</SelectItem>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Año (ej: 2026)"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              type="number"
            />
          </div>
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger>
              <SelectValue placeholder="País" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los países</SelectItem>
              {COUNTRIES.filter((c) => c !== "otro").map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Select value={filterFormat} onValueChange={setFilterFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {Object.entries(FORMAT_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDrinkType} onValueChange={setFilterDrinkType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {Object.entries(DRINK_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {(["all", "solo", "shared"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setFilterShared(v)}
                className={cn(
                  "flex-1 h-9 rounded-xl border text-xs font-medium transition-all",
                  filterShared === v ? "bg-coca-red text-white border-coca-red" : "border-input"
                )}
              >
                {v === "all" ? "Todas" : v === "solo" ? "Sola" : "Compartidas"}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="w-full text-xs text-muted-foreground underline">
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {filtered.length} registros
      </p>

      <div className="space-y-2 pb-4">
        {filtered.map((c) => (
          <ConsumoRow
            key={c.id}
            consumo={c}
            isEditing={editingId === c.id}
            editData={editData as ConsumoWithShared & { sharedNames: string[] }}
            onEdit={() => startEdit(c)}
            onSave={() => saveEdit(c.id)}
            onCancel={() => { setEditingId(null); setEditData({}); }}
            onDelete={() => handleDelete(c.id)}
            onEditDataChange={setEditData}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hay registros para estos filtros
          </div>
        )}
      </div>
    </div>
  );
}

interface ConsumoRowProps {
  consumo: ConsumoWithShared;
  isEditing: boolean;
  editData: Partial<ConsumoWithShared & { sharedNames: string[] }>;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onEditDataChange: (d: Partial<ConsumoWithShared & { sharedNames: string[] }>) => void;
}

function ConsumoRow({
  consumo: c,
  isEditing,
  editData,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditDataChange,
}: ConsumoRowProps) {
  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-soft border border-coca-red/30 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Cantidad</label>
            <Input
              type="number"
              min="0.5"
              step="0.5"
              value={editData.quantity ?? c.quantity}
              onChange={(e) => onEditDataChange({ ...editData, quantity: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Formato</label>
            <Select
              value={editData.format ?? c.format}
              onValueChange={(v) => onEditDataChange({ ...editData, format: v as FormatType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FORMAT_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Tipo</label>
          <Select
            value={editData.drinkType ?? c.drinkType}
            onValueChange={(v) => onEditDataChange({ ...editData, drinkType: v as DrinkType })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(DRINK_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">País</label>
          <Input
            value={editData.country ?? c.country}
            onChange={(e) => onEditDataChange({ ...editData, country: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Compartido con (separado por comas)</label>
          <Input
            value={(editData.sharedNames ?? c.sharedWith.map((s) => s.name)).join(", ")}
            onChange={(e) => onEditDataChange({
              ...editData,
              sharedNames: e.target.value.split(",").map((n) => n.trim()).filter(Boolean),
            })}
            placeholder="fede, vicu..."
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onSave} className="flex-1">
            <Check size={14} /> Guardar
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
            <X size={14} /> Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-soft border border-border/60 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-coca-red-pale flex items-center justify-center shrink-0">
        <span className="text-lg font-bold text-coca-red">{quantityDisplay(c.quantity)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">
          {FORMAT_LABELS[c.format]}
          {c.drinkType !== "COMUN" && (
            <span className="text-muted-foreground font-normal"> · {DRINK_LABELS[c.drinkType]}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {formatConsumoDate(c.datePrecision, c.consumedAt, c.month, c.year)}
          {" · "}{c.country}
          {c.place && ` · ${c.place}`}
          {c.sharedWith.length > 0 && ` · con ${c.sharedWith.map((s) => s.name).join(", ")}`}
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
