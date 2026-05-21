import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SpeechBubbleProps {
  children: ReactNode;
  /** Which corner the tail points from. */
  tail?: "bottom-left" | "bottom-right" | "top-left" | "none";
  tone?: "paper" | "sky" | "rose";
  className?: string;
}

const TONE = {
  paper: "bg-paper",
  sky: "bg-sky",
  rose: "bg-rose",
};

const TAIL_POS = {
  "bottom-left": "left-8 -bottom-3",
  "bottom-right": "right-8 -bottom-3",
  "top-left": "left-8 -top-3 rotate-180",
  none: "hidden",
};

/** A comic speech bubble with an ink-outlined tail. */
export function SpeechBubble({
  children,
  tail = "bottom-left",
  tone = "paper",
  className,
}: SpeechBubbleProps) {
  return (
    <div
      className={cn(
        "relative inline-block rounded-[28px] border-ink-lg border-ink px-6 py-4 shadow-panel-sm",
        TONE[tone],
        className,
      )}
    >
      <div className="font-body text-base font-medium leading-snug text-ink">{children}</div>
      <svg
        aria-hidden
        viewBox="0 0 24 18"
        className={cn("absolute h-4 w-5", TAIL_POS[tail])}
      >
        <path d="M2 0 L24 0 L8 18 Z" fill="#1A1A1A" />
        <path
          d="M5 0 L20 0 L8 14 Z"
          className={cn(
            tone === "paper" && "fill-paper",
            tone === "sky" && "fill-sky",
            tone === "rose" && "fill-rose",
          )}
        />
      </svg>
    </div>
  );
}
