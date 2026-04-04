import { PrismaClient } from "@prisma/client";
import { parseTxt } from "../src/lib/parser";
import type { FormatType, DrinkType, DatePrecision } from "@prisma/client";

const prisma = new PrismaClient();

// Tu dataset completo. Duplicados detectados: el bloque ENERO/BRASIL/URUGUAY aparece dos veces.
// El script desduplicará basándose en contenido si se corre dos veces.
const DATASET = `OCA
ENERO
BRASIL
1 coca Mc
1 botellas de vidrio 300ml
1 botellas de vidrio 300ml con fede
2 vasos de coca
1 vaso de coca
1 vaso de coca con vicu
1 lata de coca 350
1 lata de coca 350 con fede
6 vasos de coca
1 lata de coca
2 vasos de coca
1 coca de mc
1 coca de mc
1 coca de mc con vicu y fede
2 vasos de coca con fede
1 lata de coca
URUGUAY
1 lata de coca
1 lata de coca
2 vasos de coca
1 vaso de coca
2 vasos de coca
1 coca de vidrio
1 lata de coca
1 coca de vidrio
1 vaso de coca
1 vaso de coca
2 vasos de coca
1 vaso de coca
1 coca de vidrio
3 vasos de coca
1 lata de coca
1 coca de vidrio
1 coca de vidrio
1 lata de coca
1 lata de coca
2 vasos de coca
1 lata de coca
1 botella de vidrio
ARG
1 coca de mc
URU
1 lata de coca
1 lata de coca
1 coca de vidrio
1 coca de vidrio
1 coca de vidrio
1 coca de vidrio
1 cocs de vidrio
1 lata de coca
1 coca de vidiro
1 lata de cixa
1 pepsi chica
1/2 lata de coca
1 lata de coxa
4 vasos de coca
1 lata de coca
1 lata de coca
1 coca de vidrio
1 lata de coca
1 lata de coca
1 LATA DE COCA
1 lata de coca
1 lata de coca
1 lata de coca
1 coca de vidrio
1 lata de coca
1 lata de coca
1 coca de vidrio
1 vaso de coca
FEBRERO
1 vaso de coca
1 vaso de coca
1 botella de coca 500ml
1 coca de vidrio
1 lata de coca
1 lata de coca
1 coca de vidrio
ARG
1 lata de coca
1 latas de coca con fede
1 vaso de coca
1 vaso de coca
2 vasos de coca
1 vaso de coca en el avion
2 vasos de coca ZERO
4 vasos de coca
1 vaso de coca
2 vasos de coca
1 botella de coca 375ml
1 vaso de coca
1 vaso de coca
1 vaso de coca en el avion
1 coca de mc
2 latas de coca con fede
1 coca de vidrio
2 vasos de coca
1 coca de vidrio
1 lata de coca con fede
1 vaso de coca
1 vaso de coca con fede
1 vaso de coca
4 vasos de coca
1 lata de coca chiquita
4 vaso de pepsi black
1 vaso de coca
1 coca de vidrio
1 lata de coca
3 vasos de coca
1 coca de vidrio
1 coca de vidrio con fede
4 latas de coca con fede
US
1 coca de vidrio
1 coca de vidrio chiquita
1 coca de vidrio
2 cocas de maquina en shake shack
1 lata de coca
1 coca de vidrio
1 coca de vidrio
1 cocade vidrio
1 coca de vidrio
1 coca de vidrio chiqita
1 coca de vidrio
3 coca de maquina en pastis
1 coca de vidrio
MARZO
1 lata de coca
1 coca de vidrio
1cocA de vidrio
2 cocas de maquina grande
1 cocas de maquina grande de disney epcot
2 cocas de maquina medianas de disney epcot
2 cocas de maquina medianas de disney animal
1 coca de maquina chica en disney springs
2 cocas de maquina en summerhouse on the lake
3 coca de maquina universal
1 coca de maquinta en antojitos
1 cocas de maquina grande de disney hollywood
1 frozen slushi coke hollywood
1 cocas de maquina grande de disney hollywood
2 cocas de maquina medianas de disney magic
2 coca de maquina universal
2 cocas de maquina planet hollywood
1 lata de coca
2 coca de maquina en uchi ( chica)
1 coca de maquina en cheesecake factory
ARG
1 botella de coca chiquita
1 coca de vidrio
1 lata de coca
1 botella de coca 500ml
1 lata de coca
1 botella de coca
1 coca de mc
2 botellas chicas de coca con fede
1 botella chica de coca
1 botella de coca 500m
1 vaso de coca en el avion
1 lata de coca
1 lata de coca zero
1 vaso de coca en el avion
2 latas de coca con fede
2 botellas chicas de coca con fede
2 vaso de coca con vicu
2 cocas de vidrio con fede
1 lata de coca zero grande con fede
1 lata de coca
1 coca de vidrio
1 lata de pepsi comun
1 vaso decoca
2 vasos decoca
4 vasos de coca con fede
2 copas de coca
2 vasos de coca de maquina en rf
1 lata de coca
1 lata de coca
3 latas de coca con fede
2 latas de pepsi con fede
3 vasoa de coca
1 lata de pepsi
3 vasos de coca
ABRIL
URU
1 lata de coca
1 lata de coca con fede
1 lata de coca
1 botella de pepsi
1 lata de coca con nacho
2 latas de coca con fede`;

// Note: The dataset was duplicated in the original prompt. We use only one copy above (up to ABRIL).

async function main() {
  console.log("🔍 Parseando dataset...");
  const { entries, skipped } = parseTxt(DATASET, 2026);

  console.log(`✓ ${entries.length} entradas parseadas`);
  console.log(`⚠ ${skipped.length} líneas omitidas:`);
  if (skipped.length > 0) {
    skipped.forEach((s) => console.log(`  - "${s}"`));
  }

  const dubious = entries.filter((e) => e.dubious);
  if (dubious.length > 0) {
    console.log(`\n⚠ ${dubious.length} entradas marcadas como dudosas:`);
    dubious.forEach((e) => console.log(`  - "${e.rawLine}" → ${e.dubiousReason}`));
  }

  console.log("\n💾 Importando a la base de datos...");
  let created = 0;
  let errors = 0;

  for (const entry of entries) {
    try {
      await prisma.consumo.create({
        data: {
          quantity: entry.quantity,
          format: entry.format as FormatType,
          formatOther: entry.formatOther ?? null,
          drinkType: entry.drinkType as DrinkType,
          drinkTypeOther: entry.drinkTypeOther ?? null,
          mlOverride: entry.mlOverride ?? null,
          datePrecision: entry.datePrecision as DatePrecision,
          consumedAt: null,
          month: entry.month ?? null,
          year: entry.year ?? null,
          country: entry.country,
          place: entry.place ?? null,
          notes: entry.rawLine,
          sharedWith: {
            create: entry.sharedWith.map((name) => ({ name })),
          },
        },
      });
      created++;
    } catch (err) {
      errors++;
      console.error(`  ✗ Error en "${entry.rawLine}":`, err);
    }
  }

  console.log(`\n✅ Importación completa: ${created} registros creados, ${errors} errores`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
