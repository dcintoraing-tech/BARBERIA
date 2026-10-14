"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { SectionHead } from "@/components/ui/SectionHead";
import {
  CURTAIN_CLOSED,
  CURTAIN_OPEN,
  EASE_CURTAIN,
  EASE_SETTLE,
} from "@/components/ui/RevealImage";
import { useDialog } from "@/components/ui/useDialog";
import { GALLERY } from "@/data/gallery";

const ASPECT: Record<string, string> = {
  tall: "aspect-[3/4]",
  wide: "aspect-[4/3]",
  sq: "aspect-square",
  xl: "aspect-[4/5]",
};

export function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIndex(null), []);
  const go = useCallback(
    (delta: number) =>
      setIndex((current) =>
        current === null ? null : (current + delta + GALLERY.length) % GALLERY.length,
      ),
    [],
  );

  useDialog(index !== null, close, lightboxRef);

  // Navegación con flechas dentro de la galería ampliada.
  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, go]);

  return (
    <section id="galeria" className="relative scroll-mt-20 border-t border-bone/8">
      <div className="mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            index="05"
            label="Trabajo"
            title="Lo que sale"
            titleAccent="de estas sillas."
            className="max-w-xl"
          />
          <p className="text-xs text-ash/70 lg:pb-4 lg:text-right">
            Fotografía del local. Sin retoque de piel.
            <br className="hidden lg:block" /> Toca cualquier imagen para verla
            completa.
          </p>
        </div>

        {/* Columnas de altura libre: la retícula respira distinto en cada columna */}
        <div className="mt-14 columns-2 gap-3 sm:gap-4 lg:columns-3 xl:columns-4">
          {GALLERY.map((shot, i) => (
            <motion.div
              key={shot.src + i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="mb-3 block w-full break-inside-avoid sm:mb-4"
            >
            <motion.button
              type="button"
              onClick={() => setIndex(i)}
              data-cursor="Ampliar"
              variants={{
                hidden: { clipPath: CURTAIN_CLOSED.up },
                show: {
                  clipPath: CURTAIN_OPEN,
                  transition: { duration: 1.05, delay: (i % 4) * 0.07, ease: EASE_CURTAIN },
                },
              }}
              className="group relative block w-full overflow-hidden"
            >
              <motion.span
                className={`relative block w-full ${ASPECT[shot.span]}`}
                variants={{
                  hidden: { scale: 1.2 },
                  show: {
                    scale: 1,
                    transition: { duration: 1.4, delay: (i % 4) * 0.07, ease: EASE_SETTLE },
                  },
                }}
              >
                <Image
                  src={shot.src}
                  alt={shot.caption}
                  fill
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 45vw"
                  className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-filo)] group-hover:scale-[1.06]"
                />
              </motion.span>

              <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/25" />

              <span className="absolute inset-x-0 bottom-0 translate-y-full p-3 text-left transition-transform duration-500 ease-[var(--ease-filo)] group-hover:translate-y-0">
                <span className="block bg-ink/80 px-3 py-2 backdrop-blur-sm">
                  <span className="block text-xs text-bone">{shot.caption}</span>
                  <span className="label mt-1 block text-ash">{shot.meta}</span>
                </span>
              </span>
            </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      <Lightbox ref={lightboxRef} index={index} onClose={close} onNavigate={go} />
    </section>
  );
}

function Lightbox({
  ref,
  index,
  onClose,
  onNavigate,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  index: number | null;
  onClose: () => void;
  onNavigate: (delta: number) => void;
}) {
  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div
          ref={ref}
          className="fixed inset-0 z-[160] flex flex-col bg-ink/95 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-modal="true"
          aria-label="Galería ampliada"
        >
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <span className="label text-ash tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(GALLERY.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar galería"
              className="flex h-10 w-10 items-center justify-center border border-bone/15 transition-colors duration-300 hover:border-brass hover:text-brass"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.4}>
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-16">
            <AnimatePresence mode="wait">
              <motion.figure
                key={index}
                className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) onNavigate(1);
                  if (info.offset.x > 80) onNavigate(-1);
                }}
              >
                <div className="relative min-h-0 w-full flex-1">
                  <Image
                    src={GALLERY[index].src}
                    alt={GALLERY[index].caption}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                  />
                </div>
                <figcaption className="mt-5 flex items-baseline gap-4 text-center">
                  <span className="text-sm text-bone">{GALLERY[index].caption}</span>
                  <span className="label text-ash">{GALLERY[index].meta}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>

            <NavArrow direction="prev" onClick={() => onNavigate(-1)} />
            <NavArrow direction="next" onClick={() => onNavigate(1)} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NavArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Imagen anterior" : "Imagen siguiente"}
      className={`absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-bone/15 bg-ink/50 backdrop-blur transition-colors duration-300 hover:border-brass hover:text-brass sm:flex ${
        direction === "prev" ? "left-3" : "right-3"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d={direction === "prev" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"} strokeLinecap="square" />
      </svg>
    </button>
  );
}
