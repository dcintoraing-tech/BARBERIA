"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Filete de latón que cruza la parte superior conforme avanza la lectura.
 * Es el único elemento de la página que mide el recorrido completo, así que
 * se mantiene fino: tres píxeles y nada más.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    restDelta: 0.001,
  });
  // Se desvanece arriba del todo, donde aún no hay nada que medir.
  const opacity = useTransform(scrollYProgress, [0, 0.02], [0, 1]);

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, opacity }}
      className="fixed inset-x-0 top-0 z-[130] h-[3px] origin-left bg-brass"
    />
  );
}
