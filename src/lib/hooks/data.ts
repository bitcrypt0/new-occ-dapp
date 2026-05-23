"use client";

/**
 * Real on-chain data layer — wagmi/viem reads and writes against the live
 * OCCV2 mainnet contracts. Read hooks return `{ data, isLoading, error }`
 * style objects; write functions keep the `(args, onState) => Promise`
 * shape and drive the same TxState lifecycle the UI already consumes.
 */
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
  getAccount,
  getPublicClient,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { formatEther, getAddress, isAddress } from "viem";
import { wagmiConfig } from "../wagmi";
import { CHAIN_ID, CONTRACT } from "../constants";
import {
  occv1Contract,
  occv2Contract,
  marketContract,
  citizenStakerContract,
} from "../chain/contracts";
import { parseCitizen, parseV1Token } from "../chain/citizen";
import { scanOwnedIds, scanUnclaimedIds, type MulticallRow } from "../chain/scan";
import { decodeTxError } from "../chain/errors";
import type { Citizen, MarketListing, TxState, V1Token } from "../types";

/* ============================ READS ============================ */

/** Citizens owned by the connected wallet. */
export function useOwnedCitizens() {
  const { address, isConnected } = useAccount();
  const client = usePublicClient();

  const query = useQuery({
    queryKey: ["ownedCitizens", address],
    enabled: Boolean(isConnected && address && client),
    queryFn: async (): Promise<Citizen[]> => {
      const owner = getAddress(address!);
      const balance = (await client!.readContract({
        ...occv2Contract,
        functionName: "balanceOf",
        args: [owner],
      })) as bigint;
      if (balance === 0n) return [];

      const ids = await scanOwnedIds(
        client!,
        occv2Contract,
        owner,
        1,
        CONTRACT.totalSupply,
        Number(balance),
      );
      return loadCitizens(client!, ids);
    },
  });

  return {
    citizens: query.data ?? [],
    isLoading: query.isLoading && query.fetchStatus !== "idle",
    error: query.error as Error | null,
  };
}

/** V1 tokens held by the connected wallet, claimable into V2. */
export function useV1Tokens() {
  const { address, isConnected } = useAccount();
  const client = usePublicClient();

  const query = useQuery({
    queryKey: ["v1Tokens", address],
    enabled: Boolean(isConnected && address && client),
    queryFn: async (): Promise<V1Token[]> => {
      const owner = getAddress(address!);
      const balance = (await client!.readContract({
        ...occv1Contract,
        functionName: "balanceOf",
        args: [owner],
      })) as bigint;
      if (balance === 0n) return [];

      // V1's highest minted id is 4540; scan that bounded range.
      const ids = await scanOwnedIds(
        client!,
        occv1Contract,
        owner,
        1,
        4540,
        Number(balance),
      );
      return loadV1Tokens(client!, ids);
    },
  });

  return {
    tokens: query.data ?? [],
    isLoading: query.isLoading && query.fetchStatus !== "idle",
    error: query.error as Error | null,
  };
}

/** Decode a batch of V1 token ids into V1Tokens via V1 `tokenURI`. */
async function loadV1Tokens(
  client: NonNullable<ReturnType<typeof usePublicClient>>,
  ids: number[],
  staked = false,
): Promise<V1Token[]> {
  if (ids.length === 0) return [];
  const uris = (await client.multicall({
    allowFailure: true,
    contracts: ids.map((id) => ({
      ...occv1Contract,
      functionName: "tokenURI",
      args: [BigInt(id)],
    })),
  } as never)) as MulticallRow[];
  return ids.map((id, i) => {
    const r = uris[i];
    const uri =
      r && r.status === "success" && typeof r.result === "string"
        ? r.result
        : undefined;
    const token = parseV1Token(id, uri);
    return staked ? { ...token, staked: true } : token;
  });
}

/**
 * V1 tokens the connected wallet has staked in the CitizenStaker vault.
 * They must be unstaked before they can be migrated to V2.
 */
