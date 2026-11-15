import "dotenv/config";
import express, { type Request, type Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createAuthRouter } from "./routes/auth";

const app = express();
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/api/auth", createAuthRouter(prisma));

app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({ status: "ok" });
});

app.get("/api/pitches", async (_request: Request, response: Response) => {
  try {
    const pitches = await prisma.pitch.findMany({
      orderBy: { name: "asc" },
    });

    response.status(200).json(pitches);
  } catch (error) {
    console.error("Failed to fetch pitches:", error);
    response.status(500).json({ error: "Failed to fetch pitches" });
  }
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
