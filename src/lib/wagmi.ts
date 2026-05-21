import { http, createConfig, fallback, webSocket } from "wagmi";
import { mainnet } from "wagmi/chains";
import type { Transport } from "viem";

/**
 * wagmi config — Ethereum mainnet only, EIP-6963 multi-injected-provider
 * discovery (the default). No RainbowKit / ConnectKit / WalletConnect.
 *
 * RPC: public endpoints by default (no paid provider). Override via
 * NEXT_PUBLIC_RPC_URL / NEXT_PUBLIC_RPC_WS_URL to drop in a private key
 * later with zero code changes. Multiple HTTP endpoints are stacked behind
 * viem's `fallback` so a single endpoint outage doesn't break the dapp.
 */

const PUBLIC_HTTP = [
  "https://ethereum-rpc.publicnode.com",
  "https://eth.llamarpc.com",
  "https://rpc.ankr.com/eth",
  "https://cloudflare-eth.com",
];

const envHttp = process.env.NEXT_PUBLIC_RPC_URL;
const envWs = process.env.NEXT_PUBLIC_RPC_WS_URL;

function buildTransport(): Transport {
  const transports: Transport[] = [];
  // A websocket endpoint, when available, gives push-based event delivery.
  // Public endpoints often rate-limit WS hard, so it sits ahead of HTTP in
  // the fallback chain but HTTP polling remains the dependable path.
  if (envWs) transports.push(webSocket(envWs));
  if (envHttp) transports.push(http(envHttp));
  for (const url of PUBLIC_HTTP) transports.push(http(url));
  return fallback(transports, { rank: false });
}

export const wagmiConfig = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: true,
  ssr: true,
  transports: {
    [mainnet.id]: buildTransport(),
  },
});

/** Block-time-paced polling interval for event watchers (~12s mainnet). */
export const EVENT_POLL_MS = 12_000;

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
