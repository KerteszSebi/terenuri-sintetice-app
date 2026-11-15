import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { getJwtSecret } from "../auth/config";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const isAuthenticatedUser = (
  payload: string | JwtPayload,
): payload is JwtPayload & AuthenticatedUser =>
  typeof payload !== "string" &&
  typeof payload.id === "string" &&
  (payload.role === UserRole.ADMIN || payload.role === UserRole.PLAYER);

export const authenticateToken = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const authorization = request.header("Authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : undefined;

  if (!token) {
    response.status(401).json({ error: "Authentication token is required" });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (!isAuthenticatedUser(payload)) {
      response.status(401).json({ error: "Invalid authentication token" });
      return;
    }

    request.user = {
      id: payload.id,
      role: payload.role,
    };
    next();
  } catch (error: unknown) {
    console.error("Failed to verify authentication token:", error);
    response.status(401).json({ error: "Invalid or expired authentication token" });
  }
};
