type Props = {
  className?: string;
};

export function Skeleton({ className = "" }: Props) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <Skeleton className="mb-3 h-8 w-24" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

export function StatsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className={`mb-10 grid grid-cols-2 gap-4 xl:grid-cols-${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <main className="min-h-screen bg-[#F7F8FC] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <StatsSkeleton />
        <ListSkeleton />
      </div>
    </main>
  );
}
