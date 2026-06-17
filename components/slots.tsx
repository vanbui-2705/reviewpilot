"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Inbox } from "lucide-react";

type AdStatus = "loading" | "ready" | "error" | "empty";

type AdSlotProps = {
  label: string;
  /** Width class — useful for responsive slots */
  widthClass?: string;
  /** Height in px (min-h) for compact slots */
  minHeight?: number;
  /** Compact shorthand — sets minHeight to 256px for backward compat */
  compact?: boolean;
  /** Force a specific ad status (for testing) */
  forcedStatus?: AdStatus;
  /** Custom class */
  className?: string;
};

/**
 * Production-grade ad slot component.
 *
 * States:
 * - loading   → skeleton shimmer
 * - ready     → placeholder box (swap with real ad tag)
 * - error     → inline error notice
 * - empty     → empty state (no ad available)
 */
export function AdSlot({
  label,
  widthClass = "w-full",
  minHeight,
  compact,
  forcedStatus,
  className = "",
}: AdSlotProps) {
  const [status, setStatus] = useState<AdStatus>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (forcedStatus) {
      setStatus(forcedStatus);
      if (forcedStatus === "error") setErrorMsg("Ad network timed out");
      return;
    }

    // Simulate async ad network init — replace with real ad tag init
    const timers = [
      // In production, hook into GPT / Prebid / Adsterra callbacks here
      setTimeout(() => setStatus("ready"), 600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [forcedStatus]);

  const resolvedMinHeight = compact ? 256 : minHeight ?? 160;
  const heightStyle = { minHeight: resolvedMinHeight };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-dashed border-orange-200 bg-orange-50/60 ${widthClass} ${className}`}
      style={heightStyle}
      role="complementary"
      aria-label={`Ad slot: ${label}`}
    >
      {/* ── Loading state ── */}
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center gap-3 p-4 h-full">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
            <span className="font-mono text-[11px] font-medium text-orange-600/70 uppercase tracking-wider">
              Đang tải quảng cáo...
            </span>
          </div>
          {/* Skeleton bars */}
          <div className="w-full space-y-2">
            <div className="h-2 w-3/4 animate-pulse rounded bg-orange-200/60" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-orange-200/40" style={{ animationDelay: "100ms" }} />
            <div className="h-2 w-5/6 animate-pulse rounded bg-orange-200/40" style={{ animationDelay: "200ms" }} />
          </div>
        </div>
      )}

      {/* ── Ready state ── */}
      {status === "ready" && (
        <div className="flex flex-col items-center justify-center gap-2 p-4 h-full text-center">
          <Inbox className="h-6 w-6 text-orange-400/50" />
          <span className="font-extrabold text-[13px] text-orange-900/80">{label}</span>
          <p className="max-w-xs text-[11px] leading-relaxed text-orange-800/60">
            Placeholder — gắn AdSense, Adsterra, PropellerAds hoặc direct ad tag tại đây.
          </p>
          <span className="font-mono text-[9px] uppercase tracking-widest text-orange-700/40">
            [ ad-ready ]
          </span>
        </div>
      )}

      {/* ── Error state ── */}
      {status === "error" && (
        <div className="flex flex-col items-center justify-center gap-2 p-4 h-full text-center">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-red-600">
            Ad load failed
          </span>
          <p className="max-w-xs text-[11px] text-red-500/80">{errorMsg}</p>
          <button
            type="button"
            onClick={() => setStatus("loading")}
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-500 underline decoration-dotted underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {status === "empty" && (
        <div className="flex flex-col items-center justify-center gap-1.5 p-4 h-full text-center">
          <Inbox className="h-5 w-5 text-orange-300/60" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-orange-700/50">
            No ad configured
          </span>
        </div>
      )}
    </div>
  );
}
