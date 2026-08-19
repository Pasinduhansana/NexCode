import { ObjectId } from "mongodb";
import { getCollection, unwrap } from "./mongodb.js";
import { logActivity } from "./activity.js";
import { getProjectById } from "./projects.js";
import { getDesignSectionById, DesignSectionServiceError } from "./designsections.js";
import { getDesignReferenceById, DesignReferenceServiceError } from "./designreferences.js";

export const DESIGN_NOTE_PARENT_TYPES = ["project", "section", "reference"];

export class DesignNoteServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "DesignNoteServiceError";
    this.status = status;
    this.expose = true;
  }
}

const MAX_NOTE_LENGTH = 4000;

function asTrimmed(value) {
  return value ? String(value).trim() : "";
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
    throw new DesignNoteServiceError("The specified project does not exist.", 404);
  }
}

async function validateParent({ projectId, parentType, parentId }) {
  const pid = toProjectIdString(projectId);

  if (parentType === "project") {
    if (!parentId || String(parentId) === pid || String(parentId) === "project") return pid;
    throw new DesignNoteServiceError("Invalid parent id for project notes", 400);
  }

  if (parentType === "section") {
    let section;
    try {
      section = await getDesignSectionById(parentId);
    } catch (err) {
      if (err instanceof DesignSectionServiceError && err.status === 404) {
        throw new DesignNoteServiceError("The design section does not exist.", 404);
      }
      throw err;
    }
    if (toProjectIdString(section.projectId) !== pid) {
      throw new DesignNoteServiceError("The design section does not belong to this project.", 400);
    }
    return pid;
  }

  if (parentType === "reference") {
    let reference;
    try {
      reference = await getDesignReferenceById(parentId);
    } catch (err) {
      if (err instanceof DesignReferenceServiceError && err.status === 404) {
        throw new DesignNoteServiceError("The design reference does not exist.", 404);
      }
      throw err;
    }
    if (toProjectIdString(reference.projectId) !== pid) {
      throw new DesignNoteServiceError("The design reference does not belong to this project.", 400);
    }
    return pid;
  }

  throw new DesignNoteServiceError("Invalid note parent type", 400);
}

export async function createDesignNote(input = {}, user) {
  const projectId = toProjectIdString(input.projectId);
  const parentType = input.parentType;
  const parentId = input.parentId !== undefined && input.parentId !== null ? String(input.parentId) : "";
  const text = asTrimmed(input.text);

  if (!projectId) {
    throw new DesignNoteServiceError("projectId is required", 400);
  }
  if (!DESIGN_NOTE_PARENT_TYPES.includes(parentType)) {
    throw new DesignNoteServiceError("parentType must be one of: project, section, reference", 400);
  }
  if (!parentId) {
    throw new DesignNoteServiceError("parentId is required", 400);
  }
  if (!text) {
    throw new DesignNoteServiceError("Note text is required", 400);
  }
  if (text.length > MAX_NOTE_LENGTH) {
    throw new DesignNoteServiceError(`Note text must be at most ${MAX_NOTE_LENGTH} characters`, 400);
  }

  await requireExistingProject(projectId);
  await validateParent({ projectId, parentType, parentId });

  const now = new Date();
  const note = {
    projectId,
    parentType,
    parentId,
    text,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const notes = await getCollection("designnotes");
    const { insertedId } = await notes.insertOne(note);

    await logActivity(user, {
      action: "create",
      targetType: "designNote",
      target: text.slice(0, 80),
      details: { projectId, parentType, parentId },
    }).catch(() => {});

    return { ...note, _id: insertedId };
  } catch (err) {
    if (err instanceof DesignNoteServiceError) throw err;
    throw new DesignNoteServiceError("Could not create the design note. Please try again.", 500);
  }
}

export async function getDesignNoteById(id) {
  if (!ObjectId.isValid(id)) {
    throw new DesignNoteServiceError("Invalid design note id", 400);
  }

  try {
    const note = await (await getCollection("designnotes")).findOne({ _id: new ObjectId(id) });
    if (!note) {
      throw new DesignNoteServiceError("Design note not found", 404);
    }
    return note;
  } catch (err) {
    if (err instanceof DesignNoteServiceError) throw err;
    throw new DesignNoteServiceError("Could not load the design note. Please try again.", 500);
  }
}

export async function listDesignNotes({ projectId, parentType, parentId } = {}) {
  const filter = {};
  if (projectId) filter.projectId = toProjectIdString(projectId);
  if (parentType) filter.parentType = parentType;
  if (parentId !== undefined && parentId !== null && String(parentId).trim() !== "") {
    filter.parentId = String(parentId);
  }

  try {
    return await (await getCollection("designnotes")).find(filter).sort({ createdAt: 1 }).toArray();
  } catch (err) {
    if (err instanceof DesignNoteServiceError) throw err;
    throw new DesignNoteServiceError("Could not load the design notes. Please try again.", 500);
  }
}

export async function updateDesignNote(id, input = {}, user) {
  if (!ObjectId.isValid(id)) {
    throw new DesignNoteServiceError("Invalid design note id", 400);
  }

  const patch = { updatedAt: new Date() };

  if (input.text !== undefined) {
    const text = asTrimmed(input.text);
    if (!text) {
      throw new DesignNoteServiceError("Note text cannot be empty", 400);
    }
    if (text.length > MAX_NOTE_LENGTH) {
      throw new DesignNoteServiceError(`Note text must be at most ${MAX_NOTE_LENGTH} characters`, 400);
    }
    patch.text = text;
  }

  try {
    const notes = await getCollection("designnotes");
    const result = await notes.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const note = unwrap(result);
    if (!note) {
      throw new DesignNoteServiceError("Design note not found", 404);
    }

    await logActivity(user, {
      action: "update",
      targetType: "designNote",
      target: (patch.text || note.text || "").slice(0, 80),
      details: {},
    }).catch(() => {});

    return note;
  } catch (err) {
    if (err instanceof DesignNoteServiceError) throw err;
    throw new DesignNoteServiceError("Could not update the design note. Please try again.", 500);
  }
}

export async function deleteDesignNote(id, user) {
  if (!ObjectId.isValid(id)) {
    throw new DesignNoteServiceError("Invalid design note id", 400);
  }

  try {
    const notes = await getCollection("designnotes");
    const result = await notes.findOneAndDelete({ _id: new ObjectId(id) });
    const note = unwrap(result);
    if (!note) {
      throw new DesignNoteServiceError("Design note not found", 404);
    }

    await logActivity(user, {
      action: "delete",
      targetType: "designNote",
      target: (note.text || "").slice(0, 80),
      details: {},
    }).catch(() => {});

    return { deleted: true, id, text: note.text };
  } catch (err) {
    if (err instanceof DesignNoteServiceError) throw err;
    throw new DesignNoteServiceError("Could not delete the design note. Please try again.", 500);
  }
}