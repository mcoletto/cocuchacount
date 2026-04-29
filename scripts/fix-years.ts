/**
 * Actualiza los registros con year=2025 a year=2026.
 * NO borra ningún registro.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.consumo.updateMany({
    where: { year: 2025 },
    data: { year: 2026 },
  });

  console.log(`✅ ${result.count} registros actualizados de 2025 → 2026`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
