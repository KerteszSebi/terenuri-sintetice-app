import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is not configured");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const seed = async () => {
  await prisma.matchPlayer.deleteMany();
  await prisma.match.deleteMany();
  await prisma.pitch.deleteMany();

  await prisma.pitch.createMany({
    data: [
      {
        name: "Greenfield Arena",
        location: "Targu Mures",
      },
      {
        name: "Teren Sintetic LPS Targu Mures",
        location: "Strada Insulei, Targu Mures",
      },
      {
        name: "Agora Terenuri de Fotbal Tg.Mures",
        location: "Strada Regele Ferdinand 4, Targu Mures",
      },
    ],
  });
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Seeding failed:", error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
