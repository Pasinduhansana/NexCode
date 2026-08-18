import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineSparkles,
  HiOutlineMenu,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineChatAlt2,
  HiOutlineX,
} from "react-icons/hi";
import usePageTitle from "../../utils/usePageTitle";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import PremiumSelect from "../components/PremiumSelect";
import DesignerSidebar from "../components/Designer/DesignerSidebar";
import DesignerReferenceCard from "../components/Designer/DesignerReferenceCard";
import DesignerReferenceModal from "../components/Designer/DesignerReferenceModal";
import DesignerSectionModal from "../components/Designer/DesignerSectionModal";
import DesignerNotesPanel from "../components/Designer/DesignerNotesPanel";
import {
  listProjects,
  listDesignSections,
  createDesignSection,
  updateDesignSection,
  deleteDesignSection,
  listDesignReferences,
  createDesignReference,
  updateDesignReference,
  reorderDesignReference,
  deleteDesignReference,
  listDesignNotes,
  createDesignNote,
  updateDesignNote,
  deleteDesignNote,
} from "../utils/designerApi";
import { DESIGN_REFERENCE_TYPES } from "../utils/designerApi";

const SORT_OPTIONS = [
  { value: "manual", label: "Manual order" },
  { value: "recent", label: "Recently updated" },
  { value: "created", label: "Recently added" },
  { value: "title", label: "Title A–Z" },
];

const STORAGE_KEY = "nexcode_designer_project";

