/**
 * Modelo de dominio de CASA FILO.
 *
 * Estos tipos son la frontera entre la interfaz y la persistencia. Hoy el
 * repositorio vive en memoria (ver `lib/repository.ts`); al conectar Postgres,
 * Supabase o cualquier otro motor sólo cambia la implementación, nunca estos
 * contratos ni los componentes que los consumen.
 */

export type ServiceId =
  | "corte-sastre"
  | "corte-barba"
  | "navaja-caliente"
  | "ritual-executive"
  | "cadete";

export type BarberId = "ismael" | "tadeo" | "bruno" | "nico";

/** 0 = domingo … 6 = sábado */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Service {
  id: ServiceId;
  name: string;
  /** Rótulo corto para pastillas y resúmenes */
  short: string;
  tagline: string;
  description: string;
  /** Minutos que el servicio ocupa la silla */
  durationMin: number;
  /** Precio en MXN */
  price: number;
  includes: string[];
  image: string;
  /** Días completos de anticipación que exige la casa para este servicio */
  leadDays?: number;
  /** Marcado en la carta como el servicio insignia */
  featured?: boolean;
}

export interface Barber {
  id: BarberId;
  name: string;
  alias: string;
  role: string;
  specialty: string;
  yearsExperience: number;
  bio: string;
  /** Lo que sólo esta persona hace en la casa */
  signature: string;
  image: string;
  portrait: string;
  services: ServiceId[];
  /** Días que se presenta a trabajar */
  workDays: Weekday[];
  instagram: string;
}

export type AppointmentStatus =
  | "pendiente"
  | "confirmada"
  | "completada"
  | "cancelada";

export interface Customer {
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  /** Folio legible que recibe el cliente: CF-7K2Q */
  code: string;
  serviceId: ServiceId;
  /** Siempre resuelto: "sin preferencia" se asigna al crear la cita */
  barberId: BarberId;
  /** El cliente no eligió barbero */
  autoAssigned: boolean;
  /** Fecha local del negocio, YYYY-MM-DD */
  date: string;
  /** Hora de inicio local, HH:mm */
  time: string;
  /** Hora de término, derivada de la duración del servicio */
  endTime: string;
  durationMin: number;
  /** Precio congelado al momento de reservar */
  price: number;
  status: AppointmentStatus;
  customer: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  /** HH:mm */
  time: string;
  available: boolean;
  /** Barberos libres en ese horario para el servicio consultado */
  freeBarbers: BarberId[];
}

export interface AvailabilityResponse {
  date: string;
  serviceId: ServiceId;
  barberId: BarberId | null;
  closed: boolean;
  /** Motivo del cierre, si aplica */
  closedReason?: string;
  slots: TimeSlot[];
}

export interface BookingDraft {
  serviceId: ServiceId | null;
  barberId: BarberId | null;
  date: string | null;
  time: string | null;
  customer: Customer;
}

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

/** Transiciones permitidas. El repositorio las valida antes de escribir. */
export const STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pendiente: ["confirmada", "cancelada"],
  confirmada: ["completada", "cancelada"],
  completada: [],
  cancelada: [],
};
