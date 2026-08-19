/**
 * Maps /api/* paths to existing Vercel serverless handlers (api/...).
 * Keeps one Next.js route file → one serverless function on Vercel Hobby.
 */

const handlers = {
  "auth/login": () => import("../api-handlers/auth/login.js"),
  "auth/verify": () => import("../api-handlers/auth/verify.js"),
  "ai/conversations": () => import("../api-handlers/ai/conversations.js"),
  "ai/conversations/:id": () => import("../api-handlers/ai/conversations/[id].js"),
  "ai/conversations/:id/clear": () => import("../api-handlers/ai/conversations/[id]/clear.js"),
  "ai/conversations/:id/messages": () => import("../api-handlers/ai/conversations/[id]/messages.js"),
  reports: () => import("../api-handlers/reports.js"),
  "reports/ai": () => import("../api-handlers/reports/ai.js"),
  "reports/:id": () => import("../api-handlers/reports/[id].js"),
  "reports/:id/file": () => import("../api-handlers/reports/[id]/file.js"),
  "reports/:id/generate": () => import("../api-handlers/reports/[id]/generate.js"),
  users: () => import("../api-handlers/users/index.js"),
  "users/:id": () => import("../api-handlers/users/[id].js"),
  "users/:id/password": () => import("../api-handlers/users/[id]/password.js"),
  activities: () => import("../api-handlers/activities.js"),
  assistant: () => import("../api-handlers/assistant.js"),
  stats: () => import("../api-handlers/stats.js"),
  health: () => import("../api-handlers/health.js"),
  document: () => import("../api-handlers/document.js"),
  finance: () => import("../api-handlers/finance.js"),
  "finance/:id": () => import("../api-handlers/finance/[id].js"),
  issues: () => import("../api-handlers/issues.js"),
  "issues/:id": () => import("../api-handlers/issues/[id].js"),
  tasks: () => import("../api-handlers/tasks.js"),
  "tasks/:id": () => import("../api-handlers/tasks/[id].js"),
  projects: () => import("../api-handlers/projects.js"),
  "projects/:id": () => import("../api-handlers/projects/[id].js"),
  kanban: () => import("../api-handlers/kanban.js"),
  designsections: () => import("../api-handlers/designsections.js"),
  "designsections/:id": () => import("../api-handlers/designsections/[id].js"),
  designreferences: () => import("../api-handlers/designreferences.js"),
  "designreferences/:id": () => import("../api-handlers/designreferences/[id].js"),
  designnotes: () => import("../api-handlers/designnotes.js"),
  "designnotes/:id": () => import("../api-handlers/designnotes/[id].js"),
  calendar: () => import("../api-handlers/calendar.js"),
  "calendar/:id": () => import("../api-handlers/calendar/[id].js"),
  "calendar/reminders": () => import("../api-handlers/calendar/reminders.js"),
  "calendar/reminders/process": () => import("../api-handlers/calendar/reminders/process.js"),
};

const handlerKeys = Object.keys(handlers);

export async function resolveApiHandler(pathSegments) {
  const parts = pathSegments ?? [];
  const joined = parts.join("/");

  const exactKey = handlerKeys.find((key) => key === joined);
  if (exactKey) {
    return (await handlers[exactKey]()).default;
  }

  const paramKey = handlerKeys
    .filter((key) => key.includes(":"))
    .sort((a, b) => b.split("/").length - a.split("/").length)
    .find((key) => {
      const segs = key.split("/");
      if (segs.length !== parts.length) return false;
      return segs.every((s, i) => s === ":id" || s === parts[i]);
    });

  if (paramKey) {
    return (await handlers[paramKey]()).default;
  }

  return null;
}

/** Dynamic path segments → req.query (e.g. id) for legacy handlers */
export function pathParamsFromSegments(parts) {
  const extra = {};
  if (!parts?.length) return extra;

  if (parts[0] === "auth" || parts[0] === "assistant") return extra;

  if (parts[0] === "ai" && parts[1] === "conversations" && parts.length >= 3) {
    extra.id = parts[2];
    return extra;
  }

  if (parts[0] === "reports") {
    if (parts.length >= 2 && parts[1] !== "ai") extra.id = parts[1];
    return extra;
  }

  if (parts[0] === "calendar") {
    // "calendar/reminders" and "calendar/reminders/process" are not id routes.
    if (parts.length === 2 && parts[1] !== "reminders") extra.id = parts[1];
    return extra;
  }

  if (parts[0] === "users" && parts.length >= 2) {
    extra.id = parts[1];
    return extra;
  }

  const withId = [
    "finance",
    "issues",
    "tasks",
    "projects",
    "designsections",
    "designreferences",
    "designnotes",
  ];
  if (withId.includes(parts[0]) && parts.length === 2) {
    extra.id = parts[1];
  }

  return extra;
}
