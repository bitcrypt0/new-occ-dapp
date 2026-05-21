export interface FaqItem {
  q: string;
  a: string;
}

/** Shared FAQ content — used by /how-it-works and the homepage teaser. */
export const FAQ: FaqItem[] = [
  {
    q: "What does \"fully on-chain\" actually mean?",
    a: "Every Citizen's artwork is drawn as SVG and stored inside the Ethereum contract itself. There's no IPFS link, no image server, no off-chain database. As long as Ethereum exists, your Citizen's picture exists — rendered straight from the chain.",
  },
  {
    q: "Why would my Citizen's face change when I transfer it?",
    a: "That's the reshuffle. Reshuffles are switched on by a one-time activation — they may not be live until after the mint window. Once active, every time a Citizen moves to a new wallet, five trait categories (Eyes, Eyebrows, Mouth, Clothing and Accessory II) re-roll into a new combination. When they're on, a Citizen is alive: it changes hands, and it changes face.",
  },
  {
    q: "If it reshuffles, can I lose a rare trait?",
    a: "Not to a reshuffle or a transfer. If a Citizen mints with a rare trait, that trait is frozen — no reshuffle can ever re-roll it away, and it carries through every transfer untouched. The only way a rare trait moves is if you choose to move it: the Trait Market lets an owner deliberately trade a frozen trait to another Citizen. Reshuffles can't take it — only you can.",
  },
  {
    q: "Can I stop my Citizen from changing?",
    a: "Yes — and you can change your mind. As the owner you can lock all traits, which pauses reshuffles so the current look holds steady. It isn't permanent: unlock anytime to let reshuffles resume. Locking and unlocking each cost the same small fee of 0.001 ETH. You can also re-roll the background color separately.",
  },
  {
    q: "What are the three ways to get a Citizen?",
    a: "Claim — if you hold an OCC V1 token, burn it to receive the matching V2 Citizen with the same ID. Free Mint — if you don't hold a V1 and haven't claimed, mint a fresh Citizen (max 2 per wallet). Raffle — IDs 8001–10000 are minted externally on dropr.fun.",
  },
  {
    q: "Is there a mint price?",
    a: "No. There is no mint price for Claim or Free Mint — you only ever pay Ethereum gas. \"Free to mint\" means exactly that.",
  },
  {
    q: "My wallet says \"this transaction might fail\" — is something wrong?",
    a: "No, that's expected and harmless on the Free Mint. The contract has an anti-bot rule that checks your wallet holds at least 0.015 ETH (it's only checked, never spent). That check makes wallets show a cautious warning. As long as you hold a little ETH, the mint goes through.",
  },
  {
    q: "How much ETH should I have before free-minting?",
    a: "Hold comfortably more than the 0.015 ETH minimum — we recommend at least 0.02 ETH. Some wallets reserve gas before running the transaction, which can briefly dip your balance under the threshold and cause a real failure. A little headroom avoids that entirely.",
  },
];
