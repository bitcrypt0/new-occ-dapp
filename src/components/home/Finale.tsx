"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/actions/Button";
import { ActionBurst } from "@/components/narrative/ActionBurst";
import { CitizenRender } from "@/components/citizen/CitizenRender";

/** The journey's closing call-to-action panel. */
export function Finale() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden border-b-ink-lg border-ink bg-red">
      <div
        aria-hidden
        className="halftone-lg pointer-events-none absolute inset-0 text-paper/30"
      />
      <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <motion.div
          {...(reduce
            ? {}
            : {
                initial: { opacity: 0, scale: 0.8 },
                whileInView: { opacity: 1, scale: 1 },
                viewport: { once: true, amount: 0.6 },
                transition: { duration: 0.5, ease: [0.34, 1.4, 0.64, 1] as const },
              })}
          className="mx-auto mb-6 h-32 w-32 sm:h-40 sm:w-40"
        >
          <ActionBurst tone="orange" spin={!reduce} className="h-full w-full text-xl">
            Mint
            <br />
            Yours!
          </ActionBurst>
        </motion.div>

        <h2 className="font-display text-display-lg text-paper text-shadow-pop">
          Now — write your own.
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-body text-lg font-medium text-paper">
          Claim the V1 you already hold, or free-mint a brand-new Citizen.
          Either way it costs nothing but gas — there is no mint price.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/claim" variant="secondary" size="lg">
            Migrate V1 NFTs
          </Button>
          <Button href="/mint" variant="ghost" size="lg">
            Free Mint a Citizen
          </Button>
        </div>

        <div className="mt-12 flex items-end justify-center gap-3 sm:gap-6">
          {(["male-buzzcut", "female-bob", "male-buzzcut"] as const).map((art, i) => (
            <div
              key={i}
              className="w-24 rotate-0 sm:w-32"
              style={{ transform: `rotate(${[-6, 0, 6][i]}deg)` }}
            >
              <div className="rounded-panel border-ink-lg border-ink bg-paper p-1.5 shadow-panel">
                <CitizenRender
                  art={art}
                  stage={(["III", "II", "I"] as const)[i]}
                  background={(["Sage", "Rose", "Lavender"] as const)[i]}
                  framed={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
