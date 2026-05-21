"use client";

import { cn } from "@/lib/cn";

interface QuantityStepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

/** A +/- quantity stepper, ink-outlined. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
}: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div>
      {label && (
        <span className="mb-1 block font-display text-sm uppercase tracking-wide text-brown">
          {label}
        </span>
      )}
      <div className="inline-flex items-stretch overflow-hidden rounded-lg border-ink border-ink shadow-panel-sm">
        <Step glyph="−" label="Decrease" disabled={value <= min} onClick={() => onChange(clamp(value - 1))} />
        <span className="grid w-14 place-items-center bg-paper font-display text-xl tabular-nums">
          {value}
        </span>
        <Step glyph="+" label="Increase" disabled={value >= max} onClick={() => onChange(clamp(value + 1))} />
      </div>
    </div>
  );
}

function Step({
  glyph,
  label,
  disabled,
  onClick,
}: {
  glyph: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid w-11 place-items-center bg-cream font-display text-2xl leading-none",
        "hover:bg-orange disabled:cursor-not-allowed disabled:opacity-30",
      )}
    >
      {glyph}
    </button>
  );
}
