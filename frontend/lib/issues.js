import { ObjectId } from "mongodb";
import { getCollection, unwrap } from "./mongodb.js";
import { logActivity } from "./activity.js";

export const ISSUE_STATUSES = ["open", "in_progress", "resolved", "closed"];
export const ISSUE_SEVERITIES = ["low", "medium", "high", "critical"];
export const ISSUE_PRIORITIES = ["low", "medium", "high", "urgent"];

export class IssueServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "IssueServiceError";
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toProjectIdString(id) {
  if (id instanceof ObjectId) return id.toHexString();
  return String(id);
}

export async function createIssue(input = {}, user) {
  const projectId = toProjectIdString(input.projectId);
  const title = asTrimmed(input.title);

  if (!projectId) {
    throw new IssueServiceError("projectId is required", 400);
  }
  if (!title) {
    throw new IssueServiceError("Issue title is required", 400);
  }

  const now = new Date();
  const issue = {
    projectId,
    title,
    description: asTrimmed(input.description),
    severity: input.severity || "medium",
    status: input.status || "open",
    priority: input.priority || "medium",
    assignee: asTrimmed(input.assignee),
    dueDate: toDateOrNull(input.dueDate),
    createdAt: now,
    updatedAt: now,
  };

  try {
    const issues = await getCollection("issues");
    const { insertedId } = await issues.insertOne(issue);

    await logActivity(user, {
      action: "create",
      targetType: "issue",
      target: issue.title,
      details: { projectId, status: issue.status, priority: issue.priority },
    }).catch(() => {});

    return { ...issue, _id: insertedId };
  } catch (err) {
    if (err instanceof IssueServiceError) throw err;
    throw new IssueServiceError("Could not create the issue. Please try again.", 500);
  }
}

export async function getIssueById(id) {
  if (!ObjectId.isValid(id)) {
    throw new IssueServiceError("Invalid issue id", 400);
  }

  try {
    const issue = await (await getCollection("issues")).findOne({ _id: new ObjectId(id) });
    if (!issue) {
      throw new IssueServiceError("Issue not found", 404);
    }
    return issue;
  } catch (err) {
    if (err instanceof IssueServiceError) throw err;
    throw new IssueServiceError("Could not load the issue. Please try again.", 500);
  }
}

export async function listIssuesByProject(projectId, status) {
  const filter = projectId ? { projectId: toProjectIdString(projectId) } : {};
  if (status) filter.status = status;

  try {
    return await (await getCollection("issues")).find(filter).sort({ createdAt: 1 }).toArray();
  } catch (err) {
    if (err instanceof IssueServiceError) throw err;
    throw new IssueServiceError("Could not load the issues. Please try again.", 500);
  }
}

export async function findIssue({ id, searchTitle, projectId, status }) {
  if (id !== undefined && id !== null && String(id).trim() !== "") {
    return { kind: "single", issue: await getIssueById(String(id).trim()) };
  }

  const scope = projectId ? { projectId: toProjectIdString(projectId) } : {};
  const title = asTrimmed(searchTitle);

  if (!title && !scope.projectId) {
    throw new IssueServiceError("Please provide an issue id, an issue title, or a project", 400);
  }

  if (!title && scope.projectId) {
    return { kind: "list", issues: await listIssuesByProject(scope.projectId, status) };
  }

  try {
    const issues = await getCollection("issues");
    const pattern = escapeRegex(title);
    const titleFilter = { title: { $regex: new RegExp(`^${pattern}$`, "i") } };

    const exact = await issues.findOne({ ...titleFilter, ...scope });
    if (exact) return { kind: "single", issue: exact };

    const matches = await issues
      .find({ title: { $regex: new RegExp(pattern, "i") }, ...scope })
      .sort({ createdAt: 1 })
      .limit(5)
      .toArray();

    if (matches.length === 0) {
      throw new IssueServiceError(`Issue "${title}" not found`, 404);
    }
    if (matches.length > 1) {
      const names = matches.map((i) => `"${i.title}"`).join(", ");
      throw new IssueServiceError(`Multiple issues match "${title}". Please specify one: ${names}.`, 400);
    }
    return { kind: "single", issue: matches[0] };
  } catch (err) {
    if (err instanceof IssueServiceError) throw err;
    throw new IssueServiceError("Could not find the issue. Please try again.", 500);
  }
}

export async function updateIssue(id, input = {}, user) {
  if (!ObjectId.isValid(id)) {
    throw new IssueServiceError("Invalid issue id", 400);
  }

  const patch = { updatedAt: new Date() };

  if (input.title !== undefined) {
    if (!String(input.title).trim()) {
      throw new IssueServiceError("Issue title cannot be empty", 400);
    }
    patch.title = String(input.title).trim();
  }
  if (input.description !== undefined) patch.description = String(input.description).trim();
  if (input.severity !== undefined) patch.severity = input.severity;
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.assignee !== undefined) patch.assignee = String(input.assignee).trim();
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate ? new Date(input.dueDate) : null;

  try {
    const issues = await getCollection("issues");
    const result = await issues.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const issue = unwrap(result);
    if (!issue) {
      throw new IssueServiceError("Issue not found", 404);
    }

    await logActivity(user, {
      action: "update",
      targetType: "issue",
      target: issue.title || id,
      details: { status: patch.status || issue.status, priority: patch.priority || issue.priority },
    }).catch(() => {});

    return issue;
  } catch (err) {
    if (err instanceof IssueServiceError) throw err;
    throw new IssueServiceError("Could not update the issue. Please try again.", 500);
  }
}

export async function resolveIssue(id, user) {
  return updateIssue(id, { status: "resolved" }, user);
}

export async function deleteIssue(id, user) {
  if (!ObjectId.isValid(id)) {
    throw new IssueServiceError("Invalid issue id", 400);
  }

  try {
    const issues = await getCollection("issues");
    const result = await issues.findOneAndDelete({ _id: new ObjectId(id) });
    const issue = unwrap(result);

    if (!issue) {
      throw new IssueServiceError("Issue not found", 404);
    }

    await logActivity(user, {
      action: "delete",
      targetType: "issue",
      target: issue.title || id,
      details: {},
    }).catch(() => {});

    return { deleted: true, id };
  } catch (err) {
    if (err instanceof IssueServiceError) throw err;
    throw new IssueServiceError("Could not delete the issue. Please try again.", 500);
  }
}
