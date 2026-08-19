import { HiOutlineSearch, HiOutlineX } from "react-icons/hi";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  ariaLabel = "Search",
}) {
  return (
    <div className="relative flex items-center">
      <HiOutlineSearch
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text_muted"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-text_muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text_muted hover:bg-muted hover:text-foreground"
        >
          <HiOutlineX size={16} />
        </button>
      )}
    </div>
  );
}
