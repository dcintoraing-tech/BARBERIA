"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { useBooking } from "@/components/booking/BookingProvider";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { SplitText } from "@/components/ui/SplitText";
import { IMG } from "@/data/images";
import { SITE } from "@/data/site";

export function Hero() {
  const { openBooking } = useBooking();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      id="inicio"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      <motion.div className="absolute inset-0" style={{ y: imageY, scale: imageScale }}>
        <Image
          src={IMG.heroPrincipal}
          alt="Barbero afeitando a un cliente en el salón de Casa Filo"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[44%_center] sm:object-[58%_center]"
        />
      </motion.div>

      {/* Capas de atmósfera: degradado, grano y viñeta */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-transparent to-ink/50" />
      <div className="grain vignette absolute inset-0" aria-hidden />

      <motion.div
        style={{ y: contentY, opacity: fade }}
        className="relative mt-auto w-full px-5 pb-10 pt-[calc(var(--nav-h)+2rem)] sm:px-8 sm:pb-14 lg:px-12"
      >
        <div className="mx-auto flex w-full max-w-[100rem] items-end justify-between gap-10">
          <div className="min-w-0 max-w-4xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="flex items-center gap-4"
            >
              <span className="h-px w-10 bg-brass" aria-hidden />
              <span className="label text-brass">
                {SITE.descriptor} · Est. {SITE.founded}
              </span>
            </motion.div>

            <h1 className="display mt-6 text-[clamp(3rem,12vw,9.75rem)] leading-[0.82]">
              <SplitText text="CASA" immediate delay={0.35} className="block" />
              <SplitText
                text="FILO"
                immediate
                delay={0.45}
                className="block pl-[0.1em] text-brass"
              />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
              className="accent mt-8 max-w-lg text-[clamp(1.5rem,4vw,2.375rem)] text-bone/90"
            >
              {SITE.claim}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-5 max-w-md text-sm leading-relaxed text-bone/55"
            >
              Cuatro sillas en Col. Americana. Se trabaja con cita y sin prisa.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="mt-9 flex flex-col gap-3 xs:flex-row"
            >
              <Magnetic strength={0.2}>
                <Button tone="brass" size="lg" onClick={() => openBooking()} full>
                  Agendar cita
                </Button>
              </Magnetic>
              <a
                href="#servicios"
                className="group flex h-14 items-center justify-center gap-3 border border-bone/25 px-9 text-[0.75rem] font-medium uppercase tracking-[0.22em] transition-colors duration-500 hover:border-bone/60 xs:justify-start"
              >
                Ver servicios
                <svg
                  viewBox="0 0 16 16"
                  className="h-3 w-3 transition-transform duration-500 ease-[var(--ease-filo)] group-hover:translate-y-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M8 2v12M3 9l5 5 5-5" strokeLinecap="square" />
                </svg>
              </a>
            </motion.div>
          </div>

          {/* Riel lateral: la información de servicio sin robarle sitio al titular */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
            className="hidden shrink-0 text-right lg:block"
          >
            <dl className="space-y-5 border-r border-bone/15 pr-6 text-right">
              <div>
                <dt className="label text-ash">Hoy</dt>
                <dd className="mt-1.5 text-sm text-bone/85">10:00 — 20:00</dd>
              </div>
              <div>
                <dt className="label text-ash">Dónde</dt>
                <dd className="mt-1.5 text-sm leading-snug text-bone/85">
                  {SITE.address.street}
                  <br />
                  {SITE.address.district}
                </dd>
              </div>
              <div>
                <dt className="label text-ash">Reservas</dt>
                <dd className="mt-1.5">
                  <a
                    href={SITE.phoneHref}
                    className="text-sm text-bone/85 transition-colors duration-300 hover:text-brass"
                  >
                    {SITE.phone}
                  </a>
                </dd>
              </div>
            </dl>
          </motion.aside>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{ opacity: fade }}
        className="pointer-events-none absolute bottom-6 right-5 hidden items-center gap-3 sm:right-8 sm:flex lg:right-12"
        aria-hidden
      >
        <span className="label text-ash">Desliza</span>
        <span className="relative block h-10 w-px overflow-hidden bg-bone/15">
          <motion.span
            className="absolute inset-x-0 top-0 block h-4 bg-brass"
            animate={{ y: [-16, 40] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
