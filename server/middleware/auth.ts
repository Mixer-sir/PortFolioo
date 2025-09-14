import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Express.Request {
  userId?: string;
}

export const requireAuth: RequestHandler = (req: AuthRequest, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
