import { ObjectId } from "mongodb";
import { getCollection, unwrap } from "./mongodb.js";
import { logActivity } from "./activity.js";
import { getProjectById } from "./projects.js";

export class DesignSectionServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "DesignSectionServiceError";
    this.status = status;
    this.expose = true;
  }
}

const MAX_NAME_LENGTH = 120;

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

async function requireExistingProject(projectId) {
  try {
    await getProjectById(projectId);
  } catch (err) {
    throw new DesignSectionServiceError("The specified project does not exist.", 404);
  }
}

export async function createDesignSection(input = {}, user) {
  const projectId = toProjectIdString(input.projectId);
  const name = asTrimmed(input.name);

  if (!projectId) {
    throw new DesignSectionServiceError("projectId is required", 400);
  }
  if (!name) {
    throw new DesignSectionServiceError("Design section name is required", 400);
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new DesignSectionServiceError(`Design section name must be at most ${MAX_NAME_LENGTH} characters`, 400);
  }

  await requireExistingProject(projectId);

  const now = new Date();
  const order =
    input.order !== undefined && input.order !== null && Number.isFinite(Number(input.order))
      ? Number(input.order)
      : null;

  try {
    const sections = await getCollection("designsections");
    let nextOrder = order;
    if (nextOrder === null) {
      const last = await sections.find({ projectId }).sort({ order: -1 }).limit(1).next();
      nextOrder = (last?.order ?? -1) + 1;
    }

    const section = {
      projectId,
      name,
      order: nextOrder,
      createdAt: now,
      updatedAt: now,
    };

    const { insertedId } = await sections.insertOne(section);

    await logActivity(user, {
      action: "create",
      targetType: "designSection",
      target: section.name,
      details: { projectId },
    }).catch(() => {});

    return { ...section, _id: insertedId };
  } catch (err) {
    if (err instanceof DesignSectionServiceError) throw err;
    throw new DesignSectionServiceError("Could not create the design section. Please try again.", 500);
  }
}

export async function getDesignSectionById(id) {
  if (!ObjectId.isValid(id)) {
    throw new DesignSectionServiceError("Invalid design section id", 400);
  }

  try {
    const section = await (await getCollection("designsections")).findOne({ _id: new ObjectId(id) });
    if (!section) {
      throw new DesignSectionServiceError("Design section not found", 404);
    }
    return section;
  } catch (err) {
    if (err instanceof DesignSectionServiceError) throw err;
    throw new DesignSectionServiceError("Could not load the design section. Please try again.", 500);
  }
}

export async function listDesignSectionsByProject(projectId) {
  const pid = projectId ? toProjectIdString(projectId) : "";
  if (!pid) {
    throw new DesignSectionServiceError("projectId is required", 400);
  }

  try {
    return await (await getCollection("designsections"))
      .find({ projectId: pid })
      .sort({ order: 1, createdAt: 1 })
      .toArray();
  } catch (err) {
    if (err instanceof DesignSectionServiceError) throw err;
    throw new DesignSectionServiceError("Could not load the design sections. Please try again.", 500);
  }
}

export async function findDesignSection({ id, searchName, projectId }) {
  if (id !== undefined && id !== null && String(id).trim() !== "") {
    return { kind: "single", designSection: await getDesignSectionById(String(id).trim()) };
  }

  const scope = projectId ? { projectId: toProjectIdString(projectId) } : {};
  const name = asTrimmed(searchName);

  if (!name && !scope.projectId) {
    throw new DesignSectionServiceError("Please provide a design section id, a name, or a project", 400);
  }

  if (!name && scope.projectId) {
    return { kind: "list", designSections: await listDesignSectionsByProject(scope.projectId) };
  }

  try {
    const sections = await getCollection("designsections");
    const pattern = escapeRegex(name);
    const nameFilter = { name: { $regex: new RegExp(`^${pattern}$`, "i") } };

    const exact = await sections.findOne({ ...nameFilter, ...scope });
    if (exact) return { kind: "single", designSection: exact };

    const matches = await sections
      .find({ name: { $regex: new RegExp(pattern, "i") }, ...scope })
      .sort({ order: 1, createdAt: 1 })
      .limit(5)
      .toArray();

    if (matches.length === 0) {
      throw new DesignSectionServiceError(`Design section "${name}" not found`, 404);
    }
    if (matches.length > 1) {
      const names = matches.map((s) => `"${s.name}"`).join(", ");
      throw new DesignSectionServiceError(
        `Multiple design sections match "${name}". Please specify one: ${names}.`,
        400
      );
    }
    return { kind: "single", designSection: matches[0] };
  } catch (err) {
    if (err instanceof DesignSectionServiceError) throw err;
    throw new DesignSectionServiceError("Could not find the design section. Please try again.", 500);
  }
}

export async function updateDesignSection(id, input = {}, user) {
  if (!ObjectId.isValid(id)) {
    throw new DesignSectionServiceError("Invalid design section id", 400);
  }

  const patch = { updatedAt: new Date() };

  if (input.name !== undefined) {
    const name = asTrimmed(input.name);
    if (!name) {
      throw new DesignSectionServiceError("Design section name cannot be empty", 400);
    }
    if (name.length > MAX_NAME_LENGTH) {
      throw new DesignSectionServiceError(`Design section name must be at most ${MAX_NAME_LENGTH} characters`, 400);
    }
    patch.name = name;
  }
  if (input.order !== undefined && input.order !== null && Number.isFinite(Number(input.order))) {
    patch.order = Number(input.order);
  }

  try {
    const sections = await getCollection("designsections");
    const result = await sections.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const section = unwrap(result);
    if (!section) {
      throw new DesignSectionServiceError("Design section not found", 404);
    }

    await logActivity(user, {
      action: "update",
      targetType: "designSection",
      target: section.name || id,
      details: {},
    }).catch(() => {});

    return section;
  } catch (err) {
    if (err instanceof DesignSectionServiceError) throw err;
    throw new DesignSectionServiceError("Could not update the design section. Please try again.", 500);
  }
}

export async function deleteDesignSection(id, user) {
  if (!ObjectId.isValid(id)) {
    throw new DesignSectionServiceError("Invalid design section id", 400);
  }

  try {
    const sections = await getCollection("designsections");
    const refs = await getCollection("designreferences");
    const notes = await getCollection("designnotes");

    const result = await sections.findOneAndDelete({ _id: new ObjectId(id) });
    const section = unwrap(result);
    if (!section) {
      throw new DesignSectionServiceError("Design section not found", 404);
    }

    const sectionId = String(section._id);
    await refs.updateMany(
      { sectionId },
      { $set: { sectionId: null, updatedAt: new Date() } }
    );
    await notes.deleteMany({ parentType: "section", parentId: sectionId });

    await logActivity(user, {
      action: "delete",
      targetType: "designSection",
      target: section.name || id,
      details: {},
    }).catch(() => {});

    return { deleted: true, id, name: section.name };
  } catch (err) {
    if (err instanceof DesignSectionServiceError) throw err;
    throw new DesignSectionServiceError("Could not delete the design section. Please try again.", 500);
  }
}

export async function countDesignSectionsByProject(projectId) {
  try {
    return await (await getCollection("designsections")).countDocuments({ projectId: toProjectIdString(projectId) });
  } catch (err) {
    return 0;
  }
}