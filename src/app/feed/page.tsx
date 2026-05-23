"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Page } from "@/components/layout/Page";
import { Panel } from "@/components/layout/Panel";
import { Button } from "@/components/actions/Button";
import { CitizenRender } from "@/components/citizen/CitizenRender";
import { CitizenPreviewModal } from "@/components/citizen/CitizenPreviewModal";
import { EmptyState } from "@/components/states/EmptyState";
import { ActionBurst } from "@/components/narrative/ActionBurst";
import { cn } from "@/lib/cn";
import { CONTRACT, FEED_LIVE } from "@/lib/constants";
import { useCitizen, useReshufflesActive } from "@/lib/hooks/data";
import { useFeedStream } from "@/lib/feed/useFeedStream";
import {
  ALL_FEED_TYPES,
  EVENT_META,
  relativeTime,
  type FeedEvent,
  type FeedEventType,
} from "@/lib/feed/types";

/**
 * The Live Feed — a real-time, grid-style timeline of Citizens whose art just
 * changed. Each tile opens a lightweight preview modal so the user doesn't
 * lose their place on the feed.
 *
 * Phase 2a: client-side subscription, no backend, no history (live from now).
 * See `src/lib/feed/wsClient.ts` and `useFeedStream.ts`.
 */
export default function FeedPage() {
  if (!FEED_LIVE) return <FeedComingSoon />;
  return <FeedLive />;
}

/* -------------------------------- live view ------------------------------ */

function FeedLive() {
  const reduce = useReducedMotion();
  const reshufflesActive = useReshufflesActive();
  const events = useFeedStream();
  const [filter, setFilter] = useState<FeedEventType | "all">("all");
  const [now, setNow] = useState(() => Date.now());
  const [openId, setOpenId] = useState<number | null>(null);

  // Keep relative timestamps fresh.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 20_000);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of events) c[e.type] = (c[e.type] ?? 0) + 1;
    return c;
  }, [events]);

  const visible = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.type === filter)),
    [events, filter],
  );

  return (
    <Page width="wide">
      <Masthead live />

      {!reshufflesActive && (
        <p className="mb-5 border-2 border-dashed border-ink bg-cream px-3 py-2 font-body text-sm text-brown">
          <strong className="text-ink">Note:</strong> &ldquo;Reshuffled&rdquo;
          events begin once trait reshuffling is activated on the contract.
          Re-rolls, locks, unlocks and trades print regardless.
        </p>
      )}

      <SearchBar onPick={setOpenId} />

      <p className="mb-5 mt-4 border-2 border-dashed border-ink bg-paper px-3 py-2 font-body text-xs text-brown">
        <strong className="text-ink">Live from this moment forward.</strong>{" "}
        The Wire streams metadata changes as they fire on-chain. The grid
        holds up to {100} of the most recent — older bulletins roll off.
      </p>

      {/* ---- filter chips ---- */}
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter the wire">
        <Chip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
          count={events.length}
        />
        {ALL_FEED_TYPES.map((t) => (
          <Chip
            key={t}
            active={filter === t}
            onClick={() => setFilter(t)}
            label={EVENT_META[t].label}
            glyph={EVENT_META[t].glyph}
            count={counts[t] ?? 0}
          />
        ))}
      </div>

      {/* ---- the wire (grid) ---- */}
      {visible.length === 0 ? (
        <EmptyState
          mark="…"
          title="The wire is quiet"
          description={
            filter === "all"
              ? "No on-chain activity has printed yet. Keep this page open — new bulletins land automatically as they fire."
              : `No "${EVENT_META[filter as FeedEventType].label}" bulletins on the wire right now. Try another filter.`
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <AnimatePresence initial={false}>
            {visible.map((e) => (
              <motion.li
                key={e.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.32, ease: [0.34, 1.3, 0.64, 1] as const }}
              >
                <FeedTile event={e} now={now} onPick={setOpenId} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <CitizenPreviewModal tokenId={openId} onClose={() => setOpenId(null)} />
    </Page>
  );
}

/* ------------------------------ search bar ------------------------------- */

function SearchBar({ onPick }: { onPick: (id: number) => void }) {
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce so we don't re-query on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(text.trim()), 300);
    return () => clearTimeout(t);
  }, [text]);

  const parsed = Number.parseInt(debounced, 10);
  const validId =
    debounced.length > 0 &&
    Number.isInteger(parsed) &&
    parsed >= 1 &&
    parsed <= CONTRACT.totalSupply
      ? parsed
      : null;

  const malformed = text.trim().length > 0 && validId === null && debounced === text.trim();

  return (
    <div className="mb-4 rounded-panel border-ink border-ink bg-paper p-4 shadow-panel-sm">
      <label
        htmlFor="feed-search"
        className="mb-1 block font-display text-xs uppercase tracking-wide text-brown"
      >
        Look up a Citizen
      </label>
      <div className="flex items-stretch gap-2">
        <input
          id="feed-search"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && validId !== null) onPick(validId);
          }}
          placeholder={`Token ID (1–${CONTRACT.totalSupply})`}
          className="flex-1 rounded-lg border-2 border-ink bg-paper px-3 py-2 font-body text-sm placeholder:text-ink/40 focus:outline-none"
          aria-invalid={malformed}
        />
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            className="rounded-lg border-2 border-ink bg-cream px-3 py-2 font-display text-xs uppercase tracking-wide hover:bg-paper"
          >
            Clear
          </button>
        )}
      </div>
      {malformed && (
        <p className="mt-2 font-body text-xs font-semibold text-red">
          Enter a number between 1 and {CONTRACT.totalSupply.toLocaleString()}.
        </p>
      )}
      {validId !== null && (
        <div className="mt-3">
          <SearchResult tokenId={validId} onPick={() => onPick(validId)} />
        </div>
      )}
    </div>
  );
}

