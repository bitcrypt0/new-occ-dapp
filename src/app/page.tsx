import { Hero } from "@/components/home/Hero";
import { JourneyAct } from "@/components/home/JourneyAct";
import { Finale } from "@/components/home/Finale";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FaqTeaser } from "@/components/home/FaqTeaser";
import { getReshufflesActive } from "@/lib/chain/server";

export default async function HomePage() {
  // Reshuffle-on-transfer ships behind a one-way owner switch. The live
  // contract flag drives the copy's tense — future until it's activated.
  const reshufflesActive = await getReshufflesActive();
  const act2Caption = reshufflesActive
    ? "The Citizen moves to a new wallet — and as it lands, its face re-rolls. Eyes, eyebrows, mouth, clothing and one accessory all reshuffle into a fresh look."
    : "The Citizen moves to a new wallet — and once trait reshuffling is activated on the contract, its eyes, eyebrows, mouth, clothing are shuffled into a fresh look. Reshuffles switch on after the mint window.";
  const act2Bubble = reshufflesActive
    ? "Every transfer rewrites part of the picture. A Citizen wears its history on its face."
    : "Once reshuffles are switched on, every transfer rewrites part of the picture — all Citizens react to every journey and it shows.";
  const act3Caption = reshufflesActive
    ? "It changes hands again — more traits re-roll. But look closely: the crown never moves. A rare trait, minted once, is frozen on-chain forever."
    : "It changes hands yet again — and more traits are re-rolled. But look closely: the crown never moves. A rare trait, minted once, is frozen on-chain forever.";

  return (
    <>
      <Hero />

      <div id="journey" className="scroll-mt-20">
        <JourneyAct
          act="I"
          tone="sage"
          title="A Citizen is born."
          caption="Out of an Ethereum contract, fully drawn, a brand-new Citizen appears — every line of art stored on-chain. No servers were involved. No fee was charged."
          bubble="Minting is free. You pay gas, nothing else — there is no mint price on OCCV2."
          art="male-buzzcut"
          fromStage="I"
          toStage="I"
          background="Sage"
          burstWord="Minted!"
        />

        <JourneyAct
          act="II"
          tone="rose"
          title="It changes hands."
          caption={act2Caption}
          bubble={act2Bubble}
          art="male-buzzcut"
          fromStage="I"
          toStage="II"
          background="Rose"
          burstWord="Reshuffle!"
          reverse
        />

        <JourneyAct
          act="III"
          tone="lavender"
          title="Rare traits endure."
          caption={act3Caption}
          bubble="A rare trait's freeze is permanent — no reshuffle can ever take it. And if you love a look, lock every trait to pause reshuffles; unlock again whenever you like."
          art="male-buzzcut"
          fromStage="II"
          toStage="III"
          background="Lavender"
          burstWord="Crown stays!"
        />
      </div>

      <Finale />
      <HowItWorks reshufflesActive={reshufflesActive} />
      <FaqTeaser />
    </>
  );
}
