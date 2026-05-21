/**
 * OCCV2 domain types.
 * These shapes mirror what Agent 2 will populate from real contract reads.
 * Keep them stable — INTEGRATION.md references them.
 */

export const TRAIT_CATEGORIES = [
  "Background",
  "Body",
  "Skin Tone",
  "Head Shape",
  "Eyes",
  "Eyebrows",
  "Mouth",
  "Hair",
  "Facial Hair",
  "Clothing",
  "Accessory",
  "Special",
  "Hair Back",
  "Accessory II",
] as const;

export type TraitCategory = (typeof TRAIT_CATEGORIES)[number];

/** Categories that re-roll into a new look on every transfer. */
export const RESHUFFLABLE: TraitCategory[] = [
  "Eyes",
  "Eyebrows",
  "Mouth",
  "Clothing",
  "Accessory II",
];

export const MOODS = ["Happy", "Sad", "Surprised", "Bored", "Silly", "Angry"] as const;
export type Mood = (typeof MOODS)[number];

export const BACKGROUND_COLORS = [
  "Light Grey",
  "Sky Blue",
  "Sage",
  "Rose",
  "Light Red",
  "Light Orange",
  "Cream",
  "Ashen Brown",
  "Lavender",
] as const;
export type BackgroundColor = (typeof BACKGROUND_COLORS)[number];

export const SKIN_TONES = [
  "Porcelain",
  "Ivory",
  "Beige",
  "Sand",
  "Caramel",
  "Toffee",
  "Espresso",
] as const;
export type SkinTone = (typeof SKIN_TONES)[number];

export const HAIR_COLORS = [
  "Black",
  "Dark Brown",
  "Brown",
  "Light Brown",
  "Auburn",
  "Strawberry",
  "Blonde",
  "Platinum",
  "Grey",
] as const;
export type HairColor = (typeof HAIR_COLORS)[number];

export type Gender = "Male" | "Female";

/** Which sample-art base a mock Citizen renders with. */
export type ArtBase = "female-bob" | "male-buzzcut";
export type ArtStage = "I" | "II" | "III";

export interface Attribute {
  category: TraitCategory;
  value: string;
  /** A rare attribute is frozen forever — survives every reshuffle. */
  rare?: boolean;
  /** Whether this category re-rolls on transfer. */
  reshufflable?: boolean;
}

export interface Citizen {
  id: number;
  gender: Gender;
  /** Art base + stage select one of the 6 sample SVGs. */
  art: ArtBase;
  stage: ArtStage;
  mood: Mood;
  skinTone: SkinTone;
  hairColor: HairColor;
  background: BackgroundColor;
  transferCount: number;
  traitsLocked: boolean;
  attributes: Attribute[];
  /**
   * The on-chain art as a `data:image/svg+xml;base64,…` URI, decoded from
   * `tokenURI`. Rendered via <img> only. Absent for mock/sample fixtures.
   */
  imageUri?: string;
}

/** A token from the original OCC V1 collection, claimable into V2. */
export interface V1Token {
  id: number;
  art: ArtBase;
  /** On-chain V1 art as a `data:` URI, decoded from V1 `tokenURI`. */
  imageUri?: string;
  /** True when the token is currently held by the CitizenStaker vault. */
  staked?: boolean;
}

/** A rare-trait listing on the (dormant) Trait Market. */
export interface MarketListing {
  id: string;
  sellerCitizenId: number;
  category: TraitCategory;
  traitValue: string;
  priceEth: number;
  art: ArtBase;
  stage: ArtStage;
}

export interface MockWallet {
  connected: boolean;
  address: string;
  /** ETH balance — drives the Free Mint balance gate. */
  balanceEth: number;
}

/** Visual-only transaction lifecycle. Agent 2 makes these real. */
export type TxState = "idle" | "pending" | "success" | "fail";
