import "server-only";

import type {
  Appointment,
  AppointmentStatus,
  BarberId,
  Customer,
  ServiceId,
} from "./types";
import { STATUS_TRANSITIONS } from "./types";
import {
  addDays,
  computeSlots,
  eligibleBarbers,
  generateCode,
  getService,
  isBarberFree,
  toMinutes,
  toTime,
  todayISO,
} from "./schedule";

/**
 * Repositorio de citas.
 *
 * La implementación actual guarda en memoria del proceso. La interfaz está
 * pensada para que una versión con Postgres, Supabase o Prisma entre en su
 * lugar sin tocar ni las rutas de API ni la interfaz:
 *
 *   create()      -> INSERT dentro de una transacción, con SELECT ... FOR UPDATE
 *                    sobre las citas del barbero en esa fecha.
 *   listByDate()  -> SELECT ... WHERE date = $1 AND status IN (vivas)
 *
 * Ese bloqueo pesimista es justo lo que aquí resuelve la cola de escrituras:
 * dos personas no pueden quedarse con la misma silla.
 */
export interface AppointmentRepository {
  listByDate(date: string): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  findByCode(code: string): Promise<Appointment | null>;
  create(input: CreateAppointmentInput): Promise<Appointment>;
  updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
}

export interface CreateAppointmentInput {
  serviceId: ServiceId;
  /** null = sin preferencia; la casa asigna */
  barberId: BarberId | null;
  date: string;
  time: string;
  customer: Customer;
}

export class BookingError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "BookingError";
  }
}

/* ── Implementación en memoria ──────────────────────────────────────── */

interface Store {
  appointments: Map<string, Appointment>;
  seeded: boolean;
}

// Sobrevive al hot-reload de desarrollo.
const globalStore = globalThis as unknown as { __casaFiloStore?: Store };

function store(): Store {
  if (!globalStore.__casaFiloStore) {
    globalStore.__casaFiloStore = { appointments: new Map(), seeded: false };
  }
  const s = globalStore.__casaFiloStore;
  if (!s.seeded) {
    s.seeded = true;
    seed(s);
  }
  return s;
}

