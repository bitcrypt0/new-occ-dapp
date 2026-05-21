"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { ConnectButton } from "../actions/ConnectButton";
import { Logo } from "./Logo";

const NAV = [
  { href: "/claim", label: "Claim" },
  { href: "/mint", label: "Free Mint" },
  { href: "/collection", label: "My Collection" },
  { href: "/feed", label: "Live Feed" },
  { href: "/market", label: "Market" },
  { href: "/how-it-works", label: "How It Works" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-ink-lg border-ink bg-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0" aria-label="OnChain Citizens V2 — home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg border-2 px-3 py-2 font-display text-sm uppercase tracking-wide transition-colors",
                  active
                    ? "border-ink bg-red text-paper"
                    : "border-transparent text-ink hover:border-ink hover:bg-paper",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ConnectButton />
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-lg border-ink border-ink bg-paper lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="font-display text-xl">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t-ink border-ink bg-paper px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg border-2 border-ink px-3 py-2.5 font-display text-sm uppercase",
                  pathname === item.href ? "bg-red text-paper" : "bg-cream",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 sm:hidden">
            <ConnectButton className="w-full justify-center" />
          </div>
        </div>
      )}
    </header>
  );
}
