import { cn } from "@/lib/cn";
import { BG_HEX, citizenArtSrc } from "@/lib/constants";
import type { ArtBase, ArtStage, BackgroundColor } from "@/lib/types";
import { LockStamp } from "./LockStamp";

interface CitizenRenderProps {
  art: ArtBase;
  stage: ArtStage;
  background: BackgroundColor;
  id?: number;
  locked?: boolean;
  /**
   * The on-chain art as a `data:image/svg+xml;base64,…` URI from `tokenURI`.
   * When present it is rendered verbatim; otherwise a sample SVG is used.
   */
  imageUri?: string;
  /** Show a hairline ink frame around the art block. */
  framed?: boolean;
  rounded?: boolean;
  className?: string;
}

/**
 * The Citizen art frame.
 *
 * The art is always rendered through <img> with a `data:` URI — an image
 * context where no script can execute. On-chain SVG is never injected via
 * dangerouslySetInnerHTML or an inline <svg>.
 */
export function CitizenRender({
  art,
  stage,
  background,
  id,
  locked = false,
  imageUri,
  framed = true,
  rounded = true,
  className,
}: CitizenRenderProps) {
  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden",
        framed && "border-ink-lg border-ink",
        rounded && "rounded-panel",
        className,
      )}
      style={{ backgroundColor: BG_HEX[background] }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUri ?? citizenArtSrc(art, stage)}
        alt={
          id
            ? `OnChain Citizen #${id} — ${art === "female-bob" ? "female" : "male"} portrait`
            : "An OnChain Citizen portrait"
        }
        className="absolute inset-0 h-full w-full select-none"
        draggable={false}
      />
      {locked && (
        <div className="absolute right-2 top-2 z-10">
          <LockStamp />
        </div>
      )}
    </div>
  );
}
