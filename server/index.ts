import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
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

  // Connect to MongoDB; if no URI, start a local in-memory MongoDB automatically
  const uri = process.env.MONGODB_URI;
  if (uri) {
    mongoose
      .connect(uri)
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.error("MongoDB connection error", err));
  } else {
    (async () => {
      try {
        const mem = await MongoMemoryServer.create();
        const memUri = mem.getUri();
        await mongoose.connect(memUri);
        console.log("MongoMemoryServer started (local DB)");
      } catch (err) {
        console.error("Failed to start local MongoMemoryServer", err);
      }
    })();
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
  // Duplicate routes without /api for environments that strip the functions prefix
  app.post("/auth/register", register);
  app.post("/auth/login", login);

  // Projects CRUD (auth required)
  app.get("/api/projects", requireAuth, listProjects);
  app.post("/api/projects", requireAuth, createProject);
  app.put("/api/projects/:id", requireAuth, updateProject);
  app.delete("/api/projects/:id", requireAuth, deleteProject);
  // Duplicates without /api
  app.get("/projects", requireAuth, listProjects);
  app.post("/projects", requireAuth, createProject);
  app.put("/projects/:id", requireAuth, updateProject);
  app.delete("/projects/:id", requireAuth, deleteProject);

  // Public portfolio data
  app.get("/api/users/:username/projects", getUserPortfolio);
  app.get("/users/:username/projects", getUserPortfolio);

  return app;
}
