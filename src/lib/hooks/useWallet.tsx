"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAccount, useBalance, useDisconnect, useSwitchChain } from "wagmi";
import { CHAIN_ID } from "../constants";
import { WalletModal } from "@/components/actions/WalletModal";

/**
 * Real wallet context — wagmi-backed, EIP-6963 multi-injected discovery.
 * Replaces the former MockWalletProvider. The consumed API
 * (`connected`, `address`, `balanceEth`, `connect()`, `disconnect()`) is
 * preserved so screens keep working; network-safety fields are added.
 */
interface WalletCtx {
  connected: boolean;
  /** Checksummed account address, or "" when disconnected. */
  address: string;
  /** Native ETH balance — drives the Free Mint balance gate. */
  balanceEth: number;
  /** True while the balance read is in flight. */
  balanceLoading: boolean;
  /** The chain the wallet is currently on. */
  chainId: number | undefined;
  /** Connected but on a chain other than Ethereum mainnet. */
  isWrongNetwork: boolean;
  /** Opens the EIP-6963 wallet-selection modal. */
  connect: () => void;
  /** Fully disconnects and clears wagmi state. */
  disconnect: () => void;
  /** Prompts the wallet to switch to Ethereum mainnet. */
  switchToMainnet: () => void;
}

const Ctx = createContext<WalletCtx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
    query: { enabled: isConnected, refetchInterval: 30_000 },
  });

  const value = useMemo<WalletCtx>(
    () => ({
      connected: isConnected,
      address: address ?? "",
      balanceEth: balance ? Number(balance.formatted) : 0,
      balanceLoading: isConnected && balanceLoading,
      chainId,
      isWrongNetwork: isConnected && chainId !== CHAIN_ID,
      connect: () => setModalOpen(true),
      disconnect: () => wagmiDisconnect(),
      switchToMainnet: () => switchChain({ chainId: CHAIN_ID }),
    }),
    [
      isConnected,
      address,
      balance,
      balanceLoading,
      chainId,
      wagmiDisconnect,
      switchChain,
    ],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Ctx.Provider>
  );
}

export function useWallet(): WalletCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

/** Short 0x…abcd display form. */
export function shortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
