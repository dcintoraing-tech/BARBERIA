"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { useRef } from "react";

import { Monogram } from "@/components/brand/Monogram";

interface Props {
  items: string[];
  /** Píxeles por segundo en reposo */
  speed?: number;
  reverse?: boolean;
  className?: string;
}

/**
 * Cinta de texto en movimiento continuo.
 *
 * La velocidad del scroll la empuja: al bajar acelera, al subir se invierte y
 * al soltar vuelve sola a su marcha. Es el detalle que más delata si una
 * página está viva o sólo tiene un bucle CSS puesto encima.
 */
export function Marquee({ items, speed = 38, reverse = false, className = "" }: Props) {
  const baseX = useMotionValue(0);
  const direction = useRef<1 | -1>(reverse ? -1 : 1);
  const reduced = useReducedMotion();

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [-1800, 0, 1800], [-4, 0, 4], { clamp: false });

  // Dos copias idénticas: el envoltorio salta de -50% a 0 sin que se note.
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let move = direction.current * (speed / 1000) * (delta / 10);

    const boost = factor.get();
    if (boost < 0) direction.current = reverse ? 1 : -1;
    else if (boost > 0) direction.current = reverse ? -1 : 1;

    move += move * Math.abs(boost);
    baseX.set(baseX.get() + move);
  });

  const track = (
    <div className="flex shrink-0 items-center gap-10 pr-10 sm:gap-16 sm:pr-16">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center gap-10 sm:gap-16">
          <span className="display whitespace-nowrap text-[clamp(1.75rem,5vw,3.75rem)] uppercase">
            {item}
          </span>
          <Monogram className="h-4 w-4 shrink-0 text-brass sm:h-5 sm:w-5" strokeWidth={9} />
        </span>
      ))}
    </div>
  );

  return (
    <div className={`relative flex overflow-hidden ${className}`}>
      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        {track}
        <div aria-hidden className="contents">
          {track}
        </div>
        <div aria-hidden className="contents">
          {track}
        </div>
        <div aria-hidden className="contents">
          {track}
        </div>
      </motion.div>
    </div>
  );
}
