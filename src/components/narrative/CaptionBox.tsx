import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CaptionBoxProps {
  children: ReactNode;
  /** Small uppercase kicker, comic-narrator style ("MEANWHILE…"). */
  label?: string;
  tilt?: "left" | "right" | "none";
  className?: string;
}

const TILT = {
  left: "-rotate-2",
  right: "rotate-2",
  none: "",
};

/** The yellow narrator caption box from comic pages. */
export function CaptionBox({ children, label, tilt = "left", className }: CaptionBoxProps) {
  return (
    <div
      className={cn(
        "inline-block max-w-prose border-ink-lg border-ink bg-orange px-5 py-3 shadow-panel-sm",
        TILT[tilt],
        className,
      )}
    >
      {label && (
        <span className="mb-1 block font-display text-xs uppercase tracking-[0.18em] text-brown">
          {label}
        </span>
      )}
      <p className="font-display text-lg leading-tight text-ink">{children}</p>
    </div>
  );
}
