import { FormatType } from "@prisma/client";

export const ML_DEFAULTS: Record<FormatType, number> = {
  LATA: 354,
  VASO: 500,
  BOTELLA_VIDRIO: 237,
  BOTELLA_PLASTICA: 500,
  MC: 473,
  MAQUINA: 500,
  OTRO: 354,
};

export function getMl(
  format: FormatType,
  mlOverride?: number | null,
  configMap?: Partial<Record<FormatType, number>>
): number {
  if (mlOverride != null) return mlOverride;
  if (configMap?.[format] != null) return configMap[format]!;
  return ML_DEFAULTS[format];
}

export const FORMAT_LABELS: Record<FormatType, string> = {
  LATA: "Lata",
  VASO: "Vaso",
  BOTELLA_VIDRIO: "Botella de vidrio",
  BOTELLA_PLASTICA: "Botella plástica",
  MC: "Coca de Mc",
  MAQUINA: "Coca de máquina",
  OTRO: "Otro",
};

export const DRINK_LABELS = {
  COMUN: "Común",
  ZERO: "Zero",
  PEPSI: "Pepsi",
  OTRA: "Otra",
};

export const COUNTRIES = [
  "Argentina",
  "Uruguay",
  "Brasil",
  "Estados Unidos",
  "otro",
];

export const SHARED_PRESETS = ["fede", "vicu"];
