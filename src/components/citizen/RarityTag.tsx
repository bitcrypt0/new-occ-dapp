import { cn } from "@/lib/cn";

/** Marks a trait that is rare and frozen forever (survives every reshuffle). */
export function RarityTag({
  label = "Rare · Frozen",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-ink bg-orange px-2 py-0.5 font-display text-[11px] uppercase tracking-wide text-ink",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
        <path
          fill="currentColor"
          d="M12 1.5 14.9 8 22 8.8l-5.3 4.8L18.2 21 12 17.4 5.8 21l1.5-7.4L2 8.8 9.1 8z"
        />
      </svg>
      {label}
    </span>
  );
}
