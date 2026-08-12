import { getMeta } from "../data/constants";

export default function StatusBadge({ list, value, dot = true }) {
  const meta = getMeta(list, value);
  if (!meta.label || meta.label === "—") return null;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta.badge}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />}
      {meta.label}
    </span>
  );
}
