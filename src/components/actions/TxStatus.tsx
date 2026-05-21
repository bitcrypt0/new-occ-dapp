import { cn } from "@/lib/cn";
import type { TxState } from "@/lib/types";

interface TxStatusProps {
  state: TxState;
  /** Per-state messages. Sensible comic-toned defaults provided. */
  messages?: Partial<Record<TxState, string>>;
  className?: string;
}

const DEFAULTS: Record<TxState, string> = {
  idle: "Ready when you are.",
  pending: "Inking it onto the chain…",
  success: "Done — it's on-chain forever.",
  fail: "That panel didn't print. Try again.",
};

const STYLE: Record<TxState, string> = {
  idle: "bg-paper text-ink",
  pending: "bg-sky text-ink",
  success: "bg-sage text-ink",
  fail: "bg-red text-paper",
};

function Glyph({ state }: { state: TxState }) {
  if (state === "pending") {
    return (
      <span
        aria-hidden
        className="h-4 w-4 shrink-0 rounded-full border-[3px] border-ink border-t-transparent motion-safe:animate-spin"
      />
    );
  }
  const path =
    state === "success"
      ? "M4 12l5 5L20 6"
      : state === "fail"
        ? "M6 6l12 12M18 6L6 18"
        : "M12 8v8M12 8v0";
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path d={path} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/** Visual transaction lifecycle indicator (idle / pending / success / fail). */
export function TxStatus({ state, messages, className }: TxStatusProps) {
  if (state === "idle" && !messages?.idle) return null;
  const text = messages?.[state] ?? DEFAULTS[state];
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 rounded-lg border-ink border-ink px-3 py-2 font-body text-sm font-semibold",
        STYLE[state],
        className,
      )}
    >
      <Glyph state={state} />
      {text}
    </div>
  );
}
