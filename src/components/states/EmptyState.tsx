import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** A short emoji-free glyph or panel mark. */
  mark?: string;
  action?: ReactNode;
  className?: string;
}

/** A designed empty state — comic "blank panel" treatment. */
export function EmptyState({ title, description, mark = "?!", action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-panel border-ink-lg border-dashed border-ink bg-cream/60 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="grid h-20 w-20 place-items-center rounded-panel border-ink border-ink bg-paper font-display text-3xl text-ink shadow-panel-sm">
        {mark}
      </div>
      <h3 className="mt-5 font-display text-display-sm">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm font-body text-sm text-brown">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
