"use client";

import Link from "next/link";
import { Modal } from "@/components/actions/Modal";
import { Button } from "@/components/actions/Button";
import { CitizenRender } from "@/components/citizen/CitizenRender";
import { LoadingSkeleton } from "@/components/states/LoadingSkeleton";
import { useCitizensByIds } from "@/lib/hooks/data";

interface MintedCitizensModalProps {
  open: boolean;
  onClose: () => void;
  /** The V2 token ids that were just minted/claimed. */
  tokenIds: number[];
  /** Modal heading — e.g. "Migrated!" or "Minted!". */
  title: string;
  /** One-line description under the heading. */
  blurb: string;
}

/**
 * Post-transaction modal — shows the freshly minted/claimed V2 Citizens with
 * their real on-chain art, fetched fresh from `tokenURI`. Used by both the
 * Claim and Free Mint flows.
 */
export function MintedCitizensModal({
  open,
  onClose,
  tokenIds,
  title,
  blurb,
}: MintedCitizensModalProps) {
  const { citizens, isLoading } = useCitizensByIds(open ? tokenIds : []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button href="/collection" size="sm">
            View my Collection
          </Button>
        </>
      }
    >
      <p className="font-body text-sm text-brown">{blurb}</p>

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton variant="grid" count={Math.min(tokenIds.length, 4)} />
        ) : citizens.length === 0 ? (
          <p className="rounded-lg border-2 border-dashed border-ink bg-cream px-3 py-4 text-center font-body text-sm text-brown">
            Your new Citizen{tokenIds.length === 1 ? " is" : "s are"} confirmed
            on-chain. The art may take a moment to appear — find{" "}
            {tokenIds.length === 1 ? "it" : "them"} in your collection.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {citizens.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/citizen/${c.id}`}
                  onClick={onClose}
                  className="block rounded-panel border-ink-lg border-ink bg-paper p-2 shadow-panel-sm transition-transform hover:-translate-y-1 hover:shadow-panel"
                >
                  <CitizenRender
                    art={c.art}
                    stage={c.stage}
                    background={c.background}
                    id={c.id}
                    locked={c.traitsLocked}
                    imageUri={c.imageUri}
                  />
                  <p className="mt-1.5 text-center font-display text-base">
                    Citizen #{c.id}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
