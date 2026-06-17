"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Download,
  Link as LinkIcon,
  ShieldCheck,
  FileVideo,
  Music,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Terminal as TerminalIcon,
  Zap,
  Wifi,
  ChevronRight,
  X,
  ArrowRight,
} from "lucide-react";

type FormatOpt = {
  id: string;
  label: string;
  ext: string;
  size: string | null;
  downloadUrl: string;
};

type DownloadResult = {
  ok: boolean;
  error?: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
  formats?: FormatOpt[];
  platform?: string;
};

const PLATFORM_META: Record<string, { label: string; color: string; icon: string }> = {
  youtube: { label: "YT", color: "text-red-400 border-red-500/30 bg-red-500/10", icon: "▶" },
  tiktok: { label: "TK", color: "text-white border-white/20 bg-white/5", icon: "♪" },
  facebook: { label: "FB", color: "text-blue-400 border-blue-500/30 bg-blue-500/10", icon: "f" },
  instagram: { label: "IG", color: "text-pink-400 border-pink-500/30 bg-pink-500/10", icon: "◉" },
};

/* ── ASCII art header for empty state ── */
const TERMINAL_HEADER = `
╔══════════════════════════════════════════╗
║   REVIEWPILOT // VIDEO_DOWNLOADER v2.4   ║
╚══════════════════════════════════════════╝`;

/* ── Animated system ticker lines ── */
function SystemTicker() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 4), 2200);
    return () => clearInterval(id);
  }, []);

  const lines = [
    "[SYS] Engine ready — awaiting input",
    "[NET] Resolver online — 4 platforms supported",
    "[SEC] No-log policy active",
    `[MEM] Buffer ${(Math.random() * 64 + 32).toFixed(0)}MB free`,
  ];

  return (
    <div className="h-5 overflow-hidden">
      {lines.map((line, i) => (
        <div
          key={line}
          className={`text-[11px] font-mono transition-all duration-500 ${
            i === tick ? "text-terminal-green opacity-100" : "opacity-0"
          }`}
        >
          {line}
        </div>
      ))}
    </div>
  );
}

