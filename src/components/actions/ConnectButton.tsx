"use client";

import { cn } from "@/lib/cn";
import { shortAddress, useWallet } from "@/lib/hooks/useWallet";

/**
 * Wallet connect button — opens the EIP-6963 picker when disconnected,
 * surfaces a wrong-network switch, and disconnects on click when connected.
 */
export function ConnectButton({ className }: { className?: string }) {
  const { connected, address, isWrongNetwork, connect, disconnect, switchToMainnet } =
    useWallet();

  const base = cn(
    "inline-flex items-center gap-2 rounded-panel border-ink border-ink px-4 py-2 font-display text-sm uppercase tracking-wide shadow-panel-sm",
    "transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
    className,
  );

  if (connected && isWrongNetwork) {
    return (
      <button
        onClick={switchToMainnet}
        className={cn(base, "bg-orange text-ink hover:-translate-y-0.5 hover:shadow-panel")}
        title="Switch your wallet to Ethereum Mainnet"
      >
        <span aria-hidden className="h-2.5 w-2.5 rounded-full border-2 border-ink bg-red" />
        Wrong Network
      </button>
    );
  }

  return (
    <button
      onClick={connected ? disconnect : connect}
      className={cn(
        base,
        connected
          ? "bg-sage text-ink"
          : "bg-red text-paper hover:-translate-y-0.5 hover:shadow-panel",
      )}
      title={connected ? "Disconnect wallet" : "Connect a wallet"}
    >
      <span
        aria-hidden
        className={cn(
          "h-2.5 w-2.5 rounded-full border-2 border-ink",
          connected ? "bg-paper" : "bg-paper/40",
        )}
      />
      {connected ? shortAddress(address) : "Connect Wallet"}
    </button>
  );
}
