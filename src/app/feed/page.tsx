"use client";

import { Page } from "@/components/layout/Page";
import { Panel } from "@/components/layout/Panel";
import { Button } from "@/components/actions/Button";
import { ActionBurst } from "@/components/narrative/ActionBurst";
import { FEED_LIVE } from "@/lib/constants";

/**
 * The Live Feed — a real-time timeline of `MetadataUpdate` activity.
 *
 * Phase 1: gated. A reliable real-time feed needs an off-chain indexer
 * (raw RPC log queries are too slow / rate-limited, and per-token tokenURI
 * is heavy). The page shows an on-theme "coming soon" state until the
 * indexer is built, deployed, and confirmed online — at which point
 * FEED_LIVE flips to true (Phase 2).
 *
 * Phase 2 wiring: when FEED_LIVE is true, fetch recent MetadataUpdate
 * history from the indexer's paginated API and subscribe to its websocket
 * for the live stream (see INTEGRATION.md §5b).
 */
export default function FeedPage() {
  return (
    <Page width="wide">
      {/* ---- newswire masthead ---- */}
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
          <span
            className="inline-flex w-fit -rotate-3 items-center gap-2 border-ink-lg border-paper bg-orange px-3 py-1.5"
            role="status"
            aria-label="Feed is coming soon"
          >
            <span className="font-display text-sm uppercase tracking-[0.2em] text-ink">
              Soon
            </span>
          </span>
        </div>
      </Panel>

      {/* ---- coming-soon state ---- */}
      {!FEED_LIVE && (
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
            It runs on a dedicated indexer that&apos;s still being built. The
            moment it&apos;s online, the Wire goes live here.
          </p>
          <span className="mt-4 border-2 border-ink bg-paper px-3 py-1 font-display text-xs uppercase tracking-widest">
            Status: indexer in progress
          </span>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/collection" size="sm">
              View my Collection
            </Button>
            <Button href="/how-it-works" variant="ghost" size="sm">
              How OnChain Citizens works
            </Button>
          </div>
        </Panel>
      )}
    </Page>
  );
}
