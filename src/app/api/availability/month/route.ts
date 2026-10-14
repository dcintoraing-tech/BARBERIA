import { NextResponse } from "next/server";

import { appointments } from "@/lib/repository";
import {
  computeSlots,
  formatISODate,
  isWithinHorizon,
  todayISO,
} from "@/lib/schedule";
import type { BarberId, ServiceId } from "@/lib/types";
import { SERVICES } from "@/data/services";
import { BARBERS } from "@/data/barbers";

export const dynamic = "force-dynamic";

export interface DayAvailability {
  date: string;
  /** Horarios libres ese día para el servicio y barbero consultados */
  free: number;
  total: number;
  closed: boolean;
  reason?: string;
}

/**
 * GET /api/availability/month?month=2026-10&service=corte-sastre&barber=any
 *
 * Alimenta el calendario: cada día sabe cuántos lugares le quedan antes de
 * que el cliente lo toque.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const serviceId = searchParams.get("service") as ServiceId | null;
  const barberParam = searchParams.get("barber");
  const barberId = (barberParam && barberParam !== "any" ? barberParam : null) as
    | BarberId
    | null;

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Parámetro 'month' inválido (YYYY-MM)" }, { status: 400 });
  }
  if (!serviceId || !SERVICES.some((s) => s.id === serviceId)) {
    return NextResponse.json({ error: "Parámetro 'service' inválido" }, { status: 400 });
  }
  if (barberId && !BARBERS.some((b) => b.id === barberId)) {
    return NextResponse.json({ error: "Parámetro 'barber' inválido" }, { status: 400 });
  }

  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(year, monthIndex - 1, 1);
  const daysInMonth = new Date(year, monthIndex, 0).getDate();
  const today = todayISO();

  const days: DayAvailability[] = [];

  // Una sola lectura por día; con base de datos sería un GROUP BY por fecha.
  for (let i = 0; i < daysInMonth; i++) {
    const date = formatISODate(new Date(year, monthIndex - 1, 1 + i));

    if (date < today || !isWithinHorizon(date, today)) {
      days.push({ date, free: 0, total: 0, closed: true, reason: date < today ? "pasado" : "fuera-de-agenda" });
      continue;
    }

    const booked = await appointments.listByDate(date);
    const { closed, closedReason, slots } = computeSlots({
      date,
      serviceId,
      barberId,
      appointments: booked,
    });

    days.push({
      date,
      free: slots.filter((s) => s.available).length,
      total: slots.length,
      closed,
      reason: closedReason,
    });
  }

  return NextResponse.json(
    { month, serviceId, barberId, days },
    { headers: { "Cache-Control": "no-store" } },
  );
}
