import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/local-db";

const signToken = (userId: string) => {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  const expiresIn = "7d";
  return jwt.sign({ userId }, secret, { expiresIn });
};

export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password, username } = req.body || {};
    if (!email || !password || !username) {
      return res.status(400).json({ error: "email, password, username required" });
    }
    const byEmail = await db.findUserByEmail(email);
    const byUsername = await db.findUserByUsername(username);
    if (byEmail || byUsername) return res.status(409).json({ error: "User exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser({ email, username, passwordHash });
    const token = signToken(user.id);
    return res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (e) {
    return res.status(500).json({ error: "Registration failed" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const user = await db.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken(user.id);
    return res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (e) {
    return res.status(500).json({ error: "Login failed" });
  }
};
