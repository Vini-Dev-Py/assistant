import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Vinii@Domtec", 10);

  await prisma.user.create({
    data: {
      name: "Vinii",
      email: "vinicius@domtec.com.br",
      password: hashedPassword,
    },
  });

  console.log("Seed completed: User Vinii created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
