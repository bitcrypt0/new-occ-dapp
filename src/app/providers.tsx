"use client";

import { useEffect, useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { getAccount, reconnect, watchConnectors } from "@wagmi/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { WalletProvider } from "@/lib/hooks/useWallet";
import { ToastProvider } from "@/components/actions/Toast";

/**
 * Re-establishes the previous wallet connection on page load.
 *
 * wagmi v2 doesn't auto-reconnect on mount, so we trigger it ourselves.
 * Critically, EIP-6963 wallet extensions announce themselves asynchronously —
 * after a Chrome restart the extension can finish loading *after* the dapp,
 * so the connector for the previously-used wallet may not exist yet when the
 * first reconnect runs. We subscribe to `watchConnectors` and retry reconnect
 * whenever a new connector is announced. Without this, the wallet keeps the
 * dapp in its "connected sites" list while the dapp shows disconnected — the
 * stuck state users were hitting where they had to disconnect from inside the
 * wallet extension before the dapp's connect flow worked again.
 *
 * `reconnect` is idempotent: it's a no-op if a session is already active, so
 * the retry-on-announcement loop is safe.
 */
function WagmiReconnector() {
  useEffect(() => {
    const tryReconnect = () => {
      // Skip if a connection (or a user-initiated connect attempt) is already
      // in flight — racing `reconnect` against a manual `connect` from the
      // wallet picker leaves wagmi in a half-resolved state that locks out
      // future connect attempts until the wallet is reset.
      const { status } = getAccount(wagmiConfig);
      if (status === "connected" || status === "connecting") return;
      void reconnect(wagmiConfig);
    };
    tryReconnect();
    const unsub = watchConnectors(wagmiConfig, { onChange: tryReconnect });
    return unsub;
  }, []);
  return null;
}

/** Client-side context providers — wagmi, react-query, wallet, toasts. */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 2 },
        },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiReconnector />
        <WalletProvider>
          <ToastProvider>{children}</ToastProvider>
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
