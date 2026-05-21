"use client";

import { useMemo, useState } from "react";
import { parseEther } from "viem";
import { Page, PageHeader } from "@/components/layout/Page";
import { Panel } from "@/components/layout/Panel";
import { Button } from "@/components/actions/Button";
import { Modal } from "@/components/actions/Modal";
import { TxStatus } from "@/components/actions/TxStatus";
import { ConnectButton } from "@/components/actions/ConnectButton";
import { CitizenRender } from "@/components/citizen/CitizenRender";
import { RarityTag } from "@/components/citizen/RarityTag";
import { ActionBurst } from "@/components/narrative/ActionBurst";
import { useToast } from "@/components/actions/Toast";
import { cn } from "@/lib/cn";
import { MARKET_LIVE } from "@/lib/constants";
import { useWallet } from "@/lib/hooks/useWallet";
import {
  acceptListing,
  cancelListing,
  listTrait,
  useMarketListings,
  useOwnedCitizens,
} from "@/lib/hooks/data";
import type { MarketListing, TxState } from "@/lib/types";

/** 30-day default listing expiry. */
const LISTING_TTL = 30 * 24 * 60 * 60;

export default function MarketPage() {
  const { connected } = useWallet();
  const { listings } = useMarketListings();
  const { citizens: owned } = useOwnedCitizens();
  const toast = useToast();

  const [active, setActive] = useState<MarketListing | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [tx, setTx] = useState<TxState>("idle");
  const [listPrice, setListPrice] = useState("0.20");
  const [listCitizenId, setListCitizenId] = useState<number | null>(null);

  const rareOwned = useMemo(
    () => owned.filter((c) => c.attributes.some((a) => a.rare)),
    [owned],
  );
  const ownedIds = useMemo(() => new Set(owned.map((c) => c.id)), [owned]);
  const isMine = (l: MarketListing) => ownedIds.has(l.sellerCitizenId);
  const busy = tx === "pending";

  async function doAccept() {
    if (!active) return;
    const buyerTokenId = owned[0]?.id ?? 0;
    const r = await acceptListing(
      active.id,
      buyerTokenId,
      parseEther(String(active.priceEth)),
      setTx,
    );
    if (r.state === "success") {
      toast(`Trade accepted — ${active.traitValue} is heading to your Citizen.`, "success");
      setActive(null);
      setTx("idle");
    } else {
      toast(r.error ?? "Trade didn't settle.", "error");
    }
  }
  async function doCancel(l: MarketListing) {
    const r = await cancelListing(l.id, setTx);
    if (r.state === "success") {
      toast(`Listing ${l.id} cancelled.`, "success");
      setActive(null);
      setTx("idle");
    } else {
      toast(r.error ?? "Couldn't cancel that listing.", "error");
    }
  }
  async function doList() {
    if (listCitizenId === null) return;
    let priceWei: bigint;
    try {
      priceWei = parseEther(listPrice || "0");
    } catch {
      toast("Enter a valid ETH price.", "error");
      return;
    }
    const r = await listTrait(
      {
        tokenId: listCitizenId,
        category: 0,
        priceWei,
        expiry: BigInt(Math.floor(Date.now() / 1000) + LISTING_TTL),
      },
      setTx,
    );
    if (r.state === "success") {
      toast("Your rare trait is listed.", "success");
      setListOpen(false);
      setTx("idle");
    } else {
      toast(r.error ?? "Couldn't list that trait.", "error");
    }
  }

  return (
    <Page width="wide">
      <PageHeader
        kicker="Peer-to-peer"
        title="Trait Market"
        intro="Trade rare, frozen traits between Citizens. List one of yours, browse what others are offering, and strike a deal — all on-chain."
      />

      {!MARKET_LIVE && (
        <Panel tone="orange" className="mb-8 flex flex-col items-center p-8 text-center">
          <div className="mb-4 h-28 w-28">
            <ActionBurst tone="red" className="h-full w-full text-base">
              Coming
              <br />
              Soon
            </ActionBurst>
          </div>
          <h2 className="font-display text-display-md">The Trait Market is warming up.</h2>
          <p className="mx-auto mt-2 max-w-lg font-body text-ink/80">
            It ships dormant and switches on after launch. Everything below is a
            live preview of how trading rare traits will look — browsing and
            deals are paused until the market opens.
          </p>
          <span className="mt-4 border-2 border-ink bg-paper px-3 py-1 font-display text-xs uppercase tracking-widest">
            Status: dormant
          </span>
        </Panel>
      )}

      {/* toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-sm uppercase tracking-wide text-brown">
          {listings.length} rare traits listed
        </p>
        {connected ? (
          <Button
            size="sm"
            onClick={() => setListOpen(true)}
            disabled={!MARKET_LIVE}
          >
            List a trait
          </Button>
        ) : (
          <ConnectButton />
        )}
      </div>

      {/* listing grid */}
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
          !MARKET_LIVE && "pointer-events-none select-none opacity-80 saturate-50",
        )}
        aria-disabled={!MARKET_LIVE}
      >
        {listings.map((l) => (
          <Panel key={l.id} tone="paper" shadow="sm" className="flex flex-col p-3">
            <div className="flex gap-3">
              <div className="w-24 shrink-0">
                <CitizenRender art={l.art} stage={l.stage} background="Light Grey" framed />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs uppercase tracking-wide text-brown">
                  {l.category}
                </p>
                <p className="truncate font-display text-lg">{l.traitValue}</p>
                <div className="mt-1">
                  <RarityTag />
                </div>
                <p className="mt-2 font-body text-xs text-brown">
                  From Citizen #{l.sellerCitizenId}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t-2 border-ink/15 pt-3">
              <span className="font-display text-xl tabular-nums">{l.priceEth} ETH</span>
              {isMine(l) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => doCancel(l)}
                  disabled={!MARKET_LIVE}
                >
                  Cancel
                </Button>
              ) : (
                <Button size="sm" onClick={() => setActive(l)} disabled={!MARKET_LIVE}>
                  View deal
                </Button>
              )}
            </div>
          </Panel>
        ))}
      </div>

      {/* accept modal */}
      <Modal
        open={!!active}
        onClose={() => !busy && (setActive(null), setTx("idle"))}
        title={active ? `${active.traitValue}` : ""}
        footer={
          active && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => !busy && (setActive(null), setTx("idle"))}
                disabled={busy}
              >
                Close
              </Button>
              <Button size="sm" onClick={doAccept} disabled={busy}>
                {busy ? "Settling…" : `Accept · ${active.priceEth} ETH`}
              </Button>
            </>
          )
        }
      >
        {active && (
          <div>
            <div className="flex gap-4">
              <div className="w-28 shrink-0">
                <CitizenRender
                  art={active.art}
                  stage={active.stage}
                  background="Light Grey"
                  framed
                />
              </div>
              <dl className="flex-1 space-y-1.5 font-body text-sm">
                <Row k="Trait" v={`${active.category} · ${active.traitValue}`} />
                <Row k="Rarity" v="Rare · frozen forever" />
                <Row k="Seller" v={`Citizen #${active.sellerCitizenId}`} />
                <Row k="Price" v={`${active.priceEth} ETH`} />
                <Row k="Listing" v={active.id} />
              </dl>
            </div>
            <p className="mt-4 font-body text-sm text-brown">
              Accepting moves this frozen trait onto one of your Citizens — it
              settles on-chain in a single transaction.
            </p>
            <div className="mt-3">
              <TradeRules />
            </div>
            {tx !== "idle" && <TxStatus state={tx} className="mt-4" />}
          </div>
        )}
      </Modal>

      {/* list-a-trait modal */}
      <Modal
        open={listOpen}
        onClose={() => !busy && (setListOpen(false), setTx("idle"))}
        title="List a rare trait"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => !busy && (setListOpen(false), setTx("idle"))}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={doList}
              disabled={busy || listCitizenId === null}
            >
              {busy ? "Listing…" : "List trait"}
            </Button>
          </>
        }
      >
        {rareOwned.length === 0 ? (
          <p className="font-body text-sm text-brown">
            None of your Citizens hold a rare frozen trait to list. Rare traits
            are minted, not made — keep collecting.
          </p>
        ) : (
          <div>
            <p className="mb-2 font-display text-sm uppercase tracking-wide text-brown">
              Pick a Citizen with a rare trait
            </p>
            <div className="flex flex-wrap gap-2">
              {rareOwned.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setListCitizenId(c.id)}
                  className={cn(
                    "rounded-lg border-2 border-ink px-3 py-2 font-display text-sm",
                    listCitizenId === c.id ? "bg-red text-paper" : "bg-paper",
                  )}
                >
                  #{c.id}
                </button>
              ))}
            </div>
            <label className="mt-4 block font-display text-sm uppercase tracking-wide text-brown">
              Asking price (ETH)
            </label>
            <input
              value={listPrice}
              onChange={(e) => setListPrice(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-40 rounded-lg border-2 border-ink bg-paper px-3 py-2 font-body"
            />
            <div className="mt-4">
              <TradeRules />
            </div>
            {tx !== "idle" && <TxStatus state={tx} className="mt-4" />}
          </div>
        )}
      </Modal>
    </Page>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-brown">{k}</dt>
      <dd className="text-right font-semibold">{v}</dd>
    </div>
  );
}

const TRADE_RULES = [
  "Traits trade only between Citizens of the same gender.",
  "The receiving Citizen needs an empty slot in that same trait category.",
  "It's a one-way move — the seller's Citizen loses the trait (that slot goes back to reshuffling), the buyer's Citizen receives it frozen.",
  "Only the five reshufflable categories can be traded: Eyes, Eyebrows, Mouth, Clothing, Accessory II.",
];

/** How a trait swap actually works on-chain — shown in the List & Accept flows. */
function TradeRules() {
  return (
    <div className="rounded-lg border-2 border-dashed border-ink bg-cream px-3 py-2.5">
      <p className="font-display text-xs uppercase tracking-wide text-brown">
        How a trait swap works
      </p>
      <ul className="mt-1.5 space-y-1">
        {TRADE_RULES.map((r) => (
          <li key={r} className="flex gap-2 font-body text-xs text-brown">
            <span aria-hidden className="text-ink">
              ▪
            </span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
