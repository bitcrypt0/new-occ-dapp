"use client";

import { useEffect, useState } from "react";
import type { AbiEvent, Log } from "viem";
import { occv2Abi } from "../abi/occv2";
import { occv2Contract } from "../chain/contracts";
import { useReshufflesActive } from "../hooks/data";
import { wsPublicClient } from "./wsClient";
import type { FeedEvent, FeedEventType } from "./types";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAX_EVENTS = 100;

const FEED_EVENT_NAMES = [
  "BackgroundRerolled",
  "TraitsFrozen",
  "TraitsUnfrozen",
  "FrozenTraitTransferred",
  "Transfer",
] as const;
type FeedEventName = (typeof FEED_EVENT_NAMES)[number];

/** Extract the ABI entries for the five events we listen to. */
const FEED_EVENT_ABIS = occv2Abi.filter(
  (e) =>
    e.type === "event" &&
    (FEED_EVENT_NAMES as readonly string[]).includes(e.name),
) as unknown as AbiEvent[];

type FeedLog = Log<bigint, number, false, undefined, true, AbiEvent[]> & {
  eventName: FeedEventName;
  args: Record<string, unknown>;
};

/**
 * Live Feed stream — subscribes to the five OCCV2 events that change a
 * Citizen's appearance and pushes them into an in-memory rolling list.
 *
 * Phase 2a: no backend. The subscription is `eth_subscribe` over the
 * public-node websocket (see `wsClient.ts`), so it's push-based and free —
 * but each visitor gets their own ws connection and the feed only contains
 * events that fire while the page is open. A proper indexer (Phase 2b)
 * adds historical depth and shared infrastructure when budget allows.
 */
export function useFeedStream(): FeedEvent[] {
  const reshufflesActive = useReshufflesActive();
  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    const unwatch = wsPublicClient.watchEvent({
      address: occv2Contract.address,
      events: FEED_EVENT_ABIS,
      // `poll: false` forces eth_subscribe (push) — required for a live feel.
      poll: false,
      onLogs(logs) {
        setEvents((prev) => {
          const next = prev.slice();
          let added = false;
          for (const log of logs as FeedLog[]) {
            const parsed = parseFeedLog(log, reshufflesActive);
            if (parsed) {
              next.unshift(parsed);
              added = true;
            }
          }
          return added ? next.slice(0, MAX_EVENTS) : prev;
        });
      },
      onError(err) {
        // eslint-disable-next-line no-console
        console.warn("[feed] subscription error", err);
      },
    });
    return () => {
      unwatch();
    };
  }, [reshufflesActive]);

  return events;
}

function parseFeedLog(
  log: FeedLog,
  reshufflesActive: boolean,
): FeedEvent | null {
  const txHash = log.transactionHash ?? ("0x" as `0x${string}`);
  const id = `${txHash}-${log.logIndex ?? 0}`;
  const timestamp = Date.now();
  const args = log.args;

  const tokenIdOf = (key: string): number | null => {
    const v = args[key];
    if (typeof v === "bigint") return Number(v);
    if (typeof v === "number") return v;
    return null;
  };

  const make = (type: FeedEventType, citizenId: number): FeedEvent => ({
    id,
    type,
    citizenId,
    timestamp,
    txHash,
  });

  switch (log.eventName) {
    case "BackgroundRerolled": {
      const id = tokenIdOf("tokenId");
      return id != null ? make("background", id) : null;
    }
    case "TraitsFrozen": {
      const id = tokenIdOf("tokenId");
      return id != null ? make("locked", id) : null;
    }
    case "TraitsUnfrozen": {
      const id = tokenIdOf("tokenId");
      return id != null ? make("unlocked", id) : null;
    }
    case "FrozenTraitTransferred": {
      // The destination Citizen is the one whose look just changed.
      const id = tokenIdOf("dstTokenId");
      return id != null ? make("traded", id) : null;
    }
    case "Transfer": {
      // Only wallet-to-wallet transfers reshuffle — skip mints and burns.
      // And only count as "reshuffled" once the contract switch is on.
      if (!reshufflesActive) return null;
      const from = String(args.from ?? "").toLowerCase();
      const to = String(args.to ?? "").toLowerCase();
      if (from === ZERO_ADDRESS || to === ZERO_ADDRESS) return null;
      const id = tokenIdOf("tokenId");
      return id != null ? make("reshuffled", id) : null;
    }
  }
  return null;
}
