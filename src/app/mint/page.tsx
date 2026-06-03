"use client";

import { useEffect, useState } from "react";
import { Page, PageHeader } from "@/components/layout/Page";
import { Panel } from "@/components/layout/Panel";
import { Button } from "@/components/actions/Button";
import { ConnectButton } from "@/components/actions/ConnectButton";
import { TxStatus } from "@/components/actions/TxStatus";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingSkeleton } from "@/components/states/LoadingSkeleton";
import { MintedCitizensModal } from "@/components/citizen/MintedCitizensModal";
import { ActionBurst } from "@/components/narrative/ActionBurst";
import { useToast } from "@/components/actions/Toast";
import { cn } from "@/lib/cn";
import { SOCIALS } from "@/lib/constants";
import { useWallet } from "@/lib/hooks/useWallet";
import {
  publicFreeMint,
  usePublicFreeMintEligibility,
} from "@/lib/hooks/data";
import { useCitizenRefresh } from "@/lib/hooks/useMetadataWatch";
import type { TxState } from "@/lib/types";

export default function MintPage() {
  const { connected, address, isWrongNetwork } = useWallet();
  const eligibility = usePublicFreeMintEligibility(
    address as `0x${string}` | undefined,
  );
  const toast = useToast();
  const refresh = useCitizenRefresh();

  const [quantity, setQuantity] = useState<1 | 2>(1);
  const [mintTx, setMintTx] = useState<TxState>("idle");
  const [txError, setTxError] = useState<string>();
  const [mintedIds, setMintedIds] = useState<number[]>([]);
  const [showMinted, setShowMinted] = useState(false);

  // Cap the quantity selector to whatever this wallet has left.
  const cap = Math.max(1, Math.min(2, eligibility.remainingForWallet || 2));

  // If the cap dropped (e.g. after a 1-mint), clamp the current selection.
  useEffect(() => {
    if (quantity > cap) setQuantity(cap as 1 | 2);
  }, [cap, quantity]);

  async function runMint() {
    setTxError(undefined);
    const r = await publicFreeMint(quantity, setMintTx);
    if (r.state === "success") {
      const n = r.mintedIds.length;
      toast(`Minted ${n} Citizen${n === 1 ? "" : "s"}!`, "success");
      r.mintedIds.forEach(refresh);
      setMintedIds(r.mintedIds);
      setShowMinted(true);
      eligibility.refetch();
    } else {
      setTxError(r.error);
      toast(r.error ?? "Mint didn't go through — try again.", "error");
    }
  }

  return (
    <Page>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          kicker="Public Free Mint"
          title="Mint a Citizen"
          intro="The public free mint distributes brand-new OnChain Citizens from the raffle bucket. No IDs to pick — the contract auto-assigns them. It's genuinely free, you only pay Ethereum gas."
          className="mb-0"
        />
        <div className="hidden h-24 w-24 shrink-0 sm:block">
          <ActionBurst tone="red" className="h-full w-full text-sm">
            Free
          </ActionBurst>
        </div>
      </div>

      {/* eligibility strip */}
      <div className="my-8 grid gap-3 sm:grid-cols-3">
        {[
          {
            t: "Mint permit",
            d: "Each mint needs a permit signed by our backend. We'll request one for you when you click Mint.",
          },
          {
            t: "Max 2 per wallet",
            d: "Mint one or two — that's the cap, forever.",
          },
          {
            t: "No current OCCV2 holders",
            d: "If your wallet already holds an OCCV2 Citizen, the public free mint isn't eligible. You can still buy on the marketplace.",
          },
        ].map((r) => (
          <div key={r.t} className="rounded-lg border-2 border-ink bg-cream px-4 py-3">
            <p className="font-display text-base">{r.t}</p>
            <p className="mt-0.5 font-body text-xs text-brown">{r.d}</p>
          </div>
        ))}
      </div>

      {!connected ? (
        <EmptyState
          mark="0x"
          title="Connect to free-mint"
          description="Connect your wallet and we'll check your eligibility for the public free mint."
          action={<ConnectButton />}
        />
      ) : isWrongNetwork ? (
        <ErrorState
          title="Wrong network"
          description="The public free mint runs on Ethereum Mainnet. Switch your wallet's network to continue."
          action={<ConnectButton />}
        />
      ) : eligibility.isLoading ? (
        <LoadingSkeleton variant="grid" count={4} />
      ) : !eligibility.canMint ? (
        <BlockedState
          reason={eligibility.blockReason}
          mintedBy={eligibility.mintedBy}
        />
      ) : (
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-display-sm">Pick a quantity</h2>
          <p className="mb-4 mt-1 font-body text-sm text-brown">
            The contract auto-assigns Citizen IDs from the raffle bucket
            (8001+). No need to pick — choose how many you want and we&apos;ll
            fetch a mint permit for you.
          </p>

          <Panel tone="paper" shadow="sm" className="p-5">
            <QuantitySelector value={quantity} onChange={setQuantity} max={cap} />

            <dl className="mt-5 space-y-1.5 border-t-2 border-ink/15 pt-4 font-body text-sm">
              <div className="flex justify-between">
                <dt className="text-brown">Quantity</dt>
                <dd className="font-semibold">{quantity}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brown">Mint price</dt>
                <dd className="font-semibold">0 ETH — free</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brown">Remaining on this wallet</dt>
                <dd className="font-semibold">
                  {eligibility.remainingForWallet} of 2
                </dd>
              </div>
            </dl>

            <div className="mt-4 space-y-3">
              <Button
                fullWidth
                onClick={runMint}
                disabled={mintTx === "pending"}
              >
                {mintTx === "pending"
                  ? "Minting…"
                  : quantity > 1
                    ? `Free Mint ${quantity} Citizens`
                    : "Free Mint Citizen"}
              </Button>
              {mintTx !== "idle" && (
                <TxStatus
                  state={mintTx}
                  messages={
                    mintTx === "fail" && txError ? { fail: txError } : undefined
                  }
                />
              )}
            </div>
          </Panel>

          <p className="mt-3 text-center font-body text-xs text-brown">
            {eligibility.remainingAllocation.toLocaleString()} of 1,980 Citizens
            remaining in the public-free-mint pool.
          </p>
        </div>
      )}

      <MintedCitizensModal
        open={showMinted}
        onClose={() => setShowMinted(false)}
        tokenIds={mintedIds}
        title="Minted!"
        blurb={
          mintedIds.length === 1
            ? "Your brand-new Citizen is on-chain. Here it is, fresh from the contract."
            : "Your brand-new Citizens are on-chain. Here they are, fresh from the contract."
        }
      />
    </Page>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function QuantitySelector({
  value,
  onChange,
  max,
}: {
  value: 1 | 2;
  onChange: (v: 1 | 2) => void;
  max: number;
}) {
  return (
    <div role="radiogroup" aria-label="Quantity" className="flex gap-3">
      {[1, 2].map((n) => {
        const disabled = n > max;
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(n as 1 | 2)}
            className={cn(
              "flex-1 rounded-panel border-ink-lg border-ink px-4 py-4 font-display text-2xl uppercase tracking-wide shadow-panel-sm transition-transform",
              "hover:-translate-y-0.5 hover:shadow-panel",
              "active:translate-x-1 active:translate-y-1 active:shadow-none",
              selected ? "bg-red text-paper" : "bg-paper text-ink",
              disabled && "cursor-not-allowed opacity-40 hover:translate-y-0 hover:shadow-panel-sm",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function BlockedState({
  reason,
  mintedBy,
}: {
  reason: 0 | 1 | 2 | 3 | 4 | 5;
  mintedBy: number;
}) {
  switch (reason) {
    case 1:
      return (
        <EmptyState
          mark="‖"
          title="Public mint paused"
          description="The public free mint is paused. Check the project's channels for updates."
        />
      );
    case 2:
      return (
        <EmptyState
          mark="…"
          title="Not open yet"
          description="The public free mint isn't open yet. Stand by — keep an eye on the project's channels."
        />
      );
    case 3:
      return (
        <EmptyState
          mark="✓"
          title="All claimed"
          description="All 1,980 public free mints have been claimed."
          action={
            <Button href={SOCIALS.marketplace} external>
              View on OpenSea
            </Button>
          }
        />
      );
    case 4:
      return (
        <EmptyState
          mark="✓"
          title="Cap reached"
          description={`You've already minted ${mintedBy} of 2 from this wallet.`}
          action={<Button href="/collection">View my Collection</Button>}
        />
      );
    case 5:
      return (
        <EmptyState
          mark="!"
          title="Already a holder"
          description="Wallets that already hold an OCCV2 Citizen aren't eligible for the public free mint. You can still pick one up on the marketplace."
          action={
            <Button href={SOCIALS.marketplace} external>
              Buy on OpenSea
            </Button>
          }
        />
      );
    default:
      return (
        <EmptyState
          mark="!"
          title="Can't mint right now"
          description="The contract refused this wallet. Refresh and try again — or check the project's channels for updates."
        />
      );
  }
}
