export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ML_DEFAULTS } from "@/lib/ml-defaults";
import { ConfigClient } from "./ConfigClient";
import type { FormatType } from "@prisma/client";

export default async function ConfiguracionPage() {
  const configs = await prisma.formatConfig.findMany();
  const dbMap = Object.fromEntries(configs.map((c) => [c.format, c.mlDefault]));
  const mlValues = { ...ML_DEFAULTS, ...dbMap } as Record<FormatType, number>;
  return <ConfigClient mlValues={mlValues} />;
}
