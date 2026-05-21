import "server-only";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { unstable_cache } from "next/cache";
import { occv2Contract } from "./contracts";

/** Server-side viem client for SSR contract reads (public RPC). */
const serverClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL ?? "https://ethereum-rpc.publicnode.com"),
});

/**
 * Live `reshufflesActive()` for server-rendered pages (homepage, how-it-works).
 * Reshuffle activation is a rare one-way event, so a 60s cache is ample.
 * On RPC failure it fails safe to `false` — the copy stays future-tense.
 */
export const getReshufflesActive = unstable_cache(
  async (): Promise<boolean> => {
    try {
      return Boolean(
        await serverClient.readContract({
          ...occv2Contract,
          functionName: "reshufflesActive",
        }),
      );
    } catch {
      return false;
    }
  },
  ["reshufflesActive"],
  { revalidate: 60 },
);
