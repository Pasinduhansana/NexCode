import { ObjectId } from "mongodb";
import { getCollection, unwrap } from "./mongodb.js";
import { logActivity } from "./activity.js";
import { invalidate } from "./cache.js";

const PROJECT_PROJECTION = {
  name: 1,
  client: 1,
  description: 1,
  status: 1,
  priority: 1,
  startDate: 1,
  dueDate: 1,
  budget: 1,
  projectCost: 1,
  domainCost: 1,
  advanceAmount: 1,
  paidStatus: 1,
  tags: 1,
  color: 1,
};

export class ProjectServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "ProjectServiceError";
    this.status = status;
    this.expose = true;
  }
}

function asTrimmed(value) {
  return value ? String(value).trim() : "";
}

function toDateOrNull(value) {
  return value ? new Date(value) : null;
}

function toNumberOrNull(value) {
  return value !== undefined && value !== "" && value !== null ? Number(value) : null;
}

function toStringArray(value) {
  return Array.isArray(value) ? value.map((v) => String(v).trim()).filter(Boolean) : [];
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listProjects() {
  try {
    return await (await getCollection("projects"))
      .find({}, { projection: PROJECT_PROJECTION })
      .sort({ updatedAt: -1 })
      .toArray();
  } catch (err) {
    throw new ProjectServiceError("Could not load projects. Please try again.", 500);
  }
}

export async function createProject(input = {}, user) {
  const name = asTrimmed(input.name);
  if (!name) {
    throw new ProjectServiceError("Project name is required", 400);
  }

  const now = new Date();
  const project = {
    name,
    client: asTrimmed(input.client),
    description: asTrimmed(input.description),
    status: input.status || "planning",
    priority: input.priority || "medium",
    startDate: toDateOrNull(input.startDate),
    dueDate: toDateOrNull(input.dueDate),
    budget: toNumberOrNull(input.budget),
    projectCost: toNumberOrNull(input.projectCost),
    domainCost: toNumberOrNull(input.domainCost),
    advanceAmount: toNumberOrNull(input.advanceAmount),
    paidStatus: input.paidStatus || "pending",
    features: toStringArray(input.features),
    notes: asTrimmed(input.notes),
    tags: toStringArray(input.tags),
    color: input.color || "#3699f3",
    createdAt: now,
    updatedAt: now,
  };

  try {
    const projects = await getCollection("projects");
    const { insertedId } = await projects.insertOne(project);

    invalidate("kanban", "stats");

    await logActivity(user, {
      action: "create",
      targetType: "project",
      target: project.name,
      details: { status: project.status, priority: project.priority },
    }).catch(() => {});

    return { ...project, _id: insertedId };
  } catch (err) {
    if (err instanceof ProjectServiceError) throw err;
    throw new ProjectServiceError("Could not create the project. Please try again.", 500);
  }
}

export async function getProjectById(id) {
  if (!ObjectId.isValid(id)) {
    throw new ProjectServiceError("Invalid project id", 400);
  }

  try {
    const projects = await getCollection("projects");
    const tasks = await getCollection("tasks");
    const project = await projects.findOne({ _id: new ObjectId(id) });
    if (!project) {
      throw new ProjectServiceError("Project not found", 404);
    }

    const projectTasks = await tasks
      .find({ projectId: id instanceof ObjectId ? id.toHexString() : id })
      .sort({ order: 1, createdAt: 1 })
      .toArray();

    return { ...project, tasks: projectTasks };
  } catch (err) {
    if (err instanceof ProjectServiceError) throw err;
    throw new ProjectServiceError("Could not load the project. Please try again.", 500);
  }
}

export async function resolveProjectId({ id, searchName }) {
  if (id !== undefined && id !== null && String(id).trim() !== "") {
    const raw = String(id).trim();
    if (!ObjectId.isValid(raw)) {
      throw new ProjectServiceError("Invalid project id", 400);
    }
    return new ObjectId(raw);
  }

  const name = asTrimmed(searchName);
  if (!name) {
    throw new ProjectServiceError("Please provide a project id or name", 400);
  }

  try {
    const projects = await getCollection("projects");
    const pattern = escapeRegex(name);

    const exact = await projects.findOne({ name: { $regex: new RegExp(`^${pattern}$`, "i") } });
    if (exact) return exact._id;

    const matches = await projects
      .find({ name: { $regex: new RegExp(pattern, "i") } })
      .sort({ updatedAt: -1 })
      .limit(5)
      .toArray();

    if (matches.length === 0) {
      throw new ProjectServiceError(`Project "${name}" not found`, 404);
    }
    if (matches.length > 1) {
      const names = matches.map((p) => `"${p.name}"`).join(", ");
      throw new ProjectServiceError(`Multiple projects match "${name}". Please specify one: ${names}.`, 400);
    }
    return matches[0]._id;
  } catch (err) {
    if (err instanceof ProjectServiceError) throw err;
    throw new ProjectServiceError("Could not find the project. Please try again.", 500);
  }
}

export async function updateProject(id, input = {}, user) {
  if (!ObjectId.isValid(id)) {
    throw new ProjectServiceError("Invalid project id", 400);
  }

  const patch = { updatedAt: new Date() };

  if (input.name !== undefined) {
    if (!String(input.name).trim()) {
      throw new ProjectServiceError("Project name cannot be empty", 400);
    }
    patch.name = String(input.name).trim();
  }
  if (input.client !== undefined) patch.client = String(input.client).trim();
  if (input.description !== undefined) patch.description = String(input.description).trim();
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.startDate !== undefined) patch.startDate = input.startDate ? new Date(input.startDate) : null;
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.budget !== undefined)
    patch.budget = input.budget !== "" && input.budget !== null ? Number(input.budget) : null;
  if (input.projectCost !== undefined)
    patch.projectCost = input.projectCost !== "" && input.projectCost !== null ? Number(input.projectCost) : null;
  if (input.domainCost !== undefined)
    patch.domainCost = input.domainCost !== "" && input.domainCost !== null ? Number(input.domainCost) : null;
  if (input.advanceAmount !== undefined)
    patch.advanceAmount = input.advanceAmount !== "" && input.advanceAmount !== null ? Number(input.advanceAmount) : null;
  if (input.paidStatus !== undefined) patch.paidStatus = input.paidStatus;
  if (input.features !== undefined)
    patch.features = Array.isArray(input.features) ? input.features.map((f) => String(f).trim()).filter(Boolean) : [];
  if (input.notes !== undefined) patch.notes = String(input.notes).trim();
  if (input.tags !== undefined)
    patch.tags = Array.isArray(input.tags) ? input.tags.map((t) => String(t).trim()).filter(Boolean) : [];
  if (input.color !== undefined) patch.color = input.color;

  try {
    const projects = await getCollection("projects");
    const result = await projects.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const project = unwrap(result);
    if (!project) {
      throw new ProjectServiceError("Project not found", 404);
    }

    invalidate("kanban", "stats");

    await logActivity(user, {
      action: "update",
      targetType: "project",
      target: project.name || id,
      details: { status: patch.status || project.status, priority: patch.priority || project.priority },
    }).catch(() => {});

    return project;
  } catch (err) {
    if (err instanceof ProjectServiceError) throw err;
    throw new ProjectServiceError("Could not update the project. Please try again.", 500);
  }
}

export async function deleteProject(id, user) {
  if (!ObjectId.isValid(id)) {
    throw new ProjectServiceError("Invalid project id", 400);
  }

  try {
    const projects = await getCollection("projects");
    const tasks = await getCollection("tasks");
    const result = await projects.findOneAndDelete({ _id: new ObjectId(id) });
    const project = unwrap(result);
    if (!project) {
      throw new ProjectServiceError("Project not found", 404);
    }

    await tasks.deleteMany({ projectId: id instanceof ObjectId ? id.toHexString() : id });

    invalidate("kanban", "stats");

    await logActivity(user, {
      action: "delete",
      targetType: "project",
      target: project.name || id,
      details: {},
    }).catch(() => {});

    return { deleted: true, id };
  } catch (err) {
    if (err instanceof ProjectServiceError) throw err;
    throw new ProjectServiceError("Could not delete the project. Please try again.", 500);
  }
}
