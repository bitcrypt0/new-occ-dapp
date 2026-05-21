import type { Metadata } from "next";
import { Page, PageHeader } from "@/components/layout/Page";
import { Panel } from "@/components/layout/Panel";
import { CaptionBox } from "@/components/narrative/CaptionBox";
import { SpeechBubble } from "@/components/narrative/SpeechBubble";
import { Button } from "@/components/actions/Button";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CitizenRender } from "@/components/citizen/CitizenRender";
import { FAQ } from "@/lib/data/faq";
import { CONTRACT } from "@/lib/constants";
import { getReshufflesActive } from "@/lib/chain/server";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How OnChain Citizens V2 works — reshuffles, rare-trait freeze, locking, the three mint paths, and fully on-chain art.",
};

const PATHS = [
  {
    tone: "sky" as const,
    title: "Claim",
    for_: "OCC V1 holders",
    body: "Hold an OCC V1 token? Burn it and receive the matching V2 Citizen — same token ID. A two-step move: approve, then claim.",
    href: "/claim",
    cta: "Go to Claim",
  },
  {
    tone: "rose" as const,
    title: "Free Mint",
    for_: "Everyone else",
    body: "No V1, no previous claim? Free-mint from the eligible IDs in 4541–8000 — token IDs whose original V1 is no longer live. Max 2 per wallet. Free — you only pay gas.",
    href: "/mint",
    cta: "Go to Free Mint",
  },
  {
    tone: "lavender" as const,
    title: "Raffle",
    for_: "IDs 8001–10000",
    body: "The last 2,000 NFTs are minted via onchain raffles on dropr.fun — handled off this site, but they still appear in collections.",
    href: "https://dropr.fun",
    cta: "Visit dropr.fun ↗",
    external: true,
  },
];

