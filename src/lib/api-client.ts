import type {
  Appointment,
  AppointmentStatus,
  AvailabilityResponse,
  BarberId,
  Customer,
  ServiceId,
} from "./types";

/**
 * Único punto por el que la interfaz habla con el servidor.
 *
 * Al mover el backend fuera de Next sólo cambia `BASE`; los componentes no
 * se enteran.
 */
const BASE = "";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      (data as { error?: string } | null)?.error ?? "Error de conexión",
      response.status,
      (data as { code?: string } | null)?.code,
      (data as { fields?: Record<string, string> } | null)?.fields,
    );
  }
  return data as T;
}

export function fetchAvailability(
  params: { date: string; serviceId: ServiceId; barberId: BarberId | null },
  signal?: AbortSignal,
): Promise<AvailabilityResponse> {
  const query = new URLSearchParams({
    date: params.date,
    service: params.serviceId,
    barber: params.barberId ?? "any",
  });
  return fetch(`${BASE}/api/availability?${query}`, { signal, cache: "no-store" }).then(
    parse<AvailabilityResponse>,
  );
}

export function createAppointment(input: {
  serviceId: ServiceId;
  barberId: BarberId | null;
  date: string;
  time: string;
  customer: Customer;
}): Promise<Appointment> {
  return fetch(`${BASE}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then(parse<Appointment>);
}

export function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<Appointment> {
  return fetch(`${BASE}/api/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then(parse<Appointment>);
}

export function findAppointmentByCode(code: string): Promise<Appointment> {
  return fetch(`${BASE}/api/appointments?code=${encodeURIComponent(code)}`, {
    cache: "no-store",
  }).then(parse<Appointment>);
}
