import { RequestHandler } from "express";
import { db } from "../db/local-db";

export const getUserPortfolio: RequestHandler = async (req, res) => {
  try {
    const { username } = req.params as { username: string };
    const user = await db.findUserByUsername(username);
    if (!user) return res.status(404).json({ error: "User not found" });
    const projects = await db.listProjectsByUser(user.id);
    return res.json({
      user: { id: user.id, username: user.username },
      projects: projects.map((p) => ({ _id: p.id, title: p.title, description: p.description, image: p.image })),
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to load portfolio" });
  }
};
