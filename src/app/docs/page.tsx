import type { Metadata } from "next";
import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/Page";
import { Panel } from "@/components/layout/Panel";
import { Button } from "@/components/actions/Button";
import { CaptionBox } from "@/components/narrative/CaptionBox";
import { SpeechBubble } from "@/components/narrative/SpeechBubble";
import { ActionBurst } from "@/components/narrative/ActionBurst";
import { RarityTag } from "@/components/citizen/RarityTag";
import { FaqAccordion } from "@/components/FaqAccordion";
import { DocsToc, type TocChapter } from "@/components/docs/DocsToc";
import { ChapterBreak } from "@/components/docs/ChapterBreak";
import { RareTraitsAtlas } from "@/components/docs/RareTraitsAtlas";
import { LockedAtlasGrid } from "@/components/docs/LockedAtlasGrid";
import { PaletteSwatchRow } from "@/components/docs/PaletteSwatchRow";
import { Glossary } from "@/components/docs/Glossary";
import { CONTRACT, MARKET_LIVE, SOCIALS } from "@/lib/constants";
import { getReshufflesActive } from "@/lib/chain/server";
import { FAQ } from "@/lib/data/faq";
import {
  HAIR_COLOR_PALETTE,
  LOCKED_ACCESSORY_I,
  LOCKED_FACIAL_HAIR,
  LOCKED_HAIR,
  RARE_TRAITS,
  SKIN_TONE_PALETTE,
} from "@/lib/data/traits";

export const metadata: Metadata = {
  title: "Docs — the OCCV2 reference manual",
  description:
    "How OnChain Citizens V2 works — mint paths, reshuffles, rare-trait freeze, owner actions, the Trait Market, plus a full atlas of every rare variant in the collection.",
  openGraph: {
    title: "OCCV2 Docs — the reference manual",
    description:
      "The full plain-language guide to OnChain Citizens V2: how to mint, how reshuffles work, the 56 rare traits, the Trait Market rules, and more.",
    images: ["/icon.svg"],
  },
};

const CHAPTERS: TocChapter[] = [
  { id: "what-is-occv2", number: "01", label: "What is OCCV2" },
  { id: "mint-paths", number: "02", label: "Three ways in" },
  { id: "reshuffle", number: "03", label: "The reshuffle" },
  { id: "rare-freeze", number: "04", label: "Rare traits freeze" },
  { id: "rare-atlas", number: "05", label: "Rare Traits Atlas" },
  { id: "locked-personality", number: "06", label: "Core personality traits" },
  { id: "owner-actions", number: "07", label: "Owner actions" },
  { id: "provenance", number: "08", label: "Provenance" },
  { id: "trait-market", number: "09", label: "The Trait Market" },
  { id: "balance-gate", number: "10", label: "The wallet gate" },
  { id: "glossary", number: "11", label: "Glossary" },
  { id: "faq", number: "12", label: "FAQ" },
];

/** Card count in the atlas (pairs grouped as one card). */
const RARE_CARD_COUNT = RARE_TRAITS.length;
/** Individual rare variant files — matches the on-disk meta.json count. */
const RARE_VARIANT_COUNT = RARE_TRAITS.reduce(
  (n, t) => n + (t.pair ? 2 : 1),
  0,
);

