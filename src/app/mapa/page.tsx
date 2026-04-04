import { prisma } from "@/lib/prisma";
import { consumosPorPais } from "@/lib/stats";
import { MapClient } from "./MapClient";

export default async function MapaPage() {
  const consumos = await prisma.consumo.findMany({ include: { sharedWith: true } });
  const byCountry = consumosPorPais(consumos);
  return <MapClient byCountry={byCountry} />;
}
