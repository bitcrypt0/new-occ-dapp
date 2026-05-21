import { cn } from "@/lib/cn";

/** The rotated rubber-stamp mark shown on Citizens with locked traits. */
export function LockStamp({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex -rotate-[14deg] items-center gap-1 border-2 border-red bg-paper/90 font-display uppercase tracking-wider text-red",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-sm",
      )}
    >
      <svg viewBox="0 0 24 24" className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} aria-hidden>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          d="M7 11V8a5 5 0 0 1 10 0v3"
        />
        <rect
          x="4"
          y="11"
          width="16"
          height="10"
          rx="1.5"
          fill="currentColor"
        />
      </svg>
      Locked
    </span>
  );
}
