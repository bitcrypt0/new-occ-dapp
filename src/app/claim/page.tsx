"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Page, PageHeader } from "@/components/layout/Page";
import { Panel } from "@/components/layout/Panel";
import { Button } from "@/components/actions/Button";
import { ConnectButton } from "@/components/actions/ConnectButton";
import { StepProgress } from "@/components/actions/StepProgress";
import { TxStatus } from "@/components/actions/TxStatus";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingSkeleton } from "@/components/states/LoadingSkeleton";
import { CitizenRender } from "@/components/citizen/CitizenRender";
import { MintedCitizensModal } from "@/components/citizen/MintedCitizensModal";
import { CaptionBox } from "@/components/narrative/CaptionBox";
import { useToast } from "@/components/actions/Toast";
import { cn } from "@/lib/cn";
import { useWallet } from "@/lib/hooks/useWallet";
import {
  useV1Tokens,
  useStakedV1Tokens,
  approveV2,
  claimTokens,
  unstakeV1,
} from "@/lib/hooks/data";
import type { TxState } from "@/lib/types";

const STEPS = ["Approve", "Migrate", "Done"];

export default function ClaimPage() {
  const { connected, isWrongNetwork, address } = useWallet();
  const { tokens: v1Tokens, isLoading, error } = useV1Tokens();
  const { tokens: stakedTokens, isLoading: stakedLoading } = useStakedV1Tokens();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [approveTx, setApproveTx] = useState<TxState>("idle");
  const [claimTx, setClaimTx] = useState<TxState>("idle");
  const [unstakeTx, setUnstakeTx] = useState<TxState>("idle");
  const [txError, setTxError] = useState<string>();
  const [claimedIds, setClaimedIds] = useState<number[]>([]);
  const [showClaimed, setShowClaimed] = useState(false);

  const toggle = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const selectAll = () => setSelected(v1Tokens.map((t) => t.id));

  const busy =
    approveTx === "pending" || claimTx === "pending" || unstakeTx === "pending";

  async function runUnstake() {
    setTxError(undefined);
    const ids = stakedTokens.map((t) => t.id);
    const r = await unstakeV1(ids, setUnstakeTx);
    if (r.state === "success") {
      toast("V1 tokens unstaked — they're back in your wallet.", "success");
      queryClient.invalidateQueries({ queryKey: ["stakedV1Tokens", address] });
      queryClient.invalidateQueries({ queryKey: ["v1Tokens", address] });
    } else {
      toast(r.error ?? "Unstake didn't go through. Try again.", "error");
    }
  }

  async function runApprove() {
    setTxError(undefined);
    const r = await approveV2(setApproveTx);
    if (r.state === "success") {
      setStep(1);
      toast("V2 contract approved — you can migrate now.", "success");
    } else {
      setTxError(r.error);
      toast(r.error ?? "Approval didn't go through. Try again.", "error");
    }
  }

  async function runClaim() {
    setTxError(undefined);
    const ids = [...selected];
    const r = await claimTokens(ids, setClaimTx);
    if (r.state === "success") {
      setStep(2);
      // Migration mints the matching V2 token id for each burned V1.
      setClaimedIds(ids);
      setShowClaimed(true);
      toast(`Migrated ${ids.length} Citizen${ids.length === 1 ? "" : "s"}!`, "success");
    } else {
      setTxError(r.error);
      toast(r.error ?? "Migration failed. Your V1 tokens are untouched — try again.", "error");
    }
  }

  /** Staked-V1 panel — shown whenever the wallet has tokens in the vault. */
  const stakedPanel = stakedTokens.length > 0 && (
    <Panel tone="sky" className="mb-8 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-display-sm">
            {stakedTokens.length} V1 token{stakedTokens.length === 1 ? "" : "s"} staked
          </h2>
          <p className="mt-0.5 font-body text-sm text-brown">
            These are held in the CitizenStaker vault. Unstake them to bring
            them back to your wallet, then migrate them to V2.
          </p>
        </div>
        <Button size="sm" onClick={runUnstake} disabled={busy}>
          {unstakeTx === "pending"
            ? "Unstaking…"
            : `Unstake ${stakedTokens.length} token${stakedTokens.length === 1 ? "" : "s"}`}
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {stakedTokens.map((t) => (
          <div
            key={t.id}
            className="rounded-panel border-ink border-ink bg-paper p-2 shadow-panel-sm"
          >
            <CitizenRender
              art={t.art}
              stage="I"
              background="Light Grey"
              imageUri={t.imageUri}
              framed
            />
            <p className="mt-1 text-center font-display text-sm">V1 #{t.id}</p>
          </div>
        ))}
      </div>
      {unstakeTx !== "idle" && <TxStatus state={unstakeTx} className="mt-3" />}
    </Panel>
  );

  return (
    <Page>
      <PageHeader
        kicker="For V1 holders"
        title="Migrate your Citizen"
        intro="Hold an OnChain Citizens V1 token? Burn it here and receive the matching V2 Citizen — same token ID, brand-new on-chain art."
      />

      <div className="mb-8">
        <CaptionBox tilt="left">
          Migrating burns your V1 and mints the matching V2. It&apos;s a two-step
          move: first approve the V2 contract, then migrate. Free — gas only.
        </CaptionBox>
      </div>

      {!connected ? (
        <EmptyState
          mark="0x"
          title="Connect to check your V1 tokens"
          description="We'll scan your wallet — and the staking vault — for OnChain Citizens V1 tokens you can migrate."
          action={<ConnectButton />}
        />
      ) : isWrongNetwork ? (
        <ErrorState
          title="Wrong network"
          description="Migrating runs on Ethereum Mainnet. Switch your wallet's network to continue."
          action={<ConnectButton />}
        />
      ) : isLoading || stakedLoading ? (
        <LoadingSkeleton variant="grid" count={6} />
      ) : error ? (
        <ErrorState
          title="Couldn't scan your V1 tokens"
          description="The chain read didn't come back. Check your connection and try again."
        />
      ) : v1Tokens.length === 0 && stakedTokens.length === 0 ? (
        <EmptyState
          mark="!"
          title="No V1 tokens in this wallet"
          description="There's nothing here to migrate — but you can still free-mint a brand-new Citizen instead."
          action={
            <Button href="/mint" variant="secondary">
              Try Free Mint
            </Button>
          }
        />
      ) : v1Tokens.length === 0 ? (
        <>
          {stakedPanel}
          <Panel tone="cream" className="p-6 text-center">
            <h2 className="font-display text-display-sm">Unstake first</h2>
            <p className="mx-auto mt-2 max-w-md font-body text-sm text-brown">
              All your V1 tokens are currently staked. Unstake them above —
              once they&apos;re back in your wallet, they&apos;ll appear here
              ready to migrate.
            </p>
          </Panel>
        </>
      ) : step === 2 ? (
        <>
          {stakedPanel}
          <Panel tone="sage" className="p-8 text-center">
            <h2 className="font-display text-display-md">Migrated!</h2>
            <p className="mx-auto mt-2 max-w-md font-body text-ink/80">
              {claimedIds.length} V2 Citizen{claimedIds.length === 1 ? " is" : "s are"} now
              in your wallet, rendered straight from the chain.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/collection">View my Collection</Button>
              <Button variant="ghost" onClick={() => setShowClaimed(true)}>
                See what you got
              </Button>
            </div>
          </Panel>
        </>
      ) : (
        <>
          {stakedPanel}
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* ---- V1 token selection ---- */}
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-display-sm">Your V1 tokens</h2>
                <button
                  onClick={selectAll}
                  className="font-display text-sm uppercase tracking-wide text-red underline-offset-2 hover:underline"
                >
                  Select all
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {v1Tokens.map((t) => {
                  const on = selected.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggle(t.id)}
                      aria-pressed={on}
                      disabled={busy}
                      className={cn(
                        "rounded-panel border-ink-lg border-ink bg-paper p-2 text-left shadow-panel-sm transition-transform",
                        on && "-translate-y-1 shadow-panel ring-4 ring-red",
                        busy && "opacity-60",
                      )}
                    >
                      <CitizenRender
                        art={t.art}
                        stage="I"
                        background="Light Grey"
                        imageUri={t.imageUri}
                        framed
                      />
                      <div className="mt-2 flex items-center justify-between px-1">
                        <span className="font-display text-base">V1 #{t.id}</span>
                        <span
                          className={cn(
                            "grid h-5 w-5 place-items-center rounded border-2 border-ink font-display text-xs",
                            on ? "bg-red text-paper" : "bg-paper",
                          )}
                        >
                          {on ? "✓" : ""}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ---- migrate flow ---- */}
            <aside>
              <Panel tone="cream" className="sticky top-24 p-5">
                <h2 className="font-display text-display-sm">Migration flow</h2>
                <div className="mt-4">
                  <StepProgress steps={STEPS} current={step} />
                </div>

                <dl className="mt-5 space-y-1.5 border-y-2 border-ink/15 py-4 font-body text-sm">
                  <div className="flex justify-between">
                    <dt className="text-brown">Selected</dt>
                    <dd className="font-semibold">{selected.length} token(s)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-brown">Cost</dt>
                    <dd className="font-semibold">Free · gas only</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-brown">You receive</dt>
                    <dd className="font-semibold">Matching V2 IDs</dd>
                  </div>
                </dl>

                <p className="mt-3 font-body text-xs text-brown">
                  Step 1 approves the V2 contract to move your V1 tokens — a
                  one-time approval scoped to this collection only. Step 2 burns
                  each selected V1 and mints its matching V2.
                </p>

                <div className="mt-4 space-y-3">
                  {step === 0 ? (
                    <Button
                      fullWidth
                      onClick={runApprove}
                      disabled={selected.length === 0 || busy}
                    >
                      {approveTx === "pending" ? "Approving…" : "Step 1 — Approve V2"}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      onClick={runClaim}
                      disabled={selected.length === 0 || busy}
                    >
                      {claimTx === "pending"
                        ? "Migrating…"
                        : `Step 2 — Migrate ${selected.length}`}
                    </Button>
                  )}

                  {selected.length === 0 && (
                    <p className="font-body text-xs text-brown">
                      Select at least one V1 token above to begin.
                    </p>
                  )}
                  {approveTx !== "idle" && step === 0 && (
                    <TxStatus
                      state={approveTx}
                      messages={
                        approveTx === "fail" && txError ? { fail: txError } : undefined
                      }
                    />
                  )}
                  {claimTx !== "idle" && step === 1 && (
                    <TxStatus
                      state={claimTx}
                      messages={{
                        success: "Migrated — welcome to V2.",
                        ...(claimTx === "fail" && txError ? { fail: txError } : {}),
                      }}
                    />
                  )}
                </div>
              </Panel>
            </aside>
          </div>
        </>
      )}

      <MintedCitizensModal
        open={showClaimed}
        onClose={() => setShowClaimed(false)}
        tokenIds={claimedIds}
        title="Migrated!"
        blurb={
          claimedIds.length === 1
            ? "Your V1 was burned and its matching V2 Citizen minted. Here it is."
            : "Your V1 tokens were burned and their matching V2 Citizens minted. Here they are."
        }
      />
    </Page>
  );
}