export function DownloaderForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleResolve = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!url.trim()) return;
      setLoading(true);
      setResult(null);
      setDownloadedId(null);
      setHistory((h) => [url.trim(), ...h.filter((s) => s !== url.trim())].slice(0, 5));

      try {
        const res = await fetch("/api/download/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
        });
        const payload = (await res.json()) as DownloadResult;
        setResult(payload);
      } catch {
        setResult({
          ok: false,
          error: "Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền và thử lại.",
        });
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  const handleDownload = useCallback(async (fmt: FormatOpt) => {
    setDownloadingId(fmt.id);
    setDownloadedId(null);
    try {
      const res = await fetch(fmt.downloadUrl);
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const disposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename="(.+?)"/);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filenameMatch?.[1] || `${fmt.label.replace(/\s+/g, "_")}_${Date.now()}.${fmt.ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      setDownloadedId(fmt.id);
    } catch (err: any) {
      alert(`Tải file thất bại: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const handleClear = useCallback(() => {
    setUrl("");
    setResult(null);
    setDownloadedId(null);
    inputRef.current?.focus();
  }, []);

  const handleHistoryClick = useCallback((item: string) => {
    setUrl(item);
    setResult(null);
    setDownloadedId(null);
    inputRef.current?.focus();
  }, []);

  const isLoadingAny = loading || !!downloadingId;

  return (
    <div className="w-full">
      {/* ── Shell ── */}
      <div className="terminal-card rounded-xl overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-white/5 bg-[#0a0f1d] px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="font-mono text-[11px] font-medium text-white/30 tracking-wider">
              reviewpilot://dl
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isFocused && <span className="font-mono text-[10px] text-amber-400/80 animate-pulse">● LIVE</span>}
            <Wifi className="h-3 w-3 text-terminal-green" />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="relative grid-pattern p-5 md:p-6">
          {/* ── Empty state ── */}
          {!result && !loading && (
            <div className="flex flex-col items-center gap-5">
              <pre className="font-mono text-[10px] leading-tight text-white/10 select-none hidden md:block">
                {TERMINAL_HEADER}
              </pre>
              <div className="flex w-full max-w-2xl flex-col gap-4">
                {/* Terminal prompt line */}
                <div className="flex items-center gap-2 font-mono text-xs text-white/40">
                  <span className="text-amber-400">❯</span>
                  <span className="text-white/25">paste_link --platform any</span>
                </div>

                <form onSubmit={handleResolve} className="relative">
                  <div
                    className={`relative flex items-center rounded-lg border transition-all duration-300 ${
                      isFocused
                        ? "border-amber-500/60 bg-[#0f172a] shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                        : "border-white/10 bg-[#0d1525]"
                    }`}
                  >
                    <LinkIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-white/25" />
                    <input
                      ref={inputRef}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      required
                      spellCheck={false}
                      placeholder="https://..."
                      className="font-mono w-full bg-transparent py-3.5 pl-10 pr-24 text-sm text-white/90 placeholder:text-white/20 focus:outline-none"
                    />
                    <div className="absolute right-1.5 flex items-center gap-1">
                      {url && !loading && (
                        <button
                          type="button"
                          onClick={handleClear}
                          className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
                          aria-label="Xóa"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={loading || !url.trim()}
                        className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:bg-amber-400 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {loading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <TerminalIcon className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {loading ? "Scanning..." : "Resolve"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* History strip */}
                  {history.length > 0 && !isFocused && !result && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1">
                      <Clock className="h-3 w-3 shrink-0 text-white/20" />
                      {history.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => handleHistoryClick(h)}
                          className="font-mono text-[10px] text-white/30 transition-colors hover:text-amber-400/70 truncate max-w-[200px]"
                          title={h}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  )}
                </form>

                {/* Platform badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {Object.entries(PLATFORM_META).map(([key, m]) => (
                    <span
                      key={key}
                      className={`font-mono text-[10px] font-bold uppercase tracking-widest rounded border px-2 py-0.5 ${m.color}`}
                    >
                      {m.label}
                    </span>
                  ))}
                  <span className="font-mono text-[10px] text-white/20 ml-2">
                    // max 4K, no watermark
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Loading state ── */}
          {loading && (
            <div className="flex flex-col items-center gap-5 py-8">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <TerminalIcon className="h-4 w-4 text-amber-400/60" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-400/80">
                  Resolving URL
                </span>
                <SystemTicker />
              </div>
              <div className="w-full max-w-xs">
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-500/0 via-amber-500/60 to-amber-500/0 animate-[slideInLeft_1.5s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          )}

          {/* ── Error state ── */}
          {result && !result.ok && (
            <div className="flex flex-col gap-4">
              {/* Error output */}
              <div className="terminal-card-inner rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <div className="flex-1">
                    <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-red-400">
                      ERR_RESOLVE_FAILED
                    </div>
                    <p className="mt-1.5 text-sm text-red-300/80 leading-relaxed">{result.error}</p>
                  </div>
                </div>
              </div>

              {/* Back to input */}
              <button
                type="button"
                onClick={handleClear}
                className="mx-auto flex items-center gap-2 font-mono text-xs text-white/30 transition-colors hover:text-white/60"
              >
                <ArrowRight className="h-3 w-3 rotate-180" />
                <span className="uppercase tracking-widest">Try another link</span>
              </button>
            </div>
          )}

          {/* ── Result state ── */}
          {result?.ok && (
            <div className="flex flex-col gap-5">
              {/* Success banner */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-terminal-green">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="font-bold uppercase tracking-widest">OK_RESOLVED</span>
                <span className="text-white/20">//</span>
                <span className="text-white/50 truncate max-w-[300px]">{result.title}</span>
              </div>

              <div className="flex flex-col gap-5 lg:flex-row">
                {/* Thumbnail */}
                <div className="shrink-0 lg:w-64">
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#0a0f1d]">
                    {result.thumbnail ? (
                      <img
                        src={result.thumbnail}
                        alt={result.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-white/20 text-xs">
                        NO_THUMB
                      </div>
                    )}
                    {result.platform && PLATFORM_META[result.platform] && (
                      <span
                        className={`absolute left-2 top-2 font-mono text-[10px] font-bold uppercase tracking-widest rounded border px-1.5 py-0.5 ${PLATFORM_META[result.platform].color}`}
                      >
                        {PLATFORM_META[result.platform].label}
                      </span>
                    )}
                    {result.duration && (
                      <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 font-mono text-[10px] font-bold text-white">
                        {result.duration}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info + formats */}
                <div className="flex-1 min-w-0">
                  {result.duration && (
                    <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] text-white/40">
                      <Clock className="h-3 w-3" />
                      {result.duration}
                    </div>
                  )}
                  <h3 className="font-mono text-sm font-bold leading-snug text-white/85 line-clamp-2">
                    {result.title}
                  </h3>

                  {/* Format grid */}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {result.formats?.map((fmt) => {
                      const isVideo = fmt.ext === "mp4" || fmt.ext === "webm";
                      const isDownloading = downloadingId === fmt.id;
                      const isDone = downloadedId === fmt.id;
                      const isBusy = !!downloadingId && !isDownloading;

                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => handleDownload(fmt)}
                          disabled={isDownloading || isBusy}
                          className={`group relative flex items-center gap-3 rounded-lg border p-3.5 text-left font-mono text-xs transition-all duration-200 ${
                            isDone
                              ? "border-terminal-green/40 bg-terminal-green/5 text-terminal-green"
                              : isDownloading
                              ? "border-amber-500/40 bg-amber-500/5 text-amber-400 cursor-wait"
                              : "border-white/10 bg-white/[0.02] text-white/70 hover:border-amber-500/30 hover:bg-amber-500/[0.04] hover:text-amber-300"
                          } ${isBusy ? "opacity-40 cursor-wait" : ""}`}
                        >
                          {/* Icon */}
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors ${
                              isDone
                                ? "bg-terminal-green/10"
                                : isDownloading
                                ? "bg-amber-500/10"
                                : "bg-white/5 group-hover:bg-amber-500/10"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : isDownloading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isVideo ? (
                              <FileVideo className="h-4 w-4" />
                            ) : (
                              <Music className="h-4 w-4" />
                            )}
                          </span>

                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold uppercase tracking-wider">{fmt.ext.toUpperCase()}</span>
                              {fmt.size && (
                                <span className="text-white/30 ml-2 shrink-0">{fmt.size}</span>
                              )}
                            </div>
                            <span className="text-white/40">{fmt.label}</span>
                            {isDownloading && (
                              <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-amber-400 animate-pulse">
                                Downloading...
                              </span>
                            )}
                            {isDone && (
                              <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-terminal-green">
                                Complete
                              </span>
                            )}
                          </div>

                          {/* Arrow */}
                          {!isDownloading && !isDone && (
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/20 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-400/60" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Security notice */}
                  <div className="mt-4 flex items-center gap-2.5 border-t border-white/5 pt-4">
                    <div className="grid h-6 w-6 place-items-center rounded-md border border-terminal-green/20 bg-terminal-green/5">
                      <ShieldCheck className="h-3 w-3 text-terminal-green" />
                    </div>
                    <div className="font-mono text-[10px] text-white/30">
                      <span className="text-terminal-green/80 font-bold">NO_LOG</span> — file processed server-side,
                      not stored after download
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer line */}
      <div className="mt-2 flex items-center justify-between px-1 font-mono text-[10px] text-white/15">
        <span>reviewpilot-engine@2.4.0</span>
        <span>{isLoadingAny ? "● processing" : "● idle"}</span>
      </div>
    </div>
  );
}
