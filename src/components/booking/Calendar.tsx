"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import type { DayAvailability } from "@/app/api/availability/month/route";
import { MONTHS } from "@/lib/format";
import {
  BOOKING_HORIZON_DAYS,
  addDays,
  formatISODate,
  parseISODate,
  todayISO,
} from "@/lib/schedule";
import type { BarberId, ServiceId } from "@/lib/types";

interface Props {
  value: string | null;
  onChange: (date: string) => void;
  serviceId: ServiceId;
  barberId: BarberId | null;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function Calendar({ value, onChange, serviceId, barberId }: Props) {
  const today = useMemo(() => todayISO(), []);
  const limit = useMemo(() => addDays(today, BOOKING_HORIZON_DAYS), [today]);

  const [cursor, setCursor] = useState(() => {
    const base = value ? parseISODate(value) : parseISODate(today);
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const [direction, setDirection] = useState<1 | -1>(1);
  const [days, setDays] = useState<Record<string, DayAvailability>>({});
  const [loading, setLoading] = useState(true);

  const key = monthKey(cursor.year, cursor.month);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const query = new URLSearchParams({
      month: key,
      service: serviceId,
      barber: barberId ?? "any",
    });

    fetch(`/api/availability/month?${query}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data: { days?: DayAvailability[] }) => {
        const map: Record<string, DayAvailability> = {};
        for (const day of data.days ?? []) map[day.date] = day;
        setDays(map);
        setLoading(false);
      })
      .catch((error) => {
        if ((error as Error).name !== "AbortError") setLoading(false);
      });

    return () => controller.abort();
  }, [key, serviceId, barberId]);

  const grid = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const total = new Date(cursor.year, cursor.month + 1, 0).getDate();
    // La semana empieza en lunes.
    const offset = (first.getDay() + 6) % 7;
    const cells: (string | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= total; d++) {
      cells.push(formatISODate(new Date(cursor.year, cursor.month, d)));
    }
    return cells;
  }, [cursor]);

  const canGoBack = monthKey(cursor.year, cursor.month) > today.slice(0, 7);
  const canGoForward = monthKey(cursor.year, cursor.month) < limit.slice(0, 7);

  const move = (delta: 1 | -1) => {
    setDirection(delta);
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-bone/10 pb-4">
        <div className="display text-2xl capitalize sm:text-3xl">
          {MONTHS[cursor.month]}{" "}
          <span className="text-ash">{cursor.year}</span>
        </div>
        <div className="flex gap-2">
          <ArrowButton
            direction="prev"
            onClick={() => move(-1)}
            disabled={!canGoBack}
            label="Mes anterior"
          />
          <ArrowButton
            direction="next"
            onClick={() => move(1)}
            disabled={!canGoForward}
            label="Mes siguiente"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAYS.map((day, i) => (
          <div
            key={`${day}-${i}`}
            className="pb-2 text-center text-[0.625rem] font-medium uppercase tracking-[0.18em] text-ash/70"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={key}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.38, ease: [0.19, 1, 0.22, 1] }}
            className="grid grid-cols-7 gap-1 sm:gap-1.5"
          >
            {grid.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;

              const info = days[date];
              const past = date < today;
              const beyond = date > limit;
              const closed = info?.closed ?? (past || beyond);
              const free = info?.free ?? 0;
              const disabled = closed || free === 0;
              const selected = value === date;
              const isToday = date === today;

              return (
                <button
                  key={date}
                  type="button"
                  disabled={disabled || loading}
                  onClick={() => onChange(date)}
                  aria-pressed={selected}
                  aria-label={`${parseISODate(date).getDate()} de ${MONTHS[cursor.month]}${
                    disabled
                      ? ", sin disponibilidad"
                      : free === 1
                        ? ", 1 horario libre"
                        : `, ${free} horarios libres`
                  }`}
                  className={[
                    "relative flex aspect-square flex-col items-center justify-center rounded-sm border text-sm",
                    "transition-[background-color,border-color,color] duration-300 ease-[var(--ease-filo)]",
                    selected
                      ? "border-brass bg-brass text-ink"
                      : disabled
                        ? "cursor-not-allowed border-transparent text-ash/25"
                        : "border-bone/10 text-bone hover:border-brass/60 hover:bg-brass/10",
                  ].join(" ")}
                >
                  <span className={selected ? "font-medium" : ""}>
                    {parseISODate(date).getDate()}
                  </span>

                  {/* Pulso de carga: lleno, medio o libre */}
                  {!disabled && !selected && (
                    <span
                      aria-hidden
                      className={`mt-1 h-1 w-1 rounded-full ${
                        free <= 2 ? "bg-oxide" : free <= 6 ? "bg-brass/70" : "bg-bone/25"
                      }`}
                    />
                  )}
                  {isToday && !selected && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 bottom-1 h-px bg-bone/30"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/55 backdrop-blur-[1px]">
            <span className="label text-ash">Consultando agenda…</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-bone/10 pt-4 text-[0.6875rem] text-ash">
        <Legend className="bg-bone/25" text="Buena disponibilidad" />
        <Legend className="bg-brass/70" text="Pocos lugares" />
        <Legend className="bg-oxide" text="Casi lleno" />
        <span className="text-ash/60">Domingo cerrado</span>
      </div>
    </div>
  );
}

function Legend({ className, text }: { className: string; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-1 w-1 rounded-full ${className}`} aria-hidden />
      {text}
    </span>
  );
}

function ArrowButton({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center border border-bone/15 text-bone transition-colors duration-300 hover:border-brass hover:text-brass disabled:cursor-not-allowed disabled:border-bone/5 disabled:text-ash/30"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path
          d={direction === "prev" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
          strokeLinecap="square"
        />
      </svg>
    </button>
  );
}
