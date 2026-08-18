import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { db, seedProject, reset, newUser } from "./helpers/setup.js";

const {
  createDesignSection,
  getDesignSectionById,
  listDesignSectionsByProject,
  findDesignSection,
  updateDesignSection,
  deleteDesignSection,
  countDesignSectionsByProject,
  DesignSectionServiceError,
} = await import("../api/_lib/designsections.js");

const user = newUser();

before(() => reset());

describe("designsections service", () => {
  test("creates a section with auto order and trimmed name", async () => {
    const project = seedProject("Alpha");
    const section = await createDesignSection({ projectId: String(project._id), name: "  Landing Page  " }, user);
    assert.ok(section._id);
    assert.equal(section.name, "Landing Page");
    assert.equal(section.projectId, String(project._id));
    assert.equal(section.order, 0);
    assert.ok(section.createdAt instanceof Date);
  });

  test("assigns sequential orders", async () => {
    const project = seedProject("Beta");
    const first = await createDesignSection({ projectId: String(project._id), name: "Home" }, user);
    const second = await createDesignSection({ projectId: String(project._id), name: "About" }, user);
    assert.equal(first.order, 0);
    assert.equal(second.order, 1);
  });

  test("rejects missing name and unknown project", async () => {
    const project = seedProject("Gamma");
    await assert.rejects(
      createDesignSection({ projectId: String(project._id), name: "" }, user),
      (err) => err instanceof DesignSectionServiceError && err.status === 400
    );
    await assert.rejects(
      createDesignSection({ projectId: String(new ObjectId()), name: "Ghost" }, user),
      (err) => err instanceof DesignSectionServiceError && err.status === 404
    );
    await assert.rejects(
      createDesignSection({ name: "NoProject" }, user),
      (err) => err instanceof DesignSectionServiceError && err.status === 400
    );
  });

  test("lists sections ordered by order then createdAt", async () => {
    const project = seedProject("Delta");
    await createDesignSection({ projectId: String(project._id), name: "First" }, user);
    await createDesignSection({ projectId: String(project._id), name: "Second" }, user);
    const other = seedProject("Other");
    await createDesignSection({ projectId: String(other._id), name: "OtherOnly" }, user);

    const sections = await listDesignSectionsByProject(String(project._id));
    assert.deepEqual(sections.map((s) => s.name), ["First", "Second"]);
  });

  test("getDesignSectionById validates id and 404s", async () => {
    await assert.rejects(
      getDesignSectionById("not-a-valid-object-id"),
      (err) => err instanceof DesignSectionServiceError && err.status === 400
    );
    await assert.rejects(
      getDesignSectionById(String(new ObjectId())),
      (err) => err instanceof DesignSectionServiceError && err.status === 404
    );
  });

  test("findDesignSection resolves scoped names and rejects ambiguous/missing", async () => {
    const project = seedProject("Epsilon");
    const a = await createDesignSection({ projectId: String(project._id), name: "Contact" }, user);
    await createDesignSection({ projectId: String(project._id), name: "Contact Us" }, user);
    const other = seedProject("EpsilonTwo");
    const otherSection = await createDesignSection({ projectId: String(other._id), name: "Contact" }, user);

    const exact = await findDesignSection({ searchName: "contact", projectId: String(project._id) });
    assert.equal(exact.kind, "single");
    assert.equal(String(exact.designSection._id), String(a._id));

    const scoped = await findDesignSection({ searchName: "contact", projectId: String(other._id) });
    assert.equal(scoped.kind, "single");
    assert.equal(String(scoped.designSection._id), String(otherSection._id));

    await assert.rejects(
      findDesignSection({ searchName: "nope", projectId: String(project._id) }),
      (err) => err instanceof DesignSectionServiceError && err.status === 404
    );
    await assert.rejects(
      findDesignSection({}),
      (err) => err instanceof DesignSectionServiceError && err.status === 400
    );
  });

  test("updateDesignSection renames and validates empty name", async () => {
    const project = seedProject("Zeta");
    const section = await createDesignSection({ projectId: String(project._id), name: "Old" }, user);
    const updated = await updateDesignSection(String(section._id), { name: "New Name" }, user);
    assert.equal(updated.name, "New Name");
    await assert.rejects(
      updateDesignSection(String(section._id), { name: "   " }, user),
      (err) => err instanceof DesignSectionServiceError && err.status === 400
    );
    await assert.rejects(
      updateDesignSection("bad", { name: "X" }, user),
      (err) => err instanceof DesignSectionServiceError && err.status === 400
    );
  });

  test("deleteDesignSection unlinks references and removes its notes", async () => {
    const project = seedProject("Eta");
    const section = await createDesignSection({ projectId: String(project._id), name: "ToDelete" }, user);
    db.raw("designreferences").push(
      { _id: new ObjectId(), projectId: String(project._id), sectionId: String(section._id), order: 0, title: "InSection" },
      { _id: new ObjectId(), projectId: String(project._id), sectionId: null, order: 1, title: "Uncategorized" }
    );
    db.raw("designnotes").push({
      _id: new ObjectId(),
      projectId: String(project._id),
      parentType: "section",
      parentId: String(section._id),
      text: "note",
    });

    const result = await deleteDesignSection(String(section._id), user);
    assert.equal(result.deleted, true);

    const remaining = await db.collection("designreferences").find({}).toArray();
    assert.equal(remaining.length, 2);
    assert.ok(remaining.every((r) => r.sectionId === null), "references were not unlinked");
    assert.equal(await db.collection("designnotes").countDocuments({}), 0);
  });

  test("countDesignSectionsByProject counts only that project", async () => {
    const project = seedProject("Theta");
    await createDesignSection({ projectId: String(project._id), name: "A" }, user);
    await createDesignSection({ projectId: String(project._id), name: "B" }, user);
    assert.equal(await countDesignSectionsByProject(String(project._id)), 2);
    assert.equal(await countDesignSectionsByProject(String(seedProject("Unused")._id)), 0);
  });
});