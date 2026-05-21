"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/cn";
import { BG_HEX, citizenArtSrc } from "@/lib/constants";
import type { ArtBase, ArtStage, BackgroundColor } from "@/lib/types";
import { CaptionBox } from "@/components/narrative/CaptionBox";
import { SpeechBubble } from "@/components/narrative/SpeechBubble";
import { ActionBurst } from "@/components/narrative/ActionBurst";

type Tone = "sage" | "rose" | "lavender" | "orange";
const TONE_BG: Record<Tone, string> = {
  sage: "bg-sage",
  rose: "bg-rose",
  lavender: "bg-lavender",
  orange: "bg-orange",
};

export interface JourneyActProps {
  act: "I" | "II" | "III";
  tone: Tone;
  title: string;
  /** Narrator caption-box copy. */
  caption: string;
  /** The takeaway, shown as a speech bubble after the reshuffle. */
  bubble: string;
  art: ArtBase;
  fromStage: ArtStage;
  toStage: ArtStage;
  background: BackgroundColor;
  /** Starburst word at the transition moment ("MINTED!", "RESHUFFLE!"). */
  burstWord: string;
  reverse?: boolean;
}

/**
 * One scroll-pinned act of the homepage journey.
 * Scroll progress through the (tall) section drives the panel reveal and
 * the I→II→III art crossfade. Honors prefers-reduced-motion with a static
 * stacked fallback that still tells the story.
 */
export function JourneyAct(props: JourneyActProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const crossfade = props.fromStage !== props.toStage;

  // art transition
  const fromOpacity = useTransform(scrollYProgress, [0.34, 0.52], [1, 0]);
  const toOpacity = useTransform(scrollYProgress, [0.4, 0.58], [0, 1]);
  const artScale = useTransform(scrollYProgress, [0, 0.25], [0.86, 1]);
  const shakeX = useTransform(scrollYProgress, [0.4, 0.44, 0.48, 0.52], [0, -8, 8, 0]);
  const burstOpacity = useTransform(
    scrollYProgress,
    [0.36, 0.46, 0.58],
    [0, 1, 0],
  );
  const burstScale = useTransform(scrollYProgress, [0.36, 0.46], [0.4, 1]);

  // copy reveals
  const captionOpacity = useTransform(scrollYProgress, [0.06, 0.22], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.06, 0.22], [40, 0]);
  const bubbleOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0, 1]);
  const bubbleY = useTransform(scrollYProgress, [0.62, 0.78], [30, 0]);

  if (reduce) return <StaticAct {...props} />;

  return (
    <section ref={ref} className="relative h-[240vh]">
      <div
        className={cn(
          "sticky top-0 flex h-screen items-center overflow-hidden border-b-ink-lg border-ink",
          TONE_BG[props.tone],
        )}
      >
        <div
          aria-hidden
          className="halftone pointer-events-none absolute inset-0 text-ink/25"
        />
        <div
          className={cn(
            "relative mx-auto grid w-full max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14",
            props.reverse && "lg:[direction:rtl]",
          )}
        >
          {/* ---- Art ---- */}
          <motion.div
            style={{ scale: artScale, x: crossfade ? shakeX : 0 }}
            className="relative mx-auto w-full max-w-[22rem] [direction:ltr]"
          >
            <div
              className="relative aspect-square overflow-hidden rounded-panel border-ink-lg border-ink shadow-panel-lg"
              style={{ backgroundColor: BG_HEX[props.background] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                src={citizenArtSrc(props.art, props.fromStage)}
                alt=""
                style={{ opacity: crossfade ? fromOpacity : 1 }}
                className="absolute inset-0 h-full w-full"
                draggable={false}
              />
              {crossfade && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <motion.img
                  src={citizenArtSrc(props.art, props.toStage)}
                  alt={`OnChain Citizen, stage ${props.toStage}`}
                  style={{ opacity: toOpacity }}
                  className="absolute inset-0 h-full w-full"
                  draggable={false}
                />
              )}
            </div>

            {/* transition starburst */}
            <motion.div
              style={{ opacity: burstOpacity, scale: burstScale }}
              className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 sm:h-32 sm:w-32"
            >
              <ActionBurst tone="red" className="h-full w-full text-sm">
                {props.burstWord}
              </ActionBurst>
            </motion.div>
          </motion.div>

          {/* ---- Copy ---- */}
          <div className="[direction:ltr]">
            <span className="inline-block -rotate-2 border-ink border-ink bg-ink px-3 py-1 font-display text-sm uppercase tracking-[0.2em] text-paper">
              Act {props.act}
            </span>
            <h2 className="mt-3 font-display text-display-md text-ink">{props.title}</h2>

            <motion.div style={{ opacity: captionOpacity, y: captionY }} className="mt-5">
              <CaptionBox label={`Act ${props.act}`} tilt={props.reverse ? "right" : "left"}>
                {props.caption}
              </CaptionBox>
            </motion.div>

            <motion.div
              style={{ opacity: bubbleOpacity, y: bubbleY }}
              className="mt-6"
            >
              <SpeechBubble tone="paper" tail="top-left">
                {props.bubble}
              </SpeechBubble>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Calm, non-animated fallback — still tells the story through stacked panels. */
function StaticAct(props: JourneyActProps) {
  const crossfade = props.fromStage !== props.toStage;
  return (
    <section className={cn("border-b-ink-lg border-ink", TONE_BG[props.tone])}>
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          {(crossfade ? [props.fromStage, props.toStage] : [props.toStage]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              {i > 0 && <span className="font-display text-2xl">→</span>}
              <div
                className="aspect-square w-40 overflow-hidden rounded-panel border-ink-lg border-ink shadow-panel"
                style={{ backgroundColor: BG_HEX[props.background] }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={citizenArtSrc(props.art, s)} alt={`Stage ${s}`} className="h-full w-full" />
              </div>
            </div>
          ))}
        </div>
        <div>
          <span className="inline-block border-ink border-ink bg-ink px-3 py-1 font-display text-sm uppercase tracking-[0.2em] text-paper">
            Act {props.act}
          </span>
          <h2 className="mt-3 font-display text-display-md">{props.title}</h2>
          <div className="mt-4">
            <CaptionBox label={`Act ${props.act}`} tilt="none">
              {props.caption}
            </CaptionBox>
          </div>
          <div className="mt-4">
            <SpeechBubble tone="paper" tail="none">
              {props.bubble}
            </SpeechBubble>
          </div>
        </div>
      </div>
    </section>
  );
}
