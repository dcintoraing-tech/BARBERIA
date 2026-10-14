"use client";

import { useEffect, useRef } from "react";

import { setScrollLock } from "@/components/layout/SmoothScroll";

/**
 * Comportamiento compartido de las capas superpuestas: panel de reserva,
 * ficha de barbero y galería ampliada.
 *
 * Bloquea el scroll de fondo (y pausa Lenis con él), cierra con Escape,
 * lleva el foco dentro al abrir y lo devuelve al elemento de origen al
 * cerrar, que es lo que espera quien navega con teclado.
 */
export function useDialog(
  open: boolean,
  onClose: () => void,
  containerRef?: React.RefObject<HTMLElement | null>,
) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    setScrollLock(true);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Un cuadro después, para que el contenido ya esté montado.
    const focusTimer = window.setTimeout(() => {
      const container = containerRef?.current;
      if (!container) return;
      const target = container.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      target?.focus({ preventScroll: true });
    }, 60);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      setScrollLock(false);
      previouslyFocused.current?.focus({ preventScroll: true });
    };
  }, [open, onClose, containerRef]);
}
