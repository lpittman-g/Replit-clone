import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_PROJECT_FILES } from "../lib/projects/fileTree";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@replit-clone.local";
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Demo User",
      passwordHash,
    },
    create: {
      email,
      name: "Demo User",
      passwordHash,
    },
  });

  const existing = await prisma.project.findFirst({
    where: { userId: user.id, name: "Welcome Repl" },
  });

  if (!existing) {
    await prisma.project.create({
      data: {
        name: "Welcome Repl",
        description: "Your first saved Repl",
        userId: user.id,
        files: {
          create: DEFAULT_PROJECT_FILES.map((file) => ({
            path: file.path,
            name: file.name,
            type: file.type,
            content: file.content,
          })),
        },
      },
    });
  }

  console.log("Seeded demo user:", email, "/ password: demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
