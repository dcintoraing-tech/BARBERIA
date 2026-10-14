"use client";

import Image from "next/image";

import { BARBER_BY_ID } from "@/data/barbers";
import { SERVICE_BY_ID } from "@/data/services";
import { duration, longDate, money } from "@/lib/format";
import { useBooking } from "../BookingProvider";
import { StepIntro } from "./StepService";

export function StepReview() {
  const { draft, goTo } = useBooking();
  if (!draft.serviceId || !draft.date || !draft.time) return null;

  const service = SERVICE_BY_ID[draft.serviceId];
  const barber = draft.barberId ? BARBER_BY_ID[draft.barberId] : null;

  return (
    <div>
      <StepIntro
        label="Paso 06"
        title="Revisa y confirma"
        hint="Todavía puedes cambiar cualquier línea."
      />

      <div className="mt-8 border-y border-bone/10">
        <div className="flex items-start gap-4 py-5">
          <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-sm">
            <Image src={service.image} alt="" fill sizes="150px" className="object-cover" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="display text-2xl">{service.name}</div>
            <p className="mt-1 text-[0.8125rem] text-ash">
              {duration(service.durationMin)} en la silla · {service.tagline.toLowerCase()}
            </p>
          </div>
          <EditButton onClick={() => goTo(0)} label="Cambiar servicio" />
        </div>

        <dl className="divide-y divide-bone/8 border-t border-bone/8">
          <Row
            term="Barbero"
            onEdit={() => goTo(1)}
            editLabel="Cambiar barbero"
            value={
              barber ? (
                <span className="flex items-center gap-2.5">
                  <span className="relative h-6 w-6 overflow-hidden rounded-full">
                    <Image src={barber.image} alt="" fill sizes="56px" className="object-cover object-top" />
                  </span>
                  {barber.name}
                </span>
              ) : (
                <span className="text-ash">Sin preferencia · la casa asigna</span>
              )
            }
          />
          <Row
            term="Fecha"
            onEdit={() => goTo(2)}
            editLabel="Cambiar fecha"
            value={
              <span className="first-letter:uppercase">{longDate(draft.date)}</span>
            }
          />
          <Row
            term="Hora"
            onEdit={() => goTo(3)}
            editLabel="Cambiar hora"
            value={<span className="tabular-nums">{draft.time} h</span>}
          />
          <Row
            term="A nombre de"
            onEdit={() => goTo(4)}
            editLabel="Cambiar datos"
            value={
              <span className="block">
                {draft.customer.name}
                <span className="mt-0.5 block text-[0.8125rem] text-ash">
                  {draft.customer.phone} · {draft.customer.email}
                </span>
              </span>
            }
          />
          {draft.customer.notes && (
            <Row
              term="Nota"
              onEdit={() => goTo(4)}
              editLabel="Cambiar nota"
              value={<span className="text-ash">{draft.customer.notes}</span>}
            />
          )}
        </dl>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <div className="label text-ash">Total a pagar en el local</div>
          <p className="mt-2 text-xs text-ash/60">Efectivo, tarjeta o transferencia.</p>
        </div>
        <div className="display text-[clamp(2rem,7vw,3rem)] leading-none text-brass">
          {money(service.price)}
        </div>
      </div>
    </div>
  );
}

function Row({
  term,
  value,
  onEdit,
  editLabel,
}: {
  term: string;
  value: React.ReactNode;
  onEdit: () => void;
  editLabel: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4">
      <dt className="label w-20 shrink-0 pt-1 text-ash sm:w-28">{term}</dt>
      <dd className="min-w-0 flex-1 text-[0.9375rem]">{value}</dd>
      <EditButton onClick={onEdit} label={editLabel} />
    </div>
  );
}

function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="label shrink-0 pt-1 text-ash underline decoration-bone/20 underline-offset-4 transition-colors duration-300 hover:text-brass hover:decoration-brass"
    >
      Cambiar
    </button>
  );
}
