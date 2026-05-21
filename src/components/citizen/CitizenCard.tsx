import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Citizen } from "@/lib/types";
import { CitizenRender } from "./CitizenRender";
import { RarityTag } from "./RarityTag";

/** A Citizen tile for the comic-panel collection grid. */
export function CitizenCard({ citizen, className }: { citizen: Citizen; className?: string }) {
  const rare = citizen.attributes.some((a) => a.rare);
  return (
    <Link
      href={`/citizen/${citizen.id}`}
      className={cn(
        "group block rounded-panel border-ink-lg border-ink bg-paper shadow-panel-sm",
        "transition-[transform,box-shadow] duration-100 ease-snap",
        "hover:-translate-y-1 hover:shadow-panel focus-visible:-translate-y-1 focus-visible:shadow-panel",
        className,
      )}
    >
      <div className="p-2">
        <CitizenRender
          art={citizen.art}
          stage={citizen.stage}
          background={citizen.background}
          id={citizen.id}
          locked={citizen.traitsLocked}
          imageUri={citizen.imageUri}
        />
      </div>
      <div className="flex items-start justify-between gap-2 border-t-ink border-ink px-3 py-2">
        <div>
          <p className="font-display text-lg leading-none">#{citizen.id}</p>
          <p className="mt-1 font-body text-xs text-brown">
            {citizen.gender} · {citizen.mood}
          </p>
        </div>
        {rare && <RarityTag label="Rare" />}
      </div>
    </Link>
  );
}
