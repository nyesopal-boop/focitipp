import db from "../lib/db";

const codes = [
  "PRODEC25-A7KD-93QF-MZ1H",
  "PRODEC25-B2LX-5RNU-TY8C",
  "PRODEC25-C9VE-1JHK-PQ3S",
  "PRODEC25-D5WM-8AZR-LU6N",
  "PRODEC25-E4QT-2XCG-NB7V",
  "PRODEC25-F6YP-7MDB-RW0K",
];
const expires = "2025-12-30T23:59:59";

for (const code of codes) {
  db.prepare("INSERT OR IGNORE INTO coupons (code, startsAt, expiresAt) VALUES (?, ?, ?)").run(
    code,
    new Date().toISOString(),
    expires
  );
}

console.log("6 coupons seeded ✅");