function SearchResult({
  tokenId,
  onPick,
}: {
  tokenId: number;
  onPick: () => void;
}) {
  const { citizen, isLoading, notFound } = useCitizen(tokenId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border-2 border-ink bg-cream p-3">
        <div className="h-16 w-16 shrink-0 animate-pulse rounded border-2 border-ink bg-paper" />
        <p className="font-body text-sm text-brown">Looking up #{tokenId}…</p>
      </div>
    );
  }
  if (notFound || !citizen) {
    return (
      <div className="rounded-lg border-2 border-dashed border-ink bg-cream p-3">
        <p className="font-body text-sm text-brown">
          <strong className="text-ink">No Citizen #{tokenId}.</strong> That
          token isn&apos;t part of the collection yet.
        </p>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex w-full items-center gap-3 rounded-lg border-2 border-ink bg-cream p-3 text-left transition-transform hover:-translate-y-0.5 hover:bg-paper hover:shadow-panel-sm"
    >
      <div className="h-16 w-16 shrink-0">
        <CitizenRender
          art={citizen.art}
          stage={citizen.stage}
          background={citizen.background}
          id={citizen.id}
          imageUri={citizen.imageUri}
          framed
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-none">Citizen #{citizen.id}</p>
        <p className="mt-1 font-body text-xs text-brown">
          {citizen.gender} · {citizen.mood} · {citizen.skinTone} skin
        </p>
      </div>
      <span className="font-display text-xs uppercase tracking-wide text-red">
        Open →
      </span>
    </button>
  );
}

/* ----------------------------- gated view -------------------------------- */

function FeedComingSoon() {
  return (
    <Page width="wide">
      <Masthead live={false} />
      <Panel tone="orange" className="flex flex-col items-center p-8 text-center sm:p-12">
        <div className="mb-4 h-28 w-28">
          <ActionBurst tone="red" className="h-full w-full text-base">
            Coming
            <br />
            Soon
          </ActionBurst>
        </div>
        <h2 className="font-display text-display-md">The Wire is being set up.</h2>
        <p className="mx-auto mt-2 max-w-lg font-body text-ink/80">
          The Citizen Wire is a real-time timeline of every Citizen whose art
          changes on-chain — re-rolls, locks, unlocks, trades and reshuffles.
          The moment it&apos;s online, the Wire goes live here.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/collection" size="sm">
            View my Collection
          </Button>
          <Button href="/how-it-works" variant="ghost" size="sm">
            How OnChain Citizens works
          </Button>
        </div>
      </Panel>
    </Page>
  );
}

