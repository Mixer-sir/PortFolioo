import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { handleDemo } from "./routes/demo";
import { register, login } from "./routes/auth";
import { requireAuth } from "./middleware/auth";
import { listProjects, createProject, updateProject, deleteProject } from "./routes/projects";
import { getUserPortfolio } from "./routes/public";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect to MongoDB if URI provided
  const uri = process.env.MONGODB_URI;
  if (uri) {
    mongoose
      .connect(uri)
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.error("MongoDB connection error", err));
  } else {
    console.warn("MONGODB_URI not set. API will not function without a database.");
  }

  // Health
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo
  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);

  // Projects CRUD (auth required)
  app.get("/api/projects", requireAuth, listProjects);
  app.post("/api/projects", requireAuth, createProject);
  app.put("/api/projects/:id", requireAuth, updateProject);
  app.delete("/api/projects/:id", requireAuth, deleteProject);

  // Public portfolio data
  app.get("/api/users/:username/projects", getUserPortfolio);

  return app;
}
