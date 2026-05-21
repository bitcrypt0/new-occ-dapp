import { cn } from "@/lib/cn";
import type { Attribute } from "@/lib/types";
import { RarityTag } from "./RarityTag";

/** The full per-category trait list for a Citizen detail view. */
export function AttributeList({ attributes }: { attributes: Attribute[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {attributes.map((a) => (
        <li
          key={a.category}
          className={cn(
            "rounded-lg border-2 border-ink px-3 py-2",
            a.rare ? "bg-orange" : "bg-paper",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-xs uppercase tracking-wide text-brown">
              {a.category}
            </span>
            {a.rare ? (
              <RarityTag />
            ) : a.reshufflable ? (
              <span className="font-body text-[10px] uppercase tracking-wide text-brown/70">
                Reshuffles
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 font-body text-base font-semibold text-ink">{a.value}</p>
        </li>
      ))}
    </ul>
  );
}
