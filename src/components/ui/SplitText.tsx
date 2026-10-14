"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";

interface Props {
  text: string;
  className?: string;
  /** Retraso entre palabras */
  stagger?: number;
  delay?: number;
  as?: ElementType;
  once?: boolean;
  /** Dispara al montar en vez de al entrar en pantalla (para el hero) */
  immediate?: boolean;
}

/**
 * Revelado por palabras: cada una sube desde detrás de una máscara.
 * Se divide por palabra, no por letra, para no destrozar la lectura ni el
 * árbol de accesibilidad.
 */
export function SplitText({
  text,
  className = "",
  stagger = 0.045,
  delay = 0,
  as: Tag = "span",
  once = true,
  immediate = false,
}: Props) {
  const words = text.split(" ");
  const MotionTag = motion[Tag as "span"];

  const animationProps = immediate
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once, amount: 0.4 } };

  return (
    <MotionTag
      className={className}
      initial="hidden"
      {...animationProps}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          aria-hidden
        >
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: { y: "110%", opacity: 0 },
              show: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.95, ease: [0.19, 1, 0.22, 1] },
              },
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
