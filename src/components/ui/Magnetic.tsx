"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Fuerza del imán, 0 — 1 */
  strength?: number;
}

/**
 * Atracción magnética del puntero. Sólo se activa con ratón: en pantallas
 * táctiles estorba y en lectores de pantalla no existe.
 *
 * El elemento se renderiza igual siempre; la preferencia de movimiento
 * reducido se consulta dentro del manejador, no al construir el árbol.
 */
export function Magnetic({ children, className, strength = 0.28 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const release = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== "mouse") return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={release}
      onPointerCancel={release}
    >
      {children}
    </motion.div>
  );
}
