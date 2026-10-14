"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { SERVICES } from "@/data/services";
import { duration, money } from "@/lib/format";
import { useBooking } from "../BookingProvider";

export function StepService() {
  const { draft, setService, goTo } = useBooking();

  return (
    <div>
      <StepIntro
        label="Paso 01"
        title="¿Qué te hacemos?"
        hint="El tiempo de cada servicio define los horarios que te vamos a mostrar."
      />

      <ul className="mt-8 divide-y divide-bone/8 border-y border-bone/8">
        {SERVICES.map((service, i) => {
          const selected = draft.serviceId === service.id;
          return (
            <motion.li
              key={service.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            >
              <button
                type="button"
                onClick={() => {
                  setService(service.id);
                  // Un toque basta: avanza solo tras confirmar visualmente.
                  // El destino es absoluto, así dos toques seguidos no saltan un paso.
                  window.setTimeout(() => goTo(1), 260);
                }}
                aria-pressed={selected}
                className="group flex w-full items-center gap-4 py-4 text-left transition-colors duration-300 hover:bg-bone/[0.03] sm:gap-6 sm:py-5"
              >
                <span
                  aria-hidden
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-sm sm:h-16 sm:w-16 ${
                    selected ? "ring-1 ring-brass" : ""
                  }`}
                >
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    sizes="140px"
                    className={`object-cover transition-all duration-700 ease-[var(--ease-filo)] group-hover:scale-110 ${
                      selected ? "saturate-100" : "saturate-[0.35] group-hover:saturate-100"
                    }`}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-3">
                    <span
                      className={`display text-xl transition-colors duration-300 sm:text-2xl ${
                        selected ? "text-brass" : "text-bone"
                      }`}
                    >
                      {service.name}
                    </span>
                    {service.featured && (
                      <span className="label hidden text-[0.5625rem] text-ash xs:inline">
                        El más pedido
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block truncate text-[0.8125rem] text-ash">
                    {service.tagline}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-sm tabular-nums sm:text-base">
                    {money(service.price)}
                  </span>
                  <span className="label mt-1 block text-ash">
                    {duration(service.durationMin)}
                  </span>
                </span>

                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    selected
                      ? "border-brass bg-brass"
                      : "border-bone/20 group-hover:border-brass/60"
                  }`}
                >
                  {selected && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3 text-ink" fill="none">
                      <path
                        d="M2.5 6.2 4.8 8.5 9.5 3.8"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="square"
                      />
                    </svg>
                  )}
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

export function StepIntro({
  label,
  title,
  hint,
}: {
  label: string;
  title: string;
  hint?: string;
}) {
  return (
    <header>
      <div className="label text-brass">{label}</div>
      <h3 className="display mt-3 text-[clamp(1.75rem,4.5vw,2.75rem)]">{title}</h3>
      {hint && <p className="mt-3 max-w-md text-sm leading-relaxed text-ash">{hint}</p>}
    </header>
  );
}
