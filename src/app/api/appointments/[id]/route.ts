import { NextResponse } from "next/server";

import { appointments, BookingError } from "@/lib/repository";
import type { AppointmentStatus } from "@/lib/types";
import { STATUS_TRANSITIONS } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const found = await appointments.findById(id);
  if (!found) {
    return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
  }
  return NextResponse.json(found, { headers: { "Cache-Control": "no-store" } });
}

/**
 * PATCH /api/appointments/:id — mueve el estado de la cita.
 *
 * Las transiciones permitidas viven en el modelo de dominio, no aquí:
 * pendiente → confirmada | cancelada, confirmada → completada | cancelada.
 */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  let status: AppointmentStatus;
  try {
    ({ status } = (await request.json()) as { status: AppointmentStatus });
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (!status || !(status in STATUS_TRANSITIONS)) {
    return NextResponse.json({ error: "Estado desconocido" }, { status: 400 });
  }

  try {
    const updated = await appointments.updateStatus(id, status);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}
