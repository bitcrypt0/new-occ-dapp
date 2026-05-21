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
   * V1's highest minted token id is 4540, so V2 ids 4541–8000 have no live
   * V1 counterpart and form the free-mint pool (minus ids already claimed).
   */
  freeMintRangeStart: 4541,
  freeMintRangeEnd: 8000,
  freeMintCap: 2,
  // anti-bot balance gate (ETH) — checked, never spent
  balanceGateMin: 0.015,
  balanceGateSafe: 0.02,
  // default paid action fee (ETH) — UI fallback only; the live fee is read
  // from traitLockFee() and that value is authoritative.
  lockTraitsFee: 0.001,
} as const;

export const SOCIALS = {
  raffle: "https://dropr.fun",
  marketplace: "https://opensea.io",
  twitter: "https://x.com",
  etherscan: "https://etherscan.io",
};

/** Master switch for the dormant Trait Market. Flip to true to launch. */
export const MARKET_LIVE = false;

/**
 * Master switch for the Live Feed. Stays false until the off-chain indexer
 * is built, deployed, and confirmed online (Phase 2). Flipping this is a
 * deliberate post-indexer step.
 */
export const FEED_LIVE = false;

/**
 * Whether trait reshuffle-on-transfer is active yet. This is a fallback for
 * SSR / pre-connection render only — the live value is read from the
 * contract's reshufflesActive() view via useReshufflesActive() and that
 * read is authoritative once available.
 */
export const RESHUFFLES_ACTIVE = false;
