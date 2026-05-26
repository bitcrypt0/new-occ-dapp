"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/cn";
import type { Citizen } from "@/lib/types";
import {
  downloadCitizenImage,
  type ImageFormat,
} from "@/lib/citizen/download";

interface Props {
  citizen: Citizen;
  /**
   * Forwarded to every click handler in the menu — set when this component
   * lives inside a clickable parent (e.g. a Next.js `<Link>` card) so clicks
   * don't bubble up and navigate away.
   */
  preventPropagation?: boolean;
  /** Visual size variant — `sm` matches collection cards, `md` matches detail. */
  size?: "sm" | "md";
  /** Called when the rasterizer throws, so the caller can toast a message. */
  onError?: (msg: string) => void;
  className?: string;
}

/**
 * Compact download control — same circular icon button as before, but the
 * click opens a small popover offering PNG or JPEG. JPEG ships at quality
 * 0.95 because social platforms (Twitter especially) re-encode uploads as
 * JPEG; supplying a high-quality JPEG up-front preserves more detail than
 * uploading a PNG and letting them transcode it.
 */
export function DownloadMenu({
  citizen,
  preventPropagation,
  size = "sm",
  onError,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState<ImageFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function stopIfNeeded(e: MouseEvent) {
    if (preventPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function toggle(e: MouseEvent) {
    stopIfNeeded(e);
    if (!citizen.imageUri || saving) return;
    setOpen((v) => !v);
  }

  async function pick(e: MouseEvent, format: ImageFormat) {
    stopIfNeeded(e);
    if (saving) return;
    setOpen(false);
    setSaving(format);
    try {
      await downloadCitizenImage(citizen, format);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Couldn't save the image.");
    } finally {
      setSaving(null);
    }
  }

  const btnSize = size === "md" ? "h-9 w-9" : "h-8 w-8";

  return (
    // Outer wrapper takes the caller's positioning class (e.g. `absolute …`)
    // without conflicting with our own `relative` — the popover anchors to the
    // inner div, so callers can place the whole control anywhere they like.
    <div ref={ref} className={className}>
      <div className="relative inline-flex">
        <button
          type="button"
          onClick={toggle}
          disabled={!citizen.imageUri || saving !== null}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Download Citizen #${citizen.id}`}
          title="Download"
          className={cn(
            "grid place-items-center rounded-full border-2 border-ink bg-paper text-ink hover:bg-cream disabled:opacity-50",
            btnSize,
          )}
        >
          {saving ? (
            <span
              aria-hidden
              className={cn(
                "rounded-full border-[3px] border-ink border-t-transparent motion-safe:animate-spin",
                size === "md" ? "h-3.5 w-3.5" : "h-3 w-3",
              )}
            />
          ) : (
            <DownloadIcon size={size} />
          )}
        </button>

        {open && (
          <div
            role="menu"
            className="absolute bottom-full right-0 z-20 mb-2 flex w-28 flex-col gap-1 rounded-lg border-2 border-ink bg-paper p-1 shadow-panel-sm"
          >
            <MenuItem onClick={(e) => pick(e, "png")} hint="Original quality">
              PNG
            </MenuItem>
            <MenuItem
              onClick={(e) => pick(e, "jpeg")}
              hint="Best for Twitter / X"
            >
              JPEG
            </MenuItem>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  children,
  hint,
  onClick,
}: {
  children: React.ReactNode;
  hint: string;
  onClick: (e: MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="rounded px-2 py-1.5 text-left hover:bg-cream"
    >
      <span className="block font-display text-xs uppercase tracking-wide text-ink">
        {children}
      </span>
      <span className="block font-body text-[10px] leading-tight text-brown">
        {hint}
      </span>
    </button>
  );
}

function DownloadIcon({ size }: { size: "sm" | "md" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={size === "md" ? "h-4 w-4" : "h-4 w-4"}
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
