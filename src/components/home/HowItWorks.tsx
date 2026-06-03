import { Panel } from "@/components/layout/Panel";

function buildSteps(reshufflesActive: boolean) {
  return [
    {
      n: "01",
      tone: "sky" as const,
      title: "Get a Citizen",
      body: "The mint programs have wrapped. Pick one up on the secondary marketplace — they still trade like any other ERC-721.",
    },
    {
      n: "02",
      tone: "rose" as const,
      title: "It lives & reshuffles",
      body: reshufflesActive
        ? "Every transfer re-rolls five traits. Your Citizen earns a history as it changes hands."
        : "Once reshuffles activate, every transfer re-rolls five traits — your Citizen earns a history as it changes hands.",
    },
    {
      n: "03",
      tone: "sage" as const,
      title: "Rare traits stay",
      body: "Minted with something rare? It's frozen forever — no reshuffle can ever take it.",
    },
    {
      n: "04",
      tone: "lavender" as const,
      title: "Shape it your way",
      body: "Re-roll the background for free, or lock every trait to freeze the look you love.",
    },
  ];
}

/** Compact "How it works" strip below the journey. */
export function HowItWorks({ reshufflesActive }: { reshufflesActive: boolean }) {
  const STEPS = buildSteps(reshufflesActive);
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-display-md">How it works</h2>
          <span className="border-2 border-ink bg-orange px-3 py-1 font-display text-xs uppercase tracking-widest">
            Four panels, that&apos;s it
          </span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <Panel key={s.n} tone={s.tone} shadow="sm" className="p-5">
              <span className="font-display text-display-sm text-ink/30">{s.n}</span>
              <h3 className="mt-1 font-display text-xl">{s.title}</h3>
              <p className="mt-2 font-body text-sm text-ink/80">{s.body}</p>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}
