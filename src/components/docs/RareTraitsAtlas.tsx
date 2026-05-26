"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { RARE_TRAITS, type RareTrait, type TraitCategory } from "@/lib/data/traits";
import { RareTraitCard } from "./TraitCard";

/** Categories rendered (and ordered) in the atlas. */
const CATEGORIES: TraitCategory[] = [
  "Eyes",
  "Eyebrows",
  "Mouth",
  "Clothing",
  "Accessory II",
  "Accessory I",
  "Facial Hair",
  "Hair",
  "Special",
];

/** Filter chips + search + grouped grid of the 56 rare variants. */
export function RareTraitsAtlas() {
  const [cat, setCat] = useState<TraitCategory | "All">("All");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: RARE_TRAITS.length };
    for (const t of RARE_TRAITS) c[t.category] = (c[t.category] ?? 0) + 1;
    return c;
  }, []);

  const filtered = useMemo(
    () =>
      RARE_TRAITS.filter((t) => {
        if (cat !== "All" && t.category !== cat) return false;
        if (!query) return true;
        return (
          t.display.toLowerCase().includes(query) ||
          t.slug.toLowerCase().includes(query) ||
          (t.pair ?? "").toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
        );
      }),
    [cat, query],
  );

  const grouped = useMemo(() => {
    const g: Partial<Record<TraitCategory, RareTrait[]>> = {};
    for (const t of filtered) (g[t.category] ||= []).push(t);
    return g;
  }, [filtered]);

  return (
    <div>
      {/* controls */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter rare traits by category" className="flex flex-wrap gap-2">
          <Chip
            label="All"
            count={counts.All}
            active={cat === "All"}
            onClick={() => setCat("All")}
          />
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              count={counts[c] ?? 0}
              active={cat === c}
              onClick={() => setCat(c)}
            />
          ))}
        </div>
        <label className="relative w-full lg:w-64">
          <span className="sr-only">Search rare traits</span>
          <input
            type="search"
            placeholder="Search rare traits…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-panel border-ink border-ink bg-paper px-3 py-2 font-body text-sm shadow-panel-sm placeholder:text-ink/40 focus:outline-none"
          />
        </label>
      </div>

      {/* results */}
      {filtered.length === 0 ? (
        <p className="rounded-panel border-ink-lg border-dashed border-ink bg-cream/60 p-6 text-center font-body text-sm text-brown">
          No rare traits match <strong className="text-ink">&ldquo;{q}&rdquo;</strong>. Try a
          different word, or reset the filter to <em>All</em>.
        </p>
      ) : cat === "All" ? (
        <div className="space-y-8">
          {CATEGORIES.map((c) => {
            const items = grouped[c];
            if (!items || items.length === 0) return null;
            return (
              <section key={c} aria-labelledby={`rare-${slug(c)}`}>
                <h3
                  id={`rare-${slug(c)}`}
                  className="mb-3 flex items-baseline gap-2 font-display text-display-sm"
                >
                  {c}
                  <span className="font-body text-sm font-medium text-brown">
                    {items.length} rare
                  </span>
                </h3>
                <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((t) => (
                    <li key={t.slug} className="contents">
                      <RareTraitCard trait={t} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((t) => (
            <li key={t.slug} className="contents">
              <RareTraitCard trait={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-ink border-ink px-3 py-1.5 font-display text-xs uppercase tracking-wide shadow-panel-sm transition-transform",
        "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        active ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-cream",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-[10px] tabular-nums",
          active ? "bg-paper text-ink" : "bg-ink text-paper",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-");
}
