"use client";

import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { SplitText } from "./SplitText";

interface Props {
  /** Numeración editorial: 01, 02… */
  index?: string;
  label: string;
  title: string;
  /** Segunda línea del título, en cursiva, para romper la simetría */
  titleAccent?: string;
  children?: ReactNode;
  align?: "left" | "center";
  tone?: "bone" | "ink";
  className?: string;
}

export function SectionHead({
  index,
  label,
  title,
  titleAccent,
  children,
  align = "left",
  tone = "bone",
  className = "",
}: Props) {
  const muted = tone === "bone" ? "text-ash" : "text-ink/55";
  const rule = tone === "bone" ? "bg-bone/15" : "bg-ink/15";

  return (
    <div
      className={`${align === "center" ? "mx-auto max-w-2xl text-center" : ""} ${className}`}
    >
      <Reveal className="flex items-center gap-4" distance={14}>
        {index && (
          <span className={`label ${tone === "bone" ? "text-brass" : "text-ink/60"}`}>
            {index}
          </span>
        )}
        <span className={`h-px w-8 ${rule}`} aria-hidden />
        <span className={`label ${muted}`}>{label}</span>
      </Reveal>

      <h2 className="display mt-6 text-[clamp(2.25rem,6.2vw,5rem)]">
        <SplitText text={title} />
        {titleAccent && (
          <>
            <br />
            <SplitText
              text={titleAccent}
              delay={0.12}
              className={`accent text-[1.1em] ${tone === "bone" ? "text-brass" : "text-ink/55"}`}
            />
          </>
        )}
      </h2>

      {children && (
        <Reveal delay={0.1} className={`mt-7 max-w-xl text-[0.9375rem] leading-relaxed ${muted}`}>
          {children}
        </Reveal>
      )}
    </div>
  );
}
