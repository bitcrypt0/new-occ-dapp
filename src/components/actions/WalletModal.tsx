"use client";

import { useMemo, useState } from "react";
import { useConnect, type Connector } from "wagmi";
import { Modal } from "./Modal";
import { cn } from "@/lib/cn";

/** EIP-6963 rdns identifiers we special-case. */
const METAMASK_RDNS = "io.metamask";
const RABBY_RDNS = "io.rabby";

function isMetaMask(c: Connector) {
  return c.id === METAMASK_RDNS || /metamask/i.test(c.name);
}
function isRabby(c: Connector) {
  return c.id === RABBY_RDNS || /rabby/i.test(c.name);
}

/**
 * Custom EIP-6963 wallet picker. Lists every injected wallet the browser
 * announced (wagmi's multiInjectedProviderDiscovery). MetaMask is surfaced
 * first and marked Recommended — it reliably builds the free mint despite
 * the cosmetic "may fail" warning. No RainbowKit / ConnectKit / WalletConnect.
 */
export function WalletModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { connectors, connect, error, status } = useConnect();
  const [pendingId, setPendingId] = useState<string | null>(null);

  // De-dupe by rdns/id, then sort MetaMask first.
  const wallets = useMemo(() => {
    const seen = new Set<string>();
    const list = connectors.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
    return list.sort((a, b) => {
      if (isMetaMask(a)) return -1;
      if (isMetaMask(b)) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [connectors]);

  function handleConnect(connector: Connector) {
    setPendingId(connector.id);
    connect(
      { connector },
      {
        onSuccess: () => {
          setPendingId(null);
          onClose();
        },
        onError: () => setPendingId(null),
      },
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Connect a wallet">
      {wallets.length === 0 ? (
        <div className="space-y-3">
          <p className="font-body text-sm text-brown">
            No browser wallet detected. Install an Ethereum wallet extension —
            we recommend{" "}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-red underline-offset-2 hover:underline"
            >
              MetaMask
            </a>{" "}
            — then reload this page.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {wallets.map((connector) => {
            const recommended = isMetaMask(connector);
            const rabby = isRabby(connector);
            const busy = pendingId === connector.id && status === "pending";
            return (
              <li key={connector.id}>
                <button
                  onClick={() => handleConnect(connector)}
                  disabled={status === "pending"}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-panel border-ink border-ink bg-paper px-4 py-3 text-left shadow-panel-sm transition-transform",
                    "hover:-translate-y-0.5 hover:shadow-panel disabled:opacity-60 disabled:hover:translate-y-0",
                    recommended && "bg-cream",
                  )}
                >
                  {connector.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={connector.icon}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded border-2 border-ink"
                    />
                  ) : (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded border-2 border-ink bg-sky font-display text-sm">
                      {connector.name.slice(0, 1)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-base">
                        {connector.name}
                      </span>
                      {recommended && (
                        <span className="rounded-full border-2 border-ink bg-sage px-2 py-0.5 font-display text-[10px] uppercase tracking-wide">
                          Recommended
                        </span>
                      )}
                    </span>
                    {rabby && (
                      <span className="font-body text-[11px] text-brown">
                        Works for free mint — your dapp sends an explicit gas
                        limit, so Rabby&apos;s &ldquo;may fail&rdquo; warning
                        won&apos;t block it.
                      </span>
                    )}
                  </span>
                  {busy && (
                    <span
                      aria-hidden
                      className="h-4 w-4 shrink-0 rounded-full border-[3px] border-ink border-t-transparent motion-safe:animate-spin"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="mt-3 rounded-lg border-2 border-ink bg-red px-3 py-2 font-body text-sm text-paper">
          {/user rejected|denied/i.test(error.message)
            ? "Connection request was rejected in your wallet."
            : "Couldn't connect to that wallet. Make sure it's unlocked and try again."}
        </p>
      )}

      <p className="mt-4 font-body text-xs text-brown">
        OnChain Citizens runs on Ethereum mainnet. Connecting only shares your
        public address — we never move funds without a transaction you approve.
      </p>
    </Modal>
  );
}
