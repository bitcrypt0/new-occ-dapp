import { Page } from "@/components/layout/Page";
import { Button } from "@/components/actions/Button";
import { ActionBurst } from "@/components/narrative/ActionBurst";

export default function NotFound() {
  return (
    <Page className="flex flex-col items-center text-center" width="narrow">
      <div className="my-6 h-36 w-36">
        <ActionBurst tone="orange" className="h-full w-full text-3xl">
          404
        </ActionBurst>
      </div>
      <h1 className="font-display text-display-lg">This panel is missing.</h1>
      <p className="mt-3 max-w-md font-body text-lg text-brown">
        The artist must&apos;ve skipped a page. Whatever you were looking for
        didn&apos;t make it into the comic.
      </p>

      {/* an empty comic panel — the gag */}
      <div className="my-8 grid w-full max-w-sm place-items-center">
        <div className="relative aspect-square w-full rounded-panel border-ink-lg border-dashed border-ink bg-cream">
          <div
            aria-hidden
            className="halftone absolute inset-3 rounded-lg text-ink/20"
          />
          <span className="absolute inset-0 grid place-items-center font-display text-xl uppercase tracking-widest text-ink/40">
            Panel intentionally blank
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/">Back to page one</Button>
        <Button href="/collection" variant="ghost">
          Browse Citizens
        </Button>
      </div>
    </Page>
  );
}
