import { RequestHandler } from "express";
import { User } from "../models/User";
import { Project } from "../models/Project";

export const getUserPortfolio: RequestHandler = async (req, res) => {
  try {
    const { username } = req.params as { username: string };
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    const projects = await Project.find({ user: user._id }).sort({ createdAt: -1 });
    return res.json({ user: { id: user.id, username: user.username }, projects });
  } catch (e) {
    return res.status(500).json({ error: "Failed to load portfolio" });
  }
};
