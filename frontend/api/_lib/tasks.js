import { ObjectId } from "mongodb";
import { getCollection, unwrap } from "./mongodb.js";
import { logActivity } from "./activity.js";
import { invalidate } from "./cache.js";

export const TASK_STATUSES = ["todo", "in_progress", "review", "done"];
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"];

export class TaskServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "TaskServiceError";
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toProjectIdString(id) {
  if (id instanceof ObjectId) return id.toHexString();
  return String(id);
}

export async function createTask(input = {}, user) {
  const projectId = toProjectIdString(input.projectId);
  const title = asTrimmed(input.title);

  if (!projectId) {
    throw new TaskServiceError("projectId is required", 400);
  }
  if (!title) {
    throw new TaskServiceError("Task title is required", 400);
  }

  const now = new Date();
  const task = {
    projectId,
    title,
    description: asTrimmed(input.description),
    status: input.status || "todo",
    priority: input.priority || "medium",
    assignee: asTrimmed(input.assignee),
    dueDate: toDateOrNull(input.dueDate),
    startDate: toDateOrNull(input.startDate),
    endDate: toDateOrNull(input.endDate),
    estimatedHours: toNumberOrNull(input.estimatedHours),
    notes: asTrimmed(input.notes),
    createdAt: now,
    updatedAt: now,
  };

  try {
    const tasks = await getCollection("tasks");
    const count = await tasks.countDocuments({ projectId });
    task.order = count;

    const { insertedId } = await tasks.insertOne(task);

    invalidate("kanban", "stats", "dashboard:");

    await logActivity(user, {
      action: "create",
      targetType: "task",
      target: task.title,
      details: { projectId, status: task.status, priority: task.priority },
    }).catch(() => {});

    return { ...task, _id: insertedId };
  } catch (err) {
    if (err instanceof TaskServiceError) throw err;
    throw new TaskServiceError("Could not create the task. Please try again.", 500);
  }
}

export async function getTaskById(id) {
  if (!ObjectId.isValid(id)) {
    throw new TaskServiceError("Invalid task id", 400);
  }

  try {
    const task = await (await getCollection("tasks")).findOne({ _id: new ObjectId(id) });
    if (!task) {
      throw new TaskServiceError("Task not found", 404);
    }
    return task;
  } catch (err) {
    if (err instanceof TaskServiceError) throw err;
    throw new TaskServiceError("Could not load the task. Please try again.", 500);
  }
}

export async function listTasksByProject(projectId) {
  const filter = projectId ? { projectId: toProjectIdString(projectId) } : {};

  try {
    return await (await getCollection("tasks"))
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .toArray();
  } catch (err) {
    if (err instanceof TaskServiceError) throw err;
    throw new TaskServiceError("Could not load the tasks. Please try again.", 500);
  }
}

export async function findTask({ id, searchTitle, projectId }) {
  if (id !== undefined && id !== null && String(id).trim() !== "") {
    return { kind: "single", task: await getTaskById(String(id).trim()) };
  }

  const scope = projectId ? { projectId: toProjectIdString(projectId) } : {};
  const title = asTrimmed(searchTitle);

  if (!title && !scope.projectId) {
    throw new TaskServiceError("Please provide a task id, a task title, or a project", 400);
  }

  if (!title && scope.projectId) {
    return { kind: "list", tasks: await listTasksByProject(scope.projectId) };
  }

  try {
    const tasks = await getCollection("tasks");
    const pattern = escapeRegex(title);
    const titleFilter = { title: { $regex: new RegExp(`^${pattern}$`, "i") } };

    const exact = await tasks.findOne({ ...titleFilter, ...scope });
    if (exact) return { kind: "single", task: exact };

    const matches = await tasks
      .find({ title: { $regex: new RegExp(pattern, "i") }, ...scope })
      .sort({ createdAt: 1 })
      .limit(5)
      .toArray();

    if (matches.length === 0) {
      throw new TaskServiceError(`Task "${title}" not found`, 404);
    }
    if (matches.length > 1) {
      const names = matches.map((t) => `"${t.title}"`).join(", ");
      throw new TaskServiceError(`Multiple tasks match "${title}". Please specify one: ${names}.`, 400);
    }
    return { kind: "single", task: matches[0] };
  } catch (err) {
    if (err instanceof TaskServiceError) throw err;
    throw new TaskServiceError("Could not find the task. Please try again.", 500);
  }
}

export async function updateTask(id, input = {}, user) {
  if (!ObjectId.isValid(id)) {
    throw new TaskServiceError("Invalid task id", 400);
  }

  const patch = { updatedAt: new Date() };

  if (input.title !== undefined) {
    if (!String(input.title).trim()) {
      throw new TaskServiceError("Task title cannot be empty", 400);
    }
    patch.title = String(input.title).trim();
  }
  if (input.description !== undefined) patch.description = String(input.description).trim();
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.assignee !== undefined) patch.assignee = String(input.assignee).trim();
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.startDate !== undefined) patch.startDate = input.startDate ? new Date(input.startDate) : null;
  if (input.endDate !== undefined) patch.endDate = input.endDate ? new Date(input.endDate) : null;
  if (input.notes !== undefined) patch.notes = input.notes ? String(input.notes).trim() : "";
  if (input.estimatedHours !== undefined)
    patch.estimatedHours =
      input.estimatedHours !== "" && input.estimatedHours !== null ? Number(input.estimatedHours) : null;
  if (input.order !== undefined) patch.order = Number(input.order);

  try {
    const tasks = await getCollection("tasks");
    const result = await tasks.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const task = unwrap(result);
    if (!task) {
      throw new TaskServiceError("Task not found", 404);
    }

    invalidate("kanban", "stats", "dashboard:");

    await logActivity(user, {
      action: "update",
      targetType: "task",
      target: task.title || id,
      details: { status: patch.status || task.status, priority: patch.priority || task.priority },
    }).catch(() => {});

    return task;
  } catch (err) {
    if (err instanceof TaskServiceError) throw err;
    throw new TaskServiceError("Could not update the task. Please try again.", 500);
  }
}

export async function completeTask(id, user) {
  return updateTask(id, { status: "done" }, user);
}

export async function deleteTask(id, user) {
  if (!ObjectId.isValid(id)) {
    throw new TaskServiceError("Invalid task id", 400);
  }

  try {
    const tasks = await getCollection("tasks");
    const result = await tasks.findOneAndDelete({ _id: new ObjectId(id) });
    const task = unwrap(result);

    if (!task) {
      throw new TaskServiceError("Task not found", 404);
    }

    invalidate("kanban", "stats", "dashboard:");

    await logActivity(user, {
      action: "delete",
      targetType: "task",
      target: task.title || id,
      details: {},
    }).catch(() => {});

    return { deleted: true, id };
  } catch (err) {
    if (err instanceof TaskServiceError) throw err;
    throw new TaskServiceError("Could not delete the task. Please try again.", 500);
  }
}
