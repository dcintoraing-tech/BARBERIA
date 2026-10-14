"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

import { useBooking } from "@/components/booking/BookingProvider";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
  CURTAIN_CLOSED,
  CURTAIN_OPEN,
  EASE_CURTAIN,
} from "@/components/ui/RevealImage";
import { SectionHead } from "@/components/ui/SectionHead";
import { useDialog } from "@/components/ui/useDialog";
import { BARBERS } from "@/data/barbers";
import { SERVICE_BY_ID } from "@/data/services";
import { DAYS } from "@/lib/format";
import { duration, money } from "@/lib/format";
import type { Barber } from "@/lib/types";

/** Columnas desfasadas: la rejilla perfecta es lo que delata una plantilla. */
const OFFSET = ["lg:mt-0", "lg:mt-16", "lg:mt-4", "lg:mt-20"];

export function Barbers() {
  const [active, setActive] = useState<Barber | null>(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <section id="barberos" className="relative scroll-mt-20 border-t border-bone/8">
      <div className="mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            index="04"
            label="El equipo"
            title="Cuatro manos"
            titleAccent="con nombre."
            className="max-w-xl"
          />
          <Reveal delay={0.1} className="max-w-sm text-[0.9375rem] leading-relaxed text-ash lg:pb-3">
            Nadie rota entre sillas. Si vuelves con el mismo barbero, no tienes
            que volver a explicar nada.
          </Reveal>
        </div>

        <div className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {BARBERS.map((barber, i) => (
            <Reveal
              key={barber.id}
              delay={i * 0.08}
              distance={34}
              className={OFFSET[i % OFFSET.length]}
            >
              <button
                type="button"
                onClick={() => setActive(barber)}
                data-cursor="Ver perfil"
                className="group block w-full text-left"
              >
                <motion.div
                  className="relative aspect-[3/4] overflow-hidden bg-carbon"
                  variants={{
                    hidden: { clipPath: CURTAIN_CLOSED.up },
                    show: {
                      clipPath: CURTAIN_OPEN,
                      transition: { duration: 1.05, delay: i * 0.08, ease: EASE_CURTAIN },
                    },
                  }}
                >
                  <Image
                    src={barber.image}
                    alt={barber.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 50vw"
                    className="object-cover object-top grayscale transition-all duration-[1.1s] ease-[var(--ease-filo)] group-hover:scale-[1.04] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-80" />

                  {/* La firma sube al pasar el cursor. El relleno va dentro
                      del elemento que se desplaza, para que translate-y-full
                      lo saque por completo del marco. */}
                  <div className="absolute inset-x-0 bottom-0 overflow-hidden">
                    <p className="accent translate-y-full p-4 text-[0.9375rem] leading-snug text-bone/90 transition-transform duration-[0.7s] ease-[var(--ease-filo)] group-hover:translate-y-0">
                      &laquo;{barber.signature}&raquo;
                    </p>
                  </div>

                  <span className="label absolute right-3 top-3 text-bone/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Filete de latón que recorre el borde inferior al pasar */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brass transition-transform duration-700 ease-[var(--ease-filo)] group-hover:scale-x-100"
                  />
                </motion.div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="display text-xl transition-colors duration-400 group-hover:text-brass">
                      {barber.name}
                    </h3>
                    <p className="mt-1.5 text-[0.8125rem] leading-snug text-ash">
                      {barber.specialty}
                    </p>
                  </div>
                  <span className="label shrink-0 pt-1 text-ash/60">
                    {barber.yearsExperience} a
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <BarberDialog barber={active} onClose={close} />
    </section>
  );
}

function BarberDialog({ barber, onClose }: { barber: Barber | null; onClose: () => void }) {
  const { openBooking } = useBooking();
  const panelRef = useRef<HTMLDivElement>(null);

  useDialog(barber !== null, onClose, panelRef);

  return (
    <AnimatePresence>
      {barber && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-end justify-center p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Perfil de ${barber.name}`}
        >
          <motion.div
            className="absolute inset-0 bg-ink/88 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
          />

          <motion.div
            ref={panelRef}
            className="relative max-h-[92svh] w-full max-w-3xl overflow-y-auto bg-ink-2 ring-1 ring-bone/10"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar perfil"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center bg-ink/70 text-bone backdrop-blur transition-colors duration-300 hover:text-brass"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.4}>
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>

            <div className="grid sm:grid-cols-[14rem_1fr]">
              <div className="relative aspect-[4/3] sm:aspect-auto">
                <Image
                  src={barber.portrait}
                  alt={barber.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 480px"
                  className="object-cover object-top"
                />
              </div>

              <div className="p-6 sm:p-8">
                <div className="label text-brass">{barber.role}</div>
                <h3 className="display mt-3 text-[clamp(1.75rem,5vw,2.5rem)]">
                  {barber.name}
                </h3>
                <p className="mt-1 text-sm text-ash">
                  {barber.specialty} · {barber.yearsExperience} años de oficio
                </p>

                <p className="mt-6 text-[0.9375rem] leading-relaxed text-bone/75">
                  {barber.bio}
                </p>

                <p className="accent mt-6 border-l border-brass/50 pl-4 text-lg leading-snug text-brass">
                  &laquo;{barber.signature}&raquo;
                </p>

                <div className="mt-8">
                  <h4 className="label text-ash">Qué hace</h4>
                  <ul className="mt-4 divide-y divide-bone/8 border-y border-bone/8">
                    {barber.services.map((id) => {
                      const service = SERVICE_BY_ID[id];
                      return (
                        <li key={id} className="flex items-baseline gap-4 py-2.5 text-sm">
                          <span className="flex-1 truncate">{service.name}</span>
                          <span className="label shrink-0 text-ash">
                            {duration(service.durationMin)}
                          </span>
                          <span className="w-20 shrink-0 text-right tabular-nums text-bone/80">
                            {money(service.price)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-7">
                  <h4 className="label text-ash">En el local</h4>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((day) => {
                      const works = barber.workDays.includes(day as never);
                      return (
                        <span
                          key={day}
                          className={`rounded-sm border px-2.5 py-1.5 text-[0.6875rem] capitalize ${
                            works
                              ? "border-brass/40 text-bone"
                              : "border-bone/8 text-ash/30 line-through"
                          }`}
                        >
                          {DAYS[day].slice(0, 3)}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 xs:flex-row">
                  <Button
                    tone="brass"
                    full
                    onClick={() => {
                      onClose();
                      window.setTimeout(() => openBooking({ barberId: barber.id }), 280);
                    }}
                  >
                    Agendar con {barber.name.split(" ")[0]}
                  </Button>
                  <a
                    href={`https://instagram.com/${barber.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center border border-bone/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-ash transition-colors duration-400 hover:border-brass hover:text-brass"
                  >
                    {barber.instagram}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
