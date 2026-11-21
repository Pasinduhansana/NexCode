import { ObjectId } from "mongodb";
import { getCollection, unwrap } from "./mongodb.js";
import { logActivity } from "./activity.js";
import { getDesignSectionById, findDesignSection, DesignSectionServiceError } from "./designsections.js";

export const DESIGN_REFERENCE_TYPES = ["website", "image", "file", "other"];

const MAX_TITLE_LENGTH = 200;
const MAX_TAGS = 30;
const MAX_TAG_LENGTH = 60;

export class DesignReferenceServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "DesignReferenceServiceError";
    this.status = status;
    this.expose = true;
  }
}

function asTrimmed(value) {
  return value ? String(value).trim() : "";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toProjectIdString(id) {
  if (id === undefined || id === null) return "";
  if (id instanceof ObjectId) return id.toHexString();
  return String(id);
}

function normalizeUrl(value) {
  const url = asTrimmed(value);
  if (!url) return "";
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (!parsed.hostname) return null;
  return url;
}

function toSectionIdString(id) {
  if (id === undefined || id === null) return null;
  if (id instanceof ObjectId) return id.toHexString();
  const str = String(id).trim();
  return str ? str : null;
}

function normalizeTags(value) {
  if (!Array.isArray(value)) return undefined;
  const seen = new Set();
  const tags = [];
  for (const t of value) {
    const tag = String(t).trim();
    if (!tag || tag.length > MAX_TAG_LENGTH || seen.has(tag.toLowerCase())) continue;
    seen.add(tag.toLowerCase());
    tags.push(tag);
    if (tags.length >= MAX_TAGS) break;
  }
  return tags;
}

async function requireDesignSectionOfProject(sectionId, projectId) {
  if (sectionId === null || sectionId === undefined || String(sectionId).trim() === "") return;
  try {
    const section = await getDesignSectionById(sectionId);
    if (toProjectIdString(section.projectId) !== toProjectIdString(projectId)) {
      throw new DesignReferenceServiceError(
        "The design section does not belong to this project.",
        400
      );
    }
  } catch (err) {
    if (err instanceof DesignSectionServiceError) {
      throw new DesignReferenceServiceError("The design section does not exist.", 404);
    }
    throw err;
  }
}

export async function createDesignReference(input = {}, user) {
  const projectId = toProjectIdString(input.projectId);
  const title = asTrimmed(input.title);
  const url = normalizeUrl(input.url);
  const sectionId = toSectionIdString(input.sectionId);
  const tags = normalizeTags(input.tags);

  if (!projectId) {
    throw new DesignReferenceServiceError("projectId is required", 400);
  }
  if (!title) {
    throw new DesignReferenceServiceError("Design reference title is required", 400);
  }
  if (title.length > MAX_TITLE_LENGTH) {
    throw new DesignReferenceServiceError(`Design reference title must be at most ${MAX_TITLE_LENGTH} characters`, 400);
  }
  if (url === null) {
    throw new DesignReferenceServiceError("Invalid URL. Please provide a valid http(s) link.", 400);
  }
  if (!url) {
    throw new DesignReferenceServiceError("A reference URL is required", 400);
  }

  await requireDesignSectionOfProject(sectionId, projectId);

  const now = new Date();
  const reference = {
    projectId,
    title,
    url,
    type: input.type || "website",
    notes: asTrimmed(input.notes),
    sectionId,
    tags: tags || [],
    createdAt: now,
    updatedAt: now,
  };

  try {
    const refs = await getCollection("designreferences");
    if (input.order === undefined || input.order === null || !Number.isFinite(Number(input.order))) {
      const last = await refs.find({ projectId }).sort({ order: -1 }).limit(1).next();
      reference.order = (last?.order ?? -1) + 1;
    } else {
      reference.order = Number(input.order);
    }

    const { insertedId } = await refs.insertOne(reference);

    await logActivity(user, {
      action: "create",
      targetType: "designReference",
      target: reference.title,
      details: { projectId, type: reference.type, sectionId },
    }).catch(() => {});

    return { ...reference, _id: insertedId };
  } catch (err) {
    if (err instanceof DesignReferenceServiceError) throw err;
    throw new DesignReferenceServiceError("Could not create the design reference. Please try again.", 500);
  }
}

export async function getDesignReferenceById(id) {
  if (!ObjectId.isValid(id)) {
    throw new DesignReferenceServiceError("Invalid design reference id", 400);
  }

  try {
    const reference = await (await getCollection("designreferences")).findOne({ _id: new ObjectId(id) });
    if (!reference) {
      throw new DesignReferenceServiceError("Design reference not found", 404);
    }
    return reference;
  } catch (err) {
    if (err instanceof DesignReferenceServiceError) throw err;
    throw new DesignReferenceServiceError("Could not load the design reference. Please try again.", 500);
  }
}

export async function listDesignReferencesByProject(projectId, type, sectionId) {
  const filter = projectId ? { projectId: toProjectIdString(projectId) } : {};
  if (type) filter.type = type;
  if (sectionId !== undefined && sectionId !== null && String(sectionId).trim() !== "") {
    filter.sectionId = toSectionIdString(sectionId);
  }

  try {
    return await (await getCollection("designreferences"))
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .toArray();
  } catch (err) {
    if (err instanceof DesignReferenceServiceError) throw err;
    throw new DesignReferenceServiceError("Could not load the design references. Please try again.", 500);
  }
}

export async function listDesignReferencesBySection(sectionId) {
  const sid = toSectionIdString(sectionId);
  if (!sid) {
    throw new DesignReferenceServiceError("sectionId is required", 400);
  }
  try {
    return await (await getCollection("designreferences"))
      .find({ sectionId: sid })
      .sort({ order: 1, createdAt: 1 })
      .toArray();
  } catch (err) {
    if (err instanceof DesignReferenceServiceError) throw err;
    throw new DesignReferenceServiceError("Could not load the design references. Please try again.", 500);
  }
}

export async function findDesignReference({ id, searchTitle, projectId, type, sectionId, searchSection }) {
  if (id !== undefined && id !== null && String(id).trim() !== "") {
    return { kind: "single", designReference: await getDesignReferenceById(String(id).trim()) };
  }

  let sectionScope = null;
  if (sectionId !== undefined && sectionId !== null && String(sectionId).trim() !== "") {
    sectionScope = toSectionIdString(sectionId);
  } else if (searchSection !== undefined && searchSection !== null && String(searchSection).trim() !== "") {
    const scope = projectId ? { projectId: toProjectIdString(projectId) } : {};
    try {
      const found = await findDesignSection({ searchName: String(searchSection).trim(), ...scope });
      if (found.kind === "single") sectionScope = toSectionIdString(found.designSection._id);
    } catch {
      // Unknown section — treat as no matches below.
    }
  }

  const scope = {
    ...(projectId ? { projectId: toProjectIdString(projectId) } : {}),
    ...(sectionScope !== null ? { sectionId: sectionScope } : {}),
  };
  const title = asTrimmed(searchTitle);

  if (!title && !scope.projectId && !scope.sectionId) {
    throw new DesignReferenceServiceError("Please provide a design reference id, a title, a project, or a section", 400);
  }

  if (!title && (scope.projectId || scope.sectionId)) {
    return { kind: "list", designReferences: await listDesignReferencesByProject(scope.projectId, type, scope.sectionId) };
  }

  try {
    const refs = await getCollection("designreferences");
    const pattern = escapeRegex(title);
    const titleFilter = { title: { $regex: new RegExp(`^${pattern}$`, "i") } };

    const exact = await refs.findOne({ ...titleFilter, ...scope });
    if (exact) return { kind: "single", designReference: exact };

    const matches = await refs
      .find({ title: { $regex: new RegExp(pattern, "i") }, ...scope })
      .sort({ order: 1, createdAt: 1 })
      .limit(5)
      .toArray();

    if (matches.length === 0) {
      throw new DesignReferenceServiceError(`Design reference "${title}" not found`, 404);
    }
    if (matches.length > 1) {
      const names = matches.map((r) => `"${r.title}"`).join(", ");
      throw new DesignReferenceServiceError(
        `Multiple design references match "${title}". Please specify one: ${names}.`,
        400
      );
    }
    return { kind: "single", designReference: matches[0] };
  } catch (err) {
    if (err instanceof DesignReferenceServiceError) throw err;
    throw new DesignReferenceServiceError("Could not find the design reference. Please try again.", 500);
  }
}

export async function updateDesignReference(id, input = {}, user) {
  if (!ObjectId.isValid(id)) {
    throw new DesignReferenceServiceError("Invalid design reference id", 400);
  }

  const patch = { updatedAt: new Date() };
  let sectionChange = null;

  if (input.title !== undefined) {
    if (!String(input.title).trim()) {
      throw new DesignReferenceServiceError("Design reference title cannot be empty", 400);
    }
    patch.title = String(input.title).trim();
  }
  if (input.url !== undefined) {
    const url = normalizeUrl(input.url);
    if (url === null) {
      throw new DesignReferenceServiceError("Invalid URL. Please provide a valid http(s) link.", 400);
    }
    if (!url) {
      throw new DesignReferenceServiceError("A reference URL is required", 400);
    }
    patch.url = url;
  }
  if (input.type !== undefined) patch.type = input.type;
  if (input.notes !== undefined) patch.notes = input.notes ? String(input.notes).trim() : "";
  if (input.sectionId !== undefined) {
    const sectionId = toSectionIdString(input.sectionId);
    patch.sectionId = sectionId;
    sectionChange = sectionId;
  }
  if (input.order !== undefined && input.order !== null && Number.isFinite(Number(input.order))) {
    patch.order = Number(input.order);
  }
  if (input.tags !== undefined) {
    const tags = normalizeTags(input.tags);
    if (tags === undefined) {
      throw new DesignReferenceServiceError("Tags must be an array of strings", 400);
    }
    patch.tags = tags;
  }

  try {
    const refs = await getCollection("designreferences");
    const existing = await refs.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      throw new DesignReferenceServiceError("Design reference not found", 404);
    }

    if (sectionChange !== null) {
      await requireDesignSectionOfProject(sectionChange, existing.projectId);
    }

    if (input.addTags !== undefined) {
      const addTags = normalizeTags(input.addTags);
      if (addTags === undefined) {
        throw new DesignReferenceServiceError("Tags must be an array of strings", 400);
      }
      const current = Array.isArray(existing.tags) ? existing.tags : [];
      const seen = new Set(current.map((t) => String(t).toLowerCase()));
      const merged = [...current];
      for (const tag of addTags) {
        if (!seen.has(tag.toLowerCase())) {
          seen.add(tag.toLowerCase());
          merged.push(tag);
        }
      }
      patch.tags = merged.slice(0, MAX_TAGS);
    }

    const result = await refs.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const reference = unwrap(result);
    if (!reference) {
      throw new DesignReferenceServiceError("Design reference not found", 404);
    }

    await logActivity(user, {
      action: "update",
      targetType: "designReference",
      target: reference.title || id,
      details: { type: patch.type || reference.type, sectionId: patch.sectionId || reference.sectionId || null },
    }).catch(() => {});

    return reference;
  } catch (err) {
    if (err instanceof DesignReferenceServiceError) throw err;
    throw new DesignReferenceServiceError("Could not update the design reference. Please try again.", 500);
  }
}

