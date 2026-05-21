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
  V1Token,
} from "../types";

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

  const attributes: Attribute[] = raw
    .filter((a) => a.trait_type && TRAIT_CATEGORY_SET.has(a.trait_type))
    .map((a) => {
      const category = a.trait_type as TraitCategory;
      return {
        category,
        value: String(a.value ?? ""),
        reshufflable: RESHUFFLABLE.includes(category),
      };
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

/**
 * Parse an OCC V1 `tokenURI` payload into a `V1Token` — the on-chain V1 art
 * and a best-effort art base. Falls back gracefully if the metadata can't
 * be decoded so the claim flow still works from the token id alone.
 */
export function parseV1Token(tokenId: number, tokenUri?: string): V1Token {
  const fallbackArt = tokenId % 2 === 0 ? "female-bob" : "male-buzzcut";
  if (!tokenUri) return { id: tokenId, art: fallbackArt };
  try {
    const meta = JSON.parse(decodeDataUri(tokenUri)) as RawMetadata;
    const genderAttr = (meta.attributes ?? []).find(
      (a) => a.trait_type === "Gender",
    )?.value;
    const art =
      genderAttr === "Female"
        ? "female-bob"
        : genderAttr === "Male"
          ? "male-buzzcut"
          : fallbackArt;
    return { id: tokenId, art, imageUri: meta.image };
  } catch {
    return { id: tokenId, art: fallbackArt };
  }
}
