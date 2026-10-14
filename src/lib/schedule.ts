import type { Appointment, BarberId, Service, TimeSlot, Weekday } from "./types";
import { BARBERS } from "@/data/barbers";
import { SERVICES } from "@/data/services";

/** Lunes a sábado, 10:00 — 20:00. Domingo cerrado. */
export const BUSINESS_HOURS: Record<Weekday, { open: string; close: string } | null> = {
  0: null,
  1: { open: "10:00", close: "20:00" },
  2: { open: "10:00", close: "20:00" },
  3: { open: "10:00", close: "20:00" },
  4: { open: "10:00", close: "20:00" },
  5: { open: "10:00", close: "21:00" },
  6: { open: "09:00", close: "20:00" },
};

/** La agenda se abre en bloques de media hora. */
export const SLOT_STEP_MIN = 30;

/** Cuántos días hacia adelante acepta reservas la casa. */
export const BOOKING_HORIZON_DAYS = 45;

export const TIMEZONE = "America/Mexico_City";

/* ── Utilidades de fecha sin dependencias ───────────────────────────── */

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function toTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "2026-10-07" → Date local a medianoche (evita el corrimiento de UTC) */
export function parseISODate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function weekdayOf(date: string): Weekday {
  return parseISODate(date).getDay() as Weekday;
}

export function addDays(date: string, days: number): string {
  const d = parseISODate(date);
  d.setDate(d.getDate() + days);
  return formatISODate(d);
}

export function todayISO(): string {
  return formatISODate(new Date());
}

export function isPastDate(date: string, today = todayISO()): boolean {
  return date < today;
}

export function isWithinHorizon(date: string, today = todayISO()): boolean {
  return date >= today && date <= addDays(today, BOOKING_HORIZON_DAYS);
}

/* ── Reglas de agenda ───────────────────────────────────────────────── */

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

/** Barberos que trabajan ese día y dominan ese servicio. */
export function eligibleBarbers(serviceId: string, date: string): BarberId[] {
  const day = weekdayOf(date);
  return BARBERS.filter(
    (b) => b.workDays.includes(day) && b.services.includes(serviceId as never),
  ).map((b) => b.id);
}

function overlaps(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA;
}

/**
 * Un barbero está libre si ninguna de sus citas vivas (pendiente o confirmada)
 * se cruza con la ventana solicitada. Las canceladas liberan la silla.
 */
export function isBarberFree(
  barberId: BarberId,
  date: string,
  start: number,
  end: number,
  appointments: Appointment[],
): boolean {
  return !appointments.some(
    (a) =>
      a.barberId === barberId &&
      a.date === date &&
      (a.status === "pendiente" || a.status === "confirmada") &&
      overlaps(start, end, toMinutes(a.time), toMinutes(a.endTime)),
  );
}

export interface SlotComputation {
  closed: boolean;
  closedReason?: string;
  slots: TimeSlot[];
}

/**
 * Genera la rejilla de horarios de un día para un servicio dado.
 *
 * Un horario sólo aparece disponible si el servicio completo cabe antes del
 * cierre y si queda al menos un barbero elegible con la silla libre. Con
 * `barberId` se restringe a esa persona.
 */
export function computeSlots(opts: {
  date: string;
  serviceId: string;
  barberId?: BarberId | null;
  appointments: Appointment[];
  /** Minutos de anticipación mínima para reservar el mismo día */
  leadTimeMin?: number;
  now?: Date;
}): SlotComputation {
  const { date, serviceId, barberId = null, appointments } = opts;
  const leadTimeMin = opts.leadTimeMin ?? 90;
  const now = opts.now ?? new Date();

  const service = getService(serviceId);
  if (!service) return { closed: true, closedReason: "Servicio no disponible", slots: [] };

  const hours = BUSINESS_HOURS[weekdayOf(date)];
  if (!hours) return { closed: true, closedReason: "Domingo cerrado", slots: [] };

  const today = formatISODate(now);
  if (isPastDate(date, today)) {
    return { closed: true, closedReason: "Fecha pasada", slots: [] };
  }

  // Servicios largos que la casa pide reservar con días de anticipación.
  if (service.leadDays && date < addDays(today, service.leadDays)) {
    return {
      closed: true,
      closedReason: `${service.name} requiere ${service.leadDays} días de anticipación`,
      slots: [],
    };
  }

  let pool = eligibleBarbers(serviceId, date);
  if (barberId) pool = pool.filter((id) => id === barberId);

  if (pool.length === 0) {
    return { closed: true, closedReason: "Sin barberos en turno", slots: [] };
  }

  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  const isToday = date === today;
  const cutoff = isToday ? now.getHours() * 60 + now.getMinutes() + leadTimeMin : -1;

  const slots: TimeSlot[] = [];
  for (let start = open; start + service.durationMin <= close; start += SLOT_STEP_MIN) {
    const end = start + service.durationMin;
    const freeBarbers =
      start < cutoff
        ? []
        : pool.filter((id) => isBarberFree(id, date, start, end, appointments));

    slots.push({
      time: toTime(start),
      available: freeBarbers.length > 0,
      freeBarbers,
    });
  }

  return { closed: false, slots };
}

/** Folio legible, sin caracteres ambiguos (0/O, 1/I). */
export function generateCode(seed?: string): string {
  const alphabet = "ACDEFGHJKLMNPQRTUVWXY2346789";
  let out = "";
  if (seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    for (let i = 0; i < 4; i++) {
      out += alphabet[h % alphabet.length];
      h = Math.floor(h / alphabet.length) + 7919;
    }
  } else {
    for (let i = 0; i < 4; i++) {
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  return `CF-${out}`;
}