export async function deleteDesignReference(id, user) {
  if (!ObjectId.isValid(id)) {
    throw new DesignReferenceServiceError("Invalid design reference id", 400);
  }

  try {
    const refs = await getCollection("designreferences");
    const result = await refs.findOneAndDelete({ _id: new ObjectId(id) });
    const reference = unwrap(result);

    if (!reference) {
      throw new DesignReferenceServiceError("Design reference not found", 404);
    }

    await logActivity(user, {
      action: "delete",
      targetType: "designReference",
      target: reference.title || id,
      details: {},
    }).catch(() => {});

    return { deleted: true, id, title: reference.title };
  } catch (err) {
    if (err instanceof DesignReferenceServiceError) throw err;
    throw new DesignReferenceServiceError("Could not delete the design reference. Please try again.", 500);
  }
}

export async function reorderDesignReference(id, direction, user) {
  if (!ObjectId.isValid(id)) {
    throw new DesignReferenceServiceError("Invalid design reference id", 400);
  }
  const dir = direction === "up" ? "up" : direction === "down" ? "down" : null;
  if (!dir) {
    throw new DesignReferenceServiceError("Direction must be \"up\" or \"down\"", 400);
  }

  try {
    const refs = await getCollection("designreferences");
    const reference = await refs.findOne({ _id: new ObjectId(id) });
    if (!reference) {
      throw new DesignReferenceServiceError("Design reference not found", 404);
    }

    const filter = { projectId: reference.projectId };
    if (reference.sectionId) filter.sectionId = reference.sectionId;
    else filter.sectionId = null;

    const siblings = await refs
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .toArray();

    const index = siblings.findIndex((r) => String(r._id) === String(id));
    const swapWith = dir === "up" ? siblings[index - 1] : siblings[index + 1];
    if (index < 0 || !swapWith) {
      return reference;
    }

    const refOrder = reference.order ?? index;
    const otherOrder = swapWith.order ?? index + (dir === "up" ? -1 : 1);
    await refs.updateOne(
      { _id: new ObjectId(id) },
      { $set: { order: otherOrder, updatedAt: new Date() } }
    );
    await refs.updateOne(
      { _id: swapWith._id },
      { $set: { order: refOrder, updatedAt: new Date() } }
    );

    const result = await refs.findOne({ _id: new ObjectId(id) });

    await logActivity(user, {
      action: "update",
      targetType: "designReference",
      target: result.title || id,
      details: { reorder: dir },
    }).catch(() => {});

    return result;
  } catch (err) {
    if (err instanceof DesignReferenceServiceError) throw err;
    throw new DesignReferenceServiceError("Could not reorder the design reference. Please try again.", 500);
  }
}
