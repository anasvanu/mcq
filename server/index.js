import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "mcq.db");

const DEFAULT_DATA = {
  users: [
    { id: "a1", name: "Super Admin", email: "admin@test.com", password: "test@admin", role: "admin" }
  ],
  tests: [],
  questions: [],
  assignments: [],
  submissions: [],
  otps: []
};

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(DB_FILE);
db.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const getStateStmt = db.prepare("SELECT data FROM app_state WHERE id = 1");
const setStateStmt = db.prepare(`
  INSERT INTO app_state (id, data, updated_at)
  VALUES (1, @data, @updatedAt)
  ON CONFLICT(id) DO UPDATE SET
    data = excluded.data,
    updated_at = excluded.updated_at
`);

function normalizeUsers(users) {
  const list = Array.isArray(users) ? users : [];
  const nonAdmins = list.filter((u) => u.role !== "admin");
  const enforcedAdmin = { id: "a1", name: "Super Admin", email: "admin@test.com", password: "test@admin", role: "admin" };
  return [enforcedAdmin, ...nonAdmins];
}

function getState() {
  const row = getStateStmt.get();
  if (!row) {
    const fallback = JSON.stringify(DEFAULT_DATA);
    setStateStmt.run({ data: fallback, updatedAt: new Date().toISOString() });
    return DEFAULT_DATA;
  }
  try {
    const parsed = JSON.parse(row.data);
    return { ...parsed, users: normalizeUsers(parsed.users) };
  } catch {
    return DEFAULT_DATA;
  }
}

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/state", (_req, res) => {
  res.json(getState());
});

app.put("/api/state", (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const normalized = { ...payload, users: normalizeUsers(payload.users) };
  setStateStmt.run({ data: JSON.stringify(normalized), updatedAt: new Date().toISOString() });
  return res.json({ ok: true });
});

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(ROOT, "dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
