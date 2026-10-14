"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Cursor de la casa: un punto fijo y un aro que lo persigue con retraso.
 * Los elementos marcados con `data-cursor="texto"` cambian el aro por una
 * etiqueta. Sólo se monta con puntero fino.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"default" | "link" | "label">("default");
  const [label, setLabel] = useState("");

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 32, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 320, damping: 32, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(fine.matches && !reduced.matches);

    const sync = () => setEnabled(fine.matches && !reduced.matches);
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const target = event.target as HTMLElement | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        setLabel(labelled.dataset.cursor ?? "");
        setMode("label");
        return;
      }
      const interactive = target?.closest(
        'a, button, input, textarea, select, [role="button"], [tabindex]:not([tabindex="-1"])',
      );
      setMode(interactive ? "link" : "default");
    };

    const leave = () => setVisible(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] hidden lg:block" aria-hidden>
      <motion.div
        className="absolute left-0 top-0"
        style={{ x: ringX, y: ringY }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      >
        <AnimatePresence mode="wait">
          {mode === "label" ? (
            <motion.div
              key="label"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
              className="label flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brass text-center text-ink"
            >
              {label}
            </motion.div>
          ) : (
            <motion.div
              key="ring"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: mode === "link" ? 1.9 : 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              className={`h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-300 ${
                mode === "link" ? "border-brass/70" : "border-bone/35"
              }`}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="absolute left-0 top-0"
        style={{ x, y }}
        animate={{ opacity: visible && mode !== "label" ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass" />
      </motion.div>
    </div>
  );
}
