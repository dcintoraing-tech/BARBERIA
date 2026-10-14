"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { Monogram } from "@/components/brand/Monogram";
import { BARBERS } from "@/data/barbers";
import { DAYS } from "@/lib/format";
import { useBooking } from "../BookingProvider";
import { StepIntro } from "./StepService";

const DAY_LABEL = ["D", "L", "M", "M", "J", "V", "S"];

export function StepBarber() {
  const { draft, setBarber, goTo } = useBooking();

  // Sólo quien domina el servicio elegido entra en la lista.
  const available = BARBERS.filter(
    (b) => !draft.serviceId || b.services.includes(draft.serviceId),
  );

  const choose = (id: (typeof BARBERS)[number]["id"] | null) => {
    setBarber(id);
    window.setTimeout(() => goTo(2), 260);
  };

  return (
    <div>
      <StepIntro
        label="Paso 02"
        title="¿Con quién?"
        hint="Si no tienes preferencia, te asignamos a quien tenga el día más despejado."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {available.map((barber, i) => {
          const selected = draft.barberId === barber.id;
          return (
            <motion.button
              key={barber.id}
              type="button"
              onClick={() => choose(barber.id)}
              aria-pressed={selected}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className={`group relative flex gap-4 overflow-hidden rounded-sm border p-3 text-left transition-colors duration-400 ${
                selected
                  ? "border-brass bg-brass/[0.07]"
                  : "border-bone/10 hover:border-bone/25 hover:bg-bone/[0.03]"
              }`}
            >
              <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-carbon">
                <Image
                  src={barber.image}
                  alt={barber.name}
                  fill
                  sizes="180px"
                  className={`object-cover object-top transition-all duration-700 ease-[var(--ease-filo)] group-hover:scale-105 ${
                    selected ? "" : "grayscale group-hover:grayscale-0"
                  }`}
                />
              </span>

              <span className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <span>
                  <span className="block truncate font-medium">{barber.name}</span>
                  <span className="mt-1 block text-[0.8125rem] leading-snug text-ash">
                    {barber.specialty}
                  </span>
                </span>

                <span className="mt-3 flex items-end justify-between gap-2">
                  <span className="label text-ash/70">{barber.yearsExperience} años</span>
                  <span className="flex gap-[3px]" aria-label="Días que trabaja">
                    {[1, 2, 3, 4, 5, 6].map((day) => (
                      <span
                        key={day}
                        title={DAYS[day]}
                        className={`flex h-4 w-4 items-center justify-center text-[0.5625rem] font-medium ${
                          barber.workDays.includes(day as never)
                            ? selected
                              ? "text-brass"
                              : "text-bone/55"
                            : "text-ash/20"
                        }`}
                      >
                        {DAY_LABEL[day]}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </motion.button>
          );
        })}

        <motion.button
          type="button"
          onClick={() => choose(null)}
          aria-pressed={draft.barberId === null}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: available.length * 0.05, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className={`group flex items-center gap-4 rounded-sm border border-dashed p-3 text-left transition-colors duration-400 sm:col-span-2 ${
            draft.barberId === null
              ? "border-brass bg-brass/[0.07]"
              : "border-bone/15 hover:border-bone/35 hover:bg-bone/[0.03]"
          }`}
        >
          <span className="flex h-24 w-20 shrink-0 items-center justify-center">
            <Monogram
              className={`h-8 w-8 transition-colors duration-400 ${
                draft.barberId === null ? "text-brass" : "text-ash"
              }`}
              strokeWidth={7}
            />
          </span>
          <span>
            <span className="block font-medium">Sin preferencia</span>
            <span className="mt-1 block text-[0.8125rem] leading-snug text-ash">
              La casa te asigna barbero. Verás quién te tocó antes de confirmar.
            </span>
          </span>
        </motion.button>
      </div>
    </div>
  );
}
