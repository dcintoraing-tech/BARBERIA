"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "brass" | "bone" | "ghost" | "ink";

interface BaseProps {
  children: ReactNode;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
  full?: boolean;
}

const TONES: Record<Tone, string> = {
  brass:
    "bg-brass text-ink border-brass hover:bg-bone hover:border-bone disabled:bg-smoke disabled:text-ash disabled:border-smoke",
  bone: "bg-bone text-ink border-bone hover:bg-brass hover:border-brass disabled:bg-smoke disabled:text-ash disabled:border-smoke",
  ink: "bg-ink text-bone border-ink hover:bg-brass hover:text-ink hover:border-brass",
  ghost:
    "bg-transparent text-bone border-bone/30 hover:border-brass hover:text-brass disabled:text-ash disabled:border-smoke",
};

const SIZES = {
  sm: "h-10 px-5 text-[0.625rem] tracking-[0.2em]",
  md: "h-12 px-7 text-[0.6875rem] tracking-[0.22em]",
  lg: "h-14 px-9 text-[0.75rem] tracking-[0.22em]",
};

function classes({
  tone = "brass",
  size = "md",
  full,
  className = "",
}: Omit<BaseProps, "children">) {
  return [
    "group relative inline-flex items-center justify-center gap-3 border font-medium uppercase",
    "transition-[background-color,border-color,color,transform] duration-500 ease-[var(--ease-filo)]",
    "active:scale-[0.985] disabled:cursor-not-allowed disabled:active:scale-100",
    TONES[tone],
    SIZES[size],
    full ? "w-full" : "",
    className,
  ].join(" ");
}

/**
 * Botón de la casa. La microinteracción es un desplazamiento del rótulo con
 * su duplicado entrando por abajo: se nota, pero no distrae.
 */
export function Button({
  children,
  tone,
  size,
  className,
  full,
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classes({ tone, size, className, full })} {...rest}>
      <ButtonLabel>{children}</ButtonLabel>
    </button>
  );
}

export function ButtonLink({
  children,
  tone,
  size,
  className,
  full,
  href,
  ...rest
}: BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} className={classes({ tone, size, className, full })} {...rest}>
      <ButtonLabel>{children}</ButtonLabel>
    </a>
  );
}

function ButtonLabel({ children }: { children: ReactNode }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-[var(--ease-filo)] group-hover:-translate-y-full group-disabled:translate-y-0">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-filo)] group-hover:translate-y-0 group-disabled:translate-y-full"
      >
        {children}
      </span>
    </span>
  );
}
