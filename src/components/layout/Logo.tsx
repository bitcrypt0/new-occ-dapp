import { cn } from "@/lib/cn";

/**
 * The OCCV2 comic wordmark. The tile is an inline SVG mirroring
 * `src/app/icon.svg` exactly so the header logo and the favicon stay
 * visually identical — same rotation, same red, same OCC lockup.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 64 64"
        aria-hidden
        className="h-11 w-11 shrink-0 drop-shadow-[2px_2px_0_rgba(26,26,26,1)]"
      >
        <g transform="rotate(-3 32 32)">
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="10"
            fill="#FD5D63"
            stroke="#1A1A1A"
            strokeWidth="4"
          />
          <text
            x="32"
            y="39"
            textAnchor="middle"
            fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
            fontWeight="900"
            fontSize="19"
            fill="#F7F1E1"
            letterSpacing="-1"
          >
            OCC
          </text>
        </g>
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg uppercase tracking-tight text-ink">
          OnChain Citizens
        </span>
      </span>
    </span>
  );
}
