import type { ArtBase, ArtStage, BackgroundColor } from "./types";

/** OCCV2 background-color name → hex. Used for art panels & swatches. */
export const BG_HEX: Record<BackgroundColor, string> = {
  "Light Grey": "#B5B5B5",
  "Sky Blue": "#A8D5FF",
  Sage: "#B8C8B0",
  Rose: "#F2C4CE",
  "Light Red": "#FD5D63",
  "Light Orange": "#FCBB59",
  Cream: "#FFF2CC",
  "Ashen Brown": "#56483C",
  Lavender: "#D4C4E8",
};

/** Background colors whose contrast needs light foreground text. */
export const DARK_BG: BackgroundColor[] = ["Ashen Brown", "Light Red"];

/** Resolve an art base + stage to one of the 6 sample SVGs in /public/citizens. */
export function citizenArtSrc(art: ArtBase, stage: ArtStage): string {
  const file =
    art === "female-bob"
      ? "sample-female-bob-light-grey"
      : "sample-male-buzzcut-light-grey";
  const suffix = stage === "I" ? "" : `-${stage}`;
  return `/citizens/${file}${suffix}.svg`;
}

/**
 * Live mainnet deployment. Addresses are pinned constants — never derived
 * from wallet state — and verified against deployments/occv2-mainnet.json.
 */
export const CHAIN_ID = 1 as const;

export const ADDRESSES = {
  occv2: "0x55ad98c4D8ECE5E1f40C04e0E1D87c014584Dc76",
  market: "0xc1D841B1C7DA40b4242429f562a22dC8A6076f54",
  // WardrobeManager — clothing/color reroll bundle (from
  // deployments/occv2-wardrobe-bundle-mainnet.json).
  wardrobe: "0x5375335840a54e0bEC888DD953af8b66E6150800",
  // TraitInspectorV2 — read-only laser/hideable-accessory introspection
  // (from deployments/occv2-inspector-v2-mainnet.json). Supersedes the V1
  // inspector at 0x566F771850fbD2Ca7860120f83a83299a332b3F5, which spuriously
  // reported `ownsHideableAccessory == false` when the registry contained
  // rare blocked Eye variants (the live registry does).
  inspector: "0xBA8D9B50b54dd3B1b949A9DE7334Ca8D97F1DCFb",
} as const;

/**
 * Eye variants in registry index order — alphabetical, no `none` variant.
 * Used to translate `intrinsicAccessoryEyesBlockMask` bit positions back into
 * human-readable eye names for the LaserCallout's "compatible eyes" list.
 */
export const OCCV2_EYE_NAMES = [
  "angry",
  "animated",
  "cross-eyed",
  "happy",
  "heart-eyes",
  "normal",
  "side-look",
  "sleepy",
  "small",
  "squinting",
  "starry",
  "surprised",
  "wide-open",
  "wink",
] as const;

/** Contract / chain facts surfaced in the UI (mainnet, immutable). */
export const CONTRACT = {
  address: ADDRESSES.occv2,
  chain: "Ethereum Mainnet",
  chainId: CHAIN_ID,
  totalSupply: 10000,
  // Historical free-mint figures — surfaced in /docs to narrate the mint
  // program that has since wrapped. Not used to drive any live behavior.
  freeMintCap: 2,
  balanceGateMin: 0.015,
  balanceGateSafe: 0.02,
  // default paid action fee (ETH) — UI fallback only; the live fee is read
  // from traitLockFee() and that value is authoritative.
  lockTraitsFee: 0.001,
} as const;

/** Permalink to a specific V2 token on OpenSea. */
export const openseaTokenUrl = (id: number): string =>
  `https://opensea.io/assets/ethereum/${ADDRESSES.occv2.toLowerCase()}/${id}`;

export const SOCIALS = {
  raffle: "https://dropr.fun",
  marketplace: "https://opensea.io/collection/onchain-citizens-v2",
  twitter: "https://x.com/citizensonchain",
  etherscan: "https://etherscan.io",
};

/** Master switch for the dormant Trait Market. Flip to true to launch. */
export const MARKET_LIVE = false;

/**
 * Master switch for the Live Feed. Phase 2a ships a client-side websocket
 * stream (no backend, no history — live-from-now-on). Flip back to false
 * to instantly revert /feed to the "coming soon" state without removing
 * the live code.
 */
export const FEED_LIVE = true;

/**
 * Whether trait reshuffle-on-transfer is active yet. This is a fallback for
 * SSR / pre-connection render only — the live value is read from the
 * contract's reshufflesActive() view via useReshufflesActive() and that
 * read is authoritative once available.
 */
export const RESHUFFLES_ACTIVE = false;
