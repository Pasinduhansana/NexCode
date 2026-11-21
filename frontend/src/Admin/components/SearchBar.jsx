import { HiOutlineSearch } from "react-icons/hi";

export default function SearchBar({ value, onChange, placeholder = "Search by name, client, or tag...", className = "" }) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <HiOutlineSearch size={18} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-text_muted" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          rounded-lg
          border-[2px]
          border-border
          bg-background
          px-4
          py-2.5
          pl-10
          text-sm
          text-foreground
          outline-none
          transition-colors
          duration-200
          placeholder:text-text_muted
          hover:border-[rgb(54_153_243_/_0.4)]
          focus:border-[rgb(54_153_243_/_0.4)]
        "
      />
    </div>
  );
}
