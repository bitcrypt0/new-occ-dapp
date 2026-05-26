import { cn } from "@/lib/cn";

/** Decorative comic-page break between docs chapters. */
export function ChapterBreak({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      aria-hidden
      className={cn("relative my-12 flex items-center gap-3", className)}
    >
      <span className="block h-[3px] flex-1 bg-ink" />
      <span
        className="halftone h-3 w-12 rounded-full text-ink/40"
        aria-hidden
      />
      <span className="grid h-7 w-7 rotate-12 place-items-center border-2 border-ink bg-orange font-display text-xs">
        ★
      </span>
      <span
        className="halftone h-3 w-12 rounded-full text-ink/40"
        aria-hidden
      />
      <span className="block h-[3px] flex-1 bg-ink" />
    </div>
  );
}
