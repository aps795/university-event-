import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function initDb() {
  try {
    // Check if the user table exists and has records
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log(`Database already initialized with ${userCount} users.`);
      return;
    }
  } catch (error) {
    console.log("Database tables missing. Running 'prisma db push'...");
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
  }

  // If table was just created or userCount is 0, seed data
  console.log("Seeding initial DHSGSU EventHub university data...");
  try {
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  } catch (seedErr) {
    console.error("Seeding warning:", seedErr);
  }
}

initDb()
  .catch((e) => {
    console.error("init-db error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
