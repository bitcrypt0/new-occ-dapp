import { createPublicClient, webSocket } from "viem";
import { mainnet } from "viem/chains";

/**
 * Dedicated websocket public client for the Live Feed.
 *
 * Phase 2a (interim, no-backend approach): the dapp subscribes directly to
 * mainnet logs over a public WS endpoint. PublicNode supports `eth_subscribe`
 * which gives a push-based stream — no polling, no infrastructure to host.
 *
 * Override the endpoint with NEXT_PUBLIC_RPC_WS_URL when a private provider
 * is available; the rest of the dapp keeps using the HTTP transport configured
 * in `lib/wagmi.ts` so this connection only opens on the /feed route.
 */
const DEFAULT_FEED_WS_URL = "wss://ethereum-rpc.publicnode.com";

export const FEED_WS_URL =
  process.env.NEXT_PUBLIC_RPC_WS_URL ?? DEFAULT_FEED_WS_URL;

export const wsPublicClient = createPublicClient({
  chain: mainnet,
  transport: webSocket(FEED_WS_URL, {
    reconnect: { attempts: 10, delay: 2_000 },
    timeout: 15_000,
  }),
});
