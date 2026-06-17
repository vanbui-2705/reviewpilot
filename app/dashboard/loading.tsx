export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-[1240px]">
      <div className="mb-6 border-b border-line/60 pb-6">
        <div className="h-6 w-36 animate-pulse rounded-full bg-line/70" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded-lg bg-line/70" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-line/60" />
      </div>
      <div className="grid gap-5 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-line/60" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-line/70" />
            <div className="mt-3 h-3 w-28 animate-pulse rounded bg-line/50" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-80 animate-pulse rounded-lg border border-line bg-white shadow-sm" />
        <div className="h-80 animate-pulse rounded-lg border border-line bg-white shadow-sm" />
      </div>
    </main>
  );
}