export function useStakedV1Tokens() {
  const { address, isConnected } = useAccount();
  const client = usePublicClient();

  const query = useQuery({
    queryKey: ["stakedV1Tokens", address],
    enabled: Boolean(isConnected && address && client),
    queryFn: async (): Promise<V1Token[]> => {
      const owner = getAddress(address!);
      const ids = (await client!.readContract({
        ...citizenStakerContract,
        functionName: "stakedTokensOf",
        args: [owner],
      })) as readonly bigint[];
      if (ids.length === 0) return [];
      return loadV1Tokens(client!, ids.map(Number), true);
    },
  });

  return {
    tokens: query.data ?? [],
    isLoading: query.isLoading && query.fetchStatus !== "idle",
    error: query.error as Error | null,
  };
}

/** Fetch a fixed set of V2 Citizens by id — used by the post-mint modal. */
export function useCitizensByIds(ids: number[]) {
  const client = usePublicClient();
  const key = [...ids].sort((a, b) => a - b).join(",");
  const query = useQuery({
    queryKey: ["citizensByIds", key],
    enabled: Boolean(client && ids.length > 0),
    queryFn: () => loadCitizens(client!, ids),
  });
  return {
    citizens: query.data ?? [],
    isLoading: query.isLoading && query.fetchStatus !== "idle",
  };
}

/** Decode a batch of token ids into Citizens via tokenURI. */
async function loadCitizens(
  client: NonNullable<ReturnType<typeof usePublicClient>>,
  ids: number[],
): Promise<Citizen[]> {
  if (ids.length === 0) return [];
  const uris = (await client.multicall({
    allowFailure: true,
    contracts: ids.map((id) => ({
      ...occv2Contract,
      functionName: "tokenURI",
      args: [BigInt(id)],
    })),
  } as never)) as MulticallRow[];
  const out: Citizen[] = [];
  uris.forEach((r, i) => {
    if (r.status === "success" && typeof r.result === "string") {
      try {
        out.push(parseCitizen(ids[i], r.result));
      } catch {
        /* skip a token whose metadata failed to parse */
      }
    }
  });
  return out;
}

/** One Citizen by token id — for /citizen/[id]. */
export function useCitizen(id: number) {
  const client = usePublicClient();
  const valid = Number.isInteger(id) && id >= 1 && id <= CONTRACT.totalSupply;

  const query = useQuery({
    queryKey: ["citizen", id],
    enabled: Boolean(valid && client),
    queryFn: async (): Promise<Citizen | undefined> => {
      try {
        const uri = (await client!.readContract({
          ...occv2Contract,
          functionName: "tokenURI",
          args: [BigInt(id)],
        })) as string;
        return parseCitizen(id, uri);
      } catch {
        // Non-existent / unminted token reverts — treat as "not found".
        return undefined;
      }
    },
  });

  return {
    citizen: query.data,
    isLoading: valid && query.isLoading && query.fetchStatus !== "idle",
    error: query.error as Error | null,
    notFound: valid && !query.isLoading && query.data === undefined,
  };
}

/** Is the connected wallet the owner of this token? Gates owner actions. */
export function useIsOwner(id: number): boolean {
  const { address, isConnected } = useAccount();
  const valid = Number.isInteger(id) && id >= 1 && id <= CONTRACT.totalSupply;
  const { data: owner } = useReadContract({
    ...occv2Contract,
    functionName: "ownerOf",
    args: [BigInt(valid ? id : 1)],
    query: { enabled: valid },
  });
  if (!isConnected || !address || !owner) return false;
  try {
    return getAddress(owner as string) === getAddress(address);
  } catch {
    return false;
  }
}

export interface MintAvailability {
  connected: boolean;
  holdsV1: boolean;
  hasClaimed: boolean;
  remainingCap: number;
  mintableIds: number[];
  isLoading: boolean;
}

