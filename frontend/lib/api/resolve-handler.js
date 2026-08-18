/**
 * Maps /api/* paths to existing Vercel serverless handlers (api/**/*.js).
 * Keeps one Next.js route file → one serverless function on Vercel Hobby.
 */

export async function resolveApiHandler(pathSegments) {
  const parts = pathSegments ?? [];
  const joined = parts.join("/");

  if (parts[0] === "auth" && parts[1] === "login") {
    return (await import("../../api/auth/login.js")).default;
  }
  if (parts[0] === "auth" && parts[1] === "verify") {
    return (await import("../../api/auth/verify.js")).default;
  }

  if (parts[0] === "ai" && parts[1] === "conversations") {
    if (parts.length === 2) {
      return (await import("../../api/ai/conversations.js")).default;
    }
    const id = parts[2];
    if (parts[3] === "clear") {
      return (await import("../../api/ai/conversations/[id]/clear.js")).default;
    }
    if (parts[3] === "messages") {
      return (await import("../../api/ai/conversations/[id]/messages.js")).default;
    }
    if (parts.length === 3) {
      return (await import("../../api/ai/conversations/[id].js")).default;
    }
  }

  if (parts[0] === "reports") {
    if (parts.length === 1) {
      return (await import("../../api/reports.js")).default;
    }
    if (parts[1] === "ai") {
      return (await import("../../api/reports/ai.js")).default;
    }
    const id = parts[1];
    if (parts[2] === "file") {
      return (await import("../../api/reports/[id]/file.js")).default;
    }
    if (parts[2] === "generate") {
      return (await import("../../api/reports/[id]/generate.js")).default;
    }
    if (parts.length === 2) {
      return (await import("../../api/reports/[id].js")).default;
    }
  }

  if (parts[0] === "users") {
    if (parts.length === 1) {
      return (await import("../../api/users/index.js")).default;
    }
    const id = parts[1];
    if (parts[2] === "password") {
      return (await import("../../api/users/[id]/password.js")).default;
    }
    if (parts.length === 2) {
      return (await import("../../api/users/[id].js")).default;
    }
  }

  const singleSegmentHandlers = {
    activities: "../../api/activities.js",
    assistant: "../../api/assistant.js",
    stats: "../../api/stats.js",
    finance: "../../api/finance.js",
    issues: "../../api/issues.js",
    tasks: "../../api/tasks.js",
    projects: "../../api/projects.js",
    kanban: "../../api/kanban.js",
    designsections: "../../api/designsections.js",
    designreferences: "../../api/designreferences.js",
    designnotes: "../../api/designnotes.js",
  };

  if (parts.length === 1 && singleSegmentHandlers[parts[0]]) {
    return (await import(singleSegmentHandlers[parts[0]])).default;
  }

  const idHandlers = {
    finance: "../../api/finance/[id].js",
    issues: "../../api/issues/[id].js",
    tasks: "../../api/tasks/[id].js",
    projects: "../../api/projects/[id].js",
    designsections: "../../api/designsections/[id].js",
    designreferences: "../../api/designreferences/[id].js",
    designnotes: "../../api/designnotes/[id].js",
  };

  if (parts.length === 2 && idHandlers[parts[0]]) {
    return (await import(idHandlers[parts[0]])).default;
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
