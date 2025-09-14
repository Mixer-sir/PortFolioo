import { RequestHandler } from "express";
import { Project } from "../models/Project";
import { AuthRequest } from "../middleware/auth";

export const listProjects: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const projects = await Project.find({ user: userId }).sort({ createdAt: -1 });
    return res.json({ projects });
  } catch (e) {
    return res.status(500).json({ error: "Failed to load projects" });
  }
};

export const createProject: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { title, description, image } = req.body || {};
    if (!title || !description) return res.status(400).json({ error: "title and description required" });
    const project = await Project.create({ user: userId, title, description, image });
    return res.status(201).json({ project });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create project" });
  }
};

export const updateProject: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { title, description, image } = req.body || {};
    const project = await Project.findOne({ _id: id, user: userId });
    if (!project) return res.status(404).json({ error: "Not found" });
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (image !== undefined) project.image = image;
    await project.save();
    return res.json({ project });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update project" });
  }
};

export const deleteProject: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const project = await Project.findOneAndDelete({ _id: id, user: userId });
    if (!project) return res.status(404).json({ error: "Not found" });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete project" });
  }
};
