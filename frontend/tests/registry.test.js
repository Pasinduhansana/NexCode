import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { seedProject, reset, newUser } from "./helpers/setup.js";

const {
  getTool,
  getToolNames,
  getToolCategories,
} = await import("../api/_lib/tools/registry.js");

const user = newUser();

before(() => reset());

describe("designer AI tools in the tool registry", () => {
  test("registers all designer tools with categories", () => {
    const names = getToolNames();
    for (const tool of [
      "createDesignSection",
      "getDesignSections",
      "updateDesignSection",
      "deleteDesignSection",
      "getDesignOverview",
      "addDesignReference",
      "getDesignReferences",
      "updateDesignReference",
      "deleteDesignReference",
      "addDesignNote",
      "getDesignNotes",
      "updateDesignNote",
      "deleteDesignNote",
    ]) {
      assert.ok(names.includes(tool), `missing tool ${tool}`);
    }

    const categories = new Map(getToolCategories().map((c) => [c.name, c.category]));
    assert.equal(categories.get("deleteDesignSection"), "DESTRUCTIVE");
    assert.equal(categories.get("deleteDesignReference"), "DESTRUCTIVE");
    assert.equal(categories.get("deleteDesignNote"), "DESTRUCTIVE");
    assert.equal(categories.get("createDesignSection"), "WRITE");
    assert.equal(categories.get("addDesignNote"), "WRITE");
    assert.equal(categories.get("getDesignOverview"), "READ_ONLY");
    assert.equal(categories.get("getDesignReferences"), "READ_ONLY");
  });

  test("createDesignSection handler creates a section for a project", async () => {
    const project = seedProject("ToolA");
    const tool = getTool("createDesignSection");
    const result = await tool.handler({ projectId: String(project._id), name: "Landing Page" }, { user });
    assert.equal(result.success, true);
    assert.equal(result.designSection.name, "Landing Page");
    assert.equal(String(result.designSection.projectId), String(project._id));
  });

  test("createDesignSection handler resolves project by name and errors without one", async () => {
    const project = seedProject("ToolB");
    const tool = getTool("createDesignSection");
    const byName = await tool.handler({ searchProject: "ToolB", name: "Menu" }, { user });
    assert.equal(String(byName.designSection.projectId), String(project._id));

    await assert.rejects(
      tool.handler({ name: "Orphan" }, { user }),
      (err) => err.expose === true && /project is required/i.test(err.message)
    );
  });

  test("getDesignSections handler lists and finds single", async () => {
    const project = seedProject("ToolC");
    const create = getTool("createDesignSection");
    await create.handler({ projectId: String(project._id), name: "Home" }, { user });
    await create.handler({ projectId: String(project._id), name: "About" }, { user });

    const list = await getTool("getDesignSections").handler({ projectId: String(project._id) }, { user });
    assert.equal(list.designSections.length, 2);

    const single = await getTool("getDesignSections").handler({ projectId: String(project._id), searchName: "home" }, { user });
    assert.equal(single.designSection.name, "Home");
  });

  test("addDesignReference handler adds to a section by name", async () => {
    const project = seedProject("ToolD");
    await getTool("createDesignSection").handler({ projectId: String(project._id), name: "Landing" }, { user });

    const result = await getTool("addDesignReference").handler(
      { searchProject: "ToolD", searchSection: "landing", title: "Figma", url: "https://figma.com/file/1", tags: ["hero"] },
      { user }
    );
    assert.equal(result.success, true);
    assert.equal(result.designReference.title, "Figma");
    assert.ok(result.designReference.sectionId, "reference should be inside the section");

    const refs = await getTool("getDesignReferences").handler(
      { projectId: String(project._id), searchSection: "landing" },
      { user }
    );
    assert.equal(refs.designReferences.length, 1);
    assert.equal(refs.designReferences[0].title, "Figma");
  });

  test("addDesignReference handler rejects unknown section and missing project", async () => {
    const project = seedProject("ToolE");
    await assert.rejects(
      getTool("addDesignReference").handler(
        { projectId: String(project._id), searchSection: "does-not-exist", title: "X", url: "https://x.com" },
        { user }
      ),
      (err) => err.expose === true
    );
    await assert.rejects(
      getTool("addDesignReference").handler({ title: "X", url: "https://x.com" }, { user }),
      (err) => err.expose === true && /project is required/i.test(err.message)
    );
  });

  test("updateDesignReference handler moves a reference between sections", async () => {
    const project = seedProject("ToolF");
    const create = getTool("createDesignSection");
    await create.handler({ projectId: String(project._id), name: "Old" }, { user });
    await create.handler({ projectId: String(project._id), name: "New" }, { user });
    await getTool("addDesignReference").handler(
      { projectId: String(project._id), searchSection: "old", title: "Sketch", url: "https://sketch.com" },
      { user }
    );

    const moved = await getTool("updateDesignReference").handler(
      { searchTitle: "Sketch", projectId: String(project._id), searchSection: "new" },
      { user }
    );
    assert.equal(moved.success, true);

    const inNew = await getTool("getDesignReferences").handler(
      { projectId: String(project._id), searchSection: "new" },
      { user }
    );
    assert.equal(inNew.designReferences.length, 1);
    assert.equal(inNew.designReferences[0].title, "Sketch");
  });

  test("updateDesignReference handler clears section with empty sectionId", async () => {
    const project = seedProject("ToolG");
    await getTool("createDesignSection").handler({ projectId: String(project._id), name: "Temp" }, { user });
    await getTool("addDesignReference").handler(
      { projectId: String(project._id), searchSection: "temp", title: "Pic", url: "https://pic.com" },
      { user }
    );

    const cleared = await getTool("updateDesignReference").handler(
      { searchTitle: "Pic", projectId: String(project._id), sectionId: "" },
      { user }
    );
    assert.equal(cleared.success, true);
    assert.equal(cleared.designReference.sectionId, null);
  });

  test("getDesignOverview handler summarizes sections, references, and notes", async () => {
    const project = seedProject("ToolH");
    const create = getTool("createDesignSection");
    await create.handler({ projectId: String(project._id), name: "Home" }, { user });
    await getTool("addDesignReference").handler(
      { projectId: String(project._id), searchSection: "home", title: "Ref1", url: "https://r1.com" },
      { user }
    );
    await getTool("addDesignReference").handler(
      { projectId: String(project._id), title: "Ref2", url: "https://r2.com" },
      { user }
    );
    await getTool("addDesignNote").handler(
      { projectId: String(project._id), parentType: "section", parentSection: "home", text: "Keep it dark" },
      { user }
    );

    const overview = await getTool("getDesignOverview").handler({ projectId: String(project._id) }, { user });
    assert.equal(overview.success, true);
    assert.equal(overview.project.name, "ToolH");
    assert.equal(overview.sections.length, 1);
    assert.equal(overview.sections[0].name, "Home");
    assert.equal(overview.sections[0].referenceCount, 1);
    assert.equal(overview.sections[0].noteCount, 1);
    assert.equal(overview.uncategorizedReferences, 1);
    assert.equal(overview.recentReferences.length, 2);
    assert.equal(overview.recentNotes.length, 1);
  });

  test("addDesignNote handler attaches notes to sections and references by name", async () => {
    const project = seedProject("ToolI");
    await getTool("createDesignSection").handler({ projectId: String(project._id), name: "About" }, { user });
    await getTool("addDesignReference").handler(
      { projectId: String(project._id), title: "Palette", url: "https://pal.com" },
      { user }
    );

    const sectionNote = await getTool("addDesignNote").handler(
      { projectId: String(project._id), parentType: "section", parentSection: "about", text: "Add team photos" },
      { user }
    );
    assert.equal(sectionNote.success, true);

    const refNote = await getTool("addDesignNote").handler(
      { projectId: String(project._id), parentType: "reference", parentReference: "Palette", text: "Use greens" },
      { user }
    );
    assert.equal(refNote.success, true);

    const notes = await getTool("getDesignNotes").handler(
      { projectId: String(project._id), parentType: "section" },
      { user }
    );
    assert.equal(notes.designNotes.length, 1);
  });

  test("deleteDesignSection requires confirmation before deleting", async () => {
    const project = seedProject("ToolJ");
    await getTool("createDesignSection").handler({ projectId: String(project._id), name: "Doomed" }, { user });

    const first = await getTool("deleteDesignSection").handler(
      { projectId: String(project._id), searchName: "Doomed" },
      { user, requestId: "turn-1" }
    );
    assert.equal(first.status, "confirmation_required");

    const stillThere = await getTool("getDesignSections").handler({ projectId: String(project._id) }, { user });
    assert.equal(stillThere.designSections.length, 1, "section must not be deleted before confirmation");

    await assert.rejects(
      getTool("deleteDesignSection").handler(
        { projectId: String(project._id), searchName: "Doomed", confirmed: true },
        { user, requestId: "turn-1" }
      ),
      (err) => err.expose === true && /same message/i.test(err.message)
    );

    const done = await getTool("deleteDesignSection").handler(
      { projectId: String(project._id), searchName: "Doomed", confirmed: true },
      { user }
    );
    assert.equal(done.status, "completed");

    const after = await getTool("getDesignSections").handler({ projectId: String(project._id) }, { user });
    assert.equal(after.designSections.length, 0, "section should be deleted after confirmation");
  });

  test("deleteDesignReference cancel path leaves the reference intact", async () => {
    const project = seedProject("ToolK");
    await getTool("addDesignReference").handler(
      { projectId: String(project._id), title: "Keep Me", url: "https://keep.com" },
      { user }
    );

    const first = await getTool("deleteDesignReference").handler(
      { projectId: String(project._id), searchTitle: "Keep Me" },
      { user, requestId: "turn-1" }
    );
    assert.equal(first.status, "confirmation_required");

    const cancelled = await getTool("deleteDesignReference").handler(
      { projectId: String(project._id), searchTitle: "Keep Me", confirmed: false },
      { user, requestId: "turn-1" }
    );
    assert.equal(cancelled.status, "cancelled");

    const refs = await getTool("getDesignReferences").handler({ projectId: String(project._id) }, { user });
    assert.equal(refs.designReferences.length, 1);
  });

  test("deleteDesignNote requires confirmation", async () => {
    const project = seedProject("ToolL");
    const created = await getTool("addDesignNote").handler(
      { projectId: String(project._id), parentType: "project", text: "Temporary note" },
      { user }
    );
    const noteId = created.designNote._id;

    const first = await getTool("deleteDesignNote").handler(
      { id: noteId },
      { user, requestId: "turn-1" }
    );
    assert.equal(first.status, "confirmation_required");

    const done = await getTool("deleteDesignNote").handler(
      { id: noteId, confirmed: true },
      { user }
    );
    assert.equal(done.status, "completed");

    const notes = await getTool("getDesignNotes").handler({ projectId: String(project._id) }, { user });
    assert.equal(notes.designNotes.length, 0);
  });
});