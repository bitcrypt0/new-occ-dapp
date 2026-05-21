"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

interface AddressInputProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
}

/** Loose 0x-address shape check — visual validation only. */
export function isAddressLike(v: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(v.trim());
}

/** An ink-outlined wallet-address field with inline validity feedback. */
export function AddressInput({
  value,
  onChange,
  label = "Recipient address",
  placeholder = "0x…",
}: AddressInputProps) {
  const id = useId();
  const touched = value.trim().length > 0;
  const valid = isAddressLike(value);
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block font-display text-sm uppercase tracking-wide text-brown"
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        aria-invalid={touched && !valid}
        className={cn(
          "w-full rounded-lg border-ink border-ink bg-paper px-3 py-2.5 font-body text-sm",
          "placeholder:text-ink/40 focus:outline-none",
          touched && !valid && "bg-red/10",
        )}
      />
      {touched && !valid && (
        <p className="mt-1 font-body text-xs font-semibold text-red">
          That doesn&apos;t look like a wallet address (needs 0x + 40 characters).
        </p>
      )}
    </div>
  );
}
