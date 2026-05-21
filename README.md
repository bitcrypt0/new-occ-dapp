# OnChain Citizens V2 — dapp frontend

The polished public front door for **OnChain Citizens V2** — a 10,000-supply,
fully on-chain ERC-721 collection on Ethereum mainnet. This app replaces the
raw Etherscan minting flow with a designed Claim / Free Mint / Manage
experience, wrapped in a retro comic-book / zine aesthetic.

> **Status: Phase 1 complete — fully functional dapp.** Wallet connection,
> contract reads/writes, transaction handling, and real-time metadata refresh
> are live against the mainnet OCCV2 contracts. The Live Feed (`/feed`) is
> gated until the Phase 2 indexer ships.

## Run it

```bash
npm install
cp .env.example .env.local   # optional — see Environment below
npm run dev
```

Open the printed URL. Connecting requires a browser wallet extension
(MetaMask recommended).

```bash
npm run build   # production build (typechecked)
```

## Environment

All config is optional — see [`.env.example`](./.env.example).

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_RPC_URL` | Mainnet HTTP RPC. Defaults to public endpoints. |
| `NEXT_PUBLIC_RPC_WS_URL` | Optional websocket RPC for push-based events. |

**No secrets belong in this app.** Every `NEXT_PUBLIC_*` value ships in the
browser bundle. The dapp runs on free public RPC by default; drop in a private
provider URL to upgrade real-time refresh from polling (~12s) to instant push.

## What's here

| Route | Page |
|---|---|
| `/` | Scrollytelling homepage — the 3-act journey of a Citizen |
| `/claim` | Claim — V1 holders burn V1 → matching V2 (2-step Approve → Claim) |
| `/mint` | Free Mint — non-holders, with the 0.015 ETH balance-gate UX |
| `/collection` | My Collection — the connected wallet's Citizens |
| `/citizen/[id]` | Citizen detail — traits, provenance, owner actions |
| `/market` | Trait Market — peer-to-peer rare-trait trading (ships **dormant**) |
| `/feed` | Live Feed — gated until the Phase 2 indexer is online |
| `/how-it-works` | Comic-explainer guide + FAQ |

## Tech & dependencies

- **Next.js 15** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS 3** — design tokens in `tailwind.config.ts`
- **framer-motion** — component motion + the scroll-driven homepage
- **wagmi v2** — wallet connection (EIP-6963 multi-injected discovery) and
  the React hooks layer for contract reads/writes
- **viem** — the low-level Ethereum client wagmi is built on; used directly
  for `tokenURI` decoding, multicall scans, gas estimation, and SSR reads
- **@tanstack/react-query** — required peer of wagmi; also caches the
  contract-read hooks

No RainbowKit / ConnectKit / Web3Modal — wallet selection is a custom
EIP-6963 modal so wallet identity is trusted by `rdns`, not `window.ethereum`.

## How the wiring works

- **Contracts.** Live mainnet addresses are pinned in `src/lib/constants.ts`
  (`ADDRESSES`) from `deployments/occv2-mainnet.json`. ABIs in `src/lib/abi/`
  are generated from the Hardhat artifacts — do not hand-edit.
- **Wallet.** `src/lib/hooks/useWallet.tsx` exposes the wallet context;
  `WalletModal` lists every EIP-6963 wallet, MetaMask first.
- **Reads.** `src/lib/hooks/data.ts` — react-query hooks over `tokenURI`,
  `balanceOf`, eligibility views, and multicall ownership scans.
- **Writes.** `data.ts` write functions estimate gas themselves and submit
  with an explicit, buffered gas limit. This is the fix for the free-mint
  "transaction may fail" false positive — wallets (Rabby especially) skip
  their faulty pre-flight when an explicit gas limit is supplied.
- **Real-time refresh.** `useMetadataWatch` watches ERC-4906 `MetadataUpdate`
  for on-screen tokens and re-fetches their art.
- **Security.** chain pinned to mainnet; on-chain SVG rendered only via
  `<img>` data URIs; security headers (CSP, `frame-ancestors`, HSTS) in
  `next.config.mjs`.

## Free-mintable ID source

`useMintAvailability` derives the free-mint pool by scanning the contract's
public `claimed(id)` mapping across token ids **4541–8000** — the range with
no live V1 counterpart (V1's highest minted id is 4540). Ids already minted
on V2 are excluded. No external dataset or indexer is needed.

## Phase status

- **Phase 1 (done).** Core dapp — wallet, reads, writes, real-time refresh,
  security hardening. `/feed` shows a gated "coming soon" state
  (`FEED_LIVE = false`); `/market` is wired but dormant (`MARKET_LIVE = false`).
- **Phase 2 (pending).** Off-chain indexer for the Live Feed. When it is
  deployed and confirmed online, `/feed` is wired to its API + websocket and
  `FEED_LIVE` flips to `true`.

## Notes & constraints

- Citizen art renders exactly as authored on-chain via `<img>` — never
  injected as inline SVG.
- The Trait Market ships **dormant** behind `MARKET_LIVE`. Its UI predates
  the trait-trade contract's full parameter set — before launch its List /
  Accept flows need a buyer-token picker and a category selector.
- Rare-trait highlighting on the Citizen page is best-effort: `tokenURI`
  metadata does not surface per-trait rarity, so the "frozen rare trait"
  panel only appears when that data is available.
- Minting is **free** (gas only). Mainnet contracts are live and immutable.
