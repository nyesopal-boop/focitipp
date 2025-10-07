import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const startsAt = new Date(); // azonnal érvényes
  const expiresAt = new Date("2025-12-30T23:59:59+01:00"); // Europe/Budapest téli idő

  const codes = [
    "PRODEC25-A7KD-93QF-MZ1H",
    "PRODEC25-B2LX-5RNU-TY8C",
    "PRODEC25-C9VE-1JHK-PQ3S",
    "PRODEC25-D5WM-8AZR-LU6N",
    "PRODEC25-E4QT-2XCG-NB7V",
    "PRODEC25-F6YP-7MDB-RW0K",
  ];

  for (const code of codes) {
    await prisma.coupon.upsert({
      where: { code },
      update: {},
      create: { code, startsAt, expiresAt, maxRedemptions: 1 },
    });
  }
  console.log("Kuponok beültetve ✅");
}

main().finally(() => prisma.$disconnect());