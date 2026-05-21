import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Standard page content container — max width + responsive gutters. */
export function Page({
  children,
  className,
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "wide" | "narrow";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 sm:py-12",
        width === "default" && "max-w-6xl",
        width === "wide" && "max-w-7xl",
        width === "narrow" && "max-w-3xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A bold comic page-title block with optional kicker + supporting copy. */
export function PageHeader({
  kicker,
  title,
  intro,
  className,
}: {
  kicker?: string;
  title: string;
  intro?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8", className)}>
      {kicker && (
        <span className="mb-2 inline-block -rotate-1 border-2 border-ink bg-orange px-3 py-1 font-display text-xs uppercase tracking-[0.18em]">
          {kicker}
        </span>
      )}
      <h1 className="font-display text-display-lg leading-[0.95]">{title}</h1>
      {intro && (
        <div className="mt-3 max-w-2xl font-body text-base text-brown sm:text-lg">{intro}</div>
      )}
    </header>
  );
}
