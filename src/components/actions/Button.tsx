import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-red text-paper",
  secondary: "bg-orange text-ink",
  ghost: "bg-paper text-ink",
};

const SIZE: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-panel border-ink-lg border-ink " +
  "font-display uppercase tracking-wide shadow-panel-sm " +
  "transition-[transform,box-shadow] duration-100 ease-snap " +
  "hover:-translate-y-0.5 hover:shadow-panel " +
  "active:translate-x-1 active:translate-y-1 active:shadow-none " +
  "disabled:pointer-events-none disabled:opacity-50 disabled:saturate-0";

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = CommonProps & { href: string; external?: boolean };

export function Button(props: ButtonProps | LinkProps) {
  const { children, variant = "primary", size = "md", className, fullWidth } = props;
  const classes = cn(
    BASE,
    VARIANT[variant],
    SIZE[size],
    fullWidth && "w-full",
    className,
  );

  if ("href" in props && props.href !== undefined) {
    const { href, external } = props;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, fullWidth: _f, ...rest } =
    props as ButtonProps;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
