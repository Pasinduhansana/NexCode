import { ObjectId } from "mongodb";
import { getCollection, unwrap } from "./mongodb.js";
import { logActivity } from "./activity.js";

export const DESIGN_REFERENCE_TYPES = ["website", "image", "file", "other"];

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

export async function createDesignReference(input = {}, user) {
  const projectId = toProjectIdString(input.projectId);
  const title = asTrimmed(input.title);
  const url = normalizeUrl(input.url);

  if (!projectId) {
    throw new DesignReferenceServiceError("projectId is required", 400);
  }
  if (!title) {
    throw new DesignReferenceServiceError("Design reference title is required", 400);
  }
  if (url === null) {
    throw new DesignReferenceServiceError("Invalid URL. Please provide a valid http(s) link.", 400);
  }
  if (!url) {
    throw new DesignReferenceServiceError("A reference URL is required", 400);
  }

  const now = new Date();
  const reference = {
    projectId,
    title,
    url,
    type: input.type || "website",
    notes: asTrimmed(input.notes),
    createdAt: now,
    updatedAt: now,
  };

  try {
    const refs = await getCollection("designreferences");
    const { insertedId } = await refs.insertOne(reference);

    await logActivity(user, {
      action: "create",
      targetType: "designReference",
      target: reference.title,
      details: { projectId, type: reference.type },
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

export async function listDesignReferencesByProject(projectId, type) {
  const filter = projectId ? { projectId: toProjectIdString(projectId) } : {};
  if (type) filter.type = type;

  try {
    return await (await getCollection("designreferences"))
      .find(filter)
      .sort({ createdAt: 1 })
      .toArray();
  } catch (err) {
    if (err instanceof DesignReferenceServiceError) throw err;
    throw new DesignReferenceServiceError("Could not load the design references. Please try again.", 500);
  }
}

export async function findDesignReference({ id, searchTitle, projectId, type }) {
  if (id !== undefined && id !== null && String(id).trim() !== "") {
    return { kind: "single", designReference: await getDesignReferenceById(String(id).trim()) };
  }

  const scope = projectId ? { projectId: toProjectIdString(projectId) } : {};
  const title = asTrimmed(searchTitle);

  if (!title && !scope.projectId) {
    throw new DesignReferenceServiceError("Please provide a design reference id, a title, or a project", 400);
  }

  if (!title && scope.projectId) {
    return { kind: "list", designReferences: await listDesignReferencesByProject(scope.projectId, type) };
  }

  try {
    const refs = await getCollection("designreferences");
    const pattern = escapeRegex(title);
    const titleFilter = { title: { $regex: new RegExp(`^${pattern}$`, "i") } };

    const exact = await refs.findOne({ ...titleFilter, ...scope });
    if (exact) return { kind: "single", designReference: exact };

    const matches = await refs
      .find({ title: { $regex: new RegExp(pattern, "i") }, ...scope })
      .sort({ createdAt: 1 })
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

  try {
    const refs = await getCollection("designreferences");
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
      details: { type: patch.type || reference.type },
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
