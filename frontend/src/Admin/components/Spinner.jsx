export default function Spinner({ className = "h-8 w-8", label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-text_secondary">
      <div className={`${className} rounded-full border-2 border-primary/20 border-t-primary animate-spin`} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
