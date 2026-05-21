import { cn } from "@/lib/cn";

/** The OCCV2 comic wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="inline-grid h-9 w-9 -rotate-3 place-items-center rounded-lg border-ink border-ink bg-red font-display text-xl leading-none text-paper shadow-panel-sm">
        OC
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg uppercase tracking-tight text-ink">
          OnChain Citizens
        </span>
      </span>
    </span>
  );
}
