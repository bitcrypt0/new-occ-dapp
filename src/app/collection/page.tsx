"use client";

import { useMemo } from "react";
import { Page, PageHeader } from "@/components/layout/Page";
import { CollectionFilters } from "@/components/citizen/CollectionFilters";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingSkeleton } from "@/components/states/LoadingSkeleton";
import { Button } from "@/components/actions/Button";
import { ConnectButton } from "@/components/actions/ConnectButton";
import { useWallet } from "@/lib/hooks/useWallet";
import { useOwnedCitizens } from "@/lib/hooks/data";
import { useMetadataWatch } from "@/lib/hooks/useMetadataWatch";

export default function CollectionPage() {
  const { connected } = useWallet();
  const { citizens, isLoading, error } = useOwnedCitizens();

  // Real-time refresh: re-fetch a Citizen's art when its metadata changes.
  const ids = useMemo(() => citizens.map((c) => c.id), [citizens]);
  useMetadataWatch(ids);

  return (
    <Page width="wide">
      <PageHeader
        kicker="Your shelf"
        title="My Collection"
        intro={
          connected
            ? "Every V2 Citizen in your wallet. Tap one to see its full story, traits, and owner actions."
            : "Connect a wallet to see the Citizens you hold."
        }
      />

      {!connected ? (
        <EmptyState
          mark="0x"
          title="No wallet connected"
          description="Connect your wallet and your Citizens will appear here as a comic-panel grid."
          action={<ConnectButton />}
        />
      ) : isLoading ? (
        <LoadingSkeleton variant="grid" count={8} />
      ) : error ? (
        <ErrorState
          title="Couldn't load your Citizens"
          description="The chain read didn't come back. Check your connection and try again."
        />
      ) : citizens.length === 0 ? (
        <EmptyState
          mark="!"
          title="No Citizens yet"
          description="This wallet doesn't hold any V2 Citizens. The mint programs have wrapped — pick one up on the secondary marketplace."
          action={
            <Button
              href="https://opensea.io/collection/onchain-citizens-v2"
              external
              size="sm"
            >
              Browse on OpenSea
            </Button>
          }
        />
      ) : (
        <CollectionFilters citizens={citizens} />
      )}
    </Page>
  );
}
