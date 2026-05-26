interface GlossaryEntry {
  term: string;
  id: string;
  definition: React.ReactNode;
}

/** Glossary content — anchored so earlier chapters can link to a term. */
export const GLOSSARY: GlossaryEntry[] = [
  {
    term: "Reshuffle",
    id: "glossary-reshuffle",
    definition:
      "The on-chain act of re-rolling five trait categories — Eyes, Eyebrows, Mouth, Clothing and Accessory II — when a Citizen is transferred wallet-to-wallet. Reshuffles happen only after the owner-flipped activation switch is on.",
  },
  {
    term: "Frozen trait",
    id: "glossary-frozen-trait",
    definition:
      "A trait whose upload weight is less than 16. The contract freezes any frozen trait a Citizen mints with — no reshuffle can ever re-roll it. The only way a frozen trait leaves is if its owner deliberately trades it on the Trait Market.",
  },
  {
    term: "Locked traits",
    id: "glossary-locked-traits",
    definition:
      "An owner-toggled state that pauses reshuffles for an entire Citizen. Locking and unlocking each cost 0.001 ETH. Reversible at any time — independent of, and additional to, the per-trait frozen-rare protection.",
  },
  {
    term: "Permanent seed",
    id: "glossary-permanent-seed",
    definition:
      "The on-chain randomness fixed at mint that drives every static (non-reshufflable) trait — Hair, Hair Color, Skin Tone, Facial Hair, Accessory I, Head Shape, Body, Hair Back. These never change for a Citizen.",
  },
  {
    term: "Reshuffle seed",
    id: "glossary-reshuffle-seed",
    definition:
      "The on-chain randomness that derives the reshufflable five (Eyes, Eyebrows, Mouth, Clothing, Accessory II) at mint and on every transfer thereafter once reshuffles are active.",
  },
  {
    term: "Background re-roll",
    id: "glossary-background-reroll",
    definition:
      "A free owner action that picks a brand-new background color at random, on-chain — the owner can't choose or preview the result. The first re-roll also makes the background a reshuffling slot, so future transfers will re-roll it too.",
  },
  {
    term: "Trait Market",
    id: "glossary-trait-market",
    definition:
      "A peer-to-peer marketplace for trading frozen rare traits between Citizens — same gender only, the receiver needs an empty slot in that category, one-way (the seller's slot goes back to reshuffling), and only the five reshufflable categories can be traded.",
  },
  {
    term: "Migration bucket",
    id: "glossary-migration-bucket",
    definition:
      "Token IDs 1–8000 — the slots reserved for V1 → V2 migration. A V1 holder claims by burning their V1 to mint the matching V2 ID. IDs whose original V1 token is no longer live are free-mintable.",
  },
  {
    term: "Raffle bucket",
    id: "glossary-raffle-bucket",
    definition:
      "Token IDs 8001–10000 — minted externally via raffles on dropr.fun, not from this dapp. Citizens minted there still appear in collections and behave identically.",
  },
];

export function Glossary() {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {GLOSSARY.map((g) => (
        <div
          key={g.id}
          className="rounded-panel border-ink-lg border-ink bg-paper p-4 shadow-panel-sm"
        >
          <dt
            id={g.id}
            className="scroll-mt-[10rem] font-display text-lg leading-tight lg:scroll-mt-24"
          >
            {g.term}
          </dt>
          <dd className="mt-1 font-body text-sm leading-relaxed text-brown">
            {g.definition}
          </dd>
        </div>
      ))}
    </dl>
  );
}
