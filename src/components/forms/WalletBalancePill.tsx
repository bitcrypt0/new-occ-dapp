import { cn } from "@/lib/cn";
import { CONTRACT } from "@/lib/constants";
import { classifyBalance } from "@/lib/hooks/data";

interface WalletBalancePillProps {
  balanceEth: number;
  /** Compact form for the header; full form shows the gate context. */
  variant?: "compact" | "full";
  className?: string;
}

const TIER_STYLE = {
  blocked: "bg-red text-paper",
  caution: "bg-orange text-ink",
  good: "bg-sage text-ink",
};

const TIER_LABEL = {
  blocked: "Below mint gate",
  caution: "Cutting it close",
  good: "Good to mint",
};

/** Live wallet-balance pill — compares balance against the 0.015 ETH gate. */
export function WalletBalancePill({
  balanceEth,
  variant = "compact",
  className,
}: WalletBalancePillProps) {
  const tier = classifyBalance(balanceEth);

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border-ink border-ink px-3 py-1 font-display text-sm tabular-nums",
          TIER_STYLE[tier],
          className,
        )}
      >
        <span
          aria-hidden
          className="h-2 w-2 rounded-full bg-current"
        />
        {balanceEth.toFixed(3)} ETH
      </span>
    );
  }

  return (
    <div
      className={cn(
        "rounded-panel border-ink border-ink p-3",
        TIER_STYLE[tier],
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-2xl tabular-nums">
          {balanceEth.toFixed(3)} ETH
        </span>
        <span className="font-display text-xs uppercase tracking-wide">
          {TIER_LABEL[tier]}
        </span>
      </div>
      {/* gate scale */}
      <div className="relative mt-2 h-3 rounded-full border-2 border-ink bg-paper">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-ink"
          style={{ width: `${Math.min(100, (balanceEth / (CONTRACT.balanceGateSafe * 1.6)) * 100)}%` }}
        />
        <Marker fraction={CONTRACT.balanceGateMin / (CONTRACT.balanceGateSafe * 1.6)} />
        <Marker fraction={CONTRACT.balanceGateSafe / (CONTRACT.balanceGateSafe * 1.6)} />
      </div>
      <div className="mt-1 flex justify-between font-body text-[11px] font-semibold">
        <span>min {CONTRACT.balanceGateMin} ETH</span>
        <span>safe {CONTRACT.balanceGateSafe} ETH</span>
      </div>
    </div>
  );
}

function Marker({ fraction }: { fraction: number }) {
  return (
    <span
      aria-hidden
      className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-ink"
      style={{ left: `${fraction * 100}%` }}
    />
  );
}
