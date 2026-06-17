/**
 * Auth seed — creates default admin user.
 * Run: npx tsx prisma/auth-seed.ts
 *
 * Default admin:
 *   Email:    admin@reviewpilot.vn
 *   Password: Admin@123456
 *   Role:     admin
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@reviewpilot.vn";
const ADMIN_PASSWORD = "Admin@123456";
const ADMIN_NAME = "Admin ReviewPilot";

async function main() {
  console.log("Checking admin user...");

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`Admin user already exists (id: ${existing.id}). Skipping.`);
    return;
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  const user = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
      role: "ADMIN",
      status: "active",
    },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log("Admin user created:", user);
  console.log(`\nLogin credentials:`);
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("Auth seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
