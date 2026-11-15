import bcrypt from "bcrypt";
import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import type { PrismaClient } from "@prisma/client";
import { getJwtSecret } from "../auth/config";

const passwordSaltRounds = 10;

const createToken = (user: { id: string; role: string }): string =>
  jwt.sign({ id: user.id, role: user.role }, getJwtSecret(), {
    expiresIn: "1d",
  });

export const createAuthRouter = (prisma: PrismaClient) => {
  const router = express.Router();

  router.post(
    "/register",
    async (request: Request, response: Response): Promise<void> => {
      const { email, password, name } = request.body as {
        email?: unknown;
        password?: unknown;
        name?: unknown;
      };

      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        password.length < 8 ||
        (name !== undefined && typeof name !== "string")
      ) {
        response.status(400).json({
          error: "Email and a password of at least 8 characters are required",
        });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        response.status(400).json({ error: "Email is required" });
        return;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (existingUser) {
        response.status(409).json({ error: "Email is already registered" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, passwordSaltRounds);
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name === undefined ? null : name.trim() || null,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      response.status(201).json({ user });
    },
  );

  router.post(
    "/login",
    async (request: Request, response: Response): Promise<void> => {
      const { email, password } = request.body as {
        email?: unknown;
        password?: unknown;
      };

      if (typeof email !== "string" || typeof password !== "string") {
        response.status(400).json({ error: "Email and password are required" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        response.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const token = createToken(user);
      response.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    },
  );

  return router;
};
