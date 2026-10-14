"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { TESTIMONIALS } from "@/data/testimonials";

/**
 * Sin tarjetas. Una sola cita grande y una lista de nombres que la cambia:
 * el testimonio pesa más cuando está solo en la página.
 */
export function Testimonials() {
  const [active, setActive] = useState(0);
  const current = TESTIMONIALS[active];

  return (
    <section className="relative border-t border-bone/8">
      <div className="mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <Reveal className="flex items-center gap-4">
          <span className="label text-brass">07</span>
          <span className="h-px w-8 bg-bone/15" aria-hidden />
          <span className="label text-ash">Lo que dicen</span>
        </Reveal>

        <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              >
                <p className="accent text-[clamp(1.625rem,4.6vw,3.25rem)] leading-[1.18]">
                  <span className="text-brass">&laquo;</span>
                  <SplitText text={current.quote} immediate stagger={0.016} />
                  <span className="text-brass">&raquo;</span>
                </p>

                <footer className="mt-9 flex items-center gap-4">
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={current.avatar}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </span>
                  <span>
                    <cite className="block not-italic">{current.name}</cite>
                    <span className="mt-1 block text-[0.8125rem] text-ash">
                      {current.detail} · {current.since}
                    </span>
                  </span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 lg:pt-3">
            <ul className="border-t border-bone/10">
              {TESTIMONIALS.map((item, i) => (
                <li key={item.name} className="border-b border-bone/10">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={i === active}
                    className="group flex w-full items-center gap-4 py-4 text-left"
                  >
                    <span
                      className={`label w-6 transition-colors duration-400 ${
                        i === active ? "text-brass" : "text-ash/50"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`h-px shrink-0 transition-all duration-500 ease-[var(--ease-filo)] ${
                        i === active ? "w-8 bg-brass" : "w-4 bg-bone/15 group-hover:w-6"
                      }`}
                      aria-hidden
                    />
                    <span
                      className={`min-w-0 flex-1 truncate text-sm transition-colors duration-400 ${
                        i === active ? "text-bone" : "text-ash group-hover:text-bone/80"
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs leading-relaxed text-ash/60">
              Reseñas tomadas de Google y de mensajes en Instagram, publicadas con
              permiso de cada persona.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
