"use client";

import { Modal } from "@/components/actions/Modal";
import { Button } from "@/components/actions/Button";
import { CitizenRender } from "./CitizenRender";
import { AttributeList } from "./AttributeList";
import { LockStamp } from "./LockStamp";
import { useCitizen } from "@/lib/hooks/data";
import { openseaTokenUrl } from "@/lib/constants";

/**
 * Lightweight Citizen preview shown over the Live Feed (and the search).
 *
 * Keeps the user in-context — clicking a feed PFP no longer navigates away.
 * Offers two clear next steps: deep-dive on the full /citizen page, or jump
 * to the listing on OpenSea.
 */
export function CitizenPreviewModal({
  tokenId,
  onClose,
}: {
  tokenId: number | null;
  onClose: () => void;
}) {
  const open = tokenId !== null;
  // Pass 0 when closed — useCitizen's range check disables the query for 0.
  const { citizen, isLoading, notFound } = useCitizen(tokenId ?? 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tokenId ? `Citizen #${tokenId}` : "Citizen"}
      footer={
        tokenId != null && (
          <>
            <Button href={`/citizen/${tokenId}`} variant="ghost" size="sm">
              Open full page →
            </Button>
            <Button href={openseaTokenUrl(tokenId)} external size="sm">
              View on OpenSea ↗
            </Button>
          </>
        )
      }
    >
      {isLoading || (!citizen && !notFound) ? (
        <div className="aspect-square w-full animate-pulse rounded-panel border-ink-lg border-ink bg-cream" />
      ) : notFound || !citizen ? (
        <p className="font-body text-sm text-brown">
          That token isn&apos;t part of the collection yet — it may not have
          been minted.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <CitizenRender
              art={citizen.art}
              stage={citizen.stage}
              background={citizen.background}
              id={citizen.id}
              imageUri={citizen.imageUri}
              locked={citizen.traitsLocked}
              framed
            />
            {citizen.traitsLocked && (
              <div className="absolute right-2 top-2 z-10">
                <LockStamp />
              </div>
            )}
          </div>
          <p className="font-body text-sm text-ink">
            {citizen.gender} · {citizen.mood} · {citizen.skinTone} skin ·{" "}
            {citizen.hairColor} hair
          </p>
          <dl className="grid grid-cols-2 gap-2 font-body text-xs text-brown">
            <div className="rounded-lg border-2 border-ink bg-paper px-3 py-2">
              <dt className="font-display uppercase tracking-wide">Transfers</dt>
              <dd className="font-display text-lg text-ink">
                {citizen.transferCount}
              </dd>
            </div>
            <div className="rounded-lg border-2 border-ink bg-paper px-3 py-2">
              <dt className="font-display uppercase tracking-wide">Locked</dt>
              <dd className="font-display text-lg text-ink">
                {citizen.traitsLocked ? "Yes" : "No"}
              </dd>
            </div>
          </dl>

          {citizen.attributes.length > 0 && (
            <section className="pt-2">
              <h3 className="mb-2 font-display text-xs uppercase tracking-wide text-brown">
                Traits
              </h3>
              <AttributeList attributes={citizen.attributes} />
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
