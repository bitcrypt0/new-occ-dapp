"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/cn";

export interface TocChapter {
  /** DOM id of the chapter's <section> element. */
  id: string;
  /** Display chapter number, e.g. "01". */
  number: string;
  /** Display label, e.g. "What OCCV2 is". */
  label: string;
}

/**
 * Sticky comic-issue chapter list with IntersectionObserver scrollspy.
 * Desktop: left rail. Mobile: sticky <details> dropdown above the content.
 */
export function DocsToc({ chapters }: { chapters: TocChapter[] }) {
  const [activeId, setActiveId] = useState<string>(chapters[0]?.id ?? "");

  useEffect(() => {
    // Honor an initial #hash on first paint.
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.slice(1);
      if (chapters.some((c) => c.id === id)) setActiveId(id);
    }

    if (typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [chapters]);

  const onClick = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
    // Move focus to the section heading for screen-reader users.
    const heading = el.querySelector<HTMLElement>("h2, [data-chapter-heading]");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  };

  const active = chapters.find((c) => c.id === activeId) ?? chapters[0];

  return (
    <>
      {/* mobile: sticky <details> dropdown */}
      <details
        className="sticky top-16 z-30 mb-4 rounded-panel border-ink-lg border-ink bg-cream shadow-panel-sm lg:hidden [&_summary::-webkit-details-marker]:hidden"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
          <span>
            <span className="block font-display text-[10px] uppercase tracking-[0.18em] text-brown">
              Chapter
            </span>
            <span className="block font-display text-base leading-tight text-ink">
              <span className="font-mono opacity-60">{active?.number}</span>{" "}
              {active?.label}
            </span>
          </span>
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-orange font-display text-lg leading-none"
          >
            ☰
          </span>
        </summary>
        <ol className="border-t-2 border-ink bg-paper p-2">
          {chapters.map((c) => (
            <ChapterLink
              key={c.id}
              c={c}
              active={activeId === c.id}
              onClick={onClick(c.id)}
            />
          ))}
        </ol>
      </details>

      {/* desktop: sticky left rail */}
      <nav
        aria-label="Docs table of contents"
        className="sticky top-24 hidden self-start lg:block"
      >
        <div className="rounded-panel border-ink-lg border-ink bg-cream p-4 shadow-panel">
          <p className="mb-3 inline-block -rotate-1 border-2 border-ink bg-orange px-2 py-0.5 font-display text-[11px] uppercase tracking-[0.18em]">
            Chapter list
          </p>
          <ol className="space-y-0.5">
            {chapters.map((c) => (
              <ChapterLink
                key={c.id}
                c={c}
                active={activeId === c.id}
                onClick={onClick(c.id)}
              />
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}

function ChapterLink({
  c,
  active,
  onClick,
}: {
  c: TocChapter;
  active: boolean;
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <li>
      <a
        href={`#${c.id}`}
        onClick={onClick}
        aria-current={active ? "location" : undefined}
        className={cn(
          "flex items-baseline gap-2 rounded px-2 py-1.5 font-display text-sm leading-snug transition-colors",
          active
            ? "bg-red text-paper"
            : "text-ink hover:bg-paper",
        )}
      >
        <span
          className={cn(
            "font-mono text-[11px] tabular-nums",
            active ? "text-paper/80" : "text-brown",
          )}
        >
          {c.number}
        </span>
        <span>{c.label}</span>
      </a>
    </li>
  );
}
