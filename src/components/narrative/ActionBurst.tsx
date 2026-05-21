import { cn } from "@/lib/cn";

interface ActionBurstProps {
  children: React.ReactNode;
  tone?: "red" | "orange" | "sky";
  spikes?: number;
  spin?: boolean;
  className?: string;
}

const FILL = { red: "#FD5D63", orange: "#FCBB59", sky: "#A8D5FF" };

/** Build a spiky starburst polygon point string. */
function burstPoints(spikes: number, outer: number, inner: number, cx = 50, cy = 50) {
  const pts: string[] = [];
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

/** A "POW!"-style starburst label for key CTAs and reveals. */
export function ActionBurst({
  children,
  tone = "red",
  spikes = 14,
  spin = false,
  className,
}: ActionBurstProps) {
  return (
    <span
      className={cn(
        "relative inline-grid aspect-square place-items-center",
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full drop-shadow-none",
          spin && "motion-safe:animate-burst-spin",
        )}
      >
        <polygon
          points={burstPoints(spikes, 50, 36)}
          fill={FILL[tone]}
          stroke="#1A1A1A"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </svg>
      <span className="relative z-10 px-4 text-center font-display uppercase leading-none text-ink">
        {children}
      </span>
    </span>
  );
}
