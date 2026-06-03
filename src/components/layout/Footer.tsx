import Link from "next/link";
import { CONTRACT, SOCIALS } from "@/lib/constants";
import { Logo } from "./Logo";

const PAGES = [
  { href: "/collection", label: "My Collection" },
  { href: "/feed", label: "Live Feed" },
  { href: "/market", label: "Trait Market" },
  { href: "/docs", label: "Docs" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t-ink-lg border-ink bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="rounded-panel border-2 border-paper bg-cream p-3">
            <Logo />
          </div>
          <p className="mt-4 max-w-xs font-body text-sm text-paper/80">
            10,000 flat-cartoon citizens, drawn and stored entirely on Ethereum.
            No servers. No IPFS. Just the chain.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-paper px-3 py-1 font-display text-xs uppercase tracking-wide">
            <span aria-hidden className="h-2 w-2 rounded-full bg-sage" />
            100% On-Chain Art
          </span>
        </div>

        <nav aria-label="Footer">
          <h3 className="font-display text-sm uppercase tracking-widest text-orange">Pages</h3>
          <ul className="mt-3 space-y-1.5">
            {PAGES.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="font-body text-sm text-paper/80 hover:text-paper hover:underline">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="font-display text-sm uppercase tracking-widest text-orange">Off-Site</h3>
          <ul className="mt-3 space-y-1.5">
            <li>
              <a href={SOCIALS.raffle} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-paper/80 hover:text-paper hover:underline">
                Raffle mints (dropr.fun) ↗
              </a>
            </li>
            <li>
              <a href={SOCIALS.marketplace} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-paper/80 hover:text-paper hover:underline">
                Secondary marketplace ↗
              </a>
            </li>
            <li>
              <a href={SOCIALS.twitter} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-paper/80 hover:text-paper hover:underline">
                Follow on X ↗
              </a>
            </li>
            <li>
              <a
                href={`${SOCIALS.etherscan}/address/${CONTRACT.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-paper/80 hover:text-paper hover:underline"
              >
                View contract on Etherscan ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t-2 border-paper/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-paper/70 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body">© {new Date().getFullYear()} OnChain Citizens. Art lives on-chain forever.</p>
          <p className="font-mono break-all">
            Contract: {CONTRACT.address}
          </p>
        </div>
      </div>
    </footer>
  );
}
