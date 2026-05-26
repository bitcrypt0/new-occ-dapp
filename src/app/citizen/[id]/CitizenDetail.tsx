"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { Page } from "@/components/layout/Page";
import { Panel } from "@/components/layout/Panel";
import { Button } from "@/components/actions/Button";
import { Modal } from "@/components/actions/Modal";
import { TxStatus } from "@/components/actions/TxStatus";
import { ConnectButton } from "@/components/actions/ConnectButton";
import { CitizenRender } from "@/components/citizen/CitizenRender";
import { AttributeList } from "@/components/citizen/AttributeList";
import { DownloadMenu } from "@/components/citizen/DownloadMenu";
import { RarityTag } from "@/components/citizen/RarityTag";
import { LockStamp } from "@/components/citizen/LockStamp";
import { AddressInput, isAddressLike } from "@/components/forms/AddressInput";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingSkeleton } from "@/components/states/LoadingSkeleton";
import { useToast } from "@/components/actions/Toast";
import { cn } from "@/lib/cn";
import { BG_HEX, CONTRACT } from "@/lib/constants";
import type { BackgroundColor, TxState } from "@/lib/types";
import { useWallet } from "@/lib/hooks/useWallet";
import {
  useCitizen,
  useIsOwner,
  useReshufflesActive,
  useTraitLockFee,
  rerollBackground,
  lockTraits,
  unlockTraits,
  transferCitizen,
} from "@/lib/hooks/data";
import { useMetadataWatch, useCitizenRefresh } from "@/lib/hooks/useMetadataWatch";

type ActiveModal = "none" | "reroll" | "lock" | "transfer";

function provenance(count: number): string {
  if (count === 0) return "Fresh from the mint — never moved.";
  if (count === 1) return "Changed hands once.";
  return `Changed hands ${count} times.`;
}

