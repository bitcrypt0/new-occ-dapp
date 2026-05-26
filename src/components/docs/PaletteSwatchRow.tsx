import { cn } from "@/lib/cn";
import type { PaletteSwatch } from "@/lib/data/traits";

/** Row of color swatches — used for Skin Tone and Hair Color in §6. */
export function PaletteSwatchRow({
  swatches,
  labelledBy,
}: {
  swatches: PaletteSwatch[];
  /** id of the section heading this row belongs to (for aria). */
  labelledBy?: string;
}) {
  return (
    <ul
      role="list"
      aria-labelledby={labelledBy}
      className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7"
    >
      {swatches.map((s) => {
        // Pick foreground for the hex stamp so it always meets contrast on the swatch.
        const dark = isDark(s.hex);
        return (
          <li key={s.name} className="text-center">
            <div
              className={cn(
                "mx-auto grid aspect-square w-full place-items-center rounded-panel border-ink-lg border-ink shadow-panel-sm",
              )}
              style={{ backgroundColor: s.hex }}
            >
              <span
                className={cn(
                  "rounded border-2 border-ink px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                  dark ? "bg-ink text-paper" : "bg-paper text-ink",
                )}
              >
                {s.hex}
              </span>
            </div>
            <p className="mt-1.5 font-display text-sm leading-tight">{s.name}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** Relative luminance check — true when the swatch needs a paper-on-ink chip. */
function isDark(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // perceptual luma
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 130;
}
