"use client";

import { useMemo } from "react";
import { useWatchContractEvent } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { occv2Contract } from "../chain/contracts";
import { EVENT_POLL_MS } from "../wagmi";

/**
 * Real-time metadata refresh (Mandate 5.4).
 *
 * Watches the ERC-4906 `MetadataUpdate(tokenId)` event for the on-screen
 * token ids and invalidates their react-query caches when one fires — the
 * affected `tokenURI` is then re-fetched and the <img> re-renders with no
 * manual reload. Public RPC has no dependable websocket, so this polls at
 * mainnet block cadence (~12s); a private WS endpoint upgrades it to push.
 *
 * Pass only the ids currently visible — watching is scoped, not collection-wide.
 */
export function useMetadataWatch(tokenIds: number[]) {
  const queryClient = useQueryClient();
  // Stable key so the watcher isn't torn down on every render.
  const watchKey = useMemo(
    () => [...new Set(tokenIds)].sort((a, b) => a - b).join(","),
    [tokenIds],
  );
  const idSet = useMemo(
    () => new Set(watchKey ? watchKey.split(",").map(Number) : []),
    [watchKey],
  );

  useWatchContractEvent({
    address: occv2Contract.address,
    abi: occv2Contract.abi,
    eventName: "MetadataUpdate",
    poll: true,
    pollingInterval: EVENT_POLL_MS,
    enabled: idSet.size > 0,
    onLogs(logs) {
      let touchedOwned = false;
      for (const log of logs) {
        const args = (log as { args?: Record<string, unknown> }).args ?? {};
        const rawId = Object.values(args)[0];
        const id = Number(rawId);
        if (Number.isFinite(id) && idSet.has(id)) {
          queryClient.invalidateQueries({ queryKey: ["citizen", id] });
          touchedOwned = true;
        }
      }
      if (touchedOwned) {
        queryClient.invalidateQueries({ queryKey: ["ownedCitizens"] });
      }
    },
  });
}

/**
 * Imperative refresh for a token the user just acted on — don't wait for the
 * event round-trip after the user's own confirmed transaction.
 */
export function useCitizenRefresh() {
  const queryClient = useQueryClient();
  return (tokenId: number) => {
    queryClient.invalidateQueries({ queryKey: ["citizen", tokenId] });
    queryClient.invalidateQueries({ queryKey: ["ownedCitizens"] });
  };
}
