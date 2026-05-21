import { cn } from "@/lib/cn";

interface StepProgressProps {
  steps: string[];
  /** Index of the active step (0-based). Steps before it render as done. */
  current: number;
  className?: string;
}

/** Numbered step indicator — used by the 2-step Approve → Claim flow. */
export function StepProgress({ steps, current, className }: StepProgressProps) {
  return (
    <ol className={cn("flex items-center gap-2", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border-ink border-ink font-display text-base",
                  done && "bg-ink text-paper",
                  active && "bg-red text-paper",
                  !done && !active && "bg-paper text-ink/40",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "font-display text-sm uppercase tracking-wide",
                  active ? "text-ink" : "text-ink/50",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "mx-1 h-1 flex-1 rounded-full",
                  done ? "bg-ink" : "bg-ink/20",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