/* ----------------------------- shared pieces ----------------------------- */

function Masthead({ live }: { live: boolean }) {
  return (
    <Panel tone="ink" shadow="lg" className="mb-6 overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <span className="font-display text-xs uppercase tracking-[0.3em] text-orange">
            OnChain Citizens · Press Bulletin
          </span>
          <h1 className="font-display text-display-lg leading-[0.95] text-paper">
            The Citizen Wire
          </h1>
          <p className="mt-1 font-body text-sm text-paper/75">
            Live off the chain — every metadata update as it prints. Re-rolls,
            locks, trades and reshuffles, hot off the press.
          </p>
        </div>
        {live ? (
          <span
            className="inline-flex w-fit -rotate-3 items-center gap-2 border-ink-lg border-paper bg-red px-3 py-1.5"
            role="status"
            aria-label="Feed is live"
          >
            <span className="relative grid h-3 w-3 place-items-center">
              <span className="absolute inset-0 rounded-full bg-paper/70 motion-safe:animate-ping" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-paper" />
            </span>
            <span className="font-display text-sm uppercase tracking-[0.2em] text-paper">
              Live
            </span>
          </span>
        ) : (
          <span
            className="inline-flex w-fit -rotate-3 items-center gap-2 border-ink-lg border-paper bg-orange px-3 py-1.5"
            role="status"
            aria-label="Feed is coming soon"
          >
            <span className="font-display text-sm uppercase tracking-[0.2em] text-ink">
              Soon
            </span>
          </span>
        )}
      </div>
    </Panel>
  );
}

function Chip({
  active,
  onClick,
  label,
  glyph,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  glyph?: string;
  count: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-ink border-ink px-3 py-1.5 font-display text-xs uppercase tracking-wide shadow-panel-sm transition-transform",
        "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        active ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-cream",
      )}
    >
      {glyph && <span aria-hidden>{glyph}</span>}
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-[10px] tabular-nums",
          active ? "bg-paper text-ink" : "bg-ink text-paper",
        )}
      >
        {count}
      </span>
    </button>
  );
}

/* --------------------------------- tile --------------------------------- */

function FeedTile({
  event,
  now,
  onPick,
}: {
  event: FeedEvent;
  now: number;
  onPick: (id: number) => void;
}) {
  const meta = EVENT_META[event.type];
  const { citizen } = useCitizen(event.citizenId);
  return (
    <button
      type="button"
      onClick={() => onPick(event.citizenId)}
      aria-label={`Open Citizen #${event.citizenId} preview`}
      className="group block w-full rounded-panel border-ink-lg border-ink bg-paper p-2 text-left shadow-panel-sm transition-[transform,box-shadow] duration-100 ease-snap hover:-translate-y-1 hover:shadow-panel focus-visible:-translate-y-1 focus-visible:shadow-panel"
    >
      <div className="relative">
        {citizen ? (
          <CitizenRender
            art={citizen.art}
            stage={citizen.stage}
            background={citizen.background}
            id={citizen.id}
            imageUri={citizen.imageUri}
            framed
          />
        ) : (
          <div className="aspect-square w-full rounded-panel border-ink-lg border-ink bg-cream" />
        )}
        <span
          className={cn(
            "absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full border-2 border-ink px-2 py-0.5 font-display text-[10px] uppercase tracking-wide shadow-panel-sm",
            meta.badge,
          )}
          title={meta.label}
        >
          <span aria-hidden>{meta.glyph}</span>
          <span className="hidden sm:inline">{meta.label}</span>
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <span className="font-display text-sm">#{event.citizenId}</span>
        <time
          className="font-body text-[10px] font-semibold text-brown"
          dateTime={new Date(event.timestamp).toISOString()}
        >
          {relativeTime(event.timestamp, now)}
        </time>
      </div>
    </button>
  );
}
