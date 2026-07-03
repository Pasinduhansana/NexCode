export default function SectionLabel({ icon: Icon, content }) {
  return (
    <div className="mb-4 inline-flex mx-auto md:ml-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-1 text-xs font-medium text-foreground-soft">
      {Icon ? <Icon className="text-primary text-sm flex-shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
      {content}
    </div>
  );
}
