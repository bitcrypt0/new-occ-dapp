import { TRAIT_CATEGORIES, RESHUFFLABLE } from "../types";
import type {
  Attribute,
  BackgroundColor,
  Citizen,
  Gender,
  HairColor,
  Mood,
  SkinTone,
  TraitCategory,
} from "../types";
import {
  RARE_TRAITS,
  type TraitCategory as RareTraitCategory,
} from "../data/traits";

/**
 * The docs/data layer uses "Accessory I" for the static face-affixed slot;
 * the on-chain trait_type is just "Accessory". Bridge the two so rare-trait
 * lookups for that category resolve.
 */
function rareCategoryToDomain(c: RareTraitCategory): TraitCategory {
  return c === "Accessory I" ? "Accessory" : (c as TraitCategory);
}

/**
 * Categories whose lock comes from being a *core personality trait* rather
 * than from being rare. Hair and Facial Hair are personality-locked by
 * default regardless of weight — even when a variant happens to be weight
 * < 16 (e.g. Mohawk, Mutton Chops) its permanence on the Citizen comes
 * from the personality lock, not from rarity. So we don't surface those
 * variants with the rare-lock tag anywhere in the dapp.
 *
 * Accessory (the static face-affixed slot — "Accessory I" in the docs) is
 * also a core personality category, but the brief explicitly carves out
 * its weight < 16 variants as rare personality traits — Sunglasses,
 * Eye Patch, Monocle, Laser, etc. — so those *do* get the rare tag. The
 * common Accessory variants (Blush, Freckles, Clear Glasses, Round
 * Glasses, Scar, No Accessory) remain untagged.
 *
 * Reshufflable categories (Eyes, Eyebrows, Mouth, Clothing, Accessory II)
 * and Special are unaffected — their rare variants are tagged as before.
 */
const PERSONALITY_LOCKED_NO_RARE_TAG: ReadonlySet<TraitCategory> = new Set([
  "Hair",
  "Facial Hair",
]);

/**
 * Lookup set of `${domainCategory}|${value}` keys for every known rare
 * variant. Both the display name ("Crown") and the on-disk slug ("crown")
 * are registered so we still resolve if the contract ever emits the slug
 * form. Comparison is case-insensitive. Categories listed in
 * `PERSONALITY_LOCKED_NO_RARE_TAG` are skipped at insertion so their rare
 * weight<16 variants never enter the lookup at all.
 */
const RARE_KEY_SET: Set<string> = (() => {
  const set = new Set<string>();
  for (const t of RARE_TRAITS) {
    const cat = rareCategoryToDomain(t.category);
    if (PERSONALITY_LOCKED_NO_RARE_TAG.has(cat)) continue;
    set.add(`${cat}|${t.display.toLowerCase()}`);
    set.add(`${cat}|${t.slug.toLowerCase()}`);
    if (t.pair) set.add(`${cat}|${t.pair.toLowerCase()}`);
  }
  return set;
})();

function isRareAttribute(category: TraitCategory, value: string): boolean {
  return RARE_KEY_SET.has(`${category}|${value.toLowerCase()}`);
}

interface RawAttribute {
  trait_type?: string;
  value?: string | number;
}
interface RawMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: RawAttribute[];
}

/** Decode a base64 `data:` URI payload to a UTF-8 string. */
function decodeDataUri(uri: string): string {
  const comma = uri.indexOf(",");
  const payload = comma === -1 ? uri : uri.slice(comma + 1);
  const isBase64 = /;base64/i.test(uri.slice(0, comma === -1 ? 0 : comma));
  if (!isBase64) return decodeURIComponent(payload);
  const binary = atob(payload);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const TRAIT_CATEGORY_SET = new Set<string>(TRAIT_CATEGORIES);

/**
 * Parse the contract's `tokenURI` payload into a domain `Citizen`.
 *
 * The image is kept as the raw `data:image/svg+xml;base64,…` URI and rendered
 * via <img> — never decoded into inline SVG, so no untrusted markup executes.
 */
export function parseCitizen(tokenId: number, tokenUri: string): Citizen {
  const json = decodeDataUri(tokenUri);
  const meta = JSON.parse(json) as RawMetadata;
  const raw = meta.attributes ?? [];

  const byType = new Map<string, string | number>();
  for (const a of raw) {
    if (a.trait_type != null && a.value != null) byType.set(a.trait_type, a.value);
  }
  const str = (key: string, fallback: string) => {
    const v = byType.get(key);
    return typeof v === "string" ? v : fallback;
  };

  const gender = (str("Gender", "Male") as Gender) === "Female" ? "Female" : "Male";
  const transferRaw = byType.get("Transfer Count");
  const transferCount = typeof transferRaw === "number" ? transferRaw : Number(transferRaw ?? 0);

  // Build the attribute list in canonical TRAIT_CATEGORIES order, taking
  // only the *first* occurrence of each trait_type. The contract emits some
  // trait_types twice — most notably "Skin Tone" (once as the palette color
  // in the header section, once as the registry-variant in the per-category
  // loop). Without dedupe, two entries share the same React key and one of
  // them silently drops out of the rendered list.
  const firstByCategory = new Map<string, RawAttribute>();
  for (const a of raw) {
    if (!a.trait_type || firstByCategory.has(a.trait_type)) continue;
    if (!TRAIT_CATEGORY_SET.has(a.trait_type)) continue;
    firstByCategory.set(a.trait_type, a);
  }
  const attributes: Attribute[] = TRAIT_CATEGORIES.flatMap((category) => {
    const a = firstByCategory.get(category);
    if (!a) return [];
    const value = String(a.value ?? "");
    return [
      {
        category,
        value,
        reshufflable: RESHUFFLABLE.includes(category),
        rare: isRareAttribute(category, value),
      },
    ];
  });

  return {
    id: tokenId,
    gender,
    art: gender === "Female" ? "female-bob" : "male-buzzcut",
    stage: "I",
    mood: str("Mood", "Happy") as Mood,
    skinTone: str("Skin Tone", "Beige") as SkinTone,
    hairColor: str("Hair Color", "Brown") as HairColor,
    background: str("Background", "Light Grey") as BackgroundColor,
    transferCount: Number.isFinite(transferCount) ? transferCount : 0,
    traitsLocked: str("Traits Locked", "No") === "Yes",
    attributes,
    imageUri: meta.image,
  };
}
