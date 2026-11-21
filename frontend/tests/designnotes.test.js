import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { seedProject, reset, newUser } from "./helpers/setup.js";

const {
  createDesignNote,
  getDesignNoteById,
  listDesignNotes,
  updateDesignNote,
  deleteDesignNote,
  DesignNoteServiceError,
} = await import("../api/_lib/designnotes.js");
const { createDesignSection } = await import("../api/_lib/designsections.js");
const { createDesignReference } = await import("../api/_lib/designreferences.js");

const user = newUser();

before(() => reset());

describe("designnotes service", () => {
  test("creates project, section, and reference notes", async () => {
    const project = seedProject("NoteA");
    const section = await createDesignSection({ projectId: String(project._id), name: "Home" }, user);
    const ref = await createDesignReference({ projectId: String(project._id), title: "Figma", url: "https://figma.com/x" }, user);

    const projectNote = await createDesignNote({ projectId: String(project._id), parentType: "project", parentId: String(project._id), text: "Overall direction" }, user);
    assert.equal(projectNote.parentType, "project");

    const sectionNote = await createDesignNote({ projectId: String(project._id), parentType: "section", parentId: String(section._id), text: "Hero must be bold" }, user);
    assert.equal(sectionNote.parentId, String(section._id));

    const refNote = await createDesignNote({ projectId: String(project._id), parentType: "reference", parentId: String(ref._id), text: "Use for palette" }, user);
    assert.equal(refNote.parentId, String(ref._id));

    const all = await listDesignNotes({ projectId: String(project._id) });
    assert.equal(all.length, 3);
  });

  test("supports parentId 'project' alias for project notes", async () => {
    const project = seedProject("NoteB");
    const note = await createDesignNote({ projectId: String(project._id), parentType: "project", parentId: "project", text: "Alias" }, user);
    assert.equal(note.parentId, "project");
  });

  test("validates input", async () => {
    const project = seedProject("NoteC");
    await assert.rejects(
      createDesignNote({ projectId: String(project._id), parentType: "bogus", parentId: "x", text: "y" }, user),
      (err) => err instanceof DesignNoteServiceError && err.status === 400
    );
    await assert.rejects(
      createDesignNote({ projectId: String(project._id), parentType: "section", parentId: "", text: "y" }, user),
      (err) => err instanceof DesignNoteServiceError && err.status === 400
    );
    await assert.rejects(
      createDesignNote({ projectId: String(project._id), parentType: "section", parentId: "x", text: "   " }, user),
      (err) => err instanceof DesignNoteServiceError && err.status === 400
    );
    await assert.rejects(
      createDesignNote({ projectId: String(project._id), parentType: "project", parentId: String(project._id), text: "z".repeat(4001) }, user),
      (err) => err instanceof DesignNoteServiceError && err.status === 400
    );
    await assert.rejects(
      createDesignNote({ parentType: "project", parentId: "x", text: "y" }, user),
      (err) => err instanceof DesignNoteServiceError && err.status === 400
    );
  });

  test("rejects notes attached to sections/references of another project", async () => {
    const projectA = seedProject("NoteD");
    const projectB = seedProject("NoteD2");
    const section = await createDesignSection({ projectId: String(projectA._id), name: "A" }, user);
    const ref = await createDesignReference({ projectId: String(projectA._id), title: "R", url: "https://r.com" }, user);

    await assert.rejects(
      createDesignNote({ projectId: String(projectB._id), parentType: "section", parentId: String(section._id), text: "nope" }, user),
      (err) => err instanceof DesignNoteServiceError && err.status === 400
    );
    await assert.rejects(
      createDesignNote({ projectId: String(projectB._id), parentType: "reference", parentId: String(ref._id), text: "nope" }, user),
      (err) => err instanceof DesignNoteServiceError && err.status === 400
    );
    await assert.rejects(
      createDesignNote({ projectId: String(projectB._id), parentType: "section", parentId: String(new ObjectId()), text: "missing" }, user),
      (err) => err instanceof DesignNoteServiceError && err.status === 404
    );
  });

  test("lists notes filtered by parentType and parentId", async () => {
    const project = seedProject("NoteE");
    const section = await createDesignSection({ projectId: String(project._id), name: "S" }, user);
    await createDesignNote({ projectId: String(project._id), parentType: "project", parentId: String(project._id), text: "P1" }, user);
    await createDesignNote({ projectId: String(project._id), parentType: "section", parentId: String(section._id), text: "S1" }, user);
    await createDesignNote({ projectId: String(project._id), parentType: "section", parentId: String(section._id), text: "S2" }, user);

    const sectionNotes = await listDesignNotes({ projectId: String(project._id), parentType: "section" });
    assert.equal(sectionNotes.length, 2);

    const one = await listDesignNotes({ projectId: String(project._id), parentType: "section", parentId: String(section._id) });
    assert.equal(one.length, 2);

    const projectNotes = await listDesignNotes({ projectId: String(project._id), parentType: "project" });
    assert.equal(projectNotes.length, 1);
  });

  test("updates and deletes notes", async () => {
    const project = seedProject("NoteF");
    const note = await createDesignNote({ projectId: String(project._id), parentType: "project", parentId: String(project._id), text: "Before" }, user);

    const updated = await updateDesignNote(String(note._id), { text: "After" }, user);
    assert.equal(updated.text, "After");

    await assert.rejects(
      updateDesignNote(String(note._id), { text: " " }, user),
      (err) => err instanceof DesignNoteServiceError && err.status === 400
    );

    const deleted = await deleteDesignNote(String(note._id), user);
    assert.equal(deleted.deleted, true);
    await assert.rejects(
      getDesignNoteById(String(note._id)),
      (err) => err instanceof DesignNoteServiceError && err.status === 404
    );
  });

  test("getDesignNoteById rejects invalid ids", async () => {
    await assert.rejects(
      getDesignNoteById("junk"),
      (err) => err instanceof DesignNoteServiceError && err.status === 400
    );
  });
});