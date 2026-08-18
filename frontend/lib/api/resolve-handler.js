/**
 * Maps /api/* paths to existing Vercel serverless handlers (api/...).
 * Keeps one Next.js route file → one serverless function on Vercel Hobby.
 */

const handlers = {
  "auth/login": () => import("../../api/auth/login.js"),
  "auth/verify": () => import("../../api/auth/verify.js"),
  "ai/conversations": () => import("../../api/ai/conversations.js"),
  "ai/conversations/:id": () => import("../../api/ai/conversations/[id].js"),
  "ai/conversations/:id/clear": () => import("../../api/ai/conversations/[id]/clear.js"),
  "ai/conversations/:id/messages": () => import("../../api/ai/conversations/[id]/messages.js"),
  reports: () => import("../../api/reports.js"),
  "reports/ai": () => import("../../api/reports/ai.js"),
  "reports/:id": () => import("../../api/reports/[id].js"),
  "reports/:id/file": () => import("../../api/reports/[id]/file.js"),
  "reports/:id/generate": () => import("../../api/reports/[id]/generate.js"),
  users: () => import("../../api/users/index.js"),
  "users/:id": () => import("../../api/users/[id].js"),
  "users/:id/password": () => import("../../api/users/[id]/password.js"),
  activities: () => import("../../api/activities.js"),
  assistant: () => import("../../api/assistant.js"),
  stats: () => import("../../api/stats.js"),
  finance: () => import("../../api/finance.js"),
  "finance/:id": () => import("../../api/finance/[id].js"),
  issues: () => import("../../api/issues.js"),
  "issues/:id": () => import("../../api/issues/[id].js"),
  tasks: () => import("../../api/tasks.js"),
  "tasks/:id": () => import("../../api/tasks/[id].js"),
  projects: () => import("../../api/projects.js"),
  "projects/:id": () => import("../../api/projects/[id].js"),
  kanban: () => import("../../api/kanban.js"),
  designsections: () => import("../../api/designsections.js"),
  "designsections/:id": () => import("../../api/designsections/[id].js"),
  designreferences: () => import("../../api/designreferences.js"),
  "designreferences/:id": () => import("../../api/designreferences/[id].js"),
  designnotes: () => import("../../api/designnotes.js"),
  "designnotes/:id": () => import("../../api/designnotes/[id].js"),
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
