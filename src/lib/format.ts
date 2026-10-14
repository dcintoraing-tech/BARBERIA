import { parseISODate } from "./schedule";

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function money(value: number): string {
  return MXN.format(value);
}

export function duration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const MONTHS_SHORT = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const DAYS_SHORT = ["D", "L", "M", "M", "J", "V", "S"];

export { MONTHS, MONTHS_SHORT, DAYS, DAYS_SHORT };

/** "jueves 9 de octubre" */
export function longDate(iso: string): string {
  const d = parseISODate(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

/** "Jue 9 oct" */
export function shortDate(iso: string): string {
  const d = parseISODate(iso);
  const day = DAYS[d.getDay()];
  return `${day.charAt(0).toUpperCase()}${day.slice(1, 3)} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "10:30 h" en reloj de 24 horas, como se lee en el local. */
export function clock(time: string): string {
  return `${time} h`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
