import {
  createProject,
  updateProject,
  getProjectById,
  resolveProjectId,
  deleteProject,
  listProjects,
} from "../projects.js";
import {
  createTask,
  findTask,
  updateTask,
  completeTask,
  deleteTask,
  listTasksByProject,
} from "../tasks.js";
import {
  createIssue,
  findIssue,
  updateIssue,
  resolveIssue,
  deleteIssue,
  listIssuesByProject,
} from "../issues.js";
import { listActivities } from "../activity.js";
import { buildDashboardStats } from "../stats.js";
import { cached } from "../cache.js";
import {
  createConfirmation,
  getConfirmation,
  resolveConfirmation,
  cancelConfirmation,
} from "./confirmation.js";
import {
  createDesignReference,
  findDesignReference,
  updateDesignReference,
  deleteDesignReference,
} from "../designreferences.js";
import {
  createTransaction,
  getTransactionById,
  listTransactions,
  findExpense,
  updateTransaction,
  deleteTransaction,
  resolveDateRangeToken,
  TRANSACTION_TYPES,
  PAID_BY_OPTIONS,
} from "../finance.js";
import {
  buildProjectPlan,
  createProjectFromPlan,
  formatLKR,
  ProjectPlanError,
} from "../projectplanner.js";

const PROJECT_STATUSES = ["planning", "in_progress", "on_hold", "completed", "cancelled"];
const TASK_STATUSES = ["todo", "in_progress", "review", "done"];
const ISSUE_STATUSES = ["open", "in_progress", "resolved", "closed"];
const ISSUE_SEVERITIES = ["low", "medium", "high", "critical"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const PROJECT_PAID_STATUSES = ["pending", "partial", "paid"];

const s = (description, extra = {}) => ({ type: "STRING", description, ...extra });
const i = (description) => ({ type: "INTEGER", description });
const n = (description) => ({ type: "NUMBER", description });
const e = (description, values) => ({ type: "STRING", description, enum: values });
const a = (description, items) => ({ type: "ARRAY", description, items });

const PROJECT_REF_FIELDS = {
  id: s("MongoDB project id"),
  searchName: s("Project name to search for (use when the id is unknown)"),
};
const PROJECT_FIELDS = {
  name: s("Project name"),
  client: s("Client name"),
  description: s("Project description"),
  status: e("Project status", PROJECT_STATUSES),
  priority: e("Project priority", PRIORITIES),
  startDate: s("Start date (YYYY-MM-DD)"),
  dueDate: s("Due date (YYYY-MM-DD)"),
  budget: n("Total project budget"),
  projectCost: n("Project cost"),
  domainCost: n("Domain cost"),
  advanceAmount: n("Advance amount received"),
  paidStatus: e("Payment status", PROJECT_PAID_STATUSES),
  features: a("Feature list", s("Feature")),
  notes: s("Internal notes"),
  tags: a("Tags", s("Tag")),
  color: s("Project color hex, e.g. #3699f3"),
};

const TASK_REF_FIELDS = {
  id: s("MongoDB task id"),
  searchTitle: s("Task title to search for (use when the id is unknown)"),
  projectId: s("Id of the parent project"),
  searchProject: s("Parent project name to search for (use when the project id is unknown)"),
};
const TASK_FIELDS = {
  title: s("Task title"),
  description: s("Task description"),
  status: e("Task status", TASK_STATUSES),
  priority: e("Task priority", PRIORITIES),
  assignee: s("Assignee name"),
  dueDate: s("Due date (YYYY-MM-DD)"),
  startDate: s("Start date (YYYY-MM-DD)"),
  endDate: s("End date (YYYY-MM-DD)"),
  estimatedHours: n("Estimated hours"),
  notes: s("Internal notes"),
};

const ISSUE_REF_FIELDS = {
  id: s("MongoDB issue id"),
  searchTitle: s("Issue title to search for (use when the id is unknown)"),
  projectId: s("Id of the parent project"),
  searchProject: s("Parent project name to search for (use when the project id is unknown)"),
};
const ISSUE_FIELDS = {
  title: s("Issue title"),
  description: s("Issue description"),
  severity: e("Issue severity", ISSUE_SEVERITIES),
  status: e("Issue status", ISSUE_STATUSES),
  priority: e("Issue priority", PRIORITIES),
  assignee: s("Assignee name"),
  dueDate: s("Due date (YYYY-MM-DD)"),
};

const DESIGN_REFERENCE_TYPES = ["website", "image", "file", "other"];
const DESIGN_REFERENCE_REF_FIELDS = {
  id: s("MongoDB design reference id"),
  searchTitle: s("Design reference title to search for (use when the id is unknown)"),
  projectId: s("Id of the parent project"),
  searchProject: s("Parent project name to search for (use when the project id is unknown)"),
};
const DESIGN_REFERENCE_FIELDS = {
  title: s("Reference title"),
  url: s("Reference URL (must be a valid http(s) link)"),
  type: e("Reference type", DESIGN_REFERENCE_TYPES),
  notes: s("Optional notes about the reference"),
};

const EXPENSE_REF_FIELDS = {
  id: s("MongoDB transaction id"),
  searchDescription: s("Expense description to search for (use when the id is unknown)"),
  projectId: s("Id of the related project"),
  searchProject: s("Project name to search for (use when the project id is unknown)"),
};
const EXPENSE_FIELDS = {
  amount: n("Expense amount in LKR (plain number)"),
  category: s("Expense category (e.g. Software, Hardware, Marketing, Salaries, Hosting, Domain, Third Party, Other)"),
  description: s("Expense description"),
  date: s("Expense date (YYYY-MM-DD; omit for today)"),
  paidBy: s("Who paid (e.g. Pasindu, Chamara, NexCode)"),
  paymentStatus: s("Payment status (usually \"paid\")"),
};

function toPlain(value) {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object") {
    if (typeof value.toHexString === "function") return value.toHexString();
    if (Array.isArray(value)) return value.map(toPlain);
    const out = {};
    for (const [key, v] of Object.entries(value)) out[key] = toPlain(v);
    return out;
  }
  return value;
}

function exposedError(message) {
  const err = new Error(message);
  err.expose = true;
  return err;
}

async function resolveProjectScope(args) {
  const { projectId, searchProject } = args;
  if (projectId !== undefined && projectId !== null && String(projectId).trim() !== "") {
    return String(projectId).trim();
  }
  if (searchProject !== undefined && searchProject !== null && String(searchProject).trim() !== "") {
    return await resolveProjectId({ searchName: String(searchProject).trim() });
  }
  return undefined;
}

