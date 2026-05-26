"use client";

import { useState } from "react";
import { Page, PageHeader } from "@/components/layout/Page";
import { Panel } from "@/components/layout/Panel";
import { Button } from "@/components/actions/Button";
import { ConnectButton } from "@/components/actions/ConnectButton";
import { TxStatus } from "@/components/actions/TxStatus";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingSkeleton } from "@/components/states/LoadingSkeleton";
import { TokenIdPicker } from "@/components/forms/TokenIdPicker";
import { WalletBalancePill } from "@/components/forms/WalletBalancePill";
import { MintedCitizensModal } from "@/components/citizen/MintedCitizensModal";
import { ActionBurst } from "@/components/narrative/ActionBurst";
import { useToast } from "@/components/actions/Toast";
import { cn } from "@/lib/cn";
import { CONTRACT } from "@/lib/constants";
import { useWallet } from "@/lib/hooks/useWallet";
import { classifyBalance, freeMint, useMintAvailability } from "@/lib/hooks/data";
import { useCitizenRefresh } from "@/lib/hooks/useMetadataWatch";
import type { TxState } from "@/lib/types";

export default function MintPage() {
  const { connected, balanceEth, isWrongNetwork } = useWallet();
  const avail = useMintAvailability();
  const toast = useToast();
  const refresh = useCitizenRefresh();

  const [selected, setSelected] = useState<number[]>([]);
  const [mintTx, setMintTx] = useState<TxState>("idle");
  const [txError, setTxError] = useState<string>();
  const [mintedIds, setMintedIds] = useState<number[]>([]);
  const [showMinted, setShowMinted] = useState(false);

  const tier = classifyBalance(balanceEth);
  const cap = avail.remainingCap;

  const toggle = (id: number) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length < cap ? [...s, id] : s,
    );

  async function runMint() {
    setTxError(undefined);
    const ids = [...selected];
    const r = await freeMint(ids, setMintTx);
    if (r.state === "success") {
      toast(`Minted ${ids.length} Citizen${ids.length === 1 ? "" : "s"}!`, "success");
      ids.forEach(refresh);
      setMintedIds(ids);
      setShowMinted(true);
      setSelected([]);
    } else {
      setTxError(r.error);
      toast(r.error ?? "Mint didn't go through — try again.", "error");
    }
  }

  return (
    <Page>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          kicker="For everyone else"
          title="Mint a Citizen"
          intro="No V1 token? Free-mint a brand-new Citizen from the eligible IDs in 1–8000 — the token IDs whose original V1 is no longer live (the never-minted block in 4541–8000 plus the 24 V1 tokens burnt-in-place inside 1–4540). It's genuinely free, you only pay Ethereum gas."
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
          { t: "No V1 token", d: "Free Mint is for wallets that don't hold an OCC V1." },
          { t: "No prior claim", d: "You haven't already claimed a Citizen with this wallet." },
          { t: `Max ${CONTRACT.freeMintCap} per wallet`, d: "Mint one or two — that's the cap, forever." },
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
          description="Connect your wallet and we'll check your eligibility and the mintable IDs."
          action={<ConnectButton />}
        />
      ) : isWrongNetwork ? (
        <ErrorState
          title="Wrong network"
          description="Free Mint runs on Ethereum Mainnet. Switch your wallet's network to continue."
          action={<ConnectButton />}
        />
      ) : avail.isLoading ? (
        <LoadingSkeleton variant="grid" count={6} />
      ) : avail.holdsV1 ? (
        <EmptyState
          mark="V1"
          title="You hold a V1 — claim instead"
          description="This wallet holds an OCC V1 token, so Free Mint isn't your path. Burn your V1 to claim the matching V2 Citizen."
          action={<Button href="/claim">Go to Claim</Button>}
        />
      ) : avail.hasClaimed || cap === 0 ? (
        <EmptyState
          mark="✓"
          title="You've already claimed"
          description="This wallet has used its mint allowance. Browse what you've got over in your collection."
          action={<Button href="/collection">My Collection</Button>}
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* ---- ID picker ---- */}
          <section>
            <h2 className="font-display text-display-sm">Pick your token IDs</h2>
            <p className="mb-4 mt-1 font-body text-sm text-brown">
              Choose up to {cap} mintable ID{cap === 1 ? "" : "s"} below — IDs
              in 1–8000 whose original V1 token is no longer live. Each becomes
              a fresh Citizen with on-chain art.
            </p>
            <Panel tone="paper" shadow="sm" className="p-5">
              <TokenIdPicker
                label="Mintable IDs"
                ids={avail.mintableIds}
                selected={selected}
                onToggle={toggle}
                max={cap}
              />
              <p className="mt-3 font-body text-xs text-brown">
                {selected.length}/{cap} selected.
              </p>
            </Panel>
          </section>

          {/* ---- balance gate + mint ---- */}
          <aside>
            <Panel tone="cream" className="sticky top-24 p-5">
              <h2 className="font-display text-display-sm">Wallet check</h2>

              <div className="mt-3">
                <WalletBalancePill balanceEth={balanceEth} variant="full" />
              </div>

              {/* gate messaging */}
              <div
                className={cn(
                  "mt-3 rounded-lg border-2 border-ink px-3 py-2.5 font-body text-sm",
                  tier === "blocked" && "bg-red/15",
                  tier === "caution" && "bg-orange/30",
                  tier === "good" && "bg-sage/40",
                )}
              >
                {tier === "blocked" && (
                  <p>
                    <strong>Below the {CONTRACT.balanceGateMin} ETH gate.</strong> Our
                    contract checks (never spends) a small balance to keep bots
                    out. Top up past {CONTRACT.balanceGateSafe} ETH to mint.
                  </p>
                )}
                {tier === "caution" && (
                  <p>
                    <strong>You&apos;re over the gate</strong> — but only just. Some
                    wallets reserve gas first and can dip under the line. Top up
                    toward {CONTRACT.balanceGateSafe} ETH to be safe.
                  </p>
                )}
                {tier === "good" && (
                  <p>
                    <strong>You&apos;re good to mint.</strong> Comfortable headroom
                    over the {CONTRACT.balanceGateMin} ETH anti-bot gate.
                  </p>
                )}
              </div>

              {/* the reassurance note */}
              <div className="mt-3 rounded-lg border-2 border-dashed border-ink bg-paper px-3 py-2.5">
                <p className="font-body text-xs leading-relaxed text-brown">
                  <strong className="text-ink">Heads up:</strong> your wallet may
                  show a &ldquo;this transaction might fail&rdquo; warning. That&apos;s
                  normal for our free mint — as long as your wallet holds a little
                  ETH for gas, it will go through.{" "}
                  <strong className="text-ink">Try with another wallet if your
                  first attempt fails.</strong>
                </p>
              </div>

              <dl className="mt-4 space-y-1.5 border-t-2 border-ink/15 pt-4 font-body text-sm">
                <div className="flex justify-between">
                  <dt className="text-brown">Selected</dt>
                  <dd className="font-semibold">{selected.length} ID(s)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-brown">Mint price</dt>
                  <dd className="font-semibold">0 ETH — free</dd>
                </div>
              </dl>

              <div className="mt-4 space-y-3">
                <Button
                  fullWidth
                  onClick={runMint}
                  disabled={tier === "blocked" || selected.length === 0 || mintTx === "pending"}
                >
                  {mintTx === "pending"
                    ? "Minting…"
                    : tier === "blocked"
                      ? "Top up to mint"
                      : selected.length > 1
                        ? `Free Mint ${selected.length} Citizens`
                        : "Free Mint Citizen"}
                </Button>
                {mintTx !== "idle" && (
                  <TxStatus
                    state={mintTx}
                    messages={mintTx === "fail" && txError ? { fail: txError } : undefined}
                  />
                )}
              </div>
            </Panel>
          </aside>
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
