"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { CitizenCard } from "./CitizenCard";
import type { Citizen, TraitCategory } from "@/lib/types";
import { TRAIT_CATEGORIES } from "@/lib/types";

type SortKey = "id-asc" | "id-desc" | "transfers-desc" | "transfers-asc";
type GenderFilter = "All" | "Male" | "Female";
type StatusFilter = "All" | "Rare" | "Locked";

/**
 * A pickable filter dimension. The normal slots come straight out of
 * `TRAIT_CATEGORIES`; "Mood" is a virtual category derived from the Mouth
 * trait at parse time (it lives on `citizen.mood`, not in the attributes
 * array), so it gets its own handling in the value extractor and matcher.
 */
type TraitDimension = TraitCategory | "Mood";
const MOOD_DIMENSION: "Mood" = "Mood";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "id-asc", label: "Token ID · low → high" },
  { value: "id-desc", label: "Token ID · high → low" },
  { value: "transfers-desc", label: "Most transferred" },
  { value: "transfers-asc", label: "Least transferred" },
];

/**
 * Filter + sort bar for the My Collection grid. Self-contained: it owns the
 * filter state, derives the visible Citizens, and renders the result grid
 * directly so the page just passes the owned array through.
 *
 * The trait dropdown is data-driven — only categories and values that appear
 * in the holder's own collection are offered, so picking a filter can never
 * return zero by mistake on a category they don't even have.
 */
