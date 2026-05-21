"use client";

import { cn } from "@/lib/cn";

interface TokenIdPickerProps {
  ids: number[];
  selected: number[];
  onToggle: (id: number) => void;
  /** Max number selectable; further selections are blocked. */
  max?: number;
  label?: string;
}

/** A grid of selectable token-ID chips (single or multi-select). */
export function TokenIdPicker({ ids, selected, onToggle, max, label }: TokenIdPickerProps) {
  const atCap = max !== undefined && selected.length >= max;
  return (
    <fieldset>
      {label && (
        <legend className="mb-2 font-display text-sm uppercase tracking-wide text-brown">
          {label}
        </legend>
      )}
      <div className="flex flex-wrap gap-2" role="group">
        {ids.map((id) => {
          const on = selected.includes(id);
          const disabled = atCap && !on;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => onToggle(id)}
              className={cn(
                "rounded-lg border-ink border-ink px-3 py-2 font-display text-sm tabular-nums shadow-panel-sm transition-transform",
                "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                on ? "bg-red text-paper" : "bg-paper text-ink hover:bg-cream",
                disabled && "cursor-not-allowed opacity-40",
              )}
            >
              #{id}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