/** Generador determinista: la agenda de demostración se ve igual en cada arranque. */
function lcg(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const SEED_NAMES = [
  "Ángel Murillo",
  "Diego Fuentes",
  "Pablo Arriaga",
  "Iván Cortés",
  "Santiago Rueda",
  "Héctor Palomares",
  "Gerardo Nava",
  "Luis Mariscal",
  "Omar Zepeda",
  "Fernando Aguirre",
  "Raúl Beltrán",
  "Carlos Iñiguez",
];

const SEED_SERVICES: ServiceId[] = [
  "corte-sastre",
  "corte-barba",
  "corte-sastre",
  "navaja-caliente",
  "corte-barba",
  "cadete",
  "corte-sastre",
  "ritual-executive",
];

const LIVE: AppointmentStatus[] = ["pendiente", "confirmada"];

/** Llena la agenda de los próximos 21 días para que la demostración tenga pulso. */
function seed(s: Store) {
  const start = todayISO();

  for (let d = 0; d < 21; d++) {
    const date = addDays(start, d);
    const rand = lcg(date + "|casa-filo");
    const weekday = new Date(date + "T00:00:00").getDay();
    // Viernes y sábado son los días llenos; el domingo no se abre.
    const load = weekday === 5 || weekday === 6 ? 0.6 : weekday === 0 ? 0 : 0.32;

    const barbers: BarberId[] = ["ismael", "tadeo", "bruno", "nico"];
    for (const barberId of barbers) {
      for (let minute = 600; minute < 1200; minute += 30) {
        if (rand() > load) continue;

        const serviceId = SEED_SERVICES[Math.floor(rand() * SEED_SERVICES.length)];
        const service = getService(serviceId);
        if (!service) continue;
        if (!eligibleBarbers(serviceId, date).includes(barberId)) continue;

        const end = minute + service.durationMin;
        if (end > 1200) continue;

        const existing = [...s.appointments.values()];
        if (!isBarberFree(barberId, date, minute, end, existing)) continue;

        const id = `seed-${date}-${barberId}-${minute}`;
        const name = SEED_NAMES[Math.floor(rand() * SEED_NAMES.length)];
        const stamp = new Date().toISOString();

        s.appointments.set(id, {
          id,
          code: generateCode(id),
          serviceId,
          barberId,
          autoAssigned: false,
          date,
          time: toTime(minute),
          endTime: toTime(end),
          durationMin: service.durationMin,
          price: service.price,
          status: d === 0 && minute < 780 ? "completada" : "confirmada",
          customer: {
            name,
            phone: "+52 33 0000 0000",
            email: "agenda@casafilo.mx",
          },
          createdAt: stamp,
          updatedAt: stamp,
        });
      }
    }
  }
}

class InMemoryAppointmentRepository implements AppointmentRepository {
  /** Serializa las escrituras: el equivalente en proceso a una transacción. */
  private queue: Promise<unknown> = Promise.resolve();

  private transaction<T>(fn: () => T): Promise<T> {
    const run = this.queue.then(fn, fn);
    this.queue = run.catch(() => undefined);
    return run;
  }

  async listByDate(date: string): Promise<Appointment[]> {
    return [...store().appointments.values()].filter((a) => a.date === date);
  }

  async findById(id: string): Promise<Appointment | null> {
    return store().appointments.get(id) ?? null;
  }

  async findByCode(code: string): Promise<Appointment | null> {
    const wanted = code.trim().toUpperCase();
    return [...store().appointments.values()].find((a) => a.code === wanted) ?? null;
  }

  create(input: CreateAppointmentInput): Promise<Appointment> {
    return this.transaction(() => {
      const s = store();
      const service = getService(input.serviceId);
      if (!service) {
        throw new BookingError("Servicio no encontrado", 400, "service_not_found");
      }

      const start = toMinutes(input.time);
      const end = start + service.durationMin;
      const all = [...s.appointments.values()];

      // Se recalcula contra el estado vivo: el horario pudo ocuparse mientras
      // el cliente llenaba sus datos.
      const { closed, closedReason, slots } = computeSlots({
        date: input.date,
        serviceId: input.serviceId,
        barberId: input.barberId,
        appointments: all,
      });
      if (closed) {
        throw new BookingError(closedReason ?? "Día no disponible", 409, "day_closed");
      }

      const slot = slots.find((x) => x.time === input.time);
      if (!slot) {
        throw new BookingError("Ese horario no existe en la agenda", 400, "slot_unknown");
      }
      if (!slot.available) {
        throw new BookingError("Ese horario acaba de ocuparse", 409, "slot_taken");
      }

      // "Sin preferencia": se asigna a quien tenga el día más despejado.
      let barberId = input.barberId;
      if (!barberId) {
        const load = (id: BarberId) =>
          all.filter(
            (x) => x.barberId === id && x.date === input.date && LIVE.includes(x.status),
          ).length;
        barberId = [...slot.freeBarbers].sort((a, b) => load(a) - load(b))[0];
      }
      if (!barberId || !isBarberFree(barberId, input.date, start, end, all)) {
        throw new BookingError("Ese barbero ya no está libre a esa hora", 409, "barber_busy");
      }

      const id = `apt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      const appointment: Appointment = {
        id,
        code: generateCode(),
        serviceId: input.serviceId,
        barberId,
        autoAssigned: input.barberId === null,
        date: input.date,
        time: input.time,
        endTime: toTime(end),
        durationMin: service.durationMin,
        price: service.price,
        status: "confirmada",
        customer: input.customer,
        createdAt: now,
        updatedAt: now,
      };
      s.appointments.set(id, appointment);
      return appointment;
    });
  }

  updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    return this.transaction(() => {
      const s = store();
      const current = s.appointments.get(id);
      if (!current) throw new BookingError("Cita no encontrada", 404, "not_found");

      if (!STATUS_TRANSITIONS[current.status].includes(status)) {
        throw new BookingError(
          `No se puede pasar de ${current.status} a ${status}`,
          409,
          "invalid_transition",
        );
      }

      const next: Appointment = {
        ...current,
        status,
        updatedAt: new Date().toISOString(),
      };
      s.appointments.set(id, next);
      return next;
    });
  }
}

export const appointments: AppointmentRepository = new InMemoryAppointmentRepository();
