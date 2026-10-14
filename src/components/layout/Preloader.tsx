"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Monogram } from "@/components/brand/Monogram";

/**
 * Pantalla de carga. El monograma se dibuja, el contador sube y la cortina
 * se abre en dos hojas: el mismo gesto de un corte.
 *
 * Se muestra una sola vez por sesión del navegador.
 */
export function Preloader() {
  const [done, setDone] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const seen = sessionStorage.getItem("casafilo:intro");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seen || reduced) return;

    setDone(false);
    document.documentElement.style.overflow = "hidden";

    const started = performance.now();
    const total = 2000;
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / total);
      // Desaceleración: sube rápido y se asienta al final.
      setCount(Math.round((1 - Math.pow(1 - progress, 3)) * 100));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const timer = window.setTimeout(() => {
      sessionStorage.setItem("casafilo:intro", "1");
      document.documentElement.style.overflow = "";
      setDone(true);
    }, total + 260);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[300] flex items-center justify-center"
          exit={{ pointerEvents: "none" }}
        >
          {/* Dos hojas que se abren */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-ink"
            exit={{ y: "-100%" }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-ink"
            exit={{ y: "100%" }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          />
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 edge-x opacity-70" />

          <motion.div
            className="relative flex flex-col items-center"
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
          >
            <Monogram className="h-20 w-20 text-bone" animated strokeWidth={4} />
            <motion.div
              className="label mt-7 text-ash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.6 }}
            >
              Casa Filo · Guadalajara
            </motion.div>
          </motion.div>

          <motion.div
            className="display absolute bottom-7 right-6 text-[clamp(2.5rem,9vw,5rem)] leading-none text-bone/15 sm:bottom-10 sm:right-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {String(count).padStart(3, "0")}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
