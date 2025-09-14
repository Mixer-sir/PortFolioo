import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data");
const dbPath = path.join(dataDir, "db.json");

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  userId: string;
  title: string;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface DbSchema {
  users: UserRecord[];
  projects: ProjectRecord[];
}

async function ensureFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    const empty: DbSchema = { users: [], projects: [] };
    await fs.writeFile(dbPath, JSON.stringify(empty, null, 2), "utf-8");
  }
}

async function readDb(): Promise<DbSchema> {
  await ensureFile();
  const raw = await fs.readFile(dbPath, "utf-8");
  try {
    return JSON.parse(raw) as DbSchema;
  } catch {
    const empty: DbSchema = { users: [], projects: [] };
    await fs.writeFile(dbPath, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }
}

async function writeDb(db: DbSchema) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

export const db = {
  // Users
  async findUserByEmail(email: string) {
    const data = await readDb();
    return (
      data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
      null
    );
  },
  async findUserByUsername(username: string) {
    const data = await readDb();
    return (
      data.users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase(),
      ) || null
    );
  },
  async createUser(params: {
    email: string;
    username: string;
    passwordHash: string;
  }) {
    const data = await readDb();
    if (
      data.users.some(
        (u) => u.email.toLowerCase() === params.email.toLowerCase(),
      )
    ) {
      throw new Error("email_taken");
    }
    if (
      data.users.some(
        (u) => u.username.toLowerCase() === params.username.toLowerCase(),
      )
    ) {
      throw new Error("username_taken");
    }
    const user: UserRecord = {
      id: crypto.randomUUID(),
      email: params.email,
      username: params.username,
      passwordHash: params.passwordHash,
      createdAt: new Date().toISOString(),
    };
    data.users.push(user);
    await writeDb(data);
    return user;
  },
  async findUserById(id: string) {
    const data = await readDb();
    return data.users.find((u) => u.id === id) || null;
  },

  // Projects
  async listProjectsByUser(userId: string) {
    const data = await readDb();
    return data.projects
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async createProject(
    userId: string,
    params: { title: string; description: string; image?: string },
  ) {
    const data = await readDb();
    const now = new Date().toISOString();
    const project: ProjectRecord = {
      id: crypto.randomUUID(),
      userId,
      title: params.title,
      description: params.description,
      image: params.image,
      createdAt: now,
      updatedAt: now,
    };
    data.projects.push(project);
    await writeDb(data);
    return project;
  },
  async findProjectByIdForUser(id: string, userId: string) {
    const data = await readDb();
    return (
      data.projects.find((p) => p.id === id && p.userId === userId) || null
    );
  },
  async updateProjectForUser(
    id: string,
    userId: string,
    params: { title?: string; description?: string; image?: string },
  ) {
    const data = await readDb();
    const idx = data.projects.findIndex(
      (p) => p.id === id && p.userId === userId,
    );
    if (idx === -1) return null;
    const current = data.projects[idx];
    const updated: ProjectRecord = {
      ...current,
      ...params,
      updatedAt: new Date().toISOString(),
    };
    data.projects[idx] = updated;
    await writeDb(data);
    return updated;
  },
  async deleteProjectForUser(id: string, userId: string) {
    const data = await readDb();
    const before = data.projects.length;
    data.projects = data.projects.filter(
      (p) => !(p.id === id && p.userId === userId),
    );
    const deleted = data.projects.length !== before;
    if (deleted) await writeDb(data);
    return deleted;
  },
};
