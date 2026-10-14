"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useState } from "react";

import { useBooking } from "@/components/booking/BookingProvider";
import { Button } from "@/components/ui/Button";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { IMG } from "@/data/images";
import { SERVICES } from "@/data/services";
import { duration, money } from "@/lib/format";
import type { ServiceId } from "@/lib/types";

export function Services() {
  const { openBooking } = useBooking();
  const [openId, setOpenId] = useState<ServiceId | null>(null);
  const [hovered, setHovered] = useState<ServiceId | null>(null);

  // Imagen que sigue al puntero mientras se recorre la carta.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 160, damping: 20, mass: 0.5 });

  const preview = hovered && !openId ? SERVICES.find((s) => s.id === hovered) : null;

  return (
    <section id="servicios" className="relative scroll-mt-20 border-t border-bone/8">
      <div className="mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <SectionHead
            index="02"
            label="La carta"
            title="Cinco servicios."
            titleAccent="Ni uno más."
            className="lg:col-span-5"
          >
            Los precios están completos: no hay cargo por lavado, por producto ni
            por &laquo;diseño&raquo;. Lo que ves es lo que se cobra en la silla.
          </SectionHead>

          {/* Detalle que llena el pie de la columna sin competir con la carta */}
          <Parallax distance={26} className="hidden lg:col-span-5 lg:col-start-1 lg:block">
            <Reveal direction="up" distance={30}>
              <figure className="mt-16 max-w-[17rem]">
                <div className="relative aspect-[5/4] overflow-hidden">
                  <Image
                    src={IMG.dTijeras}
                    alt="Tijeras de corte sobre el paño de la mesa de trabajo"
                    fill
                    sizes="(max-width: 1024px) 0px, 360px"
                    className="object-cover grayscale transition-[filter] duration-1000 hover:grayscale-0"
                  />
                </div>
                <figcaption className="mt-3 text-xs leading-relaxed text-ash/70">
                  Las tijeras de Ismael se afilan cada seis semanas con el mismo
                  señor desde 2017.
                </figcaption>
              </figure>
            </Reveal>
          </Parallax>

          <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:row-span-2 lg:pt-6">
            <ul
              className="border-t border-bone/10"
              onPointerMove={(event) => {
                if (event.pointerType !== "mouse") return;
                x.set(event.clientX);
                y.set(event.clientY);
              }}
              onPointerLeave={() => setHovered(null)}
            >
              {SERVICES.map((service, i) => {
                const isOpen = openId === service.id;
                return (
                  <li key={service.id} className="border-b border-bone/10">
                    <motion.button
                      type="button"
                      onPointerEnter={(e) =>
                        e.pointerType === "mouse" && setHovered(service.id)
                      }
                      onClick={() => setOpenId(isOpen ? null : service.id)}
                      aria-expanded={isOpen}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ delay: i * 0.06, duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                      className={`group relative flex w-full items-center gap-4 py-6 text-left transition-opacity duration-400 sm:gap-6 sm:py-7 ${
                        hovered && hovered !== service.id && !openId
                          ? "opacity-35"
                          : "opacity-100"
                      }`}
                    >
                      {/* Filete que recorre la fila al pasar el cursor */}
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brass transition-transform duration-[0.9s] ease-[var(--ease-filo)] group-hover:scale-x-100"
                      />

                      <span className="label w-6 shrink-0 text-ash transition-[color,transform] duration-500 ease-[var(--ease-filo)] group-hover:translate-x-1 group-hover:text-brass">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`display block text-[clamp(1.5rem,4.5vw,2.5rem)] leading-none transition-[transform,color] duration-600 ease-[var(--ease-filo)] ${
                            isOpen ? "text-brass" : "group-hover:translate-x-2"
                          }`}
                        >
                          {service.name}
                        </span>
                        <span className="mt-2 block text-[0.8125rem] text-ash">
                          {service.tagline}
                        </span>
                      </span>

                      <span className="shrink-0 text-right">
                        <span className="display block text-lg leading-none sm:text-2xl">
                          {money(service.price)}
                        </span>
                        <span className="label mt-2 block text-ash">
                          {duration(service.durationMin)}
                        </span>
                      </span>

                      <span
                        aria-hidden
                        className="relative ml-1 flex h-7 w-7 shrink-0 items-center justify-center sm:ml-3"
                      >
                        <span className="absolute h-px w-3.5 bg-bone/40 transition-colors duration-400 group-hover:bg-brass" />
                        <motion.span
                          className="absolute h-3.5 w-px bg-bone/40 transition-colors duration-400 group-hover:bg-brass"
                          animate={{ scaleY: isOpen ? 0 : 1, rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                        />
                      </span>
                    </motion.button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="grid gap-6 pb-8 sm:grid-cols-[13rem_1fr] sm:gap-8">
                            <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
                              <Image
                                src={service.image}
                                alt={service.name}
                                fill
                                sizes="(max-width: 640px) 100vw, 430px"
                                className="object-cover"
                              />
                            </div>

                            <div className="flex flex-col">
                              <p className="text-[0.9375rem] leading-relaxed text-bone/75">
                                {service.description}
                              </p>

                              <ul className="mt-6 space-y-2.5">
                                {service.includes.map((item) => (
                                  <li
                                    key={item}
                                    className="flex items-baseline gap-3 text-sm text-ash"
                                  >
                                    <span className="h-px w-3 shrink-0 translate-y-[-3px] bg-brass/60" aria-hidden />
                                    {item}
                                  </li>
                                ))}
                              </ul>

                              <div className="mt-7">
                                <Button
                                  tone="brass"
                                  onClick={() => openBooking({ serviceId: service.id })}
                                >
                                  Agendar {service.short}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>

            <p className="mt-7 text-xs leading-relaxed text-ash/70">
              Toca cualquier servicio para ver qué incluye. El Ritual Executive
              requiere dos días de anticipación.
            </p>
          </div>
        </div>
      </div>

      {/* Vista previa flotante, sólo con ratón */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[90] hidden lg:block"
            style={{ x: sx, y: sy }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            aria-hidden
          >
            <div className="relative h-64 w-48 -translate-x-[115%] -translate-y-1/2 overflow-hidden">
              <Image
                src={preview.image}
                alt=""
                fill
                sizes="400px"
                className="object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-bone/10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
