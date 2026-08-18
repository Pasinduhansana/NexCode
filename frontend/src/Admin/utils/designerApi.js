import adminApi from "./adminApi";

export const DESIGN_REFERENCE_TYPES = ["website", "image", "file", "other"];

export async function listProjects() {
  const { data } = await adminApi.get("/projects");
  return Array.isArray(data) ? data : [];
}

export async function listDesignSections(projectId) {
  const { data } = await adminApi.get("/designsections", { params: { projectId } });
  return Array.isArray(data) ? data : [];
}

export async function createDesignSection(payload) {
  const { data } = await adminApi.post("/designsections", payload);
  return data;
}

export async function updateDesignSection(id, payload) {
  const { data } = await adminApi.put(`/designsections/${id}`, payload);
  return data;
}

export async function deleteDesignSection(id) {
  const { data } = await adminApi.delete(`/designsections/${id}`);
  return data;
}

export async function listDesignReferences(projectId, { sectionId, type } = {}) {
  const { data } = await adminApi.get("/designreferences", {
    params: { projectId, sectionId, type: type && type !== "all" ? type : undefined },
  });
  return Array.isArray(data) ? data : [];
}

export async function createDesignReference(payload) {
  const { data } = await adminApi.post("/designreferences", payload);
  return data;
}

export async function updateDesignReference(id, payload) {
  const { data } = await adminApi.put(`/designreferences/${id}`, payload);
  return data;
}

export async function reorderDesignReference(id, direction) {
  const { data } = await adminApi.put(`/designreferences/${id}`, { reorder: true, direction });
  return data;
}

export async function deleteDesignReference(id) {
  const { data } = await adminApi.delete(`/designreferences/${id}`);
  return data;
}

export async function listDesignNotes(projectId, { parentType, parentId } = {}) {
  const { data } = await adminApi.get("/designnotes", {
    params: { projectId, parentType, parentId },
  });
  return Array.isArray(data) ? data : [];
}

export async function createDesignNote(payload) {
  const { data } = await adminApi.post("/designnotes", payload);
  return data;
}

export async function updateDesignNote(id, payload) {
  const { data } = await adminApi.put(`/designnotes/${id}`, payload);
  return data;
}

export async function deleteDesignNote(id) {
  const { data } = await adminApi.delete(`/designnotes/${id}`);
  return data;
}

export function domainFromUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return value || "";
  }
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}