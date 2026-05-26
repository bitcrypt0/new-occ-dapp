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
  occv1: "0xB7fb783381d0cF227C2A23ae2D62a43c08B70F12",
  market: "0xc1D841B1C7DA40b4242429f562a22dC8A6076f54",
  // CitizenStaker — V1 staking vault (from deployments/mainnet-1.json).
  citizenStaker: "0x63E59D80C08aE9BB151fEcDC07d314505A2aEC2E",
} as const;

/** Contract / chain facts surfaced in the UI (mainnet, immutable). */
export const CONTRACT = {
  address: ADDRESSES.occv2,
  chain: "Ethereum Mainnet",
  chainId: CHAIN_ID,
  totalSupply: 10000,
  migrationBucketEnd: 8000,
  /**
   * The contiguous **never-minted block** on V1: token ids 4541–8000 were
   * never minted on the V1 contract. These ids are the easiest source of
   * free-mintable V2 ids — a public `claimed(id)` scan across this range
   * is enough to enumerate them.
   *
   * NOTE: this is NOT the full free-mint pool. The actual contract rule
   * is `tokenId in 1..8000 AND OCC.ownerOf(tokenId) reverts`, which also
   * includes V1 tokens that were burnt-in-place inside 1..4540 (~24 of
   * them at last check). Treat these constants as the bounds of the
   * contiguous block only — do not codify a "free-mint range" assumption.
   */
  neverMintedBlockStart: 4541,
  neverMintedBlockEnd: 8000,
  freeMintCap: 2,
  // anti-bot balance gate (ETH) — checked, never spent
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
