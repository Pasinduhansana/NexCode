const PROJECT_STATUSES = ["planning", "in_progress", "on_hold", "completed", "cancelled"];
const TASK_STATUSES = ["todo", "in_progress", "review", "done"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const PAYMENT_STATUSES = ["unpaid", "partial", "paid"];

const s = (description, extra = {}) => ({ type: "STRING", description, ...extra });
const i = (description) => ({ type: "INTEGER", description });
const n = (description) => ({ type: "NUMBER", description });
const b = (description) => ({ type: "BOOLEAN", description });
const e = (description, values) => ({ type: "STRING", description, enum: values });
const a = (description, items) => ({ type: "ARRAY", description, items });

const ID_FIELD = { id: s("Record id") };
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
  paidStatus: e("Payment status", PAYMENT_STATUSES),
  features: a("Feature list", s("Feature")),
  notes: s("Internal notes"),
  tags: a("Tags", s("Tag")),
  color: s("Project color hex, e.g. #3699f3"),
};
const TASK_FIELDS = {
  projectId: s("Id of the parent project"),
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
const ISSUE_FIELDS = {
  projectId: s("Id of the parent project"),
  title: s("Issue title"),
  description: s("Issue description"),
  severity: e("Issue severity", ["low", "medium", "high", "critical"]),
  status: e("Issue status", ["open", "in_progress", "resolved", "closed"]),
  priority: e("Issue priority", PRIORITIES),
  assignee: s("Assignee name"),
  dueDate: s("Due date (YYYY-MM-DD)"),
};
const EXPENSE_FIELDS = {
  amount: n("Expense amount"),
  category: s("Expense category"),
  description: s("Expense description"),
  date: s("Date (YYYY-MM-DD)"),
  projectId: s("Id of the related project"),
  paidBy: s("Name of the person who paid"),
  paymentStatus: e("Payment status", PAYMENT_STATUSES),
};

const notImplemented = (toolName) => () => ({
  status: "not_implemented",
  tool: toolName,
  message:
    "Phase 3 tool-calling infrastructure only — this action is not connected to live data yet. No data was read or changed.",
});

const TOOLS = [
  {
    name: "getAIHealthStatus",
    description:
      "Diagnostic test tool. Returns the health status of the AI tool-calling layer. Use when the user asks to check the assistant's health, run a test, verify the tool system, or self-check.",
    parameters: { type: "OBJECT", properties: {} },
    handler: () => ({
      status: "ok",
      service: "ai-tool-layer",
      version: "phase-3",
      time: new Date().toISOString(),
      message: "The AI tool layer is healthy. No data was read or modified.",
    }),
  },
  {
    name: "createProject",
    description: "Create a new project in the NexCode agency. Currently a Phase 3 stub — reports not implemented.",
    parameters: { type: "OBJECT", properties: PROJECT_FIELDS, required: ["name"] },
    handler: notImplemented("createProject"),
  },
  {
    name: "updateProject",
    description: "Update an existing project by id. Currently a Phase 3 stub — reports not implemented.",
    parameters: { type: "OBJECT", properties: { ...ID_FIELD, ...PROJECT_FIELDS }, required: ["id"] },
    handler: notImplemented("updateProject"),
  },
  {
    name: "createTask",
    description: "Create a new task under a project. Currently a Phase 3 stub — reports not implemented.",
    parameters: { type: "OBJECT", properties: TASK_FIELDS, required: ["projectId", "title"] },
    handler: notImplemented("createTask"),
  },
  {
    name: "updateTask",
    description: "Update an existing task by id. Currently a Phase 3 stub — reports not implemented.",
    parameters: { type: "OBJECT", properties: { ...ID_FIELD, ...TASK_FIELDS }, required: ["id"] },
    handler: notImplemented("updateTask"),
  },
  {
    name: "createIssue",
    description: "Create a new issue under a project. Currently a Phase 3 stub — reports not implemented.",
    parameters: { type: "OBJECT", properties: ISSUE_FIELDS, required: ["projectId", "title"] },
    handler: notImplemented("createIssue"),
  },
  {
    name: "updateIssue",
    description: "Update an existing issue by id. Currently a Phase 3 stub — reports not implemented.",
    parameters: { type: "OBJECT", properties: { ...ID_FIELD, ...ISSUE_FIELDS }, required: ["id"] },
    handler: notImplemented("updateIssue"),
  },
  {
    name: "addDesignReference",
    description: "Add a design reference (e.g. a link or file description) to a project. Currently a Phase 3 stub — reports not implemented.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("Id of the parent project"),
        title: s("Reference title"),
        url: s("Reference URL"),
        type: e("Reference type", ["website", "image", "file", "other"]),
        description: s("Short description"),
      },
      required: ["projectId", "title"],
    },
    handler: notImplemented("addDesignReference"),
  },
  {
    name: "createExpense",
    description: "Create a new expense record. Currently a Phase 3 stub — reports not implemented.",
    parameters: { type: "OBJECT", properties: EXPENSE_FIELDS, required: ["amount"] },
    handler: notImplemented("createExpense"),
  },
  {
    name: "updateExpense",
    description: "Update an existing expense by id. Currently a Phase 3 stub — reports not implemented.",
    parameters: { type: "OBJECT", properties: { ...ID_FIELD, ...EXPENSE_FIELDS }, required: ["id"] },
    handler: notImplemented("updateExpense"),
  },
  {
    name: "getProject",
    description: "Fetch a single project by id. Currently a Phase 3 stub — reports not implemented.",
    parameters: { type: "OBJECT", properties: ID_FIELD, required: ["id"] },
    handler: notImplemented("getProject"),
  },
  {
    name: "getTasks",
    description: "List tasks with optional filters. Currently a Phase 3 stub — reports not implemented.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("Filter by project id"),
        status: e("Filter by task status", TASK_STATUSES),
        assignee: s("Filter by assignee name"),
        limit: i("Max number of results"),
      },
    },
    handler: notImplemented("getTasks"),
  },
  {
    name: "getExpenses",
    description: "List expenses with optional filters. Currently a Phase 3 stub — reports not implemented.",
    parameters: {
      type: "OBJECT",
      properties: {
        projectId: s("Filter by project id"),
        category: s("Filter by category"),
        dateFrom: s("Start date (YYYY-MM-DD)"),
        dateTo: s("End date (YYYY-MM-DD)"),
        limit: i("Max number of results"),
      },
    },
    handler: notImplemented("getExpenses"),
  },
  {
    name: "getDashboardStats",
    description: "Fetch dashboard statistics. Currently a Phase 3 stub — reports not implemented.",
    parameters: { type: "OBJECT", properties: {} },
    handler: notImplemented("getDashboardStats"),
  },
];

const REGISTRY = new Map(TOOLS.map((tool) => [tool.name, tool]));

export function getToolDefinitions() {
  return TOOLS.map(({ name, description, parameters }) => ({ name, description, parameters }));
}

export function getTool(name) {
  return REGISTRY.get(name) || null;
}

export function getToolNames() {
  return TOOLS.map((tool) => tool.name);
}
