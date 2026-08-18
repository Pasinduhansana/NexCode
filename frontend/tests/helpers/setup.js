import { mock } from "node:test";
import { ObjectId } from "mongodb";
import { createMemoryDb } from "./memoryDb.js";

export const db = createMemoryDb();
export const activityLog = [];

mock.module("../../api/_lib/mongodb.js", {
  namedExports: {
    getCollection: async (name) => db.collection(name),
    unwrap: (result) => (result && result.value !== undefined ? result.value : result),
  },
});

mock.module("../../api/_lib/activity.js", {
  namedExports: {
    logActivity: async (user, entry) => {
      activityLog.push({ user, entry });
      return { insertedId: "log" };
    },
    listActivities: async () => [],
  },
});

mock.module("../../api/_lib/projects.js", {
  namedExports: {
    getProjectById: async (id) => {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
      const project = await db.collection("projects").findOne(filter);
      if (!project) {
        const err = new Error("Project not found");
        err.status = 404;
        throw err;
      }
      return project;
    },
    resolveProjectId: async ({ searchName }) => {
      const project = await db.collection("projects").findOne({ name: searchName });
      return project ? String(project._id) : undefined;
    },
    listProjects: async () =>
      db.collection("projects").find({}).sort({ updatedAt: -1 }).toArray(),
    createProject: async () => {
      throw new Error("createProject is not implemented in tests");
    },
    updateProject: async () => {
      throw new Error("updateProject is not implemented in tests");
    },
    deleteProject: async () => {
      throw new Error("deleteProject is not implemented in tests");
    },
  },
});

export function seedProject(name, extra = {}) {
  const project = {
    _id: new ObjectId(),
    name,
    client: "Test Client",
    status: "planning",
    priority: "medium",
    updatedAt: new Date(),
    ...extra,
  };
  db.raw("projects").push(project);
  return project;
}

export function reset() {
  db.clear();
  activityLog.length = 0;
}

export function newUser(name = "Tester") {
  return { uid: "user-1", name, role: "admin" };
}