import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import { db } from "../db/local-db";

export const listProjects: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const projects = await db.listProjectsByUser(userId);
    return res.json({ projects: projects.map((p) => ({ _id: p.id, title: p.title, description: p.description, image: p.image })) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to load projects" });
  }
};

export const createProject: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { title, description, image } = req.body || {};
    if (!title || !description) return res.status(400).json({ error: "title and description required" });
    const project = await db.createProject(userId, { title, description, image });
    return res.status(201).json({ project: { _id: project.id, title: project.title, description: project.description, image: project.image } });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create project" });
  }
};

export const updateProject: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { title, description, image } = req.body || {};
    const project = await db.updateProjectForUser(id, userId, { title, description, image });
    if (!project) return res.status(404).json({ error: "Not found" });
    return res.json({ project: { _id: project.id, title: project.title, description: project.description, image: project.image } });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update project" });
  }
};

export const deleteProject: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const deleted = await db.deleteProjectForUser(id, userId);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete project" });
  }
};
