"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { Monogram } from "@/components/brand/Monogram";
import { Button, ButtonLink } from "@/components/ui/Button";
import { BARBER_BY_ID } from "@/data/barbers";
import { SERVICE_BY_ID } from "@/data/services";
import { SITE } from "@/data/site";
import { updateAppointmentStatus } from "@/lib/api-client";
import {
  appointmentWhatsappMessage,
  buildIcs,
  downloadIcs,
  googleCalendarUrl,
  whatsappUrl,
} from "@/lib/calendar";
import { duration, longDate, money } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/types";

const STATUS_TONE: Record<Appointment["status"], string> = {
  pendiente: "border-brass/50 text-brass",
  confirmada: "border-brass/50 text-brass",
  completada: "border-bone/30 text-bone",
  cancelada: "border-oxide/60 text-oxide",
};

export function Confirmation({
  appointment: initial,
  onClose,
}: {
  appointment: Appointment;
  onClose: () => void;
}) {
  const [appointment, setAppointment] = useState(initial);
  const [working, setWorking] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const service = SERVICE_BY_ID[appointment.serviceId];
  const barber = BARBER_BY_ID[appointment.barberId];
  const cancelled = appointment.status === "cancelada";

  const cancel = async () => {
    setWorking(true);
    try {
      const updated = await updateAppointmentStatus(appointment.id, "cancelada");
      setAppointment(updated);
      setConfirmingCancel(false);
    } finally {
      setWorking(false);
    }
  };

  const message = appointmentWhatsappMessage(
    appointment,
    service,
    barber,
    longDate(appointment.date),
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="relative flex h-28 w-28 items-center justify-center"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Sello: dos anillos que se abren detrás de la marca */}
          {!cancelled && (
            <>
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border border-brass/40"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border border-brass/25"
                initial={{ scale: 0.4, opacity: 0.9 }}
                animate={{ scale: 1.55, opacity: 0 }}
                transition={{ delay: 0.5, duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
              />
            </>
          )}
          <Monogram
            className={`relative h-14 w-14 ${cancelled ? "text-ash" : "text-brass"}`}
            animated
            strokeWidth={5}
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          className="display mt-7 text-[clamp(2rem,6vw,3rem)]"
        >
          {cancelled ? "Cita cancelada" : "Tu cita está confirmada."}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="mt-4 max-w-sm text-sm leading-relaxed text-ash"
        >
          {cancelled
            ? "Liberamos tu lugar en la agenda. Cuando quieras volver, aquí estamos."
            : `Te esperamos en ${SITE.address.street}. Si llegas diez minutos antes, te alcanza para un café.`}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mt-7 flex items-center gap-3"
        >
          <span className="label text-ash">Folio</span>
          <span className="display text-xl tracking-[0.2em] text-bone">
            {appointment.code}
          </span>
          <span
            className={`label rounded-full border px-3 py-1.5 ${STATUS_TONE[appointment.status]}`}
          >
            {APPOINTMENT_STATUS_LABEL[appointment.status]}
          </span>
        </motion.div>
      </div>

      <motion.dl
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        className={`mt-10 divide-y divide-bone/8 border-y border-bone/10 transition-opacity duration-500 ${
          cancelled ? "opacity-40" : ""
        }`}
      >
        <Line term="Servicio" value={`${service.name} · ${duration(service.durationMin)}`} />
        <Line
          term="Barbero"
          value={`${barber.name}${appointment.autoAssigned ? " · asignado por la casa" : ""}`}
        />
        <Line term="Fecha" value={longDate(appointment.date)} capitalize />
        <Line term="Hora" value={`${appointment.time} — ${appointment.endTime} h`} />
        <Line term="A nombre de" value={appointment.customer.name} />
        {appointment.customer.notes && (
          <Line term="Nota" value={appointment.customer.notes} />
        )}
        <Line term="Total" value={money(appointment.price)} accent />
      </motion.dl>

      {!cancelled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          className="mt-8 space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ButtonLink
              href={googleCalendarUrl(appointment, service, barber)}
              target="_blank"
              rel="noopener noreferrer"
              tone="bone"
              full
            >
              Agregar al calendario
            </ButtonLink>
            <ButtonLink
              href={whatsappUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              tone="ghost"
              full
            >
              Escribir por WhatsApp
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() =>
              downloadIcs(
                `casa-filo-${appointment.code}.ics`,
                buildIcs(appointment, service, barber),
              )
            }
            className="w-full py-2 text-center text-xs text-ash underline decoration-bone/15 underline-offset-4 transition-colors duration-300 hover:text-brass hover:decoration-brass"
          >
            O descarga el archivo .ics para Apple Calendar y Outlook
          </button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.15, duration: 0.6 }}
        className="mt-10 border-t border-bone/8 pt-6"
      >
        {cancelled ? (
          <Button tone="brass" full onClick={onClose}>
            Cerrar
          </Button>
        ) : confirmingCancel ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button tone="ghost" full disabled={working} onClick={cancel}>
              {working ? "Cancelando…" : "Sí, cancelar la cita"}
            </Button>
            <Button tone="bone" full onClick={() => setConfirmingCancel(false)}>
              Mejor no
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              className="text-xs text-ash underline decoration-bone/15 underline-offset-4 transition-colors duration-300 hover:text-oxide hover:decoration-oxide"
            >
              Cancelar esta cita
            </button>
            <Button tone="brass" size="sm" onClick={onClose}>
              Listo
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Line({
  term,
  value,
  accent,
  capitalize,
}: {
  term: string;
  value: string;
  accent?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-4 py-3.5">
      <dt className="label w-24 shrink-0 text-ash sm:w-28">{term}</dt>
      <dd
        className={`min-w-0 flex-1 text-[0.9375rem] ${accent ? "text-brass" : ""} ${
          capitalize ? "first-letter:uppercase" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
