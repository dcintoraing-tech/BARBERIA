"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Recorrido en píxeles. El efecto va de +distance a -distance. */
  distance?: number;
  /** Escala adicional al recorrer, para fotografías */
  zoom?: boolean;
}

/**
 * Parallax de amplitud corta. Veinte o treinta píxeles bastan para dar
 * profundidad; más de eso se nota y se siente barato.
 *
 * El árbol renderizado es idéntico en servidor y cliente: la preferencia de
 * movimiento reducido se aplica después de montar, nunca ramificando el DOM,
 * porque eso rompía la hidratación.
 */
export function Parallax({ children, className, distance = 60, zoom = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const still = mounted && reduced;
  const range = still ? 0 : distance;

  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    zoom && !still ? [1.08, 1.14, 1.08] : [1, 1, 1],
  );

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y, scale }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
