import { prisma } from "@/lib/prisma";
import { HistorialClient } from "./HistorialClient";

export default async function HistorialPage() {
  const consumos = await prisma.consumo.findMany({
    include: { sharedWith: true },
    orderBy: [{ consumedAt: "desc" }, { createdAt: "desc" }],
  });

  return <HistorialClient initialConsumos={consumos} />;
}
