import type { FaqItem } from "@/lib/data/faq";

/** An ink-outlined FAQ accordion (native <details> — works without JS). */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-panel border-ink border-ink bg-paper shadow-panel-sm [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 font-display text-base">
            <span>{item.q}</span>
            <span
              aria-hidden
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-orange font-display text-lg leading-none transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="border-t-2 border-ink/15 px-4 py-3.5 font-body text-sm leading-relaxed text-brown">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
