/**
 * Authoritative trait data for the Docs page atlases.
 *
 * This file is the single source of truth — hand-curated from
 * FRONTEND_OCCV2_DOCS_PAGE_TASK.md §4 and §5. The build script
 * (`scripts/build-trait-previews.mjs`) cross-checks every rare entry's
 * `weight` against the corresponding `*.meta.json` in
 * `art/megans/traits/<folder>/`. If it ever finds a drift it logs a warning
 * — stop and flag the supervisor before publishing, per the brief's §9.
 *
 * "Rare" in OCCV2 = upload weight < 16. Weight ≤ 1 is an "extra-rare".
 */

/** Folder name on disk inside `art/megans/traits/`. */
export type TraitFolder =
  | "eyes"
  | "eyebrows"
  | "mouths"
  | "clothing"
  | "accessories"
  | "accessory-ii"
  | "facial-hair"
  | "hair"
  | "specials";

/** Display category as surfaced in the UI. */
export type TraitCategory =
  | "Eyes"
  | "Eyebrows"
  | "Mouth"
  | "Clothing"
  | "Accessory I"
  | "Accessory II"
  | "Facial Hair"
  | "Hair"
  | "Special";

/** Categories that re-roll on every wallet-to-wallet transfer. */
export const RESHUFFLABLE_CATEGORIES: TraitCategory[] = [
  "Eyes",
  "Eyebrows",
  "Mouth",
  "Clothing",
  "Accessory II",
];

export interface RareTrait {
  category: TraitCategory;
  folder: TraitFolder;
  /** Male / unisex SVG slug (filename without `.svg`). */
  slug: string;
  /** Display name shown to users. */
  display: string;
  /** Upload weight from the contract metadata. < 16 = rare. */
  weight: number;
  /** Female-pair SVG slug (e.g. "crown-f"). Omitted for unisex / gender-locked singles. */
  pair?: string;
  /** Gender restriction (singles only). Pairs are implicitly both. */
  maleOnly?: boolean;
  femaleOnly?: boolean;
}

/** Convenience flag — the eight weight ≤ 1 variants per §4. */
export function isExtraRare(t: { weight: number }): boolean {
  return t.weight <= 1;
}

/* ============================================================
 * THE 56 RARES — exact list from §4. Order preserved per category.
 * ============================================================ */
