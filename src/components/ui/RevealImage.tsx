"use client";

import Image, { type ImageProps } from "next/image";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right";

interface Props extends Omit<ImageProps, "className"> {
  /** Proporción del marco, p. ej. "aspect-[3/4]" */
  frame?: string;
  className?: string;
  imageClassName?: string;
  delay?: number;
  duration?: number;
  /** Lado por el que entra la cortina */
  from?: Direction;
  /** Contenido sobre la fotografía: pies de foto, etiquetas */
  children?: ReactNode;
}

const CLOSED: Record<Direction, string> = {
  up: "inset(0% 0% 100% 0%)",
  down: "inset(100% 0% 0% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

const OPEN = "inset(0% 0% 0% 0%)";

const EASE_CURTAIN = [0.76, 0, 0.24, 1] as const;
const EASE_SETTLE = [0.19, 1, 0.22, 1] as const;

/**
 * Fotografía que se descubre con una cortina.
 *
 * El marco recorta con `clip-path` mientras la imagen, por dentro, se asienta
 * desde una escala mayor: dos capas a distinta velocidad, que es lo que hace
 * que la entrada se sienta de cine y no de plantilla.
 *
 * El disparador vive en un envoltorio **sin recortar**: un elemento con
 * `clip-path` cerrado tiene rectángulo de intersección nulo, así que si se
 * observa a sí mismo nunca llega a entrar en pantalla y la cortina se queda
 * cerrada para siempre.
 */
export function RevealImage({
  frame = "aspect-[3/4]",
  className = "",
  imageClassName = "",
  delay = 0,
  duration = 1.15,
  from = "up",
  children,
  ...image
}: Props) {
  const curtain: Variants = {
    hidden: { clipPath: CLOSED[from] },
    show: {
      clipPath: OPEN,
      transition: { duration, delay, ease: EASE_CURTAIN },
    },
  };

  const settle: Variants = {
    hidden: { scale: 1.22 },
    show: {
      scale: 1,
      transition: { duration: duration + 0.35, delay, ease: EASE_SETTLE },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={curtain} className={`relative overflow-hidden ${frame}`}>
        <motion.div variants={settle} className="absolute inset-0">
          <Image {...image} fill className={`object-cover ${imageClassName}`} />
        </motion.div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export { CLOSED as CURTAIN_CLOSED, OPEN as CURTAIN_OPEN, EASE_CURTAIN, EASE_SETTLE };
