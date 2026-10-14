"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "inicio", label: "Inicio" },
  { id: "servicios", label: "Servicios" },
  { id: "nosotros", label: "La experiencia" },
  { id: "barberos", label: "Barberos" },
  { id: "galeria", label: "Galería" },
  { id: "contacto", label: "Contacto" },
] as const;

/**
 * Riel lateral con la numeración de la sección en curso.
 *
 * Es un folio de revista: el número cambia con la lectura y la marca del riel
 * se desliza. Decorativo, por eso queda fuera del árbol accesible, y sólo
 * aparece a partir de 1760 px, que es donde la retícula —limitada a 1600— deja
 * margen suficiente para que no se monte sobre el contenido.
 */
export function SectionIndicator() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (n): n is HTMLElement => n !== null,
    );
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Gana la sección que más superficie ocupa en pantalla.
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const index = SECTIONS.findIndex((s) => s.id === best.target.id);
        if (index >= 0) setActive(index);
      },
      { threshold: [0.15, 0.4, 0.7], rootMargin: "-20% 0px -20% 0px" },
    );

    nodes.forEach((n) => observer.observe(n));

    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 18 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          className="pointer-events-none fixed bottom-6 right-6 z-[95] hidden items-center gap-4 min-[1760px]:flex"
        >
          <div className="text-right">
            <div className="relative h-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={SECTIONS[active].label}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                  className="label whitespace-nowrap text-ash"
                >
                  {SECTIONS[active].label}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative flex items-center gap-1.5">
            {SECTIONS.map((section, i) => (
              <span
                key={section.id}
                className={`h-px transition-all duration-500 ease-[var(--ease-filo)] ${
                  i === active ? "w-6 bg-brass" : "w-2.5 bg-bone/25"
                }`}
              />
            ))}
          </div>

          <div className="relative h-7 w-7 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                className="display absolute inset-0 flex items-center justify-center text-xl text-brass"
              >
                {String(active + 1).padStart(2, "0")}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
