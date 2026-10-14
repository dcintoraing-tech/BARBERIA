import { SITE } from "@/data/site";
import type { Appointment, Barber, Service } from "./types";

/** "2026-10-09" + "10:30" → "20261009T103000" (hora local del negocio) */
function stamp(date: string, time: string): string {
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function summary(service: Service, barber: Barber): string {
  return `${service.name} · ${SITE.nameUpper} con ${barber.name}`;
}

function description(appointment: Appointment, service: Service, barber: Barber): string {
  return [
    `Folio ${appointment.code}`,
    `${service.name} · ${service.durationMin} min`,
    `Barbero: ${barber.name}`,
    `A nombre de ${appointment.customer.name}`,
    appointment.customer.notes ? `Nota: ${appointment.customer.notes}` : null,
    `${SITE.phone}`,
  ]
    .filter(Boolean)
    .join("\\n");
}

function location(): string {
  return `${SITE.address.street}, ${SITE.address.district}, ${SITE.address.city}`;
}

/** Archivo .ics descargable, válido para Apple Calendar y Outlook. */
export function buildIcs(
  appointment: Appointment,
  service: Service,
  barber: Barber,
): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Casa Filo//Agenda//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/Mexico_City",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:-0600",
    "TZOFFSETTO:-0600",
    "TZNAME:CST",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@casafilo.mx`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;TZID=America/Mexico_City:${stamp(appointment.date, appointment.time)}`,
    `DTEND;TZID=America/Mexico_City:${stamp(appointment.date, appointment.endTime)}`,
    `SUMMARY:${summary(service, barber)}`,
    `DESCRIPTION:${description(appointment, service, barber)}`,
    `LOCATION:${location()}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Tu cita en Casa Filo es en dos horas",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Enlace directo para quien vive en Google Calendar. */
export function googleCalendarUrl(
  appointment: Appointment,
  service: Service,
  barber: Barber,
): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary(service, barber),
    dates: `${stamp(appointment.date, appointment.time)}/${stamp(appointment.date, appointment.endTime)}`,
    details: description(appointment, service, barber).replace(/\\n/g, "\n"),
    location: location(),
    ctz: "America/Mexico_City",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Mensaje ya redactado para que el cliente sólo presione enviar. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function appointmentWhatsappMessage(
  appointment: Appointment,
  service: Service,
  barber: Barber,
  longDate: string,
): string {
  return [
    `Hola, soy ${appointment.customer.name}.`,
    `Tengo cita en Casa Filo con folio ${appointment.code}:`,
    `${service.name} con ${barber.name}, el ${longDate} a las ${appointment.time}.`,
  ].join(" ");
}
