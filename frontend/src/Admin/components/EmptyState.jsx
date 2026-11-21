export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={26} />
        </div>
      )}
      <div>
        <h3 className="font-display font-bold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-text_secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
