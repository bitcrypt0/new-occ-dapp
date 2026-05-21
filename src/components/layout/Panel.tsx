import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "paper" | "cream" | "sky" | "sage" | "rose" | "orange" | "lavender" | "grey" | "ink";

const TONE: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  cream: "bg-cream text-ink",
  sky: "bg-sky text-ink",
  sage: "bg-sage text-ink",
  rose: "bg-rose text-ink",
  orange: "bg-orange text-ink",
  lavender: "bg-lavender text-ink",
  grey: "bg-grey text-ink",
  ink: "bg-ink text-paper",
};

const SHADOW = {
  none: "",
  sm: "shadow-panel-sm",
  md: "shadow-panel",
  lg: "shadow-panel-lg",
} as const;

interface PanelProps {
  children: ReactNode;
  tone?: Tone;
  shadow?: keyof typeof SHADOW;
  halftone?: boolean;
  as?: ElementType;
  className?: string;
}

/** The comic-panel container — ink border + hard offset shadow. */
export function Panel({
  children,
  tone = "cream",
  shadow = "md",
  halftone = false,
  as: Tag = "div",
  className,
}: PanelProps) {
  return (
    <Tag
      className={cn(
        "relative rounded-panel border-ink-lg border-ink",
        TONE[tone],
        SHADOW[shadow],
        className,
      )}
    >
      {halftone && (
        <div
          aria-hidden
          className="halftone pointer-events-none absolute inset-0 rounded-[10px]"
        />
      )}
      <div className="relative">{children}</div>
    </Tag>
  );
}
