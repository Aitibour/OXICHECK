export default function CheckinLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse" aria-label="Loading check-in form">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-gray-200" />
          <div>
            <div className="h-5 w-40 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </div>

      {/* Progress bar skeleton */}
      <div className="flex gap-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
            <div className="h-0.5 flex-1 bg-gray-200 hidden sm:block" />
          </div>
        ))}
      </div>

      {/* Form skeleton */}
      <div className="card p-6 space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-72 bg-gray-200 rounded" />
        <div className="space-y-4 mt-6">
          <div className="h-10 w-full bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