/** Free Mint eligibility + the live free-mintable id pool. */
export function useMintAvailability(): MintAvailability {
  const { address, isConnected } = useAccount();
  const client = usePublicClient();

  // Per-wallet eligibility reads.
  const elig = useQuery({
    queryKey: ["mintEligibility", address],
    enabled: Boolean(isConnected && address && client),
    queryFn: async () => {
      const owner = getAddress(address!);
      const [hasClaimed, freeMinted, v1Balance] = await Promise.all([
        client!.readContract({
          ...occv2Contract,
          functionName: "hasClaimed",
          args: [owner],
        }) as Promise<boolean>,
        client!.readContract({
          ...occv2Contract,
          functionName: "freeMintedCount",
          args: [owner],
        }) as Promise<bigint>,
        client!.readContract({
          ...occv1Contract,
          functionName: "balanceOf",
          args: [owner],
        }) as Promise<bigint>,
      ]);
      return {
        hasClaimed,
        freeMinted: Number(freeMinted),
        holdsV1: v1Balance > 0n,
      };
    },
  });

  // The free-mintable id pool — ids 4541–8000 not yet claimed on V2.
  const pool = useQuery({
    queryKey: ["mintablePool"],
    enabled: Boolean(client),
    staleTime: 60_000,
    queryFn: () =>
      scanUnclaimedIds(
        client!,
        occv2Contract,
        CONTRACT.freeMintRangeStart,
        CONTRACT.freeMintRangeEnd,
      ),
  });

  return {
    connected: isConnected,
    holdsV1: elig.data?.holdsV1 ?? false,
    hasClaimed: elig.data?.hasClaimed ?? false,
    remainingCap: Math.max(0, CONTRACT.freeMintCap - (elig.data?.freeMinted ?? 0)),
    mintableIds: pool.data ?? [],
    isLoading: elig.isLoading || pool.isLoading,
  };
}

