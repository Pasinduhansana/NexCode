import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { seedProject, reset, newUser } from "./helpers/setup.js";

const {
  createDesignReference,
  getDesignReferenceById,
  listDesignReferencesByProject,
  listDesignReferencesBySection,
  findDesignReference,
  updateDesignReference,
  deleteDesignReference,
  reorderDesignReference,
  DesignReferenceServiceError,
} = await import("../api/_lib/designreferences.js");
const { createDesignSection } = await import("../api/_lib/designsections.js");

const user = newUser();

before(() => reset());

describe("designreferences service", () => {
  test("creates a reference with trimmed fields and tags", async () => {
    const project = seedProject("RefA");
    const ref = await createDesignReference(
      { projectId: String(project._id), title: "  Figma link  ", url: "https://figma.com/file/abc", type: "image", tags: ["home", "HOME"], notes: "draft" },
      user
    );
    assert.ok(ref._id);
    assert.equal(ref.title, "Figma link");
    assert.equal(ref.url, "https://figma.com/file/abc");
    assert.equal(ref.type, "image");
    assert.deepEqual(ref.tags, ["home"]);
    assert.equal(ref.notes, "draft");
    assert.equal(ref.sectionId, null);
    assert.equal(ref.order, 0);
  });

  test("rejects missing title, bad url, and missing url", async () => {
    const project = seedProject("RefB");
    await assert.rejects(
      createDesignReference({ projectId: String(project._id), url: "https://x.com" }, user),
      (err) => err instanceof DesignReferenceServiceError && err.status === 400
    );
    await assert.rejects(
      createDesignReference({ projectId: String(project._id), title: "X", url: "ftp://bad" }, user),
      (err) => err instanceof DesignReferenceServiceError && err.status === 400
    );
    await assert.rejects(
      createDesignReference({ projectId: String(project._id), title: "X", url: "" }, user),
      (err) => err instanceof DesignReferenceServiceError && err.status === 400
    );
    await assert.rejects(
      createDesignReference({ title: "X", url: "https://x.com" }, user),
      (err) => err instanceof DesignReferenceServiceError && err.status === 400
    );
  });

  test("assigns a section and rejects sections from other projects", async () => {
    const project = seedProject("RefC");
    const other = seedProject("RefC2");
    const section = await createDesignSection({ projectId: String(project._id), name: "Landing" }, user);
    const otherSection = await createDesignSection({ projectId: String(other._id), name: "Other" }, user);

    const ref = await createDesignReference(
      { projectId: String(project._id), title: "Sketch", url: "https://sketch.com", sectionId: String(section._id) },
      user
    );
    assert.equal(String(ref.sectionId), String(section._id));

    await assert.rejects(
      createDesignReference(
        { projectId: String(project._id), title: "Sketch2", url: "https://sketch.com", sectionId: String(otherSection._id) },
        user
      ),
      (err) => err instanceof DesignReferenceServiceError && err.status === 400
    );
  });

  test("lists references by project with type/section filters and by section", async () => {
    const project = seedProject("RefD");
    const section = await createDesignSection({ projectId: String(project._id), name: "About" }, user);
    const a = await createDesignReference({ projectId: String(project._id), title: "A", url: "https://a.com", type: "website", sectionId: String(section._id) }, user);
    await createDesignReference({ projectId: String(project._id), title: "B", url: "https://b.com", type: "image" }, user);
    const other = seedProject("RefD2");
    await createDesignReference({ projectId: String(other._id), title: "C", url: "https://c.com" }, user);

    const all = await listDesignReferencesByProject(String(project._id));
    assert.equal(all.length, 2);

    const images = await listDesignReferencesByProject(String(project._id), "image");
    assert.equal(images.length, 1);
    assert.equal(images[0].title, "B");

    const inSection = await listDesignReferencesByProject(String(project._id), null, String(section._id));
    assert.equal(inSection.length, 1);
    assert.equal(inSection[0].title, "A");

    const bySection = await listDesignReferencesBySection(String(section._id));
    assert.equal(bySection.length, 1);
    assert.equal(String(bySection[0]._id), String(a._id));
  });

  test("findDesignReference resolves exact, list, ambiguous, and not-found", async () => {
    const project = seedProject("RefE");
    const a = await createDesignReference({ projectId: String(project._id), title: "Pricing", url: "https://p.com" }, user);
    await createDesignReference({ projectId: String(project._id), title: "Pricing 2", url: "https://p2.com" }, user);

    const exact = await findDesignReference({ searchTitle: "pricing", projectId: String(project._id) });
    assert.equal(exact.kind, "single");
    assert.equal(String(exact.designReference._id), String(a._id));

    const list = await findDesignReference({ projectId: String(project._id) });
    assert.equal(list.kind, "list");
    assert.equal(list.designReferences.length, 2);

    await assert.rejects(
      findDesignReference({ searchTitle: "nope", projectId: String(project._id) }),
      (err) => err instanceof DesignReferenceServiceError && err.status === 404
    );
    await assert.rejects(
      findDesignReference({}),
      (err) => err instanceof DesignReferenceServiceError && err.status === 400
    );
  });

  test("findDesignReference supports searchSection scope", async () => {
    const project = seedProject("RefF");
    const section = await createDesignSection({ projectId: String(project._id), name: "Checkout" }, user);
    await createDesignReference({ projectId: String(project._id), title: "Flow", url: "https://f.com", sectionId: String(section._id) }, user);
    await createDesignReference({ projectId: String(project._id), title: "Flow", url: "https://f2.com" }, user);

    const scoped = await findDesignReference({ searchTitle: "flow", projectId: String(project._id), searchSection: "checkout" });
    assert.equal(scoped.kind, "single");
    assert.equal(scoped.designReference.url, "https://f.com");
  });

  test("updateDesignReference updates fields, merges addTags, and moves sections", async () => {
    const project = seedProject("RefG");
    const sectionA = await createDesignSection({ projectId: String(project._id), name: "A" }, user);
    const sectionB = await createDesignSection({ projectId: String(project._id), name: "B" }, user);
    const other = seedProject("RefG2");
    const otherSection = await createDesignSection({ projectId: String(other._id), name: "Other" }, user);

    const ref = await createDesignReference(
      { projectId: String(project._id), title: "Home", url: "https://h.com", tags: ["hero"], sectionId: String(sectionA._id) },
      user
    );

    const updated = await updateDesignReference(
      String(ref._id),
      { title: "Homepage", tags: ["hero"], addTags: ["Hero", "cta"] },
      user
    );
    assert.equal(updated.title, "Homepage");
    assert.deepEqual(updated.tags, ["hero", "cta"]);

    const moved = await updateDesignReference(String(ref._id), { sectionId: String(sectionB._id) }, user);
    assert.equal(String(moved.sectionId), String(sectionB._id));

    const uncategorized = await updateDesignReference(String(ref._id), { sectionId: "" }, user);
    assert.equal(uncategorized.sectionId, null);

    await assert.rejects(
      updateDesignReference(String(ref._id), { sectionId: String(otherSection._id) }, user),
      (err) => err instanceof DesignReferenceServiceError && err.status === 400
    );
  });

  test("reorderDesignReference swaps order among siblings only", async () => {
    const project = seedProject("RefH");
    const section = await createDesignSection({ projectId: String(project._id), name: "S" }, user);
    const a = await createDesignReference({ projectId: String(project._id), title: "A", url: "https://a.com", sectionId: String(section._id) }, user);
    const b = await createDesignReference({ projectId: String(project._id), title: "B", url: "https://b.com", sectionId: String(section._id) }, user);
    const c = await createDesignReference({ projectId: String(project._id), title: "C", url: "https://c.com" }, user);

    const up = await reorderDesignReference(String(b._id), "up", user);
    assert.equal(String(up._id), String(b._id));
    const sectionRefs = await listDesignReferencesBySection(String(section._id));
    assert.deepEqual(sectionRefs.map((r) => r.title), ["B", "A"]);

    await reorderDesignReference(String(a._id), "down", user);
    const after = await listDesignReferencesBySection(String(section._id));
    assert.deepEqual(after.map((r) => r.title), ["B", "A"]);

    const top = await reorderDesignReference(String(sectionRefs[0]._id), "up", user);
    assert.equal(String(top._id), String(sectionRefs[0]._id));

    await assert.rejects(
      reorderDesignReference(String(b._id), "sideways", user),
      (err) => err instanceof DesignReferenceServiceError && err.status === 400
    );
  });

  test("deleteDesignReference removes the reference", async () => {
    const project = seedProject("RefI");
    const ref = await createDesignReference({ projectId: String(project._id), title: "Gone", url: "https://g.com" }, user);
    const result = await deleteDesignReference(String(ref._id), user);
    assert.equal(result.deleted, true);
    await assert.rejects(
      getDesignReferenceById(String(ref._id)),
      (err) => err instanceof DesignReferenceServiceError && err.status === 404
    );
  });

  test("getDesignReferenceById rejects invalid ids", async () => {
    await assert.rejects(
      getDesignReferenceById("junk"),
      (err) => err instanceof DesignReferenceServiceError && err.status === 400
    );
  });
});