export default function AdminDesignerPage() {
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [sections, setSections] = useState([]);
  const [references, setReferences] = useState([]);
  const [notes, setNotes] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const [selectedKey, setSelectedKey] = useState("all");
  const [selectedReference, setSelectedReference] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sort, setSort] = useState("manual");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionEditing, setSectionEditing] = useState(null);
  const [referenceModalOpen, setReferenceModalOpen] = useState(false);
  const [referenceEditing, setReferenceEditing] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null);
  const [deletingReference, setDeletingReference] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [busyNote, setBusyNote] = useState(false);

  usePageTitle("Designer");

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const data = await listProjects();
      setProjects(data);
      setSelectedProjectId((prev) => {
        if (prev && data.some((p) => String(p._id) === prev)) return prev;
        return data[0] ? String(data[0]._id) : "";
      });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to load projects");
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const fetchWorkspace = useCallback(async (projectId, { silent = false } = {}) => {
    if (!projectId) {
      setSections([]);
      setReferences([]);
      setNotes([]);
      return;
    }
    if (!silent) setSectionsLoading(true);
    try {
      const [secs, refs, noteDocs] = await Promise.all([
        listDesignSections(projectId),
        listDesignReferences(projectId),
        listDesignNotes(projectId),
      ]);
      setSections(secs);
      setReferences(refs);
      setNotes(noteDocs);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to load designer data");
    } finally {
      if (!silent) setSectionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    setSelectedKey("all");
    setSelectedReference(null);
    setSearch("");
    setTypeFilter("all");
    setTagFilter("all");
    setNotesPanelOpen(false);
    fetchWorkspace(selectedProjectId);
  }, [selectedProjectId, fetchWorkspace]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && selectedProjectId) {
        fetchWorkspace(selectedProjectId, { silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [selectedProjectId, fetchWorkspace]);

  useEffect(() => {
    try {
      if (selectedProjectId) localStorage.setItem(STORAGE_KEY, selectedProjectId);
    } catch {}
  }, [selectedProjectId]);

  const counts = useMemo(() => {
    const out = { all: references.length, uncategorized: 0 };
    for (const section of sections) {
      const key = `section:${String(section._id)}`;
      out[key] = references.filter((r) => String(r.sectionId || "") === String(section._id)).length;
    }
    for (const r of references) {
      if (!r.sectionId) out.uncategorized += 1;
    }
    return out;
  }, [references, sections]);

  const noteCountFor = useCallback(
    (parentType, parentId) =>
      notes.filter((n) => n.parentType === parentType && String(n.parentId) === String(parentId)).length,
    [notes]
  );

  const allTags = useMemo(() => {
    const seen = new Set();
    for (const r of references) {
      for (const tag of Array.isArray(r.tags) ? r.tags : []) seen.add(tag);
    }
    return [...seen].sort((a, b) => a.localeCompare(b));
  }, [references]);

  const selectedSection = useMemo(() => {
    if (!selectedKey || selectedKey === "all" || selectedKey === "uncategorized") return null;
    return sections.find((s) => String(s._id) === selectedKey) || null;
  }, [selectedKey, sections]);

  const filteredReferences = useMemo(() => {
    let list = references;
    if (selectedKey === "uncategorized") {
      list = list.filter((r) => !r.sectionId);
    } else if (selectedKey !== "all") {
      list = list.filter((r) => String(r.sectionId || "") === String(selectedKey));
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const tags = Array.isArray(r.tags) ? r.tags.join(" ").toLowerCase() : "";
        return (
          (r.title || "").toLowerCase().includes(q) ||
          (r.url || "").toLowerCase().includes(q) ||
          (r.notes || "").toLowerCase().includes(q) ||
          tags.includes(q)
        );
      });
    }
    if (typeFilter !== "all") list = list.filter((r) => r.type === typeFilter);
    if (tagFilter !== "all") {
      list = list.filter((r) => (Array.isArray(r.tags) ? r.tags : []).includes(tagFilter));
    }

    if (sort === "recent") {
      list = [...list].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    } else if (sort === "created") {
      list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sort === "title") {
      list = [...list].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }
    return list;
  }, [references, selectedKey, search, typeFilter, tagFilter, sort]);

  const groupedReferences = useMemo(() => {
    if (selectedKey !== "all") return null;
    const groups = [];
    for (const section of sections) {
      const items = filteredReferences.filter((r) => String(r.sectionId || "") === String(section._id));
      if (items.length) groups.push({ key: String(section._id), name: section.name, items });
    }
    const uncat = filteredReferences.filter((r) => !r.sectionId);
    if (uncat.length) groups.push({ key: "uncategorized", name: "Uncategorized", items: uncat });
    return groups;
  }, [filteredReferences, sections, selectedKey]);

  const contextNotes = useMemo(() => {
    if (selectedReference) {
      return notes.filter(
        (n) => n.parentType === "reference" && String(n.parentId) === String(selectedReference._id)
      );
    }
    if (selectedSection) {
      return notes.filter(
        (n) => n.parentType === "section" && String(n.parentId) === String(selectedSection._id)
      );
    }
    return notes.filter((n) => n.parentType === "project");
  }, [notes, selectedReference, selectedSection]);

  const handleSelectProject = useCallback((projectId) => {
    setSelectedProjectId(projectId);
  }, []);

  const handleSelectKey = useCallback((key) => {
    setSelectedKey(key);
    setSelectedReference(null);
    setSidebarOpen(false);
  }, []);

  const handleSaveSection = async (payload, section) => {
    if (section) {
      const updated = await updateDesignSection(section._id, payload);
      setSections((prev) => prev.map((s) => (String(s._id) === String(updated._id) ? updated : s)));
      toast.success("Section updated");
    } else {
      const created = await createDesignSection({ ...payload, projectId: selectedProjectId });
      setSections((prev) => [...prev, created]);
      setSelectedKey(String(created._id));
      toast.success("Section created");
    }
  };

  const handleDeleteSection = async () => {
    if (!deletingSection) return;
    setDeletingLoading(true);
    try {
      await deleteDesignSection(deletingSection._id);
      toast.success("Section deleted");
      setSections((prev) => prev.filter((s) => String(s._id) !== String(deletingSection._id)));
      setReferences((prev) =>
        prev.map((r) =>
          String(r.sectionId || "") === String(deletingSection._id) ? { ...r, sectionId: null } : r
        )
      );
      setNotes((prev) =>
        prev.filter((n) => !(n.parentType === "section" && String(n.parentId) === String(deletingSection._id)))
      );
      if (selectedKey === String(deletingSection._id)) setSelectedKey("all");
      if (selectedReference && String(selectedReference.sectionId || "") === String(deletingSection._id)) {
        setSelectedReference(null);
      }
      setDeletingSection(null);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete section");
    } finally {
      setDeletingLoading(false);
    }
  };

  const handleSaveReference = async (payload, reference) => {
    if (reference) {
      const updated = await updateDesignReference(reference._id, payload);
      setReferences((prev) => prev.map((r) => (String(r._id) === String(updated._id) ? updated : r)));
      setSelectedReference((prev) =>
        prev && String(prev._id) === String(updated._id) ? { ...updated } : prev
      );
      toast.success("Reference updated");
    } else {
      const created = await createDesignReference({ ...payload, projectId: selectedProjectId });
      setReferences((prev) => [...prev, created]);
      if (selectedKey !== "all" && selectedKey !== "uncategorized" && created.sectionId !== selectedKey) {
        // keep current section selected; reference appears under its own section in "all"
      }
      toast.success("Reference added");
    }
  };

  const handleMoveReference = async (id, direction) => {
    try {
      const updated = await reorderDesignReference(id, direction);
      setReferences((prev) => prev.map((r) => (String(r._id) === String(updated._id) ? updated : r)));
      toast.success(`Moved ${direction}`);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to reorder reference");
    }
  };

  const handleDeleteReference = async () => {
    if (!deletingReference) return;
    setDeletingLoading(true);
    try {
      await deleteDesignReference(deletingReference._id);
      toast.success("Reference deleted");
      setReferences((prev) => prev.filter((r) => String(r._id) !== String(deletingReference._id)));
      setSelectedReference((prev) => (prev && String(prev._id) === String(deletingReference._id) ? null : prev));
      setDeletingReference(null);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete reference");
    } finally {
      setDeletingLoading(false);
    }
  };

  const handleAddNote = async (text) => {
    setBusyNote(true);
    try {
      let payload;
      if (selectedReference) {
        payload = { parentType: "reference", parentId: String(selectedReference._id) };
      } else if (selectedSection) {
        payload = { parentType: "section", parentId: String(selectedSection._id) };
      } else {
        payload = { parentType: "project", parentId: String(selectedProjectId) };
      }
      const note = await createDesignNote({ ...payload, text, projectId: selectedProjectId });
      setNotes((prev) => [...prev, note]);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to add note");
    } finally {
      setBusyNote(false);
    }
  };

  const handleEditNote = async (note, text) => {
    setBusyNote(true);
    try {
      const updated = await updateDesignNote(note._id, { text });
      setNotes((prev) => prev.map((n) => (String(n._id) === String(updated._id) ? updated : n)));
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update note");
    } finally {
      setBusyNote(false);
    }
  };

  const handleDeleteNote = async (note) => {
    setBusyNote(true);
    try {
      await deleteDesignNote(note._id);
      setNotes((prev) => prev.filter((n) => String(n._id) !== String(note._id)));
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete note");
    } finally {
      setBusyNote(false);
    }
  };

  const refreshAll = () => {
    fetchWorkspace(selectedProjectId);
  };

  const workspaceTitle = selectedReference
    ? "Reference"
    : selectedSection
      ? selectedSection.name
      : selectedKey === "uncategorized"
        ? "Uncategorized"
        : "All references";

  const workspaceSubtitle = selectedSection
    ? `${counts[`section:${String(selectedSection._id)}`] || 0} reference${
        counts[`section:${String(selectedSection._id)}`] === 1 ? "" : "s"
      } · ${noteCountFor("section", selectedSection._id)} note${
        noteCountFor("section", selectedSection._id) === 1 ? "" : "s"
      }`
    : `${filteredReferences.length} reference${filteredReferences.length === 1 ? "" : "s"}`;

  if (projectsLoading) return <Spinner label="Loading projects..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">Designer Workspace</h1>
          <p className="mt-1 text-sm text-text_secondary">
            Organize design references and notes by project and page/section.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/assistant"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <HiOutlineChatAlt2 size={16} className="text-primary" />
            <span className="hidden sm:inline">Ask AI</span>
          </Link>
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            title="Refresh designer data"
          >
            <HiOutlineRefresh size={16} className="text-primary" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setReferenceEditing(null);
              setReferenceModalOpen(true);
            }}
            disabled={!selectedProjectId}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary_hover disabled:opacity-50"
          >
            <HiOutlinePlus size={16} />
            Add Reference
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={HiOutlineSparkles}
          title="No projects yet"
          description="Create a project first, then design references can be organized here."
        />
      ) : (
        <div className="flex h-[calc(100dvh-15rem)] min-h-[28rem] gap-4 sm:h-[calc(100dvh-16rem)] lg:h-[calc(100dvh-18rem)]">
          {/* Desktop sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <DesignerSidebar
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={handleSelectProject}
              sections={sections}
              counts={counts}
              selectedKey={selectedKey}
              onSelect={handleSelectKey}
              onCreateSection={() => {
                setSectionEditing(null);
                setSectionModalOpen(true);
              }}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>

          {/* Mobile drawer */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div
            className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85%] transform flex-col p-3 transition-transform duration-200 lg:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <DesignerSidebar
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={handleSelectProject}
              sections={sections}
              counts={counts}
              selectedKey={selectedKey}
              onSelect={handleSelectKey}
              onCreateSection={() => {
                setSectionEditing(null);
                setSectionModalOpen(true);
                setSidebarOpen(false);
              }}
              onClose={() => setSidebarOpen(false)}
            />
          </div>

          {/* Center workspace */}
          <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-1.5 text-text_secondary hover:bg-muted lg:hidden"
                aria-label="Open project navigation"
              >
                <HiOutlineMenu size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-sm font-bold text-foreground">{workspaceTitle}</h2>
                <p className="truncate text-[11px] text-text_muted">{workspaceSubtitle}</p>
              </div>
              {selectedSection && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSectionEditing(selectedSection);
                      setSectionModalOpen(true);
                    }}
                    className="rounded-lg p-1.5 text-text_secondary transition-colors hover:bg-muted hover:text-foreground"
                    title="Rename section"
                  >
                    <HiOutlinePencilAlt size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingSection(selectedSection)}
                    className="rounded-lg p-1.5 text-text_secondary transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                    title="Delete section"
                  >
                    <HiOutlineTrash size={15} />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setNotesPanelOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text_secondary transition-colors hover:bg-muted xl:hidden"
                title="Toggle notes"
              >
                <HiOutlineChatAlt2 size={13} />
                Notes
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-2.5 border-b border-border px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <HiOutlineSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
                  <input
                    className="input-field pl-9"
                    placeholder="Search title, URL, notes, tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PremiumSelect
                    compact
                    className="min-w-[120px]"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[
                      { value: "all", label: "All types" },
                      ...DESIGN_REFERENCE_TYPES.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) })),
                    ]}
                  />
                  <PremiumSelect
                    compact
                    className="min-w-[130px]"
                    value={tagFilter}
                    onChange={setTagFilter}
                    options={[
                      { value: "all", label: "All tags" },
                      ...allTags.map((t) => ({ value: t, label: `#${t}` })),
                    ]}
                  />
                  <PremiumSelect
                    compact
                    className="min-w-[150px]"
                    value={sort}
                    onChange={setSort}
                    options={SORT_OPTIONS}
                  />
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto bg-page-alt/40 p-4 sm:p-5">
              {sectionsLoading ? (
                <Spinner label="Loading references..." />
              ) : filteredReferences.length === 0 ? (
                <EmptyState
                  icon={HiOutlineSparkles}
                  title="No references here yet"
                  description={
                    search || typeFilter !== "all" || tagFilter !== "all"
                      ? "Try adjusting your search or filters."
                      : "Add your first design reference, or ask the AI Assistant to save one."
                  }
                  action={
                    !search && typeFilter === "all" && tagFilter === "all" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setReferenceEditing(null);
                          setReferenceModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary_hover"
                      >
                        <HiOutlinePlus size={16} />
                        Add Reference
                      </button>
                    ) : null
                  }
                />
              ) : groupedReferences ? (
                <div className="space-y-6">
                  {groupedReferences.map((group) => (
                    <div key={group.key}>
                      <div className="mb-2.5 flex items-center gap-2">
                        <span className="font-display text-xs font-bold uppercase tracking-wider text-text_muted">
                          {group.name}
                        </span>
                        <span className="h-px flex-1 bg-border" />
                        <span className="text-[11px] text-text_muted">{group.items.length}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                        {group.items.map((ref, index, arr) => (
                          <DesignerReferenceCard
                            key={String(ref._id)}
                            reference={ref}
                            selected={selectedReference && String(selectedReference._id) === String(ref._id)}
                            onSelect={(r) => {
                              setSelectedReference(r);
                              setNotesPanelOpen(true);
                            }}
                            onEdit={() => {
                              setReferenceEditing(ref);
                              setReferenceModalOpen(true);
                            }}
                            onDelete={() => setDeletingReference(ref)}
                            onMoveUp={() => handleMoveReference(ref._id, "up")}
                            onMoveDown={() => handleMoveReference(ref._id, "down")}
                            canMoveUp={index > 0}
                            canMoveDown={index < arr.length - 1}
                            showReorder={sort === "manual"}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredReferences.map((ref, index, arr) => (
                    <DesignerReferenceCard
                      key={String(ref._id)}
                      reference={ref}
                      selected={selectedReference && String(selectedReference._id) === String(ref._id)}
                      onSelect={(r) => {
                        setSelectedReference(r);
                        setNotesPanelOpen(true);
                      }}
                      onEdit={() => {
                        setReferenceEditing(ref);
                        setReferenceModalOpen(true);
                      }}
                      onDelete={() => setDeletingReference(ref)}
                      onMoveUp={() => handleMoveReference(ref._id, "up")}
                      onMoveDown={() => handleMoveReference(ref._id, "down")}
                      canMoveUp={index > 0}
                      canMoveDown={index < arr.length - 1}
                      showReorder={sort === "manual"}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Desktop notes panel */}
          <aside className="hidden w-80 shrink-0 xl:block">
            <DesignerNotesPanel
              title={selectedReference ? selectedReference.title : selectedSection ? selectedSection.name : selectedProjectId ? projects.find((p) => String(p._id) === selectedProjectId)?.name || "Project" : "Project"}
              subtitle={selectedReference ? "Reference notes" : selectedSection ? "Section notes" : "Project notes"}
              notes={contextNotes}
              onAdd={handleAddNote}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              reference={selectedReference}
              onClearReference={() => setSelectedReference(null)}
              busy={busyNote}
            />
          </aside>

          {/* Mobile notes drawer */}
          {notesPanelOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm xl:hidden"
              onClick={() => setNotesPanelOpen(false)}
            />
          )}
          <div
            className={`fixed inset-y-0 right-0 z-40 flex w-80 max-w-[90%] transform flex-col p-3 transition-transform duration-200 xl:hidden ${
              notesPanelOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setNotesPanelOpen(false)}
                className="rounded-lg bg-card p-1.5 text-text_secondary hover:bg-muted"
                aria-label="Close notes"
              >
                <HiOutlineX size={16} />
              </button>
            </div>
            <DesignerNotesPanel
              title={selectedReference ? selectedReference.title : selectedSection ? selectedSection.name : "Project"}
              subtitle={selectedReference ? "Reference notes" : selectedSection ? "Section notes" : "Project notes"}
              notes={contextNotes}
              onAdd={handleAddNote}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              reference={selectedReference}
              onClearReference={() => setSelectedReference(null)}
              busy={busyNote}
            />
          </div>
        </div>
      )}

      <DesignerSectionModal
        open={sectionModalOpen}
        section={sectionEditing}
        onClose={() => {
          setSectionModalOpen(false);
          setSectionEditing(null);
        }}
        onSaved={handleSaveSection}
      />

      <DesignerReferenceModal
        open={referenceModalOpen}
        reference={referenceEditing}
        sections={sections}
        defaultSectionId={selectedKey !== "all" && selectedKey !== "uncategorized" ? selectedKey : ""}
        onClose={() => {
          setReferenceModalOpen(false);
          setReferenceEditing(null);
        }}
        onSaved={handleSaveReference}
      />

      <ConfirmDialog
        open={Boolean(deletingSection)}
        title="Delete section?"
        message={
          deletingSection
            ? `This will delete "${deletingSection.name}". Its references stay saved (they move to Uncategorized) and its notes are removed.`
            : ""
        }
        loading={deletingLoading}
        onConfirm={handleDeleteSection}
        onCancel={() => setDeletingSection(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingReference)}
        title="Delete reference?"
        message={deletingReference ? `Permanently delete "${deletingReference.title}" and its notes?` : ""}
        loading={deletingLoading}
        onConfirm={handleDeleteReference}
        onCancel={() => setDeletingReference(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingNote)}
        title="Delete note?"
        message="Permanently remove this note?"
        loading={busyNote}
        onConfirm={async () => {
          if (!deletingNote) return;
          await handleDeleteNote(deletingNote);
          setDeletingNote(null);
        }}
        onCancel={() => setDeletingNote(null)}
      />
    </div>
  );
}