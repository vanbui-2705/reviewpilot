export default function Loading() {
  return (
    <main className="mx-auto min-h-[60vh] w-[min(1180px,calc(100%-32px))] py-10">
      <div className="h-7 w-56 animate-pulse rounded-lg bg-line/70" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-line/60" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <div className="h-32 animate-pulse rounded-lg bg-soft" />
            <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-line/60" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-line/50" />
          </div>
        ))}
      </div>
    </main>
  );
}
