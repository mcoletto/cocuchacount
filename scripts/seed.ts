import { PrismaClient } from "@prisma/client";
import { ML_DEFAULTS } from "../src/lib/ml-defaults";
import type { FormatType } from "@prisma/client";

const prisma = new PrismaClient();

async function seedFormatConfig() {
  for (const [format, mlDefault] of Object.entries(ML_DEFAULTS)) {
    await prisma.formatConfig.upsert({
      where: { format: format as FormatType },
      create: { format: format as FormatType, mlDefault },
      update: { mlDefault },
    });
  }
  console.log("✓ FormatConfig seeded");
}

async function main() {
  await seedFormatConfig();
  console.log("✓ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
