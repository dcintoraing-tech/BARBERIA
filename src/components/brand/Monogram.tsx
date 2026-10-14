"use client";

import { motion, type Variants } from "framer-motion";

/**
 * Monograma de CASA FILO.
 *
 * Un arco abierto (la C) atravesado por un trazo vertical que lo rebasa por
 * arriba y por abajo: el filo. Dos brazos cortos convierten ese trazo en F.
 * Nada de navajas ni bigotes; la idea es el corte, no la herramienta.
 */

interface Props {
  className?: string;
  /** Dibuja el trazo al entrar (pantalla de carga, hero) */
  animated?: boolean;
  strokeWidth?: number;
  title?: string;
}

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: 0.1 + i * 0.16, duration: 0.9, ease: [0.19, 1, 0.22, 1] },
      opacity: { delay: 0.1 + i * 0.16, duration: 0.2 },
    },
  }),
};

export function Monogram({
  className,
  animated = false,
  strokeWidth = 6,
  title = "Casa Filo",
}: Props) {
  const common = {
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "square" as const,
    fill: "none",
  };

  const paths = [
    // El arco: la C, abierta hacia la derecha.
    "M 69.5 22.1 A 34 34 0 1 0 69.5 77.9",
    // El filo: rebasa el círculo arriba y abajo.
    "M 50 5 L 50 95",
    // Brazo superior de la F.
    "M 50 36 L 75 36",
    // Brazo medio de la F.
    "M 50 54 L 67 54",
  ];

  if (!animated) {
    return (
      <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
        {paths.map((d) => (
          <path key={d} d={d} {...common} />
        ))}
      </svg>
    );
  }

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={title}
      initial="hidden"
      animate="show"
    >
      {paths.map((d, i) => (
        <motion.path key={d} d={d} custom={i} variants={draw} {...common} />
      ))}
    </motion.svg>
  );
}