export const RARE_TRAITS: RareTrait[] = [
  // Eyes (4 rare) — RESHUFFLABLE
  { category: "Eyes", folder: "eyes", slug: "animated", display: "Animated", weight: 0.5 },
  { category: "Eyes", folder: "eyes", slug: "cross-eyed", display: "Cross-Eyed", weight: 15 },
  { category: "Eyes", folder: "eyes", slug: "heart-eyes", display: "Heart Eyes", weight: 15 },
  { category: "Eyes", folder: "eyes", slug: "starry", display: "Starry", weight: 15 },

  // Eyebrows (1 rare) — RESHUFFLABLE
  { category: "Eyebrows", folder: "eyebrows", slug: "unibrow", display: "Unibrow", weight: 15 },

  // Mouth (3 rare) — RESHUFFLABLE
  { category: "Mouth", folder: "mouths", slug: "cigarette", display: "Cigarette", weight: 15 },
  { category: "Mouth", folder: "mouths", slug: "tongue-out", display: "Tongue Out", weight: 15 },
  { category: "Mouth", folder: "mouths", slug: "vape", display: "Vape", weight: 10 },

  // Clothing (3 paired = 6 rare) — RESHUFFLABLE
  { category: "Clothing", folder: "clothing", slug: "coat", display: "Coat", weight: 10, pair: "coat-f" },
  { category: "Clothing", folder: "clothing", slug: "eth-tshirt", display: "ETH T-Shirt", weight: 1, pair: "eth-tshirt-f" },
  { category: "Clothing", folder: "clothing", slug: "suit", display: "Suit", weight: 15, pair: "suit-f" },

  // Accessory II (9 paired = 18 rare) — RESHUFFLABLE
  { category: "Accessory II", folder: "accessory-ii", slug: "bitcoin-maxi-cap", display: "Bitcoin Maxi Cap", weight: 2, pair: "bitcoin-maxi-cap-f" },
  { category: "Accessory II", folder: "accessory-ii", slug: "crown", display: "Crown", weight: 3, pair: "crown-f" },
  { category: "Accessory II", folder: "accessory-ii", slug: "eth-maxi-cap", display: "ETH Maxi Cap", weight: 5, pair: "eth-maxi-cap-f" },
  { category: "Accessory II", folder: "accessory-ii", slug: "eth-maxi-cap-ii", display: "ETH Maxi Cap II", weight: 4, pair: "eth-maxi-cap-ii-f" },
  { category: "Accessory II", folder: "accessory-ii", slug: "eth-maxi-cap-iii", display: "ETH Maxi Cap III", weight: 3, pair: "eth-maxi-cap-iii-f" },
  { category: "Accessory II", folder: "accessory-ii", slug: "halo", display: "Halo", weight: 5, pair: "halo-f" },
  { category: "Accessory II", folder: "accessory-ii", slug: "jazzman-hat", display: "Jazzman Hat", weight: 5, pair: "jazzman-hat-f" },
  { category: "Accessory II", folder: "accessory-ii", slug: "leather-hat", display: "Leather Hat", weight: 3, pair: "leather-hat-f" },
  { category: "Accessory II", folder: "accessory-ii", slug: "top-hat", display: "Top Hat", weight: 3, pair: "top-hat-f" },

  // Accessory I (7 paired + 3 single = 14 rare) — STATIC
  { category: "Accessory I", folder: "accessories", slug: "3d-glasses", display: "3D Glasses", weight: 15, pair: "3d-glasses-f" },
  { category: "Accessory I", folder: "accessories", slug: "ar-goggles", display: "AR Goggles", weight: 1, pair: "ar-goggles-f" },
  { category: "Accessory I", folder: "accessories", slug: "band-aid", display: "Band-Aid", weight: 15 },
  { category: "Accessory I", folder: "accessories", slug: "clear-goggles", display: "Clear Goggles", weight: 1, pair: "clear-goggles-f" },
  { category: "Accessory I", folder: "accessories", slug: "dark-goggles", display: "Dark Goggles", weight: 1, pair: "dark-goggles-f" },
  { category: "Accessory I", folder: "accessories", slug: "eye-patch", display: "Eye Patch", weight: 15, maleOnly: true },
  { category: "Accessory I", folder: "accessories", slug: "laser", display: "Laser", weight: 5 },
  { category: "Accessory I", folder: "accessories", slug: "monocle", display: "Monocle", weight: 15 },
  { category: "Accessory I", folder: "accessories", slug: "sunglasses", display: "Sunglasses", weight: 15, pair: "sunglasses-f" },

  // Facial Hair (2 rare) — STATIC, male-only
  { category: "Facial Hair", folder: "facial-hair", slug: "mutton-chops", display: "Mutton Chops", weight: 15, maleOnly: true },
  { category: "Facial Hair", folder: "facial-hair", slug: "soul-patch", display: "Soul Patch", weight: 15, maleOnly: true },

  // Hair (2 rare) — STATIC, gender-locked
  { category: "Hair", folder: "hair", slug: "female-pigtails", display: "Pigtails", weight: 15, femaleOnly: true },
  { category: "Hair", folder: "hair", slug: "male-mohawk", display: "Mohawk", weight: 15, maleOnly: true },

  // Special (3 rare) — STATIC, all extra-rare
  { category: "Special", folder: "specials", slug: "chart-down", display: "Chart Down", weight: 0.5 },
  { category: "Special", folder: "specials", slug: "chart-up", display: "Chart Up", weight: 0.5 },
  { category: "Special", folder: "specials", slug: "glitch", display: "Glitch", weight: 0.5 },
];

/* ============================================================
 * LOCKED PERSONALITY ATLAS — full inventories per §5.
 * ============================================================ */

export interface LockedVariant {
  slug: string;
  display: string;
  maleOnly?: boolean;
  femaleOnly?: boolean;
  /** Marked rare per §4 (these get a rarity tag in the locked atlas too). */
  rare?: boolean;
}

/** Hair — 17 variants. Gender split by filename prefix. */
export const LOCKED_HAIR: LockedVariant[] = [
  { slug: "female-bangs", display: "Bangs", femaleOnly: true },
  { slug: "female-bob", display: "Bob", femaleOnly: true },
  { slug: "female-bun", display: "Bun", femaleOnly: true },
  { slug: "female-long-straight", display: "Long Straight", femaleOnly: true },
  { slug: "female-long-wavy", display: "Long Wavy", femaleOnly: true },
  { slug: "female-pigtails", display: "Pigtails", femaleOnly: true, rare: true },
  { slug: "female-short", display: "Short", femaleOnly: true },
  { slug: "female-wavy", display: "Wavy", femaleOnly: true },
  { slug: "male-bald", display: "Bald", maleOnly: true },
  { slug: "male-big", display: "Big", maleOnly: true },
  { slug: "male-bun", display: "Bun", maleOnly: true },
  { slug: "male-buzzcut", display: "Buzzcut", maleOnly: true },
  { slug: "male-combover", display: "Combover", maleOnly: true },
  { slug: "male-mohawk", display: "Mohawk", maleOnly: true, rare: true },
  { slug: "male-parted", display: "Parted", maleOnly: true },
  { slug: "male-spiky", display: "Spiky", maleOnly: true },
  { slug: "male-wavy", display: "Wavy", maleOnly: true },
];

