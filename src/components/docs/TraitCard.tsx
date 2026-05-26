import { cn } from "@/lib/cn";
import { RarityTag } from "@/components/citizen/RarityTag";
import {
  type LockedVariant,
  type RareTrait,
  publicTraitPreview,
  type TraitFolder,
} from "@/lib/data/traits";

/** Low-level preview tile — one trait variant, lazy-loaded SVG via <img>. */
export function TraitTile({
  folder,
  slug,
  alt,
  className,
}: {
  folder: TraitFolder;
  slug: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-lg border-2 border-ink bg-cream",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={publicTraitPreview(folder, slug)}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full select-none"
        draggable={false}
      />
    </div>
  );
}

/* ---------- Rare Traits Atlas card ---------- */
export function RareTraitCard({ trait }: { trait: RareTrait }) {
  const isExtra = trait.weight <= 1;
  return (
    <article className="flex h-full flex-col rounded-panel border-ink-lg border-ink bg-paper p-3 shadow-panel-sm transition-transform hover:-translate-y-0.5 hover:shadow-panel">
      {trait.pair ? (
        <div className="grid grid-cols-2 gap-2">
          <TraitTile
            folder={trait.folder}
            slug={trait.slug}
            alt={`${trait.display} (male) — rare ${trait.category} trait`}
          />
          <TraitTile
            folder={trait.folder}
            slug={trait.pair}
            alt={`${trait.display} (female) — rare ${trait.category} trait`}
          />
        </div>
      ) : (
        <TraitTile
          folder={trait.folder}
          slug={trait.slug}
          alt={`${trait.display} — rare ${trait.category} trait`}
        />
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="font-display text-base leading-tight">{trait.display}</p>
        <RarityTag label={isExtra ? "Extra-Rare" : "Rare"} />
      </div>

      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-body text-[11px] text-brown">
        <span>
          weight <span className="tabular-nums">{trait.weight}</span>
        </span>
        {trait.pair && <span>· male / female</span>}
        {trait.maleOnly && !trait.pair && <span>· male-only</span>}
        {trait.femaleOnly && !trait.pair && <span>· female-only</span>}
      </p>
    </article>
  );
}

/* ---------- Locked Personality Atlas card ---------- */
export function LockedTraitCard({
  folder,
  variant,
}: {
  folder: TraitFolder;
  variant: LockedVariant;
}) {
  const altSuffix = variant.maleOnly
    ? " (male)"
    : variant.femaleOnly
      ? " (female)"
      : "";
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-panel border-ink-lg border-ink bg-paper p-2.5 shadow-panel-sm",
        variant.rare && "ring-2 ring-orange",
      )}
    >
      <TraitTile
        folder={folder}
        slug={variant.slug}
        alt={`${variant.display}${altSuffix} trait`}
      />
      <div className="mt-2 flex items-center justify-between gap-1.5">
        <p className="font-display text-sm leading-tight">{variant.display}</p>
        {variant.rare && <RarityTag label="Rare" className="px-1.5 text-[10px]" />}
      </div>
      {(variant.maleOnly || variant.femaleOnly) && (
        <p className="mt-0.5 font-body text-[10px] uppercase tracking-wide text-brown">
          {variant.maleOnly ? "Male" : "Female"} only
        </p>
      )}
    </article>
  );
}
