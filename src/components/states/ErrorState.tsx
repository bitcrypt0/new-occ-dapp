import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** A designed error state — for wrong-network, failed reads, etc. */
export function ErrorState({
  title = "A panel smudged",
  description = "Something didn't print right. Give it another go.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-panel border-ink-lg border-ink bg-red/15 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="grid h-16 w-16 -rotate-6 place-items-center rounded-panel border-ink border-ink bg-red font-display text-3xl text-paper">
        !
      </div>
      <h3 className="mt-4 font-display text-display-sm">{title}</h3>
      <p className="mt-2 max-w-sm font-body text-sm text-brown">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
