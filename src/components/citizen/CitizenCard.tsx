"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { cn } from "@/lib/cn";
import type { Citizen } from "@/lib/types";
import { downloadCitizenPng } from "@/lib/citizen/download";
import { CitizenRender } from "./CitizenRender";
import { RarityTag } from "./RarityTag";

/** A Citizen tile for the comic-panel collection grid. */
export function CitizenCard({ citizen, className }: { citizen: Citizen; className?: string }) {
  const rare = citizen.attributes.some((a) => a.rare);
  const [saving, setSaving] = useState(false);

  async function handleDownload(e: MouseEvent<HTMLButtonElement>) {
    // Don't navigate to the detail page when the user clicks the icon.
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      await downloadCitizenPng(citizen);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[download]", err);
    } finally {
      setSaving(false);
    }
  }

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
      <div className="relative p-2">
        <CitizenRender
          art={citizen.art}
          stage={citizen.stage}
          background={citizen.background}
          id={citizen.id}
          locked={citizen.traitsLocked}
          imageUri={citizen.imageUri}
        />
        <button
          type="button"
          onClick={handleDownload}
          disabled={saving || !citizen.imageUri}
          aria-label={`Download Citizen #${citizen.id} as PNG`}
          title="Download PNG"
          className={cn(
            "absolute bottom-3 right-3 z-10 grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-paper text-ink",
            "hover:bg-cream disabled:opacity-50",
          )}
        >
          {saving ? (
            <span
              aria-hidden
              className="h-3 w-3 rounded-full border-[3px] border-ink border-t-transparent motion-safe:animate-spin"
            />
          ) : (
            <DownloadIcon />
          )}
        </button>
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

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 4v11" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}
