import { HiOutlineSearch, HiOutlineX } from "react-icons/hi";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  ariaLabel = "Search",
}) {
  return (
    <div className="relative flex items-center rounded-xl border border-border bg-background focus-within:border-primary focus-within:outline-none focus-within:ring-1 focus-within:ring-primary">
      <HiOutlineSearch
        size={16}
        className="pointer-events-none ml-3 shrink-0 text-text_muted"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full bg-transparent py-2 pl-3 pr-9 text-sm text-foreground placeholder:text-text_muted focus:outline-none"
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
