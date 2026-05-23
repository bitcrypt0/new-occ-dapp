"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** A comic-panel dialog with focus trap + escape-to-close. */
export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-ink/60"
      />
      <div
        ref={ref}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col rounded-panel border-ink-lg border-ink bg-paper shadow-panel-lg outline-none",
          className,
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b-ink border-ink bg-cream px-5 py-3">
          <h2 className="font-display text-display-sm">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full border-ink border-ink bg-paper font-display text-lg hover:bg-red hover:text-paper"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t-ink border-ink px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
