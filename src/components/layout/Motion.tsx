"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Configuración global de movimiento.
 *
 * Con `reducedMotion="user"` quien tenga activada la preferencia del sistema
 * deja de recibir desplazamientos y escalas; las opacidades se conservan, así
 * que nada queda invisible ni a medio camino.
 */
export function Motion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
