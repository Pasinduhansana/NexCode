"use client";

import { Link as RRLink } from "react-router-dom";
import {
  HiOutlinePlus,
  HiOutlineCollection,
  HiOutlineInbox,
  HiOutlineSparkles,
  HiOutlineChatAlt2,
  HiOutlineX,
} from "react-icons/hi";
import PremiumSelect from "../PremiumSelect";

export default function DesignerSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  sections,
  counts,
  selectedKey,
  onSelect,
  onCreateSection,
  onClose,
}) {
  const uncategorizedCount = counts.uncategorized || 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] uppercase tracking-wider text-text_muted">Project</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text_secondary hover:bg-muted lg:hidden"
            aria-label="Close navigation"
          >
            <HiOutlineX size={16} />
          </button>
        </div>
        <div className="mt-2">
          <PremiumSelect
            value={selectedProjectId || ""}
            onChange={onSelectProject}
            options={projects.map((p) => ({ value: String(p._id), label: p.name }))}
            placeholder="Select a project"
          />
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        <button
          type="button"
          onClick={() => onSelect("all")}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
            selectedKey === "all" ? "bg-primary/10 text-primary" : "text-text_secondary hover:bg-muted hover:text-foreground"
          }`}
        >
          <HiOutlineCollection size={16} className="shrink-0" />
          <span className="flex-1 truncate">All references</span>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-text_muted">{counts.all || 0}</span>
        </button>

        {uncategorizedCount > 0 && (
          <button
            type="button"
            onClick={() => onSelect("uncategorized")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              selectedKey === "uncategorized"
                ? "bg-primary/10 text-primary"
                : "text-text_secondary hover:bg-muted hover:text-foreground"
            }`}
          >
            <HiOutlineInbox size={16} className="shrink-0" />
            <span className="flex-1 truncate">Uncategorized</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-text_muted">{uncategorizedCount}</span>
          </button>
        )}

        <div className="mt-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-text_muted">Pages / Sections</div>

        {sections.length === 0 && (
          <p className="px-3 py-2 text-xs text-text_muted">No design sections yet.</p>
        )}

        {sections.map((section) => {
          const key = String(section._id);
          const active = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                active ? "bg-primary/10 text-primary" : "text-text_secondary hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-primary" : "bg-text_muted/40"}`} />
              <span className="flex-1 truncate">{section.name}</span>
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-text_muted">
                {counts[`section:${key}`] || 0}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onCreateSection}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm font-medium text-text_secondary transition-colors hover:border-primary/40 hover:text-primary"
        >
          <HiOutlinePlus size={15} />
          New Section
        </button>
      </div>

      <div className="border-t border-border p-3">
        <Link
          href="/admin/assistant"
          className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-3 transition-colors hover:bg-primary/10"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HiOutlineChatAlt2 size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
              <HiOutlineSparkles size={13} className="text-primary" />
              Ask the AI Assistant
            </div>
            <p className="mt-0.5 text-[11px] leading-snug text-text_secondary">
              &quot;Create an About Us section&quot;, &quot;Move a reference to the landing page&quot;, or &quot;Summarize the design direction&quot;.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