function summarizeSingle(kind, record) {
  if (kind === "task") {
    return { success: true, message: `Task "${record.title}"`, task: toPlain(record) };
  }
  if (kind === "issue") {
    return { success: true, message: `Issue "${record.title}"`, issue: toPlain(record) };
  }
  if (kind === "transaction") {
    return {
      success: true,
      message: `Expense of ${record.amount} LKR${record.description ? ` for "${record.description}"` : ""}`,
      transaction: toPlain(record),
    };
  }
  return { success: true, message: `Design reference "${record.title}"`, designReference: toPlain(record) };
}

function summarizeList(kind, records) {
  const meta = {
    task: { label: "task", key: "tasks" },
    issue: { label: "issue", key: "issues" },
    designReference: { label: "design reference", key: "designReferences" },
    transaction: { label: "expense", key: "transactions" },
  }[kind] || { label: "record", key: "records" };
  const plural = records.length === 1 ? meta.label : `${meta.label}s`;
  return {
    success: true,
    message: `Found ${records.length} ${plural}.`,
    [meta.key]: records.map(toPlain),
  };
}

function summarizeExpenseList(transactions) {
  const total = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  return {
    success: true,
    message: `Found ${transactions.length} expense${transactions.length === 1 ? "" : "s"} totaling ${total.toFixed(2)} LKR.`,
    transactions: transactions.map(toPlain),
  };
}

function expandDateRange({ dateFrom, dateTo }) {
  const hasFrom = dateFrom !== undefined && dateFrom !== null && String(dateFrom).trim() !== "";
  const hasTo = dateTo !== undefined && dateTo !== null && String(dateTo).trim() !== "";
  const fromRange = hasFrom ? resolveDateRangeToken(dateFrom) : null;
  const toRange = hasTo ? resolveDateRangeToken(dateTo) : null;

  if (fromRange && !hasTo) return { from: fromRange.from, to: fromRange.to };
  if (toRange && !hasFrom) return { from: toRange.from, to: toRange.to };

  return {
    from: fromRange ? fromRange.from : hasFrom ? dateFrom : undefined,
    to: toRange ? toRange.to : hasTo ? dateTo : undefined,
  };
}

const TOOL_CATEGORIES = {
  READ_ONLY: "READ_ONLY",
  WRITE: "WRITE",
  DESTRUCTIVE: "DESTRUCTIVE",
};

const CONFIRMED_FIELD = {
  type: "BOOLEAN",
  description:
    "Only set this when you have already made the unconfirmed call for the same action in an earlier message AND the user has explicitly said yes/confirm/go ahead. Call with the same identifying arguments. Never set it on the first (unconfirmed) call.",
};

async function requireExistingProject(projectId) {
  try {
    await getProjectById(projectId);
  } catch (err) {
    throw exposedError("The specified project does not exist. Please check the project name or id.");
  }
}

async function requestOrExecuteDelete({ context, tool, target, kind, label, execute }) {
  const confirmed = context?.argsConfirmed;
  const fingerprint = String(target._id);

  if (confirmed === true) {
    const pending = await getConfirmation({ user: context?.user, tool, fingerprint });
    if (!pending) {
      throw exposedError("There is no pending confirmation for this deletion — nothing was deleted. Request the deletion first (without `confirmed`), then confirm in a later message.");
    }
    const check = await resolveConfirmation({
      user: context?.user,
      tool,
      fingerprint,
      requestId: context?.requestId,
    });
    if (!check.ok) {
      throw exposedError(
        check.reason === "same_turn"
          ? "This deletion was only requested in the current message — it cannot be confirmed in the same message. Ask the user to confirm, then call this tool again with `confirmed: true` in the next message."
          : "This pending confirmation has expired. Nothing was deleted — please start the action again."
      );
    }
    const deleted = await execute();
    return { success: true, status: "completed", message: `Deleted the ${kind} "${label}".`, [kind]: toPlain(target) };
  }

  if (confirmed === false) {
    await cancelConfirmation({ user: context?.user, tool, fingerprint });
    return {
      success: true,
      status: "cancelled",
      message: `The deletion of the ${kind} "${label}" was cancelled. Nothing was changed.`,
      [kind]: toPlain(target),
    };
  }

  const existing = await getConfirmation({ user: context?.user, tool, fingerprint });
  if (!existing) {
    await createConfirmation({
      user: context?.user,
      tool,
      fingerprint,
      requestId: context?.requestId,
      targetLabel: label,
    });
  }
  return {
    success: true,
    status: "confirmation_required",
    message: `You're about to delete the ${kind} "${label}". Continue?`,
    [kind]: toPlain(target),
  };
}

function trimProject(project) {
  return {
    id: toPlain(project._id),
    name: project.name,
    client: project.client || null,
    status: project.status || "planning",
    priority: project.priority || null,
    budget: project.budget || 0,
    paidStatus: project.paidStatus || null,
    startDate: project.startDate || null,
    dueDate: project.dueDate || null,
    updatedAt: toPlain(project.updatedAt),
  };
}

function pickTask(task) {
  return {
    id: toPlain(task._id),
    title: task.title,
    status: task.status || "todo",
    priority: task.priority || null,
    projectId: toPlain(task.projectId),
    assignee: task.assignee || null,
    dueDate: task.dueDate || null,
  };
}

function pickIssue(issue) {
  return {
    id: toPlain(issue._id),
    title: issue.title,
    status: issue.status || "open",
    severity: issue.severity || null,
    priority: issue.priority || null,
    projectId: toPlain(issue.projectId),
    assignee: issue.assignee || null,
    dueDate: issue.dueDate || null,
  };
}

function pickActivity(activity) {
  return {
    id: toPlain(activity._id),
    userName: activity.userName || "Someone",
    action: activity.action || null,
    targetType: activity.targetType || null,
    target: activity.target || null,
    timestamp: toPlain(activity.timestamp),
  };
}

