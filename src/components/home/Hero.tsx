"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/actions/Button";
import { CitizenRender } from "@/components/citizen/CitizenRender";
import { ActionBurst } from "@/components/narrative/ActionBurst";

/** Opening panel of the scrollytelling homepage. */
export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.34, 1.2, 0.64, 1] as const },
        };

  return (
    <section className="relative overflow-hidden border-b-ink-lg border-ink bg-sky">
      <div
        aria-hidden
        className="halftone halftone-fade pointer-events-none absolute inset-0 text-ink/30"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div>
          <motion.span
            {...rise(0)}
            className="inline-block -rotate-2 border-ink border-ink bg-paper px-3 py-1 font-display text-xs uppercase tracking-[0.2em]"
          >
            10,000 citizens · 100% on-chain
          </motion.span>

          <motion.h1
            {...rise(0.08)}
            className="mt-4 font-display text-display-xl text-ink"
          >
            Every Citizens
            <br />
            tells a <span className="text-red text-shadow-pop-sm">story</span>
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mt-5 max-w-md font-body text-lg font-medium text-ink/90"
          >
            And it&apos;s written on-chain — drawn, stored, and reshuffled
            entirely inside an Ethereum contract. No servers. No IPFS.
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-7 flex flex-wrap items-center gap-3">
            <Button href="https://opensea.io/collection/onchain-citizens-v2" external size="lg">
              Browse on OpenSea
            </Button>
            <Button href="/feed" variant="secondary" size="lg">
              Watch the Live Feed
            </Button>
          </motion.div>

          <motion.a
            {...rise(0.36)}
            href="#journey"
            className="mt-10 inline-flex items-center gap-2 font-display text-sm uppercase tracking-widest text-ink/70 hover:text-ink"
          >
            <span className="motion-safe:animate-bob">▼</span>
            Scroll — read the story
          </motion.a>
        </div>

        <motion.div
          {...(reduce
            ? {}
            : {
                initial: { opacity: 0, scale: 0.9, rotate: -4 },
                animate: { opacity: 1, scale: 1, rotate: 0 },
                transition: { duration: 0.7, delay: 0.2, ease: [0.34, 1.4, 0.64, 1] as const },
              })}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="rounded-panel border-ink-lg border-ink bg-paper p-3 shadow-panel-lg">
            <CitizenRender art="male-buzzcut" stage="I" background="Sky Blue" id={256} />
          </div>
          <div className="absolute -right-4 -top-6 h-24 w-24 sm:-right-8 sm:h-28 sm:w-28">
            <ActionBurst tone="red" spin={!reduce} className="h-full w-full text-xs">
              Free
              <br />
              Mint!
            </ActionBurst>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