export default async function DocsPage() {
  const reshufflesActive = await getReshufflesActive();
  return (
    <Page width="wide">
      <PageHeader
        kicker="The reference manual"
        title="OCCV2 Docs"
        intro={
          <>
            Everything you need to understand{" "}
            <strong className="text-ink">OnChain Citizens V2</strong> — the
            mint paths, the reshuffle, what makes a trait rare, and the full
            atlas of every rare variant in the collection. Twelve chapters,
            plain language, none of the marketing fluff.
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <DocsToc chapters={CHAPTERS} />

        <article className="min-w-0 space-y-2">
          {/* ============================ §1 ============================ */}
          <ChapterSection id="what-is-occv2" number="01" title="What is OCCV2">
            <Panel tone="cream" className="p-6" halftone>
              <p className="font-body text-base leading-relaxed text-ink">
                <strong>OnChain Citizens V2 (OCCV2)</strong> is a 10,000-supply
                ERC-721 collection on Ethereum mainnet. Every Citizen is a
                flat-cartoon SVG portrait composed and stored{" "}
                <em>fully on-chain</em>. There is no IPFS link, no image host,
                no off-chain database — the artwork lives inside the contract
                itself and is rendered straight from it. As long as Ethereum
                exists, your Citizen&apos;s picture exists.
              </p>
              <p className="mt-3 font-body text-base leading-relaxed text-ink">
                OCCV2 is the migration of the original OCC V1 collection. V1
                holders can <Link className="font-semibold underline-offset-2 hover:underline" href="/claim">burn their V1 token to claim the matching V2 Citizen</Link>{" "}
                with the same ID; everyone else can{" "}
                <Link className="font-semibold underline-offset-2 hover:underline" href="/mint">free-mint a brand-new Citizen</Link>{" "}
                — only paying gas. The top 2,000 IDs ship via an external
                raffle on{" "}
                <a className="font-semibold underline-offset-2 hover:underline" href={SOCIALS.raffle} target="_blank" rel="noopener noreferrer">
                  dropr.fun
                </a>
                .
              </p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <Fact label="Supply" value={`${CONTRACT.totalSupply.toLocaleString()} Citizens`} />
                <Fact label="Network" value={CONTRACT.chain} />
                <Fact label="Mint price" value="Free · gas only" />
              </dl>
            </Panel>
            <p className="mt-3 font-mono text-xs text-brown break-all">
              Contract: {CONTRACT.address}
            </p>
          </ChapterSection>

          <ChapterBreak />

          {/* ============================ §2 ============================ */}
          <ChapterSection id="mint-paths" number="02" title="Three ways to get a Citizen">
            <p className="mb-5 font-body text-base text-ink/80">
              There are three paths into the collection. None of them has a
              mint price — you only ever pay Ethereum gas. They aren&apos;t a
              clean partition either: V1 holders and wallets that have already
              claimed are barred from the Free Mint route, but a raffle mint
              can land in any wallet without locking it out of anything else.
            </p>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Claim */}
              <Panel tone="sky" className="flex h-full flex-col p-5">
                <span className="font-display text-xs uppercase tracking-widest text-brown">
                  For V1 holders
                </span>
                <h3 className="mt-1 font-display text-xl">Claim</h3>
                <p className="mt-2 flex-1 font-body text-sm text-ink/85">
                  Hold an OnChain Citizens <strong>V1</strong> token in this
                  wallet? Burn it to mint the matching V2 Citizen — same token
                  ID, brand-new on-chain art. The contract checks that you{" "}
                  <em>currently</em> own the V1, so you can claim every V1 in
                  your wallet, one by one. A <strong>two-step move</strong>:
                  approve the V2 contract on V1, then claim. Free — gas only.
                </p>
                <Button href="/claim" size="sm" className="mt-4">
                  Go to Claim
                </Button>
              </Panel>

              {/* Free Mint */}
              <Panel
                tone="rose"
                className="relative flex h-full flex-col overflow-hidden p-5"
                aria-label="Free Mint — sold out"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -top-6 h-20 w-20"
                >
                  <ActionBurst tone="red" className="h-full w-full text-[10px]">
                    Sold
                    <br />
                    Out!
                  </ActionBurst>
                </div>
                <span className="font-display text-xs uppercase tracking-widest text-brown">
                  For everyone else
                </span>
                <h3 className="mt-1 font-display text-xl">Free Mint</h3>
                <p className="mt-2 font-body text-sm font-semibold text-red">
                  Fully claimed. The Free Mint allocation has sold out — no
                  IDs remain in the mintable pool.
                </p>
                <p className="mt-2 flex-1 font-body text-sm text-ink/85">
                  While it was live, this was the path for anyone without a
                  V1 token and no prior claim. The mintable pool was every
                  V2 ID in <strong>1–8000</strong> whose original V1 token
                  is no longer live — the never-minted block in 4541–8000,
                  plus the 24 V1 tokens that were burnt-in-place inside
                  1–4540. Cap was{" "}
                  <strong>{CONTRACT.freeMintCap} per wallet</strong>.
                </p>
                <p className="mt-3 font-body text-xs text-brown">
                  See the{" "}
                  <a href="#balance-gate" className="underline-offset-2 hover:underline">
                    wallet gate
                  </a>{" "}
                  below for context on the &ldquo;transaction might fail&rdquo; warning.
                </p>
                <span
                  aria-hidden
                  className="mt-4 inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-panel border-ink-lg border-ink bg-paper/80 px-6 py-3 font-display text-base uppercase tracking-wide text-ink/50 shadow-panel-sm line-through"
                >
                  Go to Free Mint
                </span>

                {/* The big diagonal SOLD OUT stamp — purely decorative. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
                >
                  <span className="rotate-[-10deg] border-[5px] border-red bg-paper/95 px-6 py-2 font-display text-4xl uppercase tracking-[0.18em] text-red shadow-panel sm:text-5xl">
                    Sold Out
                  </span>
                </span>
              </Panel>

              {/* Raffle */}
              <Panel tone="lavender" className="flex h-full flex-col p-5">
                <span className="font-display text-xs uppercase tracking-widest text-brown">
                  For raffle entrants
                </span>
                <h3 className="mt-1 font-display text-xl">Raffle</h3>
                <p className="mt-2 flex-1 font-body text-sm text-ink/85">
                  The top 2,000 IDs (<strong>8001–10000</strong>) are minted
                  externally via raffles on dropr.fun — not from this dapp.
                  Citizens minted there are first-class members of the
                  collection: they appear in <Link className="underline-offset-2 hover:underline" href="/collection">My Collection</Link>{" "}
                  and behave identically.
                </p>
                <Button
                  href={SOCIALS.raffle}
                  external
                  size="sm"
                  variant="ghost"
                  className="mt-4"
                >
                  Visit dropr.fun ↗
                </Button>
              </Panel>
            </div>

            <div className="mt-6">
              <CaptionBox tilt="left">
                Reminder: there is <strong>no mint price</strong> on OCCV2.
                Anyone telling you otherwise is selling you something else.
              </CaptionBox>
            </div>
          </ChapterSection>

          <ChapterBreak />

          {/* ============================ §3 ============================ */}
          <ChapterSection
            id="reshuffle"
            number="03"
            title="Why a Citizen is alive — the Reshuffle"
          >
            <Panel tone="rose" className="p-6">
              <p className="font-body text-base leading-relaxed text-ink">
                All Citizens are built to be <em>alive</em>. Every time a
                Citizen is transferred, five of its trait slots are liable to
                be re-rolled into a new combination, producing a new look. We
                call this a{" "}
                <Link href="#glossary-reshuffle" className="font-semibold underline-offset-2 hover:underline">
                  reshuffle
                </Link>
                . However, all rare traits within these five trait categories
                are locked at mint and cannot be re-rolled during transfers.
                Holders can also freely re-roll new background colors for
                Citizens held.
              </p>
              <p className="mt-3 font-body text-base font-semibold text-ink">
                The five reshufflable categories:
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {["Eyes", "Eyebrows", "Mouth", "Clothing", "Accessory II"].map((t) => (
                  <li
                    key={t}
                    className="border-2 border-ink bg-paper px-3 py-1 font-display text-sm uppercase"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              {!reshufflesActive && (
                <p className="mt-5 border-2 border-dashed border-ink bg-paper px-3 py-2.5 font-body text-sm text-brown">
                  <strong className="text-ink">Note:</strong> reshuffles ship{" "}
                  <em>inactive</em>. The team flips a one-way on-chain switch
                  to turn them on, possibly only after the mint window. Until
                  then, transfers leave a Citizen&apos;s look unchanged.
                </p>
              )}
            </Panel>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <SpeechBubble tone="paper" tail="bottom-left">
                Five trait slots re-roll on every transfer. By performing
                self-transfers, holders can customize their Citizens&apos;
                appearance — mood and clothing — at will.
              </SpeechBubble>
            </div>

            <figure className="mt-8 rounded-panel border-ink-lg border-ink bg-paper p-3 shadow-panel-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/docs/category-sheets/preview-eyes-no-heads.svg"
                alt="A reference sheet showing every Eyes variant on its own — the kind of category that re-rolls every transfer."
                loading="lazy"
                decoding="async"
                className="h-auto w-full"
              />
              <figcaption className="mt-2 px-1 font-body text-xs text-brown">
                <strong className="text-ink">Eyes overview.</strong> One of the
                five reshufflable categories — every variant shown on its own,
                no head silhouette in the way. On every wallet-to-wallet
                transfer (once reshuffles are active), the slot above re-rolls
                to a different one of these.
              </figcaption>
            </figure>
          </ChapterSection>

          <ChapterBreak />

          {/* ============================ §4 ============================ */}
          <ChapterSection
            id="rare-freeze"
            number="04"
            title="Rare traits never reshuffle"
          >
            <Panel tone="sage" className="p-6">
              <p className="font-body text-base leading-relaxed text-ink">
                The reshuffle has one big exception. Each trait variant has a
                weight — a number that controls how often it rolls at mint.
                The lower a trait&apos;s weight, the rarer it is.
              </p>
              <p className="mt-3 rounded border-2 border-ink bg-paper px-4 py-3 font-display text-base">
                If a Citizen mints with a trait whose <strong>weight is less
                than 16</strong>, that trait is <strong>locked forever</strong>.
                It never reshuffles.
              </p>
              <p className="mt-4 font-body text-base leading-relaxed text-ink">
                This is how rare traits are defined. The lock is permanent
                against reshuffles on-transfer. The only way a locked rare
                trait ever leaves a Citizen is if its owner{" "}
                <Link href="#trait-market" className="font-semibold underline-offset-2 hover:underline">
                  deliberately trades it on the Trait Market
                </Link>
                .
              </p>
              <details className="mt-4 rounded border-2 border-ink bg-cream/60 px-4 py-2.5 text-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="cursor-pointer list-none font-display text-sm uppercase tracking-wide text-brown">
                  Additional Note
                </summary>
                <p className="mt-2 font-body text-sm leading-relaxed text-brown">
                  Internally, Eyes and Specials weights are stored ×2, so their
                  on-chain comparison uses a threshold of 32. The user-facing
                  rule is the same either way: the rare-trait list is exactly
                  the variants whose <em>metadata</em> weight is below 16. See
                  the metadata weight on every atlas card below.
                </p>
              </details>
            </Panel>
          </ChapterSection>

          <ChapterBreak />

          {/* ============================ §5 ============================ */}
          <ChapterSection
            id="rare-atlas"
            number="05"
            title="The Rare Traits Atlas"
            kicker={`${RARE_VARIANT_COUNT} variants · ${RARE_CARD_COUNT} cards · 9 categories`}
          >
            <p className="mb-5 font-body text-base text-ink/80">
              Every rare variant in the collection. Paired entries (e.g. Crown
              — male / female) show both art renders inside one card; the eight
              extra-rare variants (weight ≤ 1) carry an{" "}
              <RarityTag label="Extra-Rare" className="align-middle" /> tag. Use
              the chips and search box to narrow the view.
            </p>
            <RareTraitsAtlas />
          </ChapterSection>

          <ChapterBreak />

          {/* ============================ §6 ============================ */}
          <ChapterSection
            id="locked-personality"
            number="06"
            title="The Core Personality Traits"
          >
            <Panel tone="lavender" className="p-6">
              <p className="font-body text-base leading-relaxed text-ink">
                These five attributes <strong>never reshuffle</strong>. Whatever
                your Citizen mints with stays with it forever — these
                attributes make each Citizen <em>unique</em>, no matter how
                many times other traits change with transfers.
              </p>
            </Panel>

            {/* Hair */}
            <SubChapter
              id="locked-hair"
              kicker="17 variants · gendered"
              title="Hair"
              intro="Sets the silhouette at a glance. Each Citizen carries one hair variant from mint, gendered."
            >
              <LockedAtlasGrid folder="hair" variants={LOCKED_HAIR} />
            </SubChapter>

            {/* Hair Color */}
            <SubChapter
              id="locked-hair-color"
              kicker="9 palette colors"
              title="Hair Color"
              intro="Applied as the fill on Hair and Facial Hair traits."
            >
              <PaletteSwatchRow swatches={HAIR_COLOR_PALETTE} labelledBy="locked-hair-color-title" />
            </SubChapter>

            {/* Facial Hair */}
            <SubChapter
              id="locked-facial-hair"
              kicker="9 variants · male only"
              title="Facial Hair"
              intro="A male-only attribute. Female citizens don't carry a Facial Hair variant at all."
            >
              <LockedAtlasGrid folder="facial-hair" variants={LOCKED_FACIAL_HAIR} />
            </SubChapter>

            {/* Skin Tone */}
            <SubChapter
              id="locked-skin-tone"
              kicker="7 palette colors"
              title="Skin Tone"
              intro="The fill colour applied to head and body. Pinned at mint and never reshuffles."
            >
              <PaletteSwatchRow swatches={SKIN_TONE_PALETTE} labelledBy="locked-skin-tone-title" />
            </SubChapter>

            {/* Accessory I */}
            <SubChapter
              id="locked-accessory-i"
              kicker="22 variants · 14 rare"
              title="Accessory I"
              intro="The static face-affixed slot. Eight eyewear kinds — 3D Glasses, AR Goggles, Clear Glasses, Clear Goggles, Dark Goggles, Round Glasses, Sunglasses, Monocle — alongside four face marks (Band-Aid, Blush, Freckles, Scar), an Eye Patch, the full-canvas Laser overlay, and a “No Accessory” baseline. Most eyewear ships as a male/female pair; fourteen of the variants are rare and frozen at mint, the other eight are common."
            >
              <LockedAtlasGrid folder="accessories" variants={LOCKED_ACCESSORY_I} />
            </SubChapter>
          </ChapterSection>

          <ChapterBreak />

          {/* ============================ §7 ============================ */}
          <ChapterSection
            id="owner-actions"
            number="07"
            title="Shape your Citizen — owner actions"
          >
            <p className="mb-5 font-body text-base text-ink/80">
              As the owner you have three on-chain levers. They&apos;re all
              available from the Citizen detail page in{" "}
              <Link href="/collection" className="font-semibold underline-offset-2 hover:underline">
                your collection
              </Link>
              .
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <Panel tone="sky" className="flex h-full flex-col p-5">
                <h3 className="font-display text-lg">Re-roll Background</h3>
                <p className="mt-2 flex-1 font-body text-sm text-ink/85">
                  Free — gas only. The contract picks a brand-new background
                  color <strong>at random, on-chain</strong>. You can&apos;t
                  choose or preview the result — it&apos;s a fresh roll every
                  time.
                </p>
                <p className="mt-3 border-2 border-dashed border-ink bg-paper px-3 py-2 font-body text-xs text-brown">
                  Heads up: after the first re-roll, the background also
                  becomes a reshuffling slot. Also, the first few re-rolls
                  may land on the same color — this is normal. Keep trying
                  until the reshuffle seed lands a new color.
                </p>
              </Panel>

              <Panel tone="orange" className="flex h-full flex-col p-5">
                <h3 className="font-display text-lg">Lock / Unlock Traits</h3>
                <p className="mt-2 flex-1 font-body text-sm text-ink/85">
                  Pauses reshuffles for an entire Citizen so the current look
                  holds steady. <strong>Reversible</strong> — unlock whenever
                  you like to let reshuffles resume on the next transfer.
                  Locking and unlocking each cost{" "}
                  <strong>{CONTRACT.lockTraitsFee} ETH</strong>.
                </p>
                <p className="mt-3 font-body text-xs text-brown">
                  Locking is separate from rare-trait freeze: rare freeze
                  protects individual traits, locking pauses the whole Citizen.
                </p>
              </Panel>

              <Panel tone="sage" className="flex h-full flex-col p-5">
                <h3 className="font-display text-lg">Transfer</h3>
                <p className="mt-2 flex-1 font-body text-sm text-ink/85">
                  Send the Citizen to another wallet. Standard ERC-721
                  <code className="px-1 font-mono"> transferFrom</code>.
                </p>
                <p className="mt-3 font-body text-xs text-brown">
                  {reshufflesActive
                    ? "On arrival, an unlocked Citizen's reshufflable traits re-roll for the new owner. Locked Citizens keep their look."
                    : "Once reshuffles are active, an unlocked Citizen's reshufflable traits will re-roll on arrival. Locked Citizens will keep their look."}
                </p>
              </Panel>
            </div>
          </ChapterSection>

          <ChapterBreak />

          {/* ============================ §8 ============================ */}
          <ChapterSection
            id="provenance"
            number="08"
            title="Provenance & the Transfer Count"
          >
            <Panel tone="cream" className="p-6">
              <p className="font-body text-base leading-relaxed text-ink">
                Every Citizen carries an on-chain <strong>transfer count</strong>{" "}
                — the number of times it&apos;s been moved around. The count
                increments on every transfer and is surfaced on the Citizen
                detail page as the &ldquo;life story&rdquo; line.
              </p>
              <p className="mt-3 font-body text-base leading-relaxed text-ink">
                Because reshuffles fire on transfer, the transfer count is
                effectively the number of times each Citizen&apos;s outlook
                changed. It&apos;s the closest thing the collection has to a
                wear-and-tear indicator — except instead of degrading, the
                collection evolves.
              </p>
            </Panel>
          </ChapterSection>

          <ChapterBreak />

          {/* ============================ §9 ============================ */}
          <ChapterSection
            id="trait-market"
            number="09"
            title="The Trait Market"
            kicker="Peer-to-peer rare trades"
          >
            {!MARKET_LIVE && (
              <Panel tone="orange" className="mb-5 flex items-center gap-4 p-5">
                <div className="h-20 w-20 shrink-0">
                  <ActionBurst tone="red" className="h-full w-full text-[10px]">
                    Coming
                    <br />
                    Soon
                  </ActionBurst>
                </div>
                <div>
                  <p className="font-display text-lg">The market is dormant.</p>
                  <p className="mt-1 font-body text-sm text-ink/85">
                    The contract ships ready; the team will flip the public
                    switch when it&apos;s time. The rules below are how trades
                    will work once it&apos;s live.
                  </p>
                </div>
              </Panel>
            )}

            <Panel tone="paper" className="p-6">
              <p className="font-body text-base leading-relaxed text-ink">
                The Trait Market is a peer-to-peer venue for trading{" "}
                <Link href="#glossary-frozen-trait" className="font-semibold underline-offset-2 hover:underline">
                  frozen rare traits
                </Link>{" "}
                between Citizens. List one of yours, browse what others are
                offering, and strike a deal on-chain.
              </p>
              <h4 className="mt-5 font-display text-display-sm">The trade rules</h4>
              <ol className="mt-3 space-y-2.5 font-body text-sm text-ink/85">
                <Rule
                  k="01"
                  body="Traits trade only between Citizens of the same gender. A male crown can only move to another male Citizen; a female crown can only move to another female."
                />
                <Rule
                  k="02"
                  body={`The receiving Citizen must have an empty slot in that same trait category. Buying a Crown for a Citizen that already wears Accessory II won't go through.`}
                />
                <Rule
                  k="03"
                  body="It's a one-way move. The seller's Citizen loses the trait and that slot goes back to reshuffling on transfer; the buyer's Citizen receives the trait frozen."
                />
                <Rule
                  k="04"
                  body="Only the five reshufflable categories can be traded — Eyes, Eyebrows, Mouth, Clothing, Accessory II. Static rare traits (e.g. Eye Patch, Mohawk, Mutton Chops) stay with the Citizen they minted on."
                />
              </ol>
              <p className="mt-5 font-body text-sm text-brown">
                {MARKET_LIVE ? (
                  <Link href="/market" className="font-semibold underline-offset-2 hover:underline">
                    Browse the Trait Market →
                  </Link>
                ) : (
                  <>
                    See the{" "}
                    <Link href="/market" className="font-semibold underline-offset-2 hover:underline">
                      Trait Market page
                    </Link>{" "}
                    for the (currently dormant) UI preview.
                  </>
                )}
              </p>
            </Panel>
          </ChapterSection>

          <ChapterBreak />

          {/* ============================ §10 ============================ */}
          <ChapterSection
            id="balance-gate"
            number="10"
            title="Anti-bot, the wallet warning, and the 0.015 ETH gate"
          >
            <Panel tone="cream" className="p-6">
              <p className="font-body text-base leading-relaxed text-ink">
                The free-mint function has a small anti-bot rule: your wallet
                must hold at least{" "}
                <strong>{CONTRACT.balanceGateMin} ETH</strong>. The contract{" "}
                <em>checks</em> this balance and never spends it — minting
                stays genuinely free.
              </p>
              <p className="mt-3 font-body text-base leading-relaxed text-ink">
                A side effect of that check: wallet simulators sometimes flash
                a <strong>&ldquo;this transaction might fail&rdquo;</strong>{" "}
                warning. That&apos;s a benign false positive — the simulator is
                tracing a caught revert path inside the contract. As long as
                your wallet has a little ETH for gas, the mint goes through.
              </p>
              <p className="mt-3 font-body text-base leading-relaxed text-ink">
                We recommend keeping a small headroom over the gate:{" "}
                <strong>{CONTRACT.balanceGateSafe} ETH</strong> or more. Some
                wallets reserve gas before running the transaction, which can
                briefly dip your balance under the line and cause a real
                failure. The Free Mint page&apos;s wallet pill tells you
                exactly which state you&apos;re in.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Fact label="Minimum gate" value={`${CONTRACT.balanceGateMin} ETH`} tone="red" />
                <Fact label="Recommended" value={`${CONTRACT.balanceGateSafe} ETH`} tone="sage" />
                <Fact label="Recommended wallet" value="MetaMask" tone="cream" />
              </div>
              <p className="mt-4 font-body text-sm text-brown">
                <strong className="text-ink">A note on wallet choice.</strong>{" "}
                MetaMask handles the free mint most reliably. Some other
                wallets (Rabby in particular) are stricter about pre-flight
                simulation and may refuse to broadcast even with sufficient
                balance — switch to MetaMask if you hit that, or top up
                further.
              </p>
            </Panel>
          </ChapterSection>

          <ChapterBreak />

          {/* ============================ §11 ============================ */}
          <ChapterSection
            id="glossary"
            number="11"
            title="Glossary"
            kicker="Shortcuts to every defined term"
          >
            <Glossary />
          </ChapterSection>

          <ChapterBreak />

          {/* ============================ §12 ============================ */}
          <ChapterSection id="faq" number="12" title="FAQ">
            <FaqAccordion items={FAQ} />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="/claim">Claim your V1</Button>
              <Button href="/mint" variant="secondary">
                Free Mint
              </Button>
              <Button href="/" variant="ghost">
                Back to the home page
              </Button>
            </div>
          </ChapterSection>
        </article>
      </div>
    </Page>
  );
}

/* ---------- local helpers ---------- */

function ChapterSection({
  id,
  number,
  title,
  kicker,
  children,
}: {
  id: string;
  number: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[10rem] lg:scroll-mt-24 pt-2">
      <header className="mb-5">
        <span className="inline-block -rotate-1 border-2 border-ink bg-orange px-2 py-0.5 font-display text-[11px] uppercase tracking-[0.18em]">
          Chapter {number}
          {kicker ? ` · ${kicker}` : ""}
        </span>
        <h2
          id={`${id}-title`}
          tabIndex={-1}
          className="mt-2 font-display text-display-md leading-[1.05] outline-none"
        >
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function SubChapter({
  id,
  kicker,
  title,
  intro,
  children,
}: {
  id: string;
  kicker?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-8 scroll-mt-[10rem] lg:scroll-mt-24">
      <header className="mb-3">
        {kicker && (
          <span className="font-display text-[11px] uppercase tracking-widest text-brown">
            {kicker}
          </span>
        )}
        <h3 id={`${id}-title`} className="font-display text-display-sm">
          {title}
        </h3>
        {intro && (
          <p className="mt-1 max-w-3xl font-body text-sm text-ink/80">{intro}</p>
        )}
      </header>
      {children}
    </section>
  );
}

function Fact({
  label,
  value,
  tone = "paper",
}: {
  label: string;
  value: string;
  tone?: "paper" | "red" | "sage" | "cream";
}) {
  const bg =
    tone === "red"
      ? "bg-red text-paper"
      : tone === "sage"
        ? "bg-sage text-ink"
        : tone === "cream"
          ? "bg-cream text-ink"
          : "bg-paper text-ink";
  return (
    <div className={`rounded-lg border-2 border-ink ${bg} px-3 py-2`}>
      <dt className="font-display text-[10px] uppercase tracking-widest opacity-80">
        {label}
      </dt>
      <dd className="font-display text-base">{value}</dd>
    </div>
  );
}

function Rule({ k, body }: { k: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-orange font-display text-sm">
        {k}
      </span>
      <p>{body}</p>
    </li>
  );
}
