"use client";

import { cn } from "@/lib/cn";
import { useLaserInspection } from "@/lib/hooks/data";
import type { Gender } from "@/lib/types";

/**
 * Read-only callout surfacing whether a Citizen owns a "hideable" Accessory
 * (currently just the laser) and whether it's visible right now.
 *
 * The component is PUBLIC — it renders for non-owners too, because the
 * accessory is part of the token's permanent identity. The `isOwner` prop
 * conditionally drops the "self-transfer to nudge a reshuffle" suggestion
 * and the lock-traits suggestion, which only make sense to surface to the
 * current holder.
 *
 * The compatible-eyes list for the laser is fixed (angry, normal, small,
 * surprised, wide-open) and surfaced verbatim — the laser is the sole
 * hideable accessory in the live registry, so the list doesn't need to be
 * derived from the inspector's eyes-block mask.
 *
 * Pronouns ("his eyes" / "her eyes", "him" / "her") are picked from the
 * Citizen's on-chain Gender attribute.
 */
export function LaserCallout({
  tokenId,
  isOwner,
  gender,
}: {
  tokenId: number;
  isOwner: boolean;
  gender: Gender;
}) {
  const { data } = useLaserInspection(tokenId);
  if (!data || !data.ownsHideableAccessory) return null;

  const possessive = gender === "Male" ? "his" : "her";
  const objective = gender === "Male" ? "him" : "her";

  if (!data.accessoryCurrentlyHidden) {
    return (
      <CalloutBox tone="emerald" glyph="⚡">
        <p className="font-body text-sm text-ink">
          <strong className="font-display text-ink">Laser equipped.</strong>{" "}
          Currently visible — your Citizen&apos;s displayed eyes are compatible.
        </p>
      </CalloutBox>
    );
  }

  return (
    <CalloutBox tone="amber" glyph="◐">
      <p className="font-body text-sm text-ink">
        <strong className="font-display text-ink">
          Laser temporarily hidden.
        </strong>{" "}
        Currently, your Citizen&apos;s eyes cannot support the laser. It will
        reappear when {possessive} eyes reshuffle to one of:{" "}
        <span className="font-semibold">
          angry, normal, small, surprised, wide-open
        </span>
        .
        {isOwner && (
          <>
            {" "}
            Perform a self-transfer to nudge a reshuffle. You can also lock
            this Citizen&apos;s traits once the laser reappears if you&apos;d
            like {objective} to always have the laser on.
          </>
        )}
      </p>
    </CalloutBox>
  );
}

function CalloutBox({
  tone,
  glyph,
  children,
}: {
  tone: "emerald" | "amber";
  glyph: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-panel border-ink-lg border-ink px-4 py-3 shadow-panel-sm",
        tone === "emerald" ? "bg-sage" : "bg-orange",
      )}
      role="status"
    >
      <span
        aria-hidden
        className="grid h-8 w-8 shrink-0 -rotate-3 place-items-center rounded-lg border-2 border-ink bg-paper font-display text-lg"
      >
        {glyph}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
