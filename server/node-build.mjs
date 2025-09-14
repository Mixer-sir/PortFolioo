import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { promises } from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const __filename = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename);
const dataDir = path.resolve(__dirname$1, "../data");
const dbPath = path.join(dataDir, "db.json");
async function ensureFile() {
  await promises.mkdir(dataDir, { recursive: true });
  try {
    await promises.access(dbPath);
  } catch {
    const empty = { users: [], projects: [] };
    await promises.writeFile(dbPath, JSON.stringify(empty, null, 2), "utf-8");
  }
}
async function readDb() {
  await ensureFile();
  const raw = await promises.readFile(dbPath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    const empty = { users: [], projects: [] };
    await promises.writeFile(dbPath, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }
}
async function writeDb(db2) {
  await promises.writeFile(dbPath, JSON.stringify(db2, null, 2), "utf-8");
}
const db = {
  // Users
  async findUserByEmail(email) {
    const data = await readDb();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  async findUserByUsername(username) {
    const data = await readDb();
    return data.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    ) || null;
  },
  async createUser(params) {
    const data = await readDb();
    if (data.users.some(
      (u) => u.email.toLowerCase() === params.email.toLowerCase()
    )) {
      throw new Error("email_taken");
    }
    if (data.users.some(
      (u) => u.username.toLowerCase() === params.username.toLowerCase()
    )) {
      throw new Error("username_taken");
    }
    const user = {
      id: crypto.randomUUID(),
      email: params.email,
      username: params.username,
      passwordHash: params.passwordHash,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    data.users.push(user);
    await writeDb(data);
    return user;
  },
  async findUserById(id) {
    const data = await readDb();
    return data.users.find((u) => u.id === id) || null;
  },
  // Projects
  async listProjectsByUser(userId) {
    const data = await readDb();
    return data.projects.filter((p) => p.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async createProject(userId, params) {
    const data = await readDb();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const project = {
      id: crypto.randomUUID(),
      userId,
      title: params.title,
      description: params.description,
      image: params.image,
      createdAt: now,
      updatedAt: now
    };
    data.projects.push(project);
    await writeDb(data);
    return project;
  },
  async findProjectByIdForUser(id, userId) {
    const data = await readDb();
    return data.projects.find((p) => p.id === id && p.userId === userId) || null;
  },
  async updateProjectForUser(id, userId, params) {
    const data = await readDb();
    const idx = data.projects.findIndex(
      (p) => p.id === id && p.userId === userId
    );
    if (idx === -1) return null;
    const current = data.projects[idx];
    const updated = {
      ...current,
      ...params,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    data.projects[idx] = updated;
    await writeDb(data);
    return updated;
  },
  async deleteProjectForUser(id, userId) {
    const data = await readDb();
    const before = data.projects.length;
    data.projects = data.projects.filter(
      (p) => !(p.id === id && p.userId === userId)
    );
    const deleted = data.projects.length !== before;
    if (deleted) await writeDb(data);
    return deleted;
  }
};
const signToken = (userId) => {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  const expiresIn = "7d";
  return jwt.sign({ userId }, secret, { expiresIn });
};
const register = async (req, res) => {
  try {
    const { email, password, username } = req.body || {};
    if (!email || !password || !username) {
      return res.status(400).json({ error: "email, password, username required" });
    }
    const byEmail = await db.findUserByEmail(email);
    const byUsername = await db.findUserByUsername(username);
    if (byEmail || byUsername)
      return res.status(409).json({ error: "User exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser({ email, username, passwordHash });
    const token = signToken(user.id);
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, username: user.username }
    });
  } catch (e) {
    return res.status(500).json({ error: "Registration failed" });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });
    const user = await db.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken(user.id);
    return res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username }
    });
  } catch (e) {
    return res.status(500).json({ error: "Login failed" });
  }
};
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : void 0;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
const listProjects = async (req, res) => {
  try {
    const userId = req.userId;
    const projects = await db.listProjectsByUser(userId);
    return res.json({
      projects: projects.map((p) => ({
        _id: p.id,
        title: p.title,
        description: p.description,
        image: p.image
      }))
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to load projects" });
  }
};
const createProject = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, image } = req.body || {};
    if (!title || !description)
      return res.status(400).json({ error: "title and description required" });
    const project = await db.createProject(userId, {
      title,
      description,
      image
    });
    return res.status(201).json({
      project: {
        _id: project.id,
        title: project.title,
        description: project.description,
        image: project.image
      }
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create project" });
  }
};
const updateProject = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { title, description, image } = req.body || {};
    const project = await db.updateProjectForUser(id, userId, {
      title,
      description,
      image
    });
    if (!project) return res.status(404).json({ error: "Not found" });
    return res.json({
      project: {
        _id: project.id,
        title: project.title,
        description: project.description,
        image: project.image
      }
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update project" });
  }
};
const deleteProject = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await db.deleteProjectForUser(id, userId);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete project" });
  }
};
const getUserPortfolio = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await db.findUserByUsername(username);
    if (!user) return res.status(404).json({ error: "User not found" });
    const projects = await db.listProjectsByUser(user.id);
    return res.json({
      user: { id: user.id, username: user.username },
      projects: projects.map((p) => ({
        _id: p.id,
        title: p.title,
        description: p.description,
        image: p.image
      }))
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to load portfolio" });
  }
};
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.get("/api/demo", handleDemo);
  app2.post("/api/auth/register", register);
  app2.post("/api/auth/login", login);
  app2.post("/auth/register", register);
  app2.post("/auth/login", login);
  app2.get("/api/projects", requireAuth, listProjects);
  app2.post("/api/projects", requireAuth, createProject);
  app2.put("/api/projects/:id", requireAuth, updateProject);
  app2.delete("/api/projects/:id", requireAuth, deleteProject);
  app2.get("/projects", requireAuth, listProjects);
  app2.post("/projects", requireAuth, createProject);
  app2.put("/projects/:id", requireAuth, updateProject);
  app2.delete("/projects/:id", requireAuth, deleteProject);
  app2.get("/api/users/:username/projects", getUserPortfolio);
  app2.get("/users/:username/projects", getUserPortfolio);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
