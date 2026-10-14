import { NextResponse } from "next/server";

import { appointments } from "@/lib/repository";
import { computeSlots, isWithinHorizon } from "@/lib/schedule";
import type { AvailabilityResponse, BarberId, ServiceId } from "@/lib/types";
import { SERVICES } from "@/data/services";
import { BARBERS } from "@/data/barbers";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?date=2026-10-09&service=corte-barba&barber=tadeo
 *
 * La disponibilidad se calcula siempre en el servidor. El cliente nunca
 * decide qué horarios están libres.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("service") as ServiceId | null;
  const barberParam = searchParams.get("barber");
  const barberId = (barberParam && barberParam !== "any" ? barberParam : null) as
    | BarberId
    | null;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Parámetro 'date' inválido (YYYY-MM-DD)" },
      { status: 400 },
    );
  }
  if (!serviceId || !SERVICES.some((s) => s.id === serviceId)) {
    return NextResponse.json({ error: "Parámetro 'service' inválido" }, { status: 400 });
  }
  if (barberId && !BARBERS.some((b) => b.id === barberId)) {
    return NextResponse.json({ error: "Parámetro 'barber' inválido" }, { status: 400 });
  }
  if (!isWithinHorizon(date)) {
    return NextResponse.json(
      { error: "La agenda sólo acepta reservas dentro de los próximos 45 días" },
      { status: 400 },
    );
  }

  const booked = await appointments.listByDate(date);
  const { closed, closedReason, slots } = computeSlots({
    date,
    serviceId,
    barberId,
    appointments: booked,
  });

  const payload: AvailabilityResponse = {
    date,
    serviceId,
    barberId,
    closed,
    closedReason,
    slots,
  };

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