export function CollectionFilters({ citizens }: { citizens: Citizen[] }) {
  const [sort, setSort] = useState<SortKey>("id-asc");
  const [gender, setGender] = useState<GenderFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [traitCat, setTraitCat] = useState<TraitDimension | "Any">("Any");
  const [traitVal, setTraitVal] = useState<string>("Any");

  // Dimensions that actually appear at least once across the holder's set.
  // Mood is added at the end as a virtual category — every Citizen carries
  // a mood, so it's always offered.
  const presentCategories = useMemo<TraitDimension[]>(() => {
    const set = new Set<TraitCategory>();
    for (const c of citizens) for (const a of c.attributes) set.add(a.category);
    const cats: TraitDimension[] = TRAIT_CATEGORIES.filter((c) => set.has(c));
    if (citizens.length > 0) cats.push(MOOD_DIMENSION);
    return cats;
  }, [citizens]);

  // Distinct values for the picked dimension, taken from the holder's own art.
  // When Status=Rare is active, only rare values are listed — so the user
  // can't accidentally pick a common variant that the Rare filter then
  // excludes from the grid. Important for the Accessory category in
  // particular: it's a locked "core personality" slot whose 22 variants
  // include 14 rare (weight < 16) and 8 common — the picker now honours
  // that split when Rare is on. Mood has no rare-weight concept of its own,
  // so its full set of values is always offered.
  const traitValues = useMemo(() => {
    if (traitCat === "Any") return [];
    const set = new Set<string>();
    if (traitCat === MOOD_DIMENSION) {
      for (const c of citizens) set.add(c.mood);
    } else {
      for (const c of citizens) {
        for (const a of c.attributes) {
          if (a.category !== traitCat) continue;
          if (status === "Rare" && !a.rare) continue;
          set.add(a.value);
        }
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [citizens, traitCat, status]);

  const filtered = useMemo(() => {
    let r = citizens.slice();

    if (gender !== "All") r = r.filter((c) => c.gender === gender);

    // Rare is category-scoped when a trait category is picked. With no
    // category picked, it means "Citizen has at least one rare trait
    // anywhere." With a category picked (e.g. Accessory), it means
    // "Citizen's attribute in that category is itself rare (weight < 16)"
    // — so locked categories like Accessory I, whose common variants
    // (Blush, Freckles, Clear Glasses, etc.) are not rare, are not
    // accidentally lumped in when a holder filters for rare Accessory.
    if (status === "Rare") {
      if (traitCat !== "Any" && traitCat !== MOOD_DIMENSION) {
        // Real trait category — scope Rare to "rare in that category".
        r = r.filter((c) =>
          c.attributes.some((a) => a.category === traitCat && a.rare),
        );
      } else {
        // No category picked, or Mood (which has no rare-weight definition)
        // — fall back to "Citizen has at least one rare attribute".
        r = r.filter((c) => c.attributes.some((a) => a.rare));
      }
    }
    if (status === "Locked") r = r.filter((c) => c.traitsLocked);
    if (traitCat !== "Any" && traitVal !== "Any") {
      if (traitCat === MOOD_DIMENSION) {
        r = r.filter((c) => c.mood === traitVal);
      } else {
        r = r.filter((c) =>
          c.attributes.some(
            (a) => a.category === traitCat && a.value === traitVal,
          ),
        );
      }
    }

    switch (sort) {
      case "id-asc":
        r.sort((a, b) => a.id - b.id);
        break;
      case "id-desc":
        r.sort((a, b) => b.id - a.id);
        break;
      case "transfers-desc":
        r.sort((a, b) => b.transferCount - a.transferCount);
        break;
      case "transfers-asc":
        r.sort((a, b) => a.transferCount - b.transferCount);
        break;
    }

    return r;
  }, [citizens, gender, status, traitCat, traitVal, sort]);

  // If toggling Status=Rare drops the currently-picked value out of the
  // rare-only list (or any other transition does the same), fall the value
  // picker back to "Any" so the grid doesn't silently empty.
  useEffect(() => {
    if (traitVal !== "Any" && !traitValues.includes(traitVal)) {
      setTraitVal("Any");
    }
  }, [traitVal, traitValues]);

  const dirty =
    gender !== "All" ||
    status !== "All" ||
    traitCat !== "Any" ||
    sort !== "id-asc";

  const reset = () => {
    setGender("All");
    setStatus("All");
    setTraitCat("Any");
    setTraitVal("Any");
    setSort("id-asc");
  };

  return (
    <>
      <section
        aria-label="Filter and sort your Citizens"
        className="mb-5 rounded-panel border-ink-lg border-ink bg-cream/60 p-4 shadow-panel-sm"
      >
        <div className="flex flex-wrap items-end gap-x-5 gap-y-4">
          {/* Sort */}
          <FieldGroup label="Sort by">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort Citizens"
              className="min-w-[12rem] rounded-panel border-ink border-ink bg-paper px-3 py-2 font-body text-sm shadow-panel-sm focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FieldGroup>

          {/* Gender */}
          <FieldGroup label="Gender">
            <ChipRow>
              <Chip label="All" active={gender === "All"} onClick={() => setGender("All")} />
              <Chip label="Male" active={gender === "Male"} onClick={() => setGender("Male")} />
              <Chip label="Female" active={gender === "Female"} onClick={() => setGender("Female")} />
            </ChipRow>
          </FieldGroup>

          {/* Status */}
          <FieldGroup label="Status">
            <ChipRow>
              <Chip label="All" active={status === "All"} onClick={() => setStatus("All")} />
              <Chip label="Rare" active={status === "Rare"} onClick={() => setStatus("Rare")} />
              <Chip label="Locked" active={status === "Locked"} onClick={() => setStatus("Locked")} />
            </ChipRow>
          </FieldGroup>

          {/* Trait */}
          <FieldGroup label="Trait">
            <div className="flex flex-wrap gap-2">
              <select
                value={traitCat}
                onChange={(e) => {
                  const next = e.target.value as TraitDimension | "Any";
                  setTraitCat(next);
                  setTraitVal("Any");
                }}
                aria-label="Trait category"
                className="rounded-panel border-ink border-ink bg-paper px-3 py-2 font-body text-sm shadow-panel-sm focus:outline-none"
              >
                <option value="Any">Any category</option>
                {presentCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={traitVal}
                onChange={(e) => setTraitVal(e.target.value)}
                aria-label="Trait value"
                disabled={traitCat === "Any" || traitValues.length === 0}
                className="rounded-panel border-ink border-ink bg-paper px-3 py-2 font-body text-sm shadow-panel-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-grey/30 disabled:text-ink/50"
              >
                <option value="Any">
                  {traitCat === "Any" ? "Pick a category first" : "Any value"}
                </option>
                {traitValues.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </FieldGroup>

          {dirty && (
            <button
              type="button"
              onClick={reset}
              className="ml-auto inline-flex items-center gap-1 rounded-panel border-ink border-ink bg-paper px-3 py-2 font-display text-xs uppercase tracking-wide shadow-panel-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-cream"
            >
              Clear filters
            </button>
          )}
        </div>

        <p className="mt-3 font-display text-xs uppercase tracking-wide text-brown">
          Showing <strong className="text-ink">{filtered.length}</strong> of{" "}
          {citizens.length} Citizen{citizens.length === 1 ? "" : "s"}
        </p>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-panel border-ink-lg border-dashed border-ink bg-cream/60 p-8 text-center">
          <p className="font-display text-display-sm">No matches</p>
          <p className="mt-2 font-body text-sm text-brown">
            None of your Citizens fit the current filter combination.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center gap-1 rounded-panel border-ink border-ink bg-paper px-4 py-2 font-display text-xs uppercase tracking-wide shadow-panel-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-cream"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c) => (
            <CitizenCard key={c.id} citizen={c} />
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- local helpers ---------- */

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-display text-[10px] uppercase tracking-widest text-brown">
        {label}
      </span>
      {children}
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border-ink border-ink px-3 py-1.5 font-display text-xs uppercase tracking-wide shadow-panel-sm transition-transform",
        "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        active ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-cream",
      )}
    >
      {label}
    </button>
  );
}
