import { getCollection } from "./mongodb.js";
import crypto from "crypto";

const SUPER_ADMINS = ["pasindu", "chamara"];

const DEFAULT_ACCESS = {
  pages: ["dashboard", "projects", "board", "finance", "activity", "reporting"],
  dashboardComponents: ["stats", "finance", "projects", "tasks"],
  projectAccess: "all",
  projectIds: [],
  expenseAccess: "view",
};

export function isSuperAdmin(userId) {
  return SUPER_ADMINS.includes(userId);
}

export function hashKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function compareKey(key, hash) {
  return hashKey(key) === hash;
}

export async function getAllUsers() {
  const col = await getCollection("users");
  return col.find({}, { projection: { keyHash: 0 } }).sort({ createdAt: 1 }).toArray();
}

export async function getUserById(id) {
  const col = await getCollection("users");
  return col.findOne({ _id: id }, { projection: { keyHash: 0 } });
}

export async function getUserByCredentials(accessKey) {
  const col = await getCollection("users");
  const users = await col.find({}).toArray();
  for (const u of users) {
    if (compareKey(accessKey, u.keyHash)) {
      return u;
    }
  }
  return null;
}

export async function createUser({ id, name, accessKey, access }) {
  const col = await getCollection("users");
  const now = new Date().toISOString();
  const doc = {
    _id: id,
    name,
    keyHash: hashKey(accessKey),
    superAdmin: isSuperAdmin(id),
    access: { ...DEFAULT_ACCESS, ...access },
    createdAt: now,
    updatedAt: now,
  };
  await col.insertOne(doc);
  const { keyHash, ...safe } = doc;
  return safe;
}

export async function updateUser(id, updates) {
  const col = await getCollection("users");
  const now = new Date().toISOString();
  const set = { updatedAt: now };
  if (updates.name) set.name = updates.name;
  if (updates.access) set.access = updates.access;
  await col.updateOne({ _id: id }, { $set: set });
  return getUserById(id);
}

export async function deleteUser(id) {
  const col = await getCollection("users");
  await col.deleteOne({ _id: id });
}

export async function changePassword(id, newKey) {
  const col = await getCollection("users");
  await col.updateOne(
    { _id: id },
    { $set: { keyHash: hashKey(newKey), updatedAt: new Date().toISOString() } }
  );
}

export async function ensureDefaultUsers() {
  const col = await getCollection("users");
  const existing = await col.countDocuments();
  if (existing > 0) return;

  const envUsers = [];
  for (const [envKey, value] of Object.entries(process.env)) {
    if (envKey.startsWith("ADMIN_USER_") && envKey.endsWith("_KEY") && value) {
      const id = envKey.slice("ADMIN_USER_".length, -"_KEY".length).toLowerCase();
      const name = process.env[`ADMIN_USER_${id.toUpperCase()}_NAME`];
      if (name) {
        envUsers.push({ id, name, key: value });
      }
    }
  }

  if (envUsers.length === 0 && process.env.ADMIN_ACCESS_KEY) {
    envUsers.push({ id: "admin", name: "Admin", key: process.env.ADMIN_ACCESS_KEY });
  }

  const now = new Date().toISOString();
  for (const u of envUsers) {
    const access = isSuperAdmin(u.id)
      ? { ...DEFAULT_ACCESS, pages: ["dashboard", "projects", "board", "designer", "reporting", "finance", "activity", "access"] }
      : DEFAULT_ACCESS;
    await col.insertOne({
      _id: u.id,
      name: u.name,
      keyHash: hashKey(u.key),
      superAdmin: isSuperAdmin(u.id),
      access,
      createdAt: now,
      updatedAt: now,
    });
  }
}
