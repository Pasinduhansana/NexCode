export default function StatCard({ icon: Icon, label, value, accent = "text-primary", sub }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={20} />
        </div>
        <span className="text-[11px] uppercase tracking-wider text-text_muted">{label}</span>
      </div>
      <div className={`mt-4 font-display text-3xl font-extrabold ${accent}`}>{value}</div>
      {sub && <p className="mt-1 text-xs text-text_secondary">{sub}</p>}
    </div>
  );
}