/** Trait Market listings (empty while the market is dormant). */
export function useMarketListings() {
  const client = usePublicClient();
  const query = useQuery({
    queryKey: ["marketListings"],
    enabled: Boolean(client),
    queryFn: async (): Promise<MarketListing[]> => {
      const next = (await client!.readContract({
        ...marketContract,
        functionName: "nextListingId",
      })) as bigint;
      if (next === 0n) return [];
      const ids = Array.from({ length: Number(next) }, (_, i) => i);
      const rows = (await client!.multicall({
        allowFailure: true,
        contracts: ids.map((i) => ({
          ...marketContract,
          functionName: "listings",
          args: [BigInt(i)],
        })),
      } as never)) as MulticallRow[];
      const out: MarketListing[] = [];
      rows.forEach((r, i) => {
        if (r.status !== "success" || !Array.isArray(r.result)) return;
        const [seller, tokenId, category, price, , active] = r.result as [
          string,
          bigint,
          number,
          bigint,
          bigint,
          boolean,
        ];
        if (!active) return;
        out.push({
          id: String(ids[i]),
          sellerCitizenId: Number(tokenId),
          category: "Eyes",
          traitValue: `Category ${category}`,
          priceEth: Number(formatEther(price)),
          art: Number(tokenId) % 2 === 0 ? "female-bob" : "male-buzzcut",
          stage: "I",
        });
        void seller;
      });
      return out;
    },
  });
  return {
    listings: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

/** All Citizens — collection-wide browsing. Needs an indexer; empty for now. */
export function useAllCitizens(): Citizen[] {
  return [];
}

/** Live `reshufflesActive()` flag — drives future/present-tense copy. */
export function useReshufflesActive(): boolean {
  const { data } = useReadContract({
    ...occv2Contract,
    functionName: "reshufflesActive",
  });
  return Boolean(data);
}

/**
 * Has the connected wallet already approved the V2 contract to move its V1
 * tokens? V1 `setApprovalForAll(v2, true)` is a one-time, owner-wide grant —
 * persistent on-chain — so the claim flow should skip the Approve step for
 * anyone who has already done it (or who approved through another dapp).
 */
export function useV1ApprovedForV2(): { approved: boolean; isLoading: boolean } {
  const { address, isConnected } = useAccount();
  const { data, isLoading } = useReadContract({
    ...occv1Contract,
    functionName: "isApprovedForAll",
    args: [
      (address ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
      occv2Contract.address,
    ],
    query: { enabled: isConnected && Boolean(address) },
  });
  return { approved: Boolean(data), isLoading: isConnected && isLoading };
}

/** Live `traitLockFee()` in wei — the lock/unlock payable amount. */
export function useTraitLockFee(): bigint | undefined {
  const { data } = useReadContract({
    ...occv2Contract,
    functionName: "traitLockFee",
  });
  return data as bigint | undefined;
}

/* ===================== BALANCE-GATE LOGIC ====================== */

export type BalanceTier = "blocked" | "caution" | "good";

/** Classify a real wallet balance against the 0.015 ETH anti-bot gate. */
export function classifyBalance(balanceEth: number): BalanceTier {
  if (balanceEth < CONTRACT.balanceGateMin) return "blocked";
  if (balanceEth < CONTRACT.balanceGateSafe) return "caution";
  return "good";
}

/* ============================ WRITES =========================== */

/** Result of a write — a lifecycle state plus a human error when it fails. */
export interface TxResult {
  state: TxState;
  error?: string;
}

interface WriteParams {
  contract:
    | typeof occv2Contract
    | typeof occv1Contract
    | typeof marketContract
    | typeof citizenStakerContract;
  functionName: string;
  args: readonly unknown[];
  value?: bigint;
  onState: (s: TxState) => void;
}

/**
 * Core write path: network guard → own gas estimation with a 30% buffer →
 * submit with an explicit gas limit → await receipt. Passing an explicit
 * gas limit makes wallets (Rabby especially) skip their faulty pre-flight,
 * which is the concrete fix for the free-mint "may fail" false positive.
 */
async function sendWrite({
  contract,
  functionName,
  args,
  value,
  onState,
}: WriteParams): Promise<TxResult> {
  onState("pending");
  try {
    const account = getAccount(wagmiConfig);
    if (!account.address) {
      onState("fail");
      return { state: "fail", error: "Connect your wallet first." };
    }
    if (account.chainId !== CHAIN_ID) {
      onState("fail");
      return {
        state: "fail",
        error: "Your wallet is on the wrong network. Switch to Ethereum Mainnet.",
      };
    }

    const client = getPublicClient(wagmiConfig);
    if (!client) {
      onState("fail");
      return { state: "fail", error: "No RPC connection. Try again in a moment." };
    }

    // Estimate gas ourselves and buffer it generously. This also acts as a
    // pre-flight: a genuine revert throws here and is surfaced before signing.
    let gas: bigint | undefined;
    try {
      const estimate = await client.estimateContractGas({
        address: contract.address,
        abi: contract.abi as never,
        functionName: functionName as never,
        args: args as never,
        account: account.address,
        value,
      });
      gas = (estimate * 130n) / 100n;
    } catch (estErr) {
      onState("fail");
      return { state: "fail", error: decodeTxError(estErr) };
    }

    const hash = await writeContract(wagmiConfig, {
      address: contract.address,
      abi: contract.abi as never,
      functionName: functionName as never,
      args: args as never,
      value,
      gas,
      chainId: CHAIN_ID,
      account: account.address,
    });

    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
      chainId: CHAIN_ID,
    });
    const ok = receipt.status === "success";
    onState(ok ? "success" : "fail");
    return ok
      ? { state: "success" }
      : { state: "fail", error: "The transaction reverted on-chain." };
  } catch (err) {
    onState("fail");
    return { state: "fail", error: decodeTxError(err) };
  }
}

/** Validate a list of token ids is non-empty and in range. */
function validateIds(ids: number[], lo: number, hi: number): string | null {
  if (ids.length === 0) return "Select at least one token first.";
  for (const id of ids) {
    if (!Number.isInteger(id) || id < lo || id > hi) {
      return `Token id ${id} is outside the valid range.`;
    }
  }
  return null;
}

/** OCC V1 `setApprovalForAll(v2, true)` — required before claiming. */
export function approveV2(onState: (s: TxState) => void): Promise<TxResult> {
  return sendWrite({
    contract: occv1Contract,
    functionName: "setApprovalForAll",
    args: [occv2Contract.address, true],
    onState,
  });
}

/** V2 `claim(id)` / `claimBatch(ids)`. */
export function claimTokens(
  ids: number[],
  onState: (s: TxState) => void,
): Promise<TxResult> {
  const bad = validateIds(ids, 1, CONTRACT.migrationBucketEnd);
  if (bad) {
    onState("fail");
    return Promise.resolve({ state: "fail", error: bad });
  }
  return ids.length === 1
    ? sendWrite({
        contract: occv2Contract,
        functionName: "claim",
        args: [BigInt(ids[0])],
        onState,
      })
    : sendWrite({
        contract: occv2Contract,
        functionName: "claimBatch",
        args: [ids.map((i) => BigInt(i))],
        onState,
      });
}

/** V2 `freeMint(id)` / `freeMintBatch(ids)` — explicit-gas path (Mandate 5.2). */
export function freeMint(
  ids: number[],
  onState: (s: TxState) => void,
): Promise<TxResult> {
  const bad = validateIds(ids, 1, CONTRACT.migrationBucketEnd);
  if (bad) {
    onState("fail");
    return Promise.resolve({ state: "fail", error: bad });
  }
  return ids.length === 1
    ? sendWrite({
        contract: occv2Contract,
        functionName: "freeMint",
        args: [BigInt(ids[0])],
        onState,
      })
    : sendWrite({
        contract: occv2Contract,
        functionName: "freeMintBatch",
        args: [ids.map((i) => BigInt(i))],
        onState,
      });
}

/** V2 `rerollBackground(id)` — free, random new background. */
export function rerollBackground(
  id: number,
  onState: (s: TxState) => void,
): Promise<TxResult> {
  return sendWrite({
    contract: occv2Contract,
    functionName: "rerollBackground",
    args: [BigInt(id)],
    onState,
  });
}

/** V2 `lockTraits(id)` — payable; value read live from `traitLockFee()`. */
export async function lockTraits(
  id: number,
  onState: (s: TxState) => void,
): Promise<TxResult> {
  const fee = await readTraitLockFee(onState);
  if (typeof fee !== "bigint") return fee;
  return sendWrite({
    contract: occv2Contract,
    functionName: "lockTraits",
    args: [BigInt(id)],
    value: fee,
    onState,
  });
}

/** V2 `unlockTraits(id)` — payable; value read live from `traitLockFee()`. */
export async function unlockTraits(
  id: number,
  onState: (s: TxState) => void,
): Promise<TxResult> {
  const fee = await readTraitLockFee(onState);
  if (typeof fee !== "bigint") return fee;
  return sendWrite({
    contract: occv2Contract,
    functionName: "unlockTraits",
    args: [BigInt(id)],
    value: fee,
    onState,
  });
}

/** Read the live trait-lock fee; returns a failed TxResult on RPC error. */
async function readTraitLockFee(
  onState: (s: TxState) => void,
): Promise<bigint | TxResult> {
  try {
    const client = getPublicClient(wagmiConfig);
    if (!client) throw new Error("No RPC connection");
    return (await client.readContract({
      ...occv2Contract,
      functionName: "traitLockFee",
    })) as bigint;
  } catch (err) {
    onState("fail");
    return { state: "fail", error: decodeTxError(err) };
  }
}

/** CitizenStaker `unstake(tokenIds[])` — frees staked V1 tokens for migration. */
export function unstakeV1(
  ids: number[],
  onState: (s: TxState) => void,
): Promise<TxResult> {
  const bad = validateIds(ids, 1, 4540);
  if (bad) {
    onState("fail");
    return Promise.resolve({ state: "fail", error: bad });
  }
  return sendWrite({
    contract: citizenStakerContract,
    functionName: "unstake",
    args: [ids.map((i) => BigInt(i))],
    onState,
  });
}

/** ERC-721 `transferFrom(account, to, id)`. */
export function transferCitizen(
  id: number,
  to: string,
  onState: (s: TxState) => void,
): Promise<TxResult> {
  if (!isAddress(to)) {
    onState("fail");
    return Promise.resolve({
      state: "fail",
      error: "That recipient address isn't valid.",
    });
  }
  const account = getAccount(wagmiConfig);
  if (!account.address) {
    onState("fail");
    return Promise.resolve({ state: "fail", error: "Connect your wallet first." });
  }
  return sendWrite({
    contract: occv2Contract,
    functionName: "transferFrom",
    args: [account.address, getAddress(to), BigInt(id)],
    onState,
  });
}

/* ----- Trait Market (dormant; wired so flipping MARKET_LIVE works) ----- */

export function listTrait(
  args: { tokenId: number; category: number; priceWei: bigint; expiry: bigint },
  onState: (s: TxState) => void,
): Promise<TxResult> {
  return sendWrite({
    contract: marketContract,
    functionName: "list",
    args: [BigInt(args.tokenId), args.category, args.priceWei, args.expiry],
    onState,
  });
}

export function cancelListing(
  id: string,
  onState: (s: TxState) => void,
): Promise<TxResult> {
  return sendWrite({
    contract: marketContract,
    functionName: "cancel",
    args: [BigInt(id)],
    onState,
  });
}

export function acceptListing(
  id: string,
  buyerTokenId: number,
  priceWei: bigint,
  onState: (s: TxState) => void,
): Promise<TxResult> {
  return sendWrite({
    contract: marketContract,
    functionName: "accept",
    args: [BigInt(id), BigInt(buyerTokenId)],
    value: priceWei,
    onState,
  });
}