/** Facial Hair — 9 variants, all male-only. */
export const LOCKED_FACIAL_HAIR: LockedVariant[] = [
  { slug: "clean-shaven", display: "Clean Shaven", maleOnly: true },
  { slug: "full-beard", display: "Full Beard", maleOnly: true },
  { slug: "goatee-i", display: "Goatee I", maleOnly: true },
  { slug: "goatee-ii", display: "Goatee II", maleOnly: true },
  { slug: "handlebars", display: "Handlebars", maleOnly: true },
  { slug: "mustache", display: "Mustache", maleOnly: true },
  { slug: "mutton-chops", display: "Mutton Chops", maleOnly: true, rare: true },
  { slug: "soul-patch", display: "Soul Patch", maleOnly: true, rare: true },
  { slug: "stubble", display: "Stubble", maleOnly: true },
];

/** Accessory I — 22 variants. Rares flagged per §4. */
export const LOCKED_ACCESSORY_I: LockedVariant[] = [
  { slug: "3d-glasses", display: "3D Glasses", maleOnly: true, rare: true },
  { slug: "3d-glasses-f", display: "3D Glasses", femaleOnly: true, rare: true },
  { slug: "ar-goggles", display: "AR Goggles", maleOnly: true, rare: true },
  { slug: "ar-goggles-f", display: "AR Goggles", femaleOnly: true, rare: true },
  { slug: "band-aid", display: "Band-Aid", rare: true },
  { slug: "blush", display: "Blush" },
  { slug: "clear-glasses", display: "Clear Glasses", maleOnly: true },
  { slug: "clear-glasses-f", display: "Clear Glasses", femaleOnly: true },
  { slug: "clear-goggles", display: "Clear Goggles", maleOnly: true, rare: true },
  { slug: "clear-goggles-f", display: "Clear Goggles", femaleOnly: true, rare: true },
  { slug: "dark-goggles", display: "Dark Goggles", maleOnly: true, rare: true },
  { slug: "dark-goggles-f", display: "Dark Goggles", femaleOnly: true, rare: true },
  { slug: "eye-patch", display: "Eye Patch", maleOnly: true, rare: true },
  { slug: "freckles", display: "Freckles" },
  { slug: "laser", display: "Laser", rare: true },
  { slug: "monocle", display: "Monocle", rare: true },
  { slug: "none", display: "No Accessory" },
  { slug: "round-glasses", display: "Round Glasses", maleOnly: true },
  { slug: "round-glasses-f", display: "Round Glasses", femaleOnly: true },
  { slug: "scar", display: "Scar" },
  { slug: "sunglasses", display: "Sunglasses", maleOnly: true, rare: true },
  { slug: "sunglasses-f", display: "Sunglasses", femaleOnly: true, rare: true },
];

/* ============================================================
 * PALETTE DATA — hex values from the brief's §5.
 * (Mirror of art/megans/palettes/*.json, hand-pinned here so the docs
 * page can render swatches without a runtime file read.)
 * ============================================================ */

export interface PaletteSwatch {
  name: string;
  hex: string;
}

/** Skin tones — 7 colors, in mint-roll order from §5. */
export const SKIN_TONE_PALETTE: PaletteSwatch[] = [
  { name: "Porcelain", hex: "#FFE0BD" },
  { name: "Ivory", hex: "#FFDBB4" },
  { name: "Beige", hex: "#F5D0A9" },
  { name: "Sand", hex: "#EDB98A" },
  { name: "Caramel", hex: "#D08B5B" },
  { name: "Toffee", hex: "#AE5D29" },
  { name: "Espresso", hex: "#694D3A" },
];

/** Hair colors — 9 colors, in mint-roll order from §5. */
export const HAIR_COLOR_PALETTE: PaletteSwatch[] = [
  { name: "Black", hex: "#090806" },
  { name: "Dark Brown", hex: "#2C222B" },
  { name: "Brown", hex: "#71635A" },
  { name: "Light Brown", hex: "#B7A69E" },
  { name: "Auburn", hex: "#8D4A43" },
  { name: "Strawberry", hex: "#DEBC99" },
  { name: "Blonde", hex: "#D6C4C2" },
  { name: "Platinum", hex: "#ECDCB0" },
  { name: "Grey", hex: "#E6E6E6" },
];

/* ============================================================
 * Where the build script writes generated previews.
 * <publicTraitPreview(folder, slug)> → "/docs/trait-previews/<folder>/<slug>.svg"
 * ============================================================ */
export function publicTraitPreview(folder: TraitFolder, slug: string): string {
  return `/docs/trait-previews/${folder}/${slug}.svg`;
}
