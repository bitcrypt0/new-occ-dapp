import { cn } from "@/lib/cn";

/** Comic-themed shimmer block. */
function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border-2 border-ink bg-grey/50 motion-safe:animate-pulse",
        className,
      )}
    />
  );
}

/** A loading skeleton — variants for card grids and detail views. */
export function LoadingSkeleton({
  variant = "grid",
  count = 8,
}: {
  variant?: "grid" | "detail" | "row";
  count?: number;
}) {
  if (variant === "detail") {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Block className="aspect-square w-full" />
        <div className="space-y-3">
          <Block className="h-10 w-2/3" />
          <Block className="h-5 w-1/2" />
          <Block className="h-32 w-full" />
          <Block className="h-12 w-full" />
        </div>
      </div>
    );
  }
  if (variant === "row") {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <Block key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-panel border-ink-lg border-ink bg-paper p-2">
          <Block className="aspect-square w-full" />
          <Block className="mt-2 h-6 w-1/2" />
        </div>
      ))}
    </div>
  );
}
