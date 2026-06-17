"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-2xl font-extrabold text-ink">Đã có lỗi xảy ra</h2>
      <p className="text-sm text-muted">{error.message}</p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-shopee px-4 py-2 text-sm font-extrabold text-white hover:bg-shopee/90"
      >
        Thử lại
      </button>
    </div>
  );
}
