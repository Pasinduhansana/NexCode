export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Navbar placeholder */}
      <div className="h-16 border-b border-border/40" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 space-y-8">
        {/* Title skeleton */}
        <div className="h-10 w-3/4 bg-muted rounded-lg" />
        <div className="h-10 w-1/2 bg-muted rounded-lg" />

        {/* Content blocks */}
        <div className="space-y-4 pt-8">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-4/6 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>

        {/* Card skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted border border-border/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