const TOOLS = [
  {
    name: "getAIHealthStatus",
    description:
      "Diagnostic test tool. Returns the health status of the AI tool-calling layer. Use when the user asks to check the assistant's health, run a test, verify the tool system, or self-check.",
    parameters: { type: "OBJECT", properties: {} },
    handler: () => ({
      status: "ok",
      service: "ai-tool-layer",
      version: "phase-9",
      time: new Date().toISOString(),
      message: "The AI tool layer is healthy. No data was read or modified.",
    }),
  },
  {
    name: "createProject",
    description:
      "Create a new project in the NexCode agency. Provide a project name. Other fields (client, budget, status, priority, dates, features, tags, notes, color) are optional and get sensible defaults. If no project name was given, ask the user for it instead of guessing. Returns the created project.",
    parameters: { type: "OBJECT", properties: PROJECT_FIELDS, required: ["name"] },
    handler: async (args, context) => {
      const project = await createProject(args, context?.user);
      return { success: true, message: `Created project "${project.name}"`, project: toPlain(project) };
    },
    dedupe: true,
  },
  {
    name: "getProject",
    description:
      "Fetch an existing project's details by its MongoDB `id` or by `searchName` (the project's name). Use when the user asks to show, view, or check a project. Returns the project including its tasks.",
    parameters: { type: "OBJECT", properties: PROJECT_REF_FIELDS },
    handler: async (args) => {
      const { id, searchName } = args;
      const projectId = await resolveProjectId({ id, searchName });
      const project = await getProjectById(projectId);
      return { success: true, message: `Project "${project.name}"`, project: toPlain(project) };
    },
  },
  {
    name: "updateProject",
    description:
      "Update fields of an existing project. Identify the project with `id` or `searchName` (its current name), and provide only the fields to change: status, priority, budget, projectCost, domainCost, advanceAmount, paidStatus, client, description, startDate, dueDate, features, tags, notes, color, or `name` to rename it. Returns the updated project.",
    parameters: { type: "OBJECT", properties: { ...PROJECT_REF_FIELDS, ...PROJECT_FIELDS } },
    handler: async (args, context) => {
      const { id, searchName, ...fields } = args;
      const projectId = await resolveProjectId({ id, searchName });
      const project = await updateProject(projectId, fields, context?.user);
      return { success: true, message: `Updated project "${project.name}"`, project: toPlain(project) };
    },
  },
  {
    name: "deleteProject",
    description:
      "Delete an existing project permanently (its tasks are removed with it). Identify the project with `id` or `searchName` (its name). DESTRUCTIVE: the first call only requests confirmation and deletes nothing; call this tool again with the same arguments and `confirmed: true` only after the user explicitly confirms, or `confirmed: false` when they decline. Returns the deleted project.",
    parameters: {
      type: "OBJECT",
      properties: {
        id: s("MongoDB project id"),
        searchName: s("Project name to search for (use when the id is unknown)"),
        confirmed: CONFIRMED_FIELD,
      },
    },
    handler: async (args, context) => {
      const { id, searchName, confirmed } = args;
      const projectId = await resolveProjectId({ id, searchName });
      const project = await getProjectById(projectId);
      return requestOrExecuteDelete({
        context: { ...context, argsConfirmed: confirmed },
        tool: "deleteProject",
        target: project,
        kind: "project",
        label: project.name,
        execute: () => deleteProject(projectId, context?.user),
      });
    },
  },
  {
    name: "createTask",
    description:
      "Create a new task under a project. Provide the task title and identify the parent project with `projectId` or `searchProject` (the project name). Other fields (description, status, priority, assignee, dueDate, startDate, endDate, estimatedHours, notes) are optional. If the project or a title is missing, ask the user for it instead of guessing. Returns the created task.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("Id of the parent project"),
        searchProject: s("Parent project name to search for (use when the project id is unknown)"),
        ...TASK_FIELDS,
      },
      required: ["title"],
    },
    handler: async (args, context) => {
      const { projectId: projectIdArg, searchProject, ...fields } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      if (!projectId) {
        throw exposedError("A project is required. Please specify which project to add the task to.");
      }
      await requireExistingProject(projectId);
      const task = await createTask({ ...fields, projectId }, context?.user);
      return { success: true, message: `Created task "${task.title}"`, task: toPlain(task) };
    },
    dedupe: true,
  },
  {
    name: "getTask",
    description:
      "Fetch a task's details by its MongoDB `id`, by `searchTitle` (the task's title), or list all tasks of a project by passing `projectId` or `searchProject`. Use when the user asks to show, view, or check a task or the tasks of a project. Returns the task or the matching task list.",
    parameters: {
      type: "OBJECT",
      properties: {
        id: s("MongoDB task id"),
        searchTitle: s("Task title to search for (use when the id is unknown)"),
        projectId: s("Id of the parent project"),
        searchProject: s("Parent project name to search for (use when the project id is unknown)"),
        status: e("Filter by task status (when listing a project's tasks)", TASK_STATUSES),
      },
    },
    handler: async (args) => {
      const { id, searchTitle, status } = args;
      const projectId = await resolveProjectScope(args);
      const result = await findTask({ id, searchTitle, projectId, status });
      if (result.kind === "single") return summarizeSingle("task", result.task);
      return summarizeList("task", result.tasks);
    },
  },
  {
    name: "updateTask",
    description:
      "Update fields of an existing task. Identify the task with `id` or `searchTitle` (its title, optionally scoped with `projectId`/`searchProject`), and provide only the fields to change: title, description, status, priority, assignee, dueDate, startDate, endDate, estimatedHours, notes. Returns the updated task.",
    parameters: { type: "OBJECT", properties: { ...TASK_REF_FIELDS, ...TASK_FIELDS } },
    handler: async (args, context) => {
      const { id, searchTitle, projectId: projectIdArg, searchProject, ...fields } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const result = await findTask({ id, searchTitle, projectId });
      const task = await updateTask(result.task._id, fields, context?.user);
      return { success: true, message: `Updated task "${task.title}"`, task: toPlain(task) };
    },
  },
  {
    name: "completeTask",
    description:
      "Mark an existing task as completed. Identify the task with `id` or `searchTitle` (its title, optionally scoped with `projectId`/`searchProject`). Uses the existing completion mechanism. Returns the updated task.",
    parameters: {
      type: "OBJECT",
      properties: {
        id: s("MongoDB task id"),
        searchTitle: s("Task title to search for (use when the id is unknown)"),
        projectId: s("Id of the parent project"),
        searchProject: s("Parent project name to search for (use when the project id is unknown)"),
      },
    },
    handler: async (args, context) => {
      const { id, searchTitle, projectId: projectIdArg, searchProject } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const result = await findTask({ id, searchTitle, projectId });
      const task = await completeTask(result.task._id, context?.user);
      return { success: true, message: `Task "${task.title}" completed`, task: toPlain(task) };
    },
  },
  {
    name: "deleteTask",
    description:
      "Delete an existing task permanently. Identify the task with `id` or `searchTitle` (its title, optionally scoped with `projectId`/`searchProject`). DESTRUCTIVE: the first call only requests confirmation and deletes nothing; call this tool again with the same arguments and `confirmed: true` only after the user explicitly confirms, or `confirmed: false` when they decline. Returns the deleted task.",
    parameters: {
      type: "OBJECT",
      properties: {
        id: s("MongoDB task id"),
        searchTitle: s("Task title to search for (use when the id is unknown)"),
        projectId: s("Id of the parent project"),
        searchProject: s("Parent project name to search for (use when the project id is unknown)"),
        confirmed: CONFIRMED_FIELD,
      },
    },
    handler: async (args, context) => {
      const { id, searchTitle, projectId: projectIdArg, searchProject, confirmed } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const result = await findTask({ id, searchTitle, projectId });
      return requestOrExecuteDelete({
        context: { ...context, argsConfirmed: confirmed },
        tool: "deleteTask",
        target: result.task,
        kind: "task",
        label: result.task.title,
        execute: () => deleteTask(result.task._id, context?.user),
      });
    },
  },
  {
    name: "createIssue",
    description:
      "Create a new issue under a project. Provide the issue title and identify the parent project with `projectId` or `searchProject` (the project name). Other fields (description, severity, status, priority, assignee, dueDate) are optional. If the project or a title is missing, ask the user for it instead of guessing. Returns the created issue.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("Id of the parent project"),
        searchProject: s("Parent project name to search for (use when the project id is unknown)"),
        ...ISSUE_FIELDS,
      },
      required: ["title"],
    },
    handler: async (args, context) => {
      const { projectId: projectIdArg, searchProject, ...fields } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      if (!projectId) {
        throw exposedError("A project is required. Please specify which project to add the issue to.");
      }
      await requireExistingProject(projectId);
      const issue = await createIssue({ ...fields, projectId }, context?.user);
      return { success: true, message: `Created issue "${issue.title}"`, issue: toPlain(issue) };
    },
    dedupe: true,
  },
  {
    name: "getIssue",
    description:
      "Fetch an issue's details by its MongoDB `id`, by `searchTitle` (the issue's title), or list issues of a project by passing `projectId` or `searchProject` (optionally filtered by `status`, e.g. \"open\"). Use when the user asks to show, view, or check an issue or the issues of a project. Returns the issue or the matching issue list.",
    parameters: {
      type: "OBJECT",
      properties: {
        id: s("MongoDB issue id"),
        searchTitle: s("Issue title to search for (use when the id is unknown)"),
        projectId: s("Id of the parent project"),
        searchProject: s("Parent project name to search for (use when the project id is unknown)"),
        status: e("Filter by issue status (when listing a project's issues)", ISSUE_STATUSES),
      },
    },
    handler: async (args) => {
      const { id, searchTitle, status } = args;
      const projectId = await resolveProjectScope(args);
      const result = await findIssue({ id, searchTitle, projectId, status });
      if (result.kind === "single") return summarizeSingle("issue", result.issue);
      return summarizeList("issue", result.issues);
    },
  },
  {
    name: "updateIssue",
    description:
      "Update fields of an existing issue. Identify the issue with `id` or `searchTitle` (its title, optionally scoped with `projectId`/`searchProject`), and provide only the fields to change: title, description, severity, status, priority, assignee, dueDate. Returns the updated issue.",
    parameters: { type: "OBJECT", properties: { ...ISSUE_REF_FIELDS, ...ISSUE_FIELDS } },
    handler: async (args, context) => {
      const { id, searchTitle, projectId: projectIdArg, searchProject, ...fields } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const result = await findIssue({ id, searchTitle, projectId });
      const issue = await updateIssue(result.issue._id, fields, context?.user);
      return { success: true, message: `Updated issue "${issue.title}"`, issue: toPlain(issue) };
    },
  },
  {
    name: "resolveIssue",
    description:
      "Mark an existing issue as resolved. Identify the issue with `id` or `searchTitle` (its title, optionally scoped with `projectId`/`searchProject`). Uses the existing resolution mechanism. Returns the updated issue.",
    parameters: {
      type: "OBJECT",
      properties: {
        id: s("MongoDB issue id"),
        searchTitle: s("Issue title to search for (use when the id is unknown)"),
        projectId: s("Id of the parent project"),
        searchProject: s("Parent project name to search for (use when the project id is unknown)"),
      },
    },
    handler: async (args, context) => {
      const { id, searchTitle, projectId: projectIdArg, searchProject } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const result = await findIssue({ id, searchTitle, projectId });
      const issue = await resolveIssue(result.issue._id, context?.user);
      return { success: true, message: `Issue "${issue.title}" resolved`, issue: toPlain(issue) };
    },
  },
  {
    name: "deleteIssue",
    description:
      "Delete an existing issue permanently. Identify the issue with `id` or `searchTitle` (its title, optionally scoped with `projectId`/`searchProject`). DESTRUCTIVE: the first call only requests confirmation and deletes nothing; call this tool again with the same arguments and `confirmed: true` only after the user explicitly confirms, or `confirmed: false` when they decline. Returns the deleted issue.",
    parameters: {
      type: "OBJECT",
      properties: {
        id: s("MongoDB issue id"),
        searchTitle: s("Issue title to search for (use when the id is unknown)"),
        projectId: s("Id of the parent project"),
        searchProject: s("Parent project name to search for (use when the project id is unknown)"),
        confirmed: CONFIRMED_FIELD,
      },
    },
    handler: async (args, context) => {
      const { id, searchTitle, projectId: projectIdArg, searchProject, confirmed } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const result = await findIssue({ id, searchTitle, projectId });
      return requestOrExecuteDelete({
        context: { ...context, argsConfirmed: confirmed },
        tool: "deleteIssue",
        target: result.issue,
        kind: "issue",
        label: result.issue.title,
        execute: () => deleteIssue(result.issue._id, context?.user),
      });
    },
  },
  {
    name: "addDesignReference",
    description:
      "Add a design reference (e.g. a Figma link or reference link) to a project. Provide the URL and identify the parent project with `projectId` or `searchProject` (the project name). `title` is required; if the user did not give one, derive a short descriptive title from the context (e.g. \"Figma link\", \"Reference link\"). `type` and `notes` are optional. If the URL or the project is missing, ask the user for it instead of guessing. Returns the created reference.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("Id of the parent project"),
        searchProject: s("Parent project name to search for (use when the project id is unknown)"),
        title: s("Reference title (derive from context if not given)"),
        url: s("Reference URL (must be a valid http(s) link)"),
        type: e("Reference type", DESIGN_REFERENCE_TYPES),
        notes: s("Optional notes about the reference"),
      },
      required: ["url", "title"],
    },
    handler: async (args, context) => {
      const { projectId: projectIdArg, searchProject, ...fields } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      if (!projectId) {
        throw exposedError("A project is required. Please specify which project to add the design reference to.");
      }
      await requireExistingProject(projectId);
      const reference = await createDesignReference({ ...fields, projectId }, context?.user);
      return {
        success: true,
        message: `Added design reference "${reference.title}"`,
        designReference: toPlain(reference),
      };
    },
    dedupe: true,
  },
  {
    name: "getDesignReferences",
    description:
      "Fetch design references by their MongoDB `id`, by `searchTitle` (their title), or list all references of a project by passing `projectId` or `searchProject` (optionally filtered by `type`). Use when the user asks to show, view, or check design references. Returns the reference or the matching list.",
    parameters: {
      type: "OBJECT",
      properties: {
        ...DESIGN_REFERENCE_REF_FIELDS,
        type: e("Filter by reference type (when listing a project's references)", DESIGN_REFERENCE_TYPES),
      },
    },
    handler: async (args) => {
      const { id, searchTitle, type } = args;
      const projectId = await resolveProjectScope(args);
      const result = await findDesignReference({ id, searchTitle, projectId, type });
      if (result.kind === "single") return summarizeSingle("designReference", result.designReference);
      return summarizeList("designReference", result.designReferences);
    },
  },
  {
    name: "updateDesignReference",
    description:
      "Update fields of an existing design reference. Identify the reference with `id` or `searchTitle` (its title, optionally scoped with `projectId`/`searchProject`), and provide only the fields to change: title, url, type, notes. Returns the updated reference.",
    parameters: { type: "OBJECT", properties: { ...DESIGN_REFERENCE_REF_FIELDS, ...DESIGN_REFERENCE_FIELDS } },
    handler: async (args, context) => {
      const { id, searchTitle, projectId: projectIdArg, searchProject, ...fields } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const result = await findDesignReference({ id, searchTitle, projectId });
      const reference = await updateDesignReference(result.designReference._id, fields, context?.user);
      return {
        success: true,
        message: `Updated design reference "${reference.title}"`,
        designReference: toPlain(reference),
      };
    },
  },
  {
    name: "deleteDesignReference",
    description:
      "Delete an existing design reference permanently. Identify the reference with `id` or `searchTitle` (its title, optionally scoped with `projectId`/`searchProject`). DESTRUCTIVE: the first call only requests confirmation and deletes nothing; call this tool again with the same arguments and `confirmed: true` only after the user explicitly confirms, or `confirmed: false` when they decline. Returns the deleted reference.",
    parameters: {
      type: "OBJECT",
      properties: {
        ...DESIGN_REFERENCE_REF_FIELDS,
        confirmed: CONFIRMED_FIELD,
      },
    },
    handler: async (args, context) => {
      const { id, searchTitle, projectId: projectIdArg, searchProject, confirmed } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const result = await findDesignReference({ id, searchTitle, projectId });
      return requestOrExecuteDelete({
        context: { ...context, argsConfirmed: confirmed },
        tool: "deleteDesignReference",
        target: result.designReference,
        kind: "design reference",
        label: result.designReference.title,
        execute: () => deleteDesignReference(result.designReference._id, context?.user),
      });
    },
  },
  {
    name: "createExpense",
    description:
      "Record a new expense for the NexCode agency. Provide the amount in LKR as a plain number (strip currency symbols like LKR/Rs and commas) and a short description. Optionally identify the related project with `projectId` or `searchProject`. Other fields (category, date, paidBy) are optional and default sensibly. If the amount or description is missing, ask the user for it instead of guessing. Returns the recorded expense.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("Id of the related project"),
        searchProject: s("Project name to search for (use when the project id is unknown)"),
        ...EXPENSE_FIELDS,
      },
      required: ["amount"],
    },
    handler: async (args, context) => {
      const { projectId: projectIdArg, searchProject, ...fields } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      if (projectId) await requireExistingProject(projectId);
      const transaction = await createTransaction({ ...fields, type: "expense", projectId }, context?.user);
      return {
        success: true,
        message: `Recorded expense of ${transaction.amount} LKR${transaction.description ? ` for "${transaction.description}"` : ""}`,
        transaction: toPlain(transaction),
      };
    },
    dedupe: true,
  },
  {
    name: "getExpense",
    description:
      "Fetch a single expense by its MongoDB `id` or by `searchDescription` (a phrase from the expense description, optionally scoped to a project with `projectId`/`searchProject`). Use when the user asks about one specific expense. Returns the expense.",
    parameters: { type: "OBJECT", properties: EXPENSE_REF_FIELDS },
    handler: async (args) => {
      const { id, searchDescription, projectId: projectIdArg, searchProject } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const result = await findExpense({ id, searchDescription, projectId, type: "expense" });
      if (result.kind === "single") return summarizeSingle("transaction", result.transaction);
      throw exposedError("Please provide an expense id or a description.");
    },
  },
  {
    name: "getExpenses",
    description:
      "List expenses (transactions of type expense) with optional filters. Supported filters: `projectId`/`searchProject` (a project), `category` (e.g. Hosting, Software, Marketing), `type` (transaction type override: income, expense, payment, advance, balance — defaults to expense), and a `dateFrom`/`dateTo` range given as YYYY-MM-DD or words like today, yesterday, this week, this month, last month. Use when the user asks to show, view, or check expenses. Returns the matching expenses with a total.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("Id of the related project"),
        searchProject: s("Project name to search for (use when the project id is unknown)"),
        category: s("Filter by category (e.g. Hosting, Software, Marketing)"),
        type: e("Transaction type filter (defaults to expense)", TRANSACTION_TYPES),
        dateFrom: s("Start date (YYYY-MM-DD) or a period word: today, this week, this month, last month"),
        dateTo: s("End date (YYYY-MM-DD)"),
      },
    },
    handler: async (args) => {
      const { projectId: projectIdArg, searchProject, dateFrom, dateTo, ...filters } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const range = expandDateRange({ dateFrom, dateTo });
      const transactions = await listTransactions({
        ...filters,
        type: filters.type || "expense",
        projectId,
        dateFrom: range.from,
        dateTo: range.to,
      });
      return summarizeExpenseList(transactions);
    },
  },
  {
    name: "updateExpense",
    description:
      "Update an existing expense. Identify it with `id` or `searchDescription` (a phrase from the description, optionally scoped to a project with `projectId`/`searchProject`), and provide only the fields to change: amount, category, description, date, paidBy, paymentStatus. Returns the updated expense.",
    parameters: { type: "OBJECT", properties: { ...EXPENSE_REF_FIELDS, ...EXPENSE_FIELDS } },
    handler: async (args, context) => {
      const { id, searchDescription, projectId: projectIdArg, searchProject, ...fields } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const result = await findExpense({ id, searchDescription, projectId, type: "expense" });
      const transaction = await updateTransaction(result.transaction._id, fields, context?.user);
      return {
        success: true,
        message: `Updated expense of ${transaction.amount} LKR${transaction.description ? ` for "${transaction.description}"` : ""}`,
        transaction: toPlain(transaction),
      };
    },
  },
  {
    name: "deleteExpense",
    description:
      "Delete an existing expense permanently. Identify it with `id` or `searchDescription` (a phrase from the description, optionally scoped to a project with `projectId`/`searchProject`). DESTRUCTIVE: the first call only requests confirmation and deletes nothing; call this tool again with the same arguments and `confirmed: true` only after the user explicitly confirms, or `confirmed: false` when they decline. Returns the deleted expense.",
    parameters: {
      type: "OBJECT",
      properties: {
        ...EXPENSE_REF_FIELDS,
        confirmed: CONFIRMED_FIELD,
      },
    },
    handler: async (args, context) => {
      const { id, searchDescription, projectId: projectIdArg, searchProject, confirmed } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const result = await findExpense({ id, searchDescription, projectId, type: "expense" });
      return requestOrExecuteDelete({
        context: { ...context, argsConfirmed: confirmed },
        tool: "deleteExpense",
        target: result.transaction,
        kind: "expense",
        label: result.transaction.description || `expense of ${result.transaction.amount} LKR`,
        execute: () => deleteTransaction(result.transaction._id, context?.user),
      });
    },
  },
  {
    name: "getDashboardStats",
    description:
      "Fetch an overview of the whole agency dashboard: total projects, tasks, completed/open tasks, overdue tasks, total budget, project counts by status, task counts by status, recent projects, and finance totals (income, expenses, net, pending payments). Read-only. Use when the user asks how many projects/tasks there are, how the business is doing overall, or for a general dashboard summary.",
    parameters: { type: "OBJECT", properties: {} },
    handler: async () => {
      const stats = await cached("stats:all", 60_000, buildDashboardStats);
      const financeTotals = stats.finance?.totals || {};
      return {
        success: true,
        message: `Dashboard summary: ${stats.totals.projects} project${stats.totals.projects === 1 ? "" : "s"}, ${stats.totals.tasks} task${stats.totals.tasks === 1 ? "" : "s"} (${stats.totals.completedTasks} completed, ${stats.totals.openTasks} open), ${stats.totals.overdueTasks} overdue task${stats.totals.overdueTasks === 1 ? "" : "s"}, ${stats.totals.totalBudget} LKR total budget, ${financeTotals.expense || 0} LKR total expenses.`,
        totals: stats.totals,
        projectStatusCounts: stats.projectStatusCounts,
        taskStatusCounts: stats.taskStatusCounts,
        recentProjects: stats.recentProjects.map(trimProject),
        overdueTasks: stats.overdueTasks.map(pickTask),
        finance: {
          totals: financeTotals,
          categoryBreakdown: (stats.finance?.categoryBreakdown || []).slice(0, 8),
          byMonth: (stats.finance?.monthlySeries || []).slice(-6),
          byPaidBy: stats.finance?.byPaidBy || {},
        },
      };
    },
  },
  {
    name: "getProjectSummary",
    description:
      "Fetch a summary of a single project. Identify the project with `projectId` or `searchProject` (the project name). Returns the project's core fields, task counts by status, how many open issues it has, and how much has been spent on it. Read-only. Use when the user asks for a summary of a specific project or how a project is doing. If the user did not name a project, ask which one instead of guessing.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("MongoDB project id"),
        searchProject: s("Project name to search for (use when the id is unknown)"),
      },
    },
    handler: async (args) => {
      const projectId = await resolveProjectScope(args);
      if (!projectId) {
        throw exposedError("Which project would you like a summary of? Please specify a project name or id.");
      }
      const project = await getProjectById(projectId);
      const taskCounts = {};
      let completed = 0;
      for (const task of project.tasks || []) {
        const status = task.status || "todo";
        taskCounts[status] = (taskCounts[status] || 0) + 1;
        if (status === "done") completed += 1;
      }
      const openIssues = await listIssuesByProject(projectId, "open");
      const expenses = await listTransactions({ type: "expense", projectId });
      const totalSpent = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalTasks = project.tasks?.length || 0;
      return {
        success: true,
        message: `Project "${project.name}" (${project.status || "planning"}): ${totalTasks} task${totalTasks === 1 ? "" : "s"}, ${completed} completed, ${openIssues.length} open issue${openIssues.length === 1 ? "" : "s"}, ${totalSpent.toFixed(2)} LKR spent.`,
        project: trimProject(project),
        taskCounts,
        totalTasks,
        completedTasks: completed,
        openIssues: openIssues.length,
        totalSpent,
      };
    },
  },
  {
    name: "getPendingTasks",
    description:
      "List tasks that are not completed yet (status not \"done\"), optionally scoped to a project with `projectId`/`searchProject` and filtered by `priority` or `status`. Returns a limited list sorted by due date plus a total count and how many are overdue. Read-only. Use when the user asks what tasks are pending, outstanding, unfinished, not done, or still in progress.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("Id of the parent project"),
        searchProject: s("Parent project name to search for (use when the project id is unknown)"),
        priority: e("Filter by priority", PRIORITIES),
        status: e("Filter by a specific status (e.g. in_progress)", TASK_STATUSES),
        limit: i("Maximum number of tasks to return (default 20, max 100)"),
      },
    },
    handler: async (args) => {
      const { priority, status, limit } = args;
      const projectId = await resolveProjectScope(args);
      const all = await listTasksByProject(projectId);
      let pending = all.filter((task) => (task.status || "todo") !== "done");
      if (priority) pending = pending.filter((task) => task.priority === priority);
      if (status) pending = pending.filter((task) => (task.status || "todo") === status);

      const now = new Date();
      const overdue = pending.filter((task) => task.dueDate && new Date(task.dueDate) < now);
      pending.sort(
        (a, b) =>
          (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) -
          (b.dueDate ? new Date(b.dueDate).getTime() : Infinity)
      );

      const size = Math.min(Number(limit) || 20, 100);
      return {
        success: true,
        message: `${pending.length} pending task${pending.length === 1 ? "" : "s"}${overdue.length ? ` (${overdue.length} overdue)` : ""}.`,
        count: pending.length,
        overdue: overdue.length,
        tasks: pending.slice(0, size).map(pickTask),
      };
    },
  },
  {
    name: "getOpenIssues",
    description:
      "List issues that are currently open, optionally scoped to a project with `projectId`/`searchProject` and filtered by `severity` or `priority`. Returns a limited list plus a total count. Read-only. Use when the user asks what issues are open or outstanding.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("Id of the parent project"),
        searchProject: s("Parent project name to search for (use when the project id is unknown)"),
        severity: e("Filter by severity", ISSUE_SEVERITIES),
        priority: e("Filter by priority", PRIORITIES),
        limit: i("Maximum number of issues to return (default 20, max 100)"),
      },
    },
    handler: async (args) => {
      const { severity, priority, limit } = args;
      const projectId = await resolveProjectScope(args);
      const issues = await listIssuesByProject(projectId, "open");
      let filtered = issues;
      if (severity) filtered = filtered.filter((issue) => issue.severity === severity);
      if (priority) filtered = filtered.filter((issue) => issue.priority === priority);

      const size = Math.min(Number(limit) || 20, 100);
      return {
        success: true,
        message:
          filtered.length === 0
            ? projectId
              ? "There are currently no open issues for this project."
              : "There are currently no open issues."
            : `${filtered.length} open issue${filtered.length === 1 ? "" : "s"}${projectId ? " for this project" : ""}.`,
        count: filtered.length,
        issues: filtered.slice(0, size).map(pickIssue),
      };
    },
  },
  {
    name: "getExpenseSummary",
    description:
      "Summarize expenses with optional filters: `projectId`/`searchProject`, `category`, and a `dateFrom`/`dateTo` range (YYYY-MM-DD or words like today, yesterday, this week, this month, last month). Returns total spent, expense count, current-month spend (when no range is given), and breakdowns by category and by project (top 8 each). Read-only. Use when the user asks how much was spent, which project or category costs the most, or what expenses were for a period.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("Id of the related project"),
        searchProject: s("Project name to search for (use when the project id is unknown)"),
        category: s("Filter by category (e.g. Hosting, Software, Marketing)"),
        dateFrom: s("Start date (YYYY-MM-DD) or a period word: today, this week, this month, last month"),
        dateTo: s("End date (YYYY-MM-DD)"),
      },
    },
    handler: async (args) => {
      const { projectId: projectIdArg, searchProject, category, dateFrom, dateTo } = args;
      const projectId = await resolveProjectScope({ projectId: projectIdArg, searchProject });
      const range = expandDateRange({ dateFrom, dateTo });

      const expenses = await listTransactions({
        type: "expense",
        projectId,
        category,
        dateFrom: range.from,
        dateTo: range.to,
      });

      const total = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);

      let currentMonth = null;
      if (!dateFrom && !dateTo) {
        const month = resolveDateRangeToken("this month");
        const monthExpenses = await listTransactions({
          type: "expense",
          projectId,
          category,
          dateFrom: month.from,
          dateTo: month.to,
        });
        currentMonth = monthExpenses.reduce((sum, t) => sum + (t.amount || 0), 0);
      }

      const byCategoryMap = {};
      for (const t of expenses) {
        const key = t.category || "Other";
        byCategoryMap[key] = (byCategoryMap[key] || 0) + (t.amount || 0);
      }
      const categoryBreakdown = Object.entries(byCategoryMap)
        .map(([categoryName, amount]) => ({ category: categoryName, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8);

      let byProject = [];
      if (!projectId) {
        const projectNames = new Map();
        try {
          const projects = await listProjects();
          for (const p of projects) projectNames.set(String(p._id), p.name);
        } catch (err) {
          // Name resolution is best-effort; the totals still stand.
        }
        const byProjectMap = {};
        for (const t of expenses) {
          const key = t.projectId ? String(t.projectId) : null;
          byProjectMap[key] = (byProjectMap[key] || 0) + (t.amount || 0);
        }
        byProject = Object.entries(byProjectMap)
          .map(([pid, amount]) => ({ project: pid ? projectNames.get(pid) || null : null, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 8);
      }

      return {
        success: true,
        message: `Total expenses${range.from || range.to ? " for the given period" : ""}: ${total.toFixed(2)} LKR across ${expenses.length} expense${expenses.length === 1 ? "" : "s"}.`,
        total,
        count: expenses.length,
        currentMonth,
        range: { from: range.from ? toPlain(range.from) : null, to: range.to ? toPlain(range.to) : null },
        byCategory: categoryBreakdown,
        byProject,
      };
    },
  },
  {
    name: "getRecentActivity",
    description:
      "List the most recent activity log entries (logins and create/update/delete actions), optionally filtered by `user` (the acting user's id), `action` (create, update, delete, login), or `targetType`. Returns a limited list of recent entries with timestamps. Read-only. Use when the user asks what has been happening recently or what the latest activity was.",
    parameters: {
      type: "OBJECT",
      properties: {
        limit: i("Maximum number of entries to return (default 10, max 50)"),
        user: s("Filter by the acting user's id"),
        action: e("Filter by action type", ["login", "create", "update", "delete"]),
        targetType: s("Filter by target type (e.g. project, task, issue, designReference, transaction)"),
      },
    },
    handler: async (args) => {
      const { limit, user, action, targetType } = args;
      const size = Math.min(Number(limit) || 10, 50);
      const activities = await listActivities({ limit: size, user, action, targetType });
      return {
        success: true,
        message: `${activities.length} recent activity entr${activities.length === 1 ? "y" : "ies"}.`,
        count: activities.length,
        activities: activities.map(pickActivity),
      };
    },
  },
  {
    name: "generateProjectPlan",
    description:
      "Project planning tool. Use when the user describes a project idea and asks to plan it, brainstorm it, estimate a price, estimate expenses, build a scope, or get a development timeline. Pass the extracted structure: the user's idea text, any pages they asked for, any features they asked for, the number of days available, a deadline date if given, and technologies if mentioned. The tool analyzes the scope, recommends pages/features with reasons, computes a deterministic price estimate from the NexCode pricing configuration, lists planned expenses, generates development tasks, and maps them onto the timeline (warning if the deadline is unrealistic). It does NOT create anything — no project, no tasks, no expenses. After presenting the plan, ask the user if they would like it created.",
    parameters: {
      type: "OBJECT",
      properties: {
        idea: s("The user's full project idea / requirements in their own words"),
        client: s("Client name if provided"),
        requestedPages: a("Pages the user explicitly requested (e.g. Homepage, About Us, Menu, Contact)", s("Page name")),
        requestedFeatures: a("Features the user explicitly requested (e.g. online ordering, reservation, gallery)", s("Feature name")),
        timelineDays: i("Number of days available to complete the project (from the user)"),
        deadline: s("Target completion date (YYYY-MM-DD) if provided"),
        technologies: a("Technologies/stack the user mentioned (e.g. React, WordPress)", s("Technology")),
        complexity: e("Overall complexity of the design/scope", ["low", "medium", "high"]),
      },
      required: ["idea"],
    },
    handler: async (args) => {
      const plan = buildProjectPlan(args);
      return {
        success: true,
        status: "plan_ready",
        message: `Prepared a plan for "${plan.name}". Estimated price ${formatLKR(plan.pricing.total)}${plan.timeline.providedDays ? ` over ${plan.timeline.providedDays} days` : ""}. Nothing has been created.`,
        plan,
        input: {
          idea: plan.description,
          client: plan.client || undefined,
          requestedPages: plan.scope.requestedPages.map((p) => p.name),
          requestedFeatures: plan.scope.requestedFeatures.map((f) => f.name),
          timelineDays: plan.timeline.providedDays || undefined,
          deadline: plan.deadline || undefined,
          technologies: plan.technologies,
          complexity: plan.complexity,
        },
      };
    },
  },
  {
    name: "createProjectFromPlan",
    description:
      "Create a project, its tasks, and its planned expenses from an approved project plan. Use ONLY after the user has explicitly confirmed the plan presented by generateProjectPlan (e.g. they said yes/create it/go ahead, or clicked Create Project). Pass the SAME arguments used for that generateProjectPlan call (idea, requestedPages, requestedFeatures, timelineDays, deadline, technologies, complexity). The plan is regenerated server-side from these arguments and then created using the standard project and task services. Planned expenses are stored separately from actual expenses — nothing is recorded as a paid expense. CONFIDENTIAL: never call this without an explicit user confirmation, and never in the same message the plan was requested.",
    parameters: {
      type: "OBJECT",
      properties: {
        idea: s("The approved project idea / requirements"),
        client: s("Client name if provided"),
        requestedPages: a("Approved pages", s("Page name")),
        requestedFeatures: a("Approved features", s("Feature name")),
        timelineDays: i("Approved number of days"),
        deadline: s("Target completion date (YYYY-MM-DD) if provided"),
        technologies: a("Technologies", s("Technology")),
        complexity: e("Overall complexity", ["low", "medium", "high"]),
        confirmed: {
          type: "BOOLEAN",
          description:
            "Set to true ONLY after the user has explicitly confirmed creation. The first call without `confirmed` only requests confirmation and creates nothing; call again with `confirmed: true` (same arguments) in a later message once the user agrees. Set false if the user declines.",
        },
      },
      required: ["idea"],
    },
    handler: async (args, context) => {
      const { confirmed, ...planInput } = args;
      const fingerprint = planFingerprint(planInput);

      if (confirmed === true) {
        const pending = await getConfirmation({ user: context?.user, tool: "createProjectFromPlan", fingerprint });
        if (pending) {
          const check = await resolveConfirmation({
            user: context?.user,
            tool: "createProjectFromPlan",
            fingerprint,
            requestId: context?.requestId,
          });
          if (!check.ok) {
            throw exposedError(
              check.reason === "same_turn"
                ? "The plan was only prepared in the current message — it cannot be confirmed in the same message. Ask the user to confirm, then call this tool again with `confirmed: true` in the next message."
                : "This plan confirmation has expired. Nothing was created — please prepare the plan again."
            );
          }
        }
        const created = await createProjectFromPlan(planInput, context?.user);
        return {
          success: true,
          status: "created",
          message: `Created the "${created.projectName}" project with ${created.taskCount} tasks and ${created.plannedExpenseCount} planned expenses.`,
          created,
        };
      }

      if (confirmed === false) {
        await cancelConfirmation({ user: context?.user, tool: "createProjectFromPlan", fingerprint });
        return {
          success: true,
          status: "cancelled",
          message: "Project creation was cancelled. Nothing was created.",
        };
      }

      const existing = await getConfirmation({ user: context?.user, tool: "createProjectFromPlan", fingerprint });
      if (!existing) {
        await createConfirmation({
          user: context?.user,
          tool: "createProjectFromPlan",
          fingerprint,
          requestId: context?.requestId,
          targetLabel: planInput.idea ? String(planInput.idea).slice(0, 80) : "project plan",
        });
      }
      return {
        success: true,
        status: "confirmation_required",
        message:
          "I've prepared this project plan. Would you like me to create the project, its tasks, and the planned expenses? Reply to confirm.",
      };
    },
    dedupe: true,
  },
];

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function planFingerprint(input) {
  const clean = {};
  for (const key of ["idea", "client", "deadline", "complexity"]) {
    const value = String(input?.[key] || "").trim().toLowerCase();
    if (value) clean[key] = value;
  }
  for (const key of ["timelineDays"]) {
    if (Number.isFinite(Number(input?.[key])) && Number(input[key]) > 0) clean[key] = Math.round(Number(input[key]));
  }
  for (const key of ["requestedPages", "requestedFeatures", "technologies"]) {
    if (Array.isArray(input?.[key])) {
      const arr = input[key].map((v) => String(v).trim().toLowerCase()).filter(Boolean).sort();
      if (arr.length) clean[key] = arr;
    }
  }
  return stableStringify(clean);
}

const REGISTRY = new Map(TOOLS.map((tool) => [tool.name, tool]));

const TOOL_CATEGORY_MAP = {
  getAIHealthStatus: TOOL_CATEGORIES.READ_ONLY,
  getProject: TOOL_CATEGORIES.READ_ONLY,
  getTask: TOOL_CATEGORIES.READ_ONLY,
  getIssue: TOOL_CATEGORIES.READ_ONLY,
  getDesignReferences: TOOL_CATEGORIES.READ_ONLY,
  getExpense: TOOL_CATEGORIES.READ_ONLY,
  getExpenses: TOOL_CATEGORIES.READ_ONLY,
  getDashboardStats: TOOL_CATEGORIES.READ_ONLY,
  getProjectSummary: TOOL_CATEGORIES.READ_ONLY,
  getPendingTasks: TOOL_CATEGORIES.READ_ONLY,
  getOpenIssues: TOOL_CATEGORIES.READ_ONLY,
  getExpenseSummary: TOOL_CATEGORIES.READ_ONLY,
  getRecentActivity: TOOL_CATEGORIES.READ_ONLY,

  createProject: TOOL_CATEGORIES.WRITE,
  updateProject: TOOL_CATEGORIES.WRITE,
  createTask: TOOL_CATEGORIES.WRITE,
  updateTask: TOOL_CATEGORIES.WRITE,
  completeTask: TOOL_CATEGORIES.WRITE,
  createIssue: TOOL_CATEGORIES.WRITE,
  updateIssue: TOOL_CATEGORIES.WRITE,
  resolveIssue: TOOL_CATEGORIES.WRITE,
  addDesignReference: TOOL_CATEGORIES.WRITE,
  updateDesignReference: TOOL_CATEGORIES.WRITE,
  createExpense: TOOL_CATEGORIES.WRITE,
  updateExpense: TOOL_CATEGORIES.WRITE,
  createProjectFromPlan: TOOL_CATEGORIES.WRITE,

  generateProjectPlan: TOOL_CATEGORIES.READ_ONLY,

  deleteProject: TOOL_CATEGORIES.DESTRUCTIVE,
  deleteTask: TOOL_CATEGORIES.DESTRUCTIVE,
  deleteIssue: TOOL_CATEGORIES.DESTRUCTIVE,
  deleteDesignReference: TOOL_CATEGORIES.DESTRUCTIVE,
  deleteExpense: TOOL_CATEGORIES.DESTRUCTIVE,
};

for (const tool of TOOLS) {
  tool.category = TOOL_CATEGORY_MAP[tool.name] || TOOL_CATEGORIES.WRITE;
}

export function getToolDefinitions() {
  return TOOLS.map(({ name, description, parameters }) => ({ name, description, parameters }));
}

export function getTool(name) {
  return REGISTRY.get(name) || null;
}

export function getToolNames() {
  return TOOLS.map((tool) => tool.name);
}

export function getToolCategories() {
  return TOOLS.map((tool) => ({ name: tool.name, category: tool.category }));
}
