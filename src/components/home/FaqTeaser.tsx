import { FAQ } from "@/lib/data/faq";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Button } from "@/components/actions/Button";

/** A short FAQ teaser on the homepage, linking to the full page. */
export function FaqTeaser() {
  return (
    <section className="border-t-ink-lg border-ink bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <span className="inline-block -rotate-2 border-2 border-ink bg-paper px-3 py-1 font-display text-xs uppercase tracking-widest">
            Quick answers
          </span>
          <h2 className="mt-3 font-display text-display-md">Still curious?</h2>
        </div>
        <div className="mt-8">
          <FaqAccordion items={FAQ.slice(0, 4)} />
        </div>
        <div className="mt-8 text-center">
          <Button href="/docs" variant="ghost">
            Read the full Docs
          </Button>
        </div>
      </div>
    </section>
  );
}
