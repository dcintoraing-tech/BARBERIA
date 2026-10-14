"use client";

import { Monogram } from "./Monogram";

interface Props {
  /** horizontal: para la navbar · apilado: para hero, footer y carga */
  variant?: "horizontal" | "stacked";
  className?: string;
  animated?: boolean;
  /** Línea descriptiva bajo el nombre */
  descriptor?: boolean;
}

export function Logo({
  variant = "horizontal",
  className = "",
  animated = false,
  descriptor = true,
}: Props) {
  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <Monogram className="h-16 w-16" animated={animated} strokeWidth={5} />
        <div className="mt-5 text-center">
          <div className="display text-[clamp(1.5rem,4vw,2.25rem)] tracking-[0.3em] pl-[0.3em]">
            CASA FILO
          </div>
          {descriptor && (
            <div className="label mt-3 text-ash">Barbería de autor · GDL</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Monogram className="h-8 w-8 shrink-0" animated={animated} strokeWidth={7} />
      <div className="leading-none">
        <div className="display text-[1.0625rem] tracking-[0.26em] pl-[0.26em]">
          CASA FILO
        </div>
        {descriptor && (
          <div className="mt-[5px] text-[0.5625rem] font-medium uppercase tracking-[0.3em] text-ash">
            Barbería
          </div>
        )}
      </div>
    </div>
  );
}
