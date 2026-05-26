import type { LockedVariant, TraitFolder } from "@/lib/data/traits";
import { LockedTraitCard } from "./TraitCard";

/** Responsive grid of locked-personality variants. */
export function LockedAtlasGrid({
  folder,
  variants,
}: {
  folder: TraitFolder;
  variants: LockedVariant[];
}) {
  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {variants.map((v) => (
        <li key={`${folder}-${v.slug}`} className="contents">
          <LockedTraitCard folder={folder} variant={v} />
        </li>
      ))}
    </ul>
  );
}