export default async function HowItWorksPage() {
  const RESHUFFLES_ACTIVE = await getReshufflesActive();
  return (
    <Page width="narrow">
      <PageHeader
        kicker="The comic guide"
        title="How OnChain Citizens works"
        intro="Six panels, plain language. By the end you'll know exactly what you're minting — and why a Citizen is never quite finished."
      />

      {/* Panel 1 — fully on-chain */}
      <Panel tone="cream" className="mb-6 p-6" halftone>
        <h2 className="font-display text-display-sm">Panel 1 — Fully on-chain</h2>
        <p className="mt-2 font-body text-brown">
          Every Citizen is an SVG drawing stored inside the Ethereum contract
          itself. No IPFS, no image host, no database. The contract is the
          gallery — and it&apos;s immutable. Your Citizen&apos;s picture lasts
          as long as Ethereum does.
        </p>
        <div className="mt-4">
          <CaptionBox tilt="left">
            If the art isn&apos;t on-chain, is it really an on-chain NFT? Ours
            is. All of it.
          </CaptionBox>
        </div>
      </Panel>

      {/* Panel 2 — reshuffle */}
      <Panel tone="rose" className="mb-6 p-6">
        <h2 className="font-display text-display-sm">Panel 2 — Traits reshuffle on transfer</h2>
        <p className="mt-2 font-body text-ink/80">
          {RESHUFFLES_ACTIVE
            ? "A Citizen is alive. Every time it moves to a new wallet, five trait categories re-roll into a new look:"
            : "A Citizen is built to be alive. Reshuffles are switched on by a one-time activation — once live, every time a Citizen moves to a new wallet five trait categories will re-roll into a new look:"}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {["Eyes", "Eyebrows", "Mouth", "Clothing", "Accessory II"].map((t) => (
            <li
              key={t}
              className="border-2 border-ink bg-paper px-3 py-1 font-display text-sm uppercase"
            >
              {t}
            </li>
          ))}
        </ul>
        {!RESHUFFLES_ACTIVE && (
          <p className="mt-3 border-2 border-dashed border-ink bg-paper px-3 py-2 font-body text-sm text-brown">
            <strong className="text-ink">Note:</strong> reshuffles activate after
            the mint window. Until then, transfers leave a Citizen&apos;s look
            unchanged.
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
          {(["male-buzzcut", "female-bob"] as const).map((art) => (
            <div key={art} className="flex items-center gap-3">
              <div className="w-24 shrink-0 sm:w-28">
                <CitizenRender art={art} stage="I" background="Rose" />
              </div>
              <span className="font-display text-3xl" aria-hidden>
                →
              </span>
              <div className="w-24 shrink-0 sm:w-28">
                <CitizenRender art={art} stage="II" background="Rose" />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Panel 3 — rare traits freeze */}
      <Panel tone="sage" className="mb-6 p-6">
        <h2 className="font-display text-display-sm">Panel 3 — Rare traits are frozen forever</h2>
        <p className="mt-2 font-body text-ink/80">
          Here&apos;s the twist: if a Citizen mints with a rare trait, that
          trait never reshuffles. It is frozen on-chain and survives every
          transfer untouched. A reshuffle can never strip it — the only way a
          rare trait leaves is if you deliberately trade it on the Trait Market.
        </p>
        <div className="mt-4">
          <SpeechBubble tone="paper" tail="bottom-left">
            See the crown? It&apos;s rare — so no matter how many times this
            Citizen changes hands, the crown stays put.
          </SpeechBubble>
        </div>
      </Panel>

      {/* Panel 4 — owner shaping */}
      <Panel tone="lavender" className="mb-6 p-6">
        <h2 className="font-display text-display-sm">Panel 4 — You can shape your Citizen</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-ink bg-paper p-4">
            <h3 className="font-display text-lg">Re-roll background</h3>
            <p className="mt-1 font-body text-sm text-brown">
              Free. Don&apos;t like the backdrop? Roll a new color anytime.
            </p>
          </div>
          <div className="rounded-lg border-2 border-ink bg-paper p-4">
            <h3 className="font-display text-lg">Lock traits</h3>
            <p className="mt-1 font-body text-sm text-brown">
              A small paid action ({CONTRACT.lockTraitsFee} ETH) that pauses
              reshuffles so your look holds steady. Reversible — unlock anytime
              for the same small fee.
            </p>
          </div>
        </div>
      </Panel>

      {/* Panel 5 — three mint paths */}
      <Panel tone="cream" className="mb-6 p-6">
        <h2 className="font-display text-display-sm">Panel 5 — Three ways in</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PATHS.map((p) => (
            <div
              key={p.title}
              className="flex flex-col rounded-lg border-2 border-ink bg-paper p-4"
            >
              <span className="font-display text-xl">{p.title}</span>
              <span className="font-display text-[11px] uppercase tracking-wide text-brown">
                For: {p.for_}
              </span>
              <p className="mt-2 flex-1 font-body text-sm text-brown">{p.body}</p>
              <div className="mt-3">
                <Button
                  href={p.href}
                  external={p.external}
                  variant="ghost"
                  size="sm"
                  fullWidth
                >
                  {p.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Panel 6 — the wallet warning */}
      <Panel tone="orange" className="mb-10 p-6">
        <h2 className="font-display text-display-sm">Panel 6 — &ldquo;This transaction might fail&rdquo;</h2>
        <p className="mt-2 font-body text-ink/80">
          On the Free Mint, your wallet may flash a{" "}
          <strong>&ldquo;this transaction might fail&rdquo;</strong> warning.
          That&apos;s expected and harmless. Our contract has an anti-bot rule
          that checks your wallet holds at least{" "}
          <strong>{CONTRACT.balanceGateMin} ETH</strong> — the balance is only
          checked, never spent.
        </p>
        <p className="mt-3 font-body text-ink/80">
          Some wallets reserve gas before running the transaction, which can
          briefly dip your balance under the line. The fix is simple: hold a
          little headroom — we recommend at least{" "}
          <strong>{CONTRACT.balanceGateSafe} ETH</strong> — and the mint sails
          through. <strong>Try with another wallet if your first attempt
          fails.</strong>
        </p>
      </Panel>

      <h2 className="mb-4 font-display text-display-md">Frequently asked</h2>
      <FaqAccordion items={FAQ} />

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button href="/claim">Migrate V1 NFTs</Button>
        <Button href="/mint" variant="secondary">
          Free Mint
        </Button>
      </div>
    </Page>
  );
}