export function CitizenDetail({ id }: { id: number }) {
  const { citizen, isLoading, error, notFound } = useCitizen(id);
  const isOwner = useIsOwner(id);
  const { connected, isWrongNetwork, address } = useWallet();
  const reshufflesActive = useReshufflesActive();
  const lockFeeWei = useTraitLockFee();
  const toast = useToast();
  const refresh = useCitizenRefresh();

  // Real-time refresh: re-fetch this token's art on any MetadataUpdate.
  useMetadataWatch(citizen ? [id] : []);

  const [modal, setModal] = useState<ActiveModal>("none");
  const [tx, setTx] = useState<TxState>("idle");
  const [txError, setTxError] = useState<string>();
  /**
   * Message shown after a completed transfer. Stays null until the transfer
   * confirms; once set, the owner-actions panel renders this in place of the
   * action buttons. The wording is computed at transfer time so it always
   * reflects what the transfer actually did — leaving the wallet vs. a
   * self-transfer used to nudge a reshuffle (or a no-op when locked).
   */
  const [postTransferMessage, setPostTransferMessage] = useState<string | null>(null);
  const [transferTo, setTransferTo] = useState("");

  const lockFeeEth = lockFeeWei != null ? formatEther(lockFeeWei) : String(CONTRACT.lockTraitsFee);

  if (isLoading) {
    return (
      <Page width="wide">
        <LoadingSkeleton variant="grid" count={2} />
      </Page>
    );
  }

  if (error) {
    return (
      <Page width="narrow">
        <ErrorState
          title="Couldn't load this Citizen"
          description="The chain read didn't come back. Check your connection and try again."
        />
      </Page>
    );
  }

  if (notFound || !citizen) {
    return (
      <Page width="narrow">
        <EmptyState
          mark="?!"
          title={`No Citizen #${id}`}
          description="That token ID isn't part of the 10,000-strong collection, or hasn't been minted yet."
          action={<Button href="/collection">Browse Citizens</Button>}
        />
      </Page>
    );
  }

  const rareTraits = citizen.attributes.filter((a) => a.rare);
  const busy = tx === "pending";
  const closeModal = () => {
    if (!busy) {
      setModal("none");
      setTx("idle");
      setTxError(undefined);
    }
  };

  async function doReroll() {
    setTxError(undefined);
    const r = await rerollBackground(id, setTx);
    if (r.state === "success") {
      refresh(id);
      toast("Background re-rolled — fresh color incoming.", "success");
      setModal("none");
      setTx("idle");
    } else {
      setTxError(r.error);
      toast(r.error ?? "Re-roll didn't go through.", "error");
    }
  }

  async function doLockToggle() {
    setTxError(undefined);
    const locking = !citizen!.traitsLocked;
    const r = await (locking ? lockTraits(id, setTx) : unlockTraits(id, setTx));
    if (r.state === "success") {
      refresh(id);
      toast(locking ? "Traits locked — this look is frozen." : "Traits unlocked.", "success");
      setModal("none");
      setTx("idle");
    } else {
      setTxError(r.error);
      toast(r.error ?? "That didn't go through.", "error");
    }
  }

  async function doTransfer() {
    setTxError(undefined);
    // Capture the inputs *before* the await so the post-transfer message
    // reflects the state at the moment the user confirmed the tx.
    const recipient = transferTo.trim().toLowerCase();
    const me = (address ?? "").toLowerCase();
    const toSelf = me.length > 0 && recipient === me;
    const wasLocked = citizen!.traitsLocked;

    const r = await transferCitizen(id, transferTo, setTx);
    if (r.state === "success") {
      let message: string;
      if (!toSelf) {
        message = reshufflesActive
          ? "You transferred this Citizen — it's no longer in your wallet. Its unlocked traits will reshuffle for the new owner."
          : "You transferred this Citizen — it's no longer in your wallet. Once reshuffles are active, an unlocked Citizen's traits re-roll for each new owner.";
      } else if (wasLocked) {
        message = "Transfer successful. Your Citizen's metadata remains unchanged.";
      } else {
        message = "Transfer successful! You successfully reshuffled this Citizen's metadata.";
      }
      setPostTransferMessage(message);
      refresh(id);
      toast(
        toSelf ? `Citizen #${id} transferred.` : `Citizen #${id} sent.`,
        "success",
      );
      setModal("none");
      setTx("idle");
    } else {
      setTxError(r.error);
      toast(r.error ?? "Transfer didn't go through.", "error");
    }
  }

  return (
    <Page width="wide">
      <nav className="mb-4 font-body text-sm text-brown">
        <a href="/collection" className="hover:underline">
          Collection
        </a>
        <span className="mx-2">/</span>
        <span className="font-semibold text-ink">Citizen #{id}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        {/* ---- art ---- */}
        <div>
          <div className="relative rounded-panel border-ink-lg border-ink bg-paper p-3 shadow-panel-lg">
            <CitizenRender
              art={citizen.art}
              stage={citizen.stage}
              background={citizen.background}
              id={citizen.id}
              locked={citizen.traitsLocked}
              imageUri={citizen.imageUri}
              framed
            />
            <DownloadMenu
              citizen={citizen}
              size="md"
              onError={(msg) => toast(msg, "error")}
              className="absolute bottom-5 right-5 z-10"
            />
          </div>
          <p className="mt-3 text-center font-body text-xs text-brown">
            Rendered on-chain · {CONTRACT.chain}
          </p>
        </div>

        {/* ---- info ---- */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-display-lg leading-none">
              Citizen #{citizen.id}
            </h1>
            {citizen.traitsLocked && <LockStamp size="lg" />}
          </div>
          <p className="mt-2 font-body text-lg text-brown">
            {citizen.gender} · {citizen.mood} · {citizen.skinTone} skin ·{" "}
            {citizen.hairColor} hair
          </p>

          {rareTraits.length > 0 && (
            <div className="mt-4 rounded-panel border-2 border-ink bg-orange/40 p-3">
              <p className="font-display text-sm uppercase tracking-wide">
                Frozen rare trait{rareTraits.length > 1 ? "s" : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {rareTraits.map((t) => (
                  <span key={t.category} className="inline-flex items-center gap-2">
                    <RarityTag label={`${t.category}: ${t.value}`} />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* provenance */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="Transfer count" value={String(citizen.transferCount)} />
            <Stat label="Traits locked" value={citizen.traitsLocked ? "Yes" : "No"} />
          </div>
          <p className="mt-2 font-body text-sm italic text-brown">
            Life story: {provenance(citizen.transferCount)}
          </p>

          {/* owner actions */}
          <Panel tone="cream" className="mt-6 p-5">
            <h2 className="font-display text-display-sm">Owner actions</h2>
            {postTransferMessage ? (
              <p className="mt-3 font-body text-sm text-brown">
                {postTransferMessage}
              </p>
            ) : !connected ? (
              <div className="mt-3">
                <p className="mb-3 font-body text-sm text-brown">
                  Connect your wallet to manage this Citizen.
                </p>
                <ConnectButton />
              </div>
            ) : isWrongNetwork ? (
              <p className="mt-3 font-body text-sm text-brown">
                Your wallet is on the wrong network. Switch to{" "}
                {CONTRACT.chain} to manage this Citizen.
              </p>
            ) : !isOwner ? (
              <p className="mt-3 font-body text-sm text-brown">
                You don&apos;t own this Citizen, so owner actions are locked. Only
                the holder can re-roll, lock, or transfer it.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setModal("reroll")}
                  disabled={citizen.traitsLocked}
                >
                  Re-roll background
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModal("lock")}
                >
                  {citizen.traitsLocked ? "Unlock traits" : "Lock traits"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setModal("transfer")}>
                  Transfer
                </Button>
                {citizen.traitsLocked && (
                  <p className="font-body text-xs text-brown sm:col-span-3">
                    Re-roll is disabled while traits are locked. Unlock first to
                    change the background.
                  </p>
                )}
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* ---- attributes ---- */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-display-md">All 14 traits</h2>
        <AttributeList attributes={citizen.attributes} />
      </section>

      {/* ===== modals ===== */}
      <Modal
        open={modal === "reroll"}
        onClose={closeModal}
        title="Re-roll background"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={closeModal} disabled={busy}>
              Cancel
            </Button>
            <Button size="sm" onClick={doReroll} disabled={busy}>
              {busy ? "Rolling…" : "Confirm re-roll (free)"}
            </Button>
          </>
        }
      >
        <p className="font-body text-sm text-brown">
          Re-rolling is free — gas only. The contract rolls a brand-new
          background color <strong>at random, on-chain</strong>. You can&apos;t
          pick or preview the result — it&apos;s a fresh roll every time.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <Swatch name={citizen.background} caption="Now" />
          <span className="font-display text-2xl">→</span>
          <MysterySwatch />
        </div>
        <p className="mt-4 border-2 border-dashed border-ink bg-cream px-3 py-2 font-body text-xs text-brown">
          <strong className="text-ink">Heads up:</strong> after its first
          re-roll, the background also becomes a reshuffling trait — from then
          on it re-rolls on future transfers alongside the other traits.
        </p>
        {tx !== "idle" && (
          <TxStatus
            state={tx}
            className="mt-4"
            messages={tx === "fail" && txError ? { fail: txError } : undefined}
          />
        )}
      </Modal>

      <Modal
        open={modal === "lock"}
        onClose={closeModal}
        title={citizen.traitsLocked ? "Unlock traits" : "Lock traits"}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={closeModal} disabled={busy}>
              Cancel
            </Button>
            <Button size="sm" onClick={doLockToggle} disabled={busy}>
              {busy
                ? "Working…"
                : citizen.traitsLocked
                  ? `Confirm unlock · ${lockFeeEth} ETH`
                  : `Lock traits · ${lockFeeEth} ETH`}
            </Button>
          </>
        }
      >
        {citizen.traitsLocked ? (
          <p className="font-body text-sm text-brown">
            Unlocking lets this Citizen&apos;s traits reshuffle again on future
            transfers, once reshuffles are active. Its rare traits stay frozen
            regardless. Unlocking costs about <strong>{lockFeeEth} ETH</strong>.
          </p>
        ) : (
          <p className="font-body text-sm text-brown">
            Locking <strong>pauses reshuffles</strong> — every trait holds at
            its current value, so transfers won&apos;t change the look. It&apos;s
            reversible: unlock anytime for the same small fee of about{" "}
            <strong>{lockFeeEth} ETH</strong>.
          </p>
        )}
        {tx !== "idle" && (
          <TxStatus
            state={tx}
            className="mt-4"
            messages={tx === "fail" && txError ? { fail: txError } : undefined}
          />
        )}
      </Modal>

      <Modal
        open={modal === "transfer"}
        onClose={closeModal}
        title="Transfer Citizen"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={closeModal} disabled={busy}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={doTransfer}
              disabled={busy || !isAddressLike(transferTo)}
            >
              {busy ? "Sending…" : "Send Citizen"}
            </Button>
          </>
        }
      >
        <p className="mb-3 font-body text-sm text-brown">
          Sending Citizen #{id} to another wallet.{" "}
          {reshufflesActive
            ? "Remember — on arrival its unlocked traits reshuffle for the new owner."
            : "Once reshuffles are active, an unlocked Citizen's traits re-roll for the new owner on arrival."}
        </p>
        <AddressInput
          value={transferTo}
          onChange={setTransferTo}
          onUseSelf={address ? () => setTransferTo(address) : undefined}
        />
        {tx !== "idle" && (
          <TxStatus
            state={tx}
            className="mt-4"
            messages={tx === "fail" && txError ? { fail: txError } : undefined}
          />
        )}
      </Modal>
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border-2 border-ink bg-paper px-3 py-2">
      <p className="font-display text-xs uppercase tracking-wide text-brown">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}

function Swatch({ name, caption }: { name: BackgroundColor; caption: string }) {
  return (
    <div className="text-center">
      <div
        className={cn("h-20 w-20 rounded-panel border-ink border-ink shadow-panel-sm")}
        style={{ backgroundColor: BG_HEX[name] }}
      />
      <p className="mt-1 font-display text-xs uppercase tracking-wide text-brown">
        {caption}
      </p>
      <p className="font-body text-xs">{name}</p>
    </div>
  );
}

/** An unknown-result swatch — the re-roll outcome is random and unpreviewable. */
function MysterySwatch() {
  return (
    <div className="text-center">
      <div className="relative grid h-20 w-20 place-items-center rounded-panel border-ink border-ink bg-cream shadow-panel-sm">
        <div
          aria-hidden
          className="halftone absolute inset-1 rounded-[8px] text-ink/25"
        />
        <span className="relative font-display text-3xl text-ink">?</span>
      </div>
      <p className="mt-1 font-display text-xs uppercase tracking-wide text-brown">
        After
      </p>
      <p className="font-body text-xs">Random roll</p>
    </div>
  );
}
