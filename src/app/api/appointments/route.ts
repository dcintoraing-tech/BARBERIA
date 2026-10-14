import { NextResponse } from "next/server";

import { appointments, BookingError } from "@/lib/repository";
import { isWithinHorizon } from "@/lib/schedule";
import type { BarberId, ServiceId } from "@/lib/types";
import { SERVICES } from "@/data/services";
import { BARBERS } from "@/data/barbers";

export const dynamic = "force-dynamic";

interface Body {
  serviceId?: string;
  barberId?: string | null;
  date?: string;
  time?: string;
  customer?: { name?: string; phone?: string; email?: string; notes?: string };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Al menos 10 dígitos, con o sin lada internacional. */
const PHONE = /^\+?[\d\s()-]{10,20}$/;

/** POST /api/appointments — crea la cita y devuelve el folio. */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const errors: Record<string, string> = {};

  const serviceId = body.serviceId as ServiceId | undefined;
  if (!serviceId || !SERVICES.some((s) => s.id === serviceId)) {
    errors.serviceId = "Elige un servicio";
  }

  const barberId = (body.barberId ?? null) as BarberId | null;
  if (barberId && !BARBERS.some((b) => b.id === barberId)) {
    errors.barberId = "Barbero no disponible";
  }

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date) || !isWithinHorizon(body.date)) {
    errors.date = "Elige una fecha válida";
  }
  if (!body.time || !/^\d{2}:\d{2}$/.test(body.time)) {
    errors.time = "Elige un horario";
  }

  const name = body.customer?.name?.trim() ?? "";
  const phone = body.customer?.phone?.trim() ?? "";
  const email = body.customer?.email?.trim() ?? "";
  const notes = body.customer?.notes?.trim() ?? "";

  if (name.length < 3) errors.name = "Escribe tu nombre completo";
  if (!PHONE.test(phone)) errors.phone = "Teléfono a 10 dígitos";
  if (!EMAIL.test(email)) errors.email = "Correo inválido";
  if (notes.length > 400) errors.notes = "Máximo 400 caracteres";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Datos incompletos", fields: errors }, { status: 422 });
  }

  try {
    const appointment = await appointments.create({
      serviceId: serviceId!,
      barberId,
      date: body.date!,
      time: body.time!,
      customer: { name, phone, email, notes: notes || undefined },
    });
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: "No se pudo agendar" }, { status: 500 });
  }
}

/** GET /api/appointments?code=CF-7K2Q — consulta de folio. */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Falta el folio" }, { status: 400 });
  }
  const found = await appointments.findByCode(code);
  if (!found) {
    return NextResponse.json({ error: "Folio no encontrado" }, { status: 404 });
  }
  return NextResponse.json(found, { headers: { "Cache-Control": "no-store" } });
}
