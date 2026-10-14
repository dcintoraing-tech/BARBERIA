"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { useBooking } from "@/components/booking/BookingProvider";
import { Magnetic } from "@/components/ui/Magnetic";
import { SplitText } from "@/components/ui/SplitText";
import { IMG } from "@/data/images";

const STEPS = [
  { n: "01", t: "Eliges servicio y barbero" },
  { n: "02", t: "Ves los horarios que de verdad quedan libres" },
  { n: "03", t: "Confirmas y te llega el folio" },
];

/**
 * Banda a sangre antes del contacto: la última oportunidad de reservar sin
 * que parezca un bloque de llamada a la acción pegado al final.
 */
export function BookingBand() {
  const { openBooking } = useBooking();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div className="absolute inset-0 scale-110" style={{ y }}>
        <Image
          src={IMG.heroLateral}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-ink/78" />
      <div className="grain absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <h2 className="display text-[clamp(2.25rem,7vw,5.5rem)] leading-[0.96]">
              <SplitText text="La agenda abre" className="block" />
              <SplitText
                text="45 días adelante."
                delay={0.08}
                className="accent block text-[1.1em] text-brass"
              />
            </h2>

            <p className="mt-7 max-w-md text-[0.9375rem] leading-relaxed text-bone/65">
              Los viernes por la tarde y los sábados se llenan con una semana de
              anticipación. Entre semana casi siempre hay lugar el mismo día.
            </p>

            <div className="mt-10">
              <Magnetic strength={0.22}>
                <button
                  type="button"
                  onClick={() => openBooking()}
                  className="group relative flex h-16 items-center gap-6 overflow-hidden border border-brass pl-9 pr-7 text-[0.75rem] font-medium uppercase tracking-[0.24em] text-brass transition-colors duration-500 hover:text-ink"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-600 ease-[var(--ease-filo)] group-hover:scale-x-100"
                  />
                  <span className="relative">Agendar cita</span>
                  <span className="relative h-px w-10 bg-current opacity-50 transition-all duration-500 group-hover:w-14 group-hover:opacity-100" />
                </button>
              </Magnetic>
            </div>
          </div>

          <ol className="lg:col-span-5 lg:pl-10">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.n}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="flex items-baseline gap-5 border-b border-bone/12 py-5 first:border-t"
              >
                <span className="label text-brass/70">{step.n}</span>
                <span className="text-[0.9375rem] leading-snug text-bone/80">{step.t}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
