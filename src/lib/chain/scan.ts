import type { PublicClient } from "viem";
import { getAddress, isAddressEqual } from "viem";

type AbiContract = { address: `0x${string}`; abi: readonly unknown[] };

/** One row of an `allowFailure` multicall result. */
export type MulticallRow =
  | { status: "success"; result: unknown }
  | { status: "failure"; error: unknown };

/** Chunk a numeric range into id arrays of at most `size`. */
function chunkRange(start: number, end: number, size: number): number[][] {
  const chunks: number[][] = [];
  for (let lo = start; lo <= end; lo += size) {
    const hi = Math.min(lo + size - 1, end);
    const ids: number[] = [];
    for (let id = lo; id <= hi; id++) ids.push(id);
    chunks.push(ids);
  }
  return chunks;
}

const CHUNK = 800;

/**
 * Scan `ownerOf(id)` across [startId, endId] and return the ids held by
 * `owner`. Burned / unminted ids revert and are skipped (allowFailure).
 * Stops early once `expected` matches are found — holders typically own a
 * handful of low ids, so the common case resolves fast.
 */
export async function scanOwnedIds(
  client: PublicClient,
  contract: AbiContract,
  owner: `0x${string}`,
  startId: number,
  endId: number,
  expected?: number,
): Promise<number[]> {
  const found: number[] = [];
  for (const ids of chunkRange(startId, endId, CHUNK)) {
    const results = (await client.multicall({
      allowFailure: true,
      contracts: ids.map((id) => ({
        address: contract.address,
        abi: contract.abi,
        functionName: "ownerOf",
        args: [BigInt(id)],
      })),
    } as never)) as MulticallRow[];
    results.forEach((r, i) => {
      if (r.status === "success" && r.result) {
        try {
          if (isAddressEqual(getAddress(r.result as string), owner)) {
            found.push(ids[i]);
          }
        } catch {
          /* ignore malformed address */
        }
      }
    });
    if (expected != null && found.length >= expected) break;
  }
  return found;
}

