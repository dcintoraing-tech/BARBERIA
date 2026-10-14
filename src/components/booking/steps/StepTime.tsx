"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { BARBER_BY_ID } from "@/data/barbers";
import { fetchAvailability } from "@/lib/api-client";
import { longDate } from "@/lib/format";
import { toMinutes } from "@/lib/schedule";
import type { AvailabilityResponse, TimeSlot } from "@/lib/types";
import { useBooking } from "../BookingProvider";
import { StepIntro } from "./StepService";

type Band = { id: string; label: string; from: number; to: number };

const BANDS: Band[] = [
  { id: "manana", label: "Mañana", from: 0, to: 13 * 60 },
  { id: "tarde", label: "Tarde", from: 13 * 60, to: 17 * 60 },
  { id: "noche", label: "Caída de tarde", from: 17 * 60, to: 24 * 60 },
];

export function StepTime() {
  const { draft, setTime, goTo } = useBooking();
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const { serviceId, barberId, date } = draft;

  useEffect(() => {
    if (!serviceId || !date) return;
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);

    fetchAvailability({ serviceId, barberId, date }, controller.signal)
      .then((response) => {
        setData(response);
        setLoading(false);
      })
      .catch((error) => {
        if ((error as Error).name === "AbortError") return;
        setFailed(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [serviceId, barberId, date]);

  if (!date) return null;

  const slots = data?.slots ?? [];
  const freeCount = slots.filter((s) => s.available).length;

  return (
    <div>
      <StepIntro
        label="Paso 04"
        title="A qué hora"
        hint={`${longDate(date).charAt(0).toUpperCase()}${longDate(date).slice(1)}${
          !loading && !failed ? ` · ${freeCount} horarios libres` : ""
        }`}
      />

      <div className="mt-8 space-y-7">
        {loading && <SlotSkeleton />}

        {failed && (
          <p className="border border-oxide/40 bg-oxide/10 p-4 text-sm text-bone">
            No pudimos leer la agenda. Revisa tu conexión e inténtalo otra vez.
          </p>
        )}

        {!loading && !failed && freeCount === 0 && (
          <p className="border border-bone/10 p-5 text-sm leading-relaxed text-ash">
            Ese día ya se llenó
            {barberId ? ` con ${BARBER_BY_ID[barberId].name.split(" ")[0]}` : ""}. Regresa
            al paso anterior y prueba otra fecha
            {barberId ? ", o quita la preferencia de barbero" : ""}.
          </p>
        )}

        {!loading &&
          !failed &&
          BANDS.map((band) => {
            const inBand = slots.filter((s) => {
              const m = toMinutes(s.time);
              return m >= band.from && m < band.to;
            });
            if (inBand.length === 0) return null;

            return (
              <section key={band.id}>
                <div className="flex items-center gap-4">
                  <h4 className="label text-ash">{band.label}</h4>
                  <span className="h-px flex-1 bg-bone/8" aria-hidden />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 xs:grid-cols-4 sm:grid-cols-5">
                  {inBand.map((slot, i) => (
                    <SlotButton
                      key={slot.time}
                      slot={slot}
                      index={i}
                      selected={draft.time === slot.time}
                      onSelect={() => {
                        setTime(slot.time);
                        window.setTimeout(() => goTo(4), 280);
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </div>
  );
}

function SlotButton({
  slot,
  index,
  selected,
  onSelect,
}: {
  slot: TimeSlot;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      disabled={!slot.available}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={
        slot.available ? `${slot.time} disponible` : `${slot.time} no disponible`
      }
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.3), duration: 0.4 }}
      className={[
        // Objetivo táctil holgado: en el teléfono esto se toca con el pulgar.
        "relative flex h-12 items-center justify-center rounded-sm border text-sm tabular-nums transition-colors duration-300 sm:h-11",
        selected
          ? "border-brass bg-brass font-medium text-ink"
          : slot.available
            ? "border-bone/12 text-bone hover:border-brass/60 hover:bg-brass/10"
            : "cursor-not-allowed border-transparent text-ash/25 line-through decoration-ash/25",
      ].join(" ")}
    >
      {slot.time}
    </motion.button>
  );
}

function SlotSkeleton() {
  return (
    <div className="space-y-7" aria-hidden>
      {[8, 8, 6].map((count, band) => (
        <div key={band}>
          <div className="h-2 w-20 animate-pulse rounded-full bg-bone/8" />
          <div className="mt-4 grid grid-cols-3 gap-2 xs:grid-cols-4 sm:grid-cols-5">
            {Array.from({ length: count }, (_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-sm bg-bone/[0.045] sm:h-11"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
