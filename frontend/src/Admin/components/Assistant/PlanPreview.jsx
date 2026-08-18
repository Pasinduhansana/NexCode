import { memo } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineFolderAdd,
  HiOutlinePencilAlt,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineClipboardList,
  HiOutlineLightBulb,
  HiOutlineChip,
  HiOutlineCube,
  HiOutlineSparkles,
} from "react-icons/hi";

const fmtLKR = (n) =>
  `LKR ${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function Badge({ tone = "default", children }) {
  const tones = {
    requested: "border-primary/40 bg-primary/10 text-primary",
    recommended: "border-sky-500/40 bg-sky-500/10 text-sky-600",
    optional: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    default: "border-border bg-muted/60 text-text_secondary",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-xl border border-border bg-page p-4">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-text_secondary">
        <Icon size={14} className="text-primary" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function ScopeItem({ title, items, tone }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="mb-2 last:mb-0">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-xs font-medium text-text_secondary">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <Badge key={i} tone={tone}>
            {typeof item === "string" ? item : item.name || String(item)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function PlanPreview({ plan, input, onConfirm, onModify, creating }) {
  const pricing = plan?.pricing || {};
  const scope = plan?.scope || {};
  const timeline = plan?.timeline || {};
  const tasks = Array.isArray(plan?.tasks) ? plan.tasks : [];
  const expenses = Array.isArray(plan?.expenses) ? plan.expenses : [];
  const recommendations = Array.isArray(plan?.recommendations) ? plan.recommendations : [];
  const assumptions = Array.isArray(plan?.assumptions) ? plan.assumptions : [];

  return (
    <div data-plan-preview className="w-full max-w-3xl space-y-3 rounded-2xl border border-primary/25 bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <HiOutlineSparkles size={16} className="text-primary" />
            <h3 className="font-display text-base font-extrabold text-foreground">{plan?.name || "Project Plan"}</h3>
            <Badge tone="default">{plan?.industryLabel || plan?.industryType || "General"}</Badge>
          </div>
          {plan?.description && (
            <p className="mt-1 text-xs leading-relaxed text-text_secondary">{plan.description}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-[10px] font-medium uppercase tracking-wide text-text_muted">Estimated cost</div>
          <div className="font-display text-xl font-extrabold text-primary">{fmtLKR(pricing?.total)}</div>
          <div className="text-[10px] text-text_muted">one-time build · {pricing?.currency}</div>
        </div>
      </div>

      {timeline?.unrealistic && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
          <HiOutlineExclamation size={15} className="mt-0.5 shrink-0" />
          <span>{timeline.warning}</span>
        </div>
      )}

      <Section icon={HiOutlineClipboardList} title="Scope">
        <ScopeItem title="Requested pages" items={scope?.requestedPages} tone="requested" />
        <ScopeItem title="Recommended pages" items={scope?.recommendedPages} tone="recommended" />
        <ScopeItem title="Requested features" items={scope?.requestedFeatures} tone="requested" />
        <ScopeItem title="Recommended features" items={scope?.recommendedFeatures} tone="recommended" />
        <ScopeItem title="Optional (discuss before adding)" items={scope?.optionalFeatures} tone="optional" />
      </Section>

      <Section icon={HiOutlineCurrencyDollar} title="Pricing breakdown">
        <div className="space-y-2 text-xs">
          {Array.isArray(pricing?.pageBreakdown) && pricing.pageBreakdown.length > 0 && (
            <div>
              <div className="mb-1 font-medium text-text_secondary">Pages</div>
              {pricing.pageBreakdown.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-0.5">
                  <span className="text-foreground">{p.name}</span>
                  <span className="text-text_muted">{fmtLKR(p.cost)}</span>
                </div>
              ))}
            </div>
          )}
          {Array.isArray(pricing?.featureBreakdown) && pricing.featureBreakdown.length > 0 && (
            <div>
              <div className="mb-1 font-medium text-text_secondary">Features</div>
              {pricing.featureBreakdown.map((f, i) => (
                <div key={i} className="flex items-center justify-between py-0.5">
                  <span className="text-foreground">{f.name}</span>
                  <span className="text-text_muted">{fmtLKR(f.cost)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 space-y-1 border-t border-border pt-2">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{fmtLKR(Number(pricing?.basePrice) + Number(pricing?.featureCost))}</span>
            </div>
            {pricing?.rushAdjustment > 0 && (
              <div className="flex items-center justify-between">
                <span>Rush adjustment</span>
                <span>+{fmtLKR(pricing.rushAdjustment)}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-bold text-foreground">
              <span>Estimated total</span>
              <span className="text-primary">{fmtLKR(pricing?.total)}</span>
            </div>
          </div>
        </div>
      </Section>

      <Section icon={HiOutlineCalendar} title="Timeline & tasks">
        {timeline?.providedDays && (
          <div className="mb-2 flex flex-wrap gap-3 text-xs">
            <span className="text-text_secondary">
              Timeline: <strong className="text-foreground">{timeline.providedDays} days</strong>
              {timeline.estimatedDays ? ` (recommended ${timeline.estimatedDays})` : ""}
            </span>
            <span className="text-text_secondary">
              Tasks: <strong className="text-foreground">{tasks.length}</strong>
            </span>
          </div>
        )}
        {Array.isArray(timeline?.days) && timeline.days.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {timeline.days.map((d, i) => (
              <div key={i} className="rounded-lg bg-muted/40 px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <Badge tone="default">{d.dayLabel}</Badge>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-text_muted">{d.phase}</span>
                </div>
                <div className="mt-1 text-xs text-text_secondary">
                  {d.tasks.map((t) => t.title).join(" · ")}
                </div>
              </div>
            ))}
          </div>
        )}
        {tasks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="text-text_muted">
                  <th className="border-b border-border px-2 py-1 font-semibold">Task</th>
                  <th className="border-b border-border px-2 py-1 font-semibold">Phase</th>
                  <th className="border-b border-border px-2 py-1 font-semibold">Priority</th>
                  <th className="border-b border-border px-2 py-1 font-semibold">Days</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="border-b border-border/60 px-2 py-1 text-foreground">{t.title}</td>
                    <td className="border-b border-border/60 px-2 py-1 text-text_secondary">{t.phase}</td>
                    <td className="border-b border-border/60 px-2 py-1 text-text_secondary">{t.priority}</td>
                    <td className="border-b border-border/60 px-2 py-1 text-text_muted">
                      {t.dayStart === t.dayEnd ? t.dayStart : `${t.dayStart}–${t.dayEnd}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section icon={HiOutlineCube} title="Estimated yearly expenses">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="text-text_muted">
                <th className="border-b border-border px-2 py-1 font-semibold">Item</th>
                <th className="border-b border-border px-2 py-1 font-semibold">Category</th>
                <th className="border-b border-border px-2 py-1 font-semibold">Estimated</th>
                <th className="border-b border-border px-2 py-1 font-semibold">Frequency</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => (
                <tr key={i} className="even:bg-muted/30">
                  <td className="border-b border-border/60 px-2 py-1 text-foreground">{e.item}</td>
                  <td className="border-b border-border/60 px-2 py-1 text-text_secondary">{e.category}</td>
                  <td className="border-b border-border/60 px-2 py-1 text-text_secondary">
                    {Number(e.estimatedCost) ? fmtLKR(e.estimatedCost) : "Included"}
                  </td>
                  <td className="border-b border-border/60 px-2 py-1 text-text_muted">{e.frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10px] text-text_muted">
          Estimates only — recurring costs are not recorded to project finances automatically.
        </p>
      </Section>

      {recommendations.length > 0 && (
        <Section icon={HiOutlineLightBulb} title="Recommendations">
          <ul className="list-disc space-y-1 pl-4 text-xs text-text_secondary">
            {recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Section>
      )}

      {assumptions.length > 0 && (
        <Section icon={HiOutlineChip} title="Assumptions">
          <ul className="list-disc space-y-1 pl-4 text-xs text-text_muted">
            {assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Section>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
        <button
          type="button"
          data-action="modify-plan"
          onClick={onModify}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-text_secondary transition-colors hover:bg-muted hover:text-foreground"
        >
          <HiOutlinePencilAlt size={14} />
          Modify Plan
        </button>
        <button
          type="button"
          data-action="confirm-plan"
          onClick={onConfirm}
          disabled={creating}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <HiOutlineFolderAdd size={14} />
          )}
          Create Project
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-text_muted">
        <HiOutlineCheckCircle size={11} className="text-emerald-500" />
        Nothing is created until you confirm. Plans are regenerated from the same inputs on confirm.
      </div>
    </div>
  );
}

export default memo(PlanPreview);