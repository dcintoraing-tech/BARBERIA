/**
 * Pruebas del motor de reservas de Casa Filo contra la API en marcha.
 * node booking.test.mjs
 */
const BASE = "http://localhost:3000";

let pass = 0;
let fail = 0;

function check(name, condition, detail) {
  if (condition) {
    pass++;
    console.log(`  ok   ${name}`);
  } else {
    fail++;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const get = (path) => fetch(BASE + path, { cache: "no-store" }).then(async (r) => ({ status: r.status, body: await r.json() }));
const post = (path, body) =>
  fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, body: await r.json() }));
const patch = (path, body) =>
  fetch(BASE + path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, body: await r.json() }));

const iso = (d) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

/** Primer día dentro de los próximos 30 cuyo día de la semana sirva */
function nextWorkday(offset, allowed = [1, 2, 3, 4, 5, 6]) {
  for (let i = offset; i < offset + 30; i++) {
    const date = iso(i);
    if (allowed.includes(new Date(date + "T00:00:00").getDay())) return date;
  }
  throw new Error("sin día hábil");
}

const customer = {
  name: "Prueba Automatizada",
  phone: "33 1234 5678",
  email: "prueba@casafilo.mx",
};

console.log("\n— Disponibilidad —");

// Tadeo sólo está de lunes a viernes; la prueba de bloqueo usa su agenda.
const workday = nextWorkday(3, [1, 2, 3, 4, 5]);
const avail = await get(`/api/availability?date=${workday}&service=corte-sastre&barber=any`);
check("200 al consultar disponibilidad", avail.status === 200, `status ${avail.status}`);
check("la respuesta trae horarios", Array.isArray(avail.body.slots) && avail.body.slots.length > 0);
check("el día abierto no viene marcado como cerrado", avail.body.closed === false);
check(
  "los horarios respetan bloques de 30 min",
  avail.body.slots.every((s) => /^\d{2}:(00|30)$/.test(s.time)),
);
check(
  "el último horario deja caber el servicio completo",
  (() => {
    const last = avail.body.slots.at(-1).time;
    const [h, m] = last.split(":").map(Number);
    return h * 60 + m + 45 <= 21 * 60;
  })(),
);

// Domingo cerrado
let sunday = null;
for (let i = 1; i < 10; i++) {
  if (new Date(iso(i) + "T00:00:00").getDay() === 0) { sunday = iso(i); break; }
}
const closed = await get(`/api/availability?date=${sunday}&service=corte-sastre&barber=any`);
check("el domingo viene cerrado", closed.body.closed === true && closed.body.slots.length === 0, JSON.stringify(closed.body).slice(0, 120));

// Fecha pasada
const past = await get(`/api/availability?date=${iso(-5)}&service=corte-sastre&barber=any`);
check("rechaza fechas pasadas", past.status === 400, `status ${past.status}`);

// Parámetros inválidos
const badService = await get(`/api/availability?date=${workday}&service=inexistente&barber=any`);
check("rechaza servicios inexistentes", badService.status === 400);

console.log("\n— Reserva y bloqueo de la silla —");

const target = await get(`/api/availability?date=${workday}&service=corte-sastre&barber=tadeo`);
const free = (target.body.slots || []).find((s) => s.available);
check("Tadeo tiene al menos un horario libre", Boolean(free), JSON.stringify(target.body).slice(0, 160));

let created = null;
if (free) {
  const res = await post("/api/appointments", {
    serviceId: "corte-sastre",
    barberId: "tadeo",
    date: workday,
    time: free.time,
    customer,
  });
  created = res.body;
  check("crea la cita (201)", res.status === 201, `status ${res.status} ${JSON.stringify(res.body).slice(0, 120)}`);
  check("la cita nace confirmada", created.status === "confirmada");
  check("devuelve folio con formato CF-XXXX", /^CF-[A-Z0-9]{4}$/.test(created.code || ""), created.code);
  check("calcula la hora de término", created.endTime === addMinutes(free.time, 45), `${created.time} → ${created.endTime}`);
  check("congela el precio", created.price === 380, String(created.price));

  // Mismo horario, mismo barbero
  const dup = await post("/api/appointments", {
    serviceId: "corte-sastre",
    barberId: "tadeo",
    date: workday,
    time: free.time,
    customer,
  });
  check("impide reservar dos veces la misma silla (409)", dup.status === 409, `status ${dup.status}`);
  check("explica que el horario se ocupó", dup.body.code === "slot_taken" || dup.body.code === "barber_busy", dup.body.code);

  // La disponibilidad ya refleja la ocupación
  const after = await get(`/api/availability?date=${workday}&service=corte-sastre&barber=tadeo`);
  const slotAfter = after.body.slots.find((s) => s.time === free.time);
  check("el horario aparece ocupado tras reservar", slotAfter && slotAfter.available === false);

  // Un servicio que se traslapa tampoco cabe
  const overlapping = await post("/api/appointments", {
    serviceId: "ritual-executive",
    barberId: "tadeo",
    date: workday,
    time: subMinutes(free.time, 30),
    customer,
  });
  check(
    "bloquea un servicio que se traslapa con la cita existente",
    overlapping.status === 409,
    `status ${overlapping.status}`,
  );
}

console.log("\n— Sin preferencia de barbero —");

const anyDay = nextWorkday(6);
const anyAvail = await get(`/api/availability?date=${anyDay}&service=corte-barba&barber=any`);
const anyFree = anyAvail.body.slots.find((s) => s.available);
let autoAssigned = null;
if (anyFree) {
  const res = await post("/api/appointments", {
    serviceId: "corte-barba",
    barberId: null,
    date: anyDay,
    time: anyFree.time,
    customer,
  });
  autoAssigned = res.body;
  check("acepta reservar sin preferencia", res.status === 201, `status ${res.status}`);
  check("asigna un barbero concreto", Boolean(autoAssigned.barberId), autoAssigned.barberId);
  check("marca la cita como asignada por la casa", autoAssigned.autoAssigned === true);
  check(
    "asigna a alguien que estaba libre en ese horario",
    anyFree.freeBarbers.includes(autoAssigned.barberId),
    `${autoAssigned.barberId} ∉ ${anyFree.freeBarbers}`,
  );
}

console.log("\n— Validación de datos —");

const invalid = await post("/api/appointments", {
  serviceId: "corte-sastre",
  barberId: null,
  date: workday,
  time: "10:00",
  customer: { name: "A", phone: "123", email: "no-es-correo" },
});
check("rechaza datos incompletos (422)", invalid.status === 422, `status ${invalid.status}`);
check("señala el nombre", Boolean(invalid.body.fields?.name));
check("señala el teléfono", Boolean(invalid.body.fields?.phone));
check("señala el correo", Boolean(invalid.body.fields?.email));

console.log("\n— Estados de la cita —");

if (created) {
  const completed = await patch(`/api/appointments/${created.id}`, { status: "completada" });
  check("confirmada → completada", completed.status === 200 && completed.body.status === "completada", `status ${completed.status}`);

  const illegal = await patch(`/api/appointments/${created.id}`, { status: "confirmada" });
  check("completada → confirmada queda prohibida (409)", illegal.status === 409, `status ${illegal.status}`);

  const unknown = await patch(`/api/appointments/${created.id}`, { status: "inventado" });
  check("rechaza estados desconocidos (400)", unknown.status === 400, `status ${unknown.status}`);

  const missing = await patch(`/api/appointments/no-existe`, { status: "cancelada" });
  check("404 si la cita no existe", missing.status === 404, `status ${missing.status}`);
}

if (autoAssigned) {
  const beforeCancel = await get(`/api/availability?date=${anyDay}&service=corte-barba&barber=${autoAssigned.barberId}`);
  const slotBusy = beforeCancel.body.slots.find((s) => s.time === autoAssigned.time);
  check("la silla está ocupada antes de cancelar", slotBusy && slotBusy.available === false);

  const cancelled = await patch(`/api/appointments/${autoAssigned.id}`, { status: "cancelada" });
  check("confirmada → cancelada", cancelled.status === 200 && cancelled.body.status === "cancelada");

  const afterCancel = await get(`/api/availability?date=${anyDay}&service=corte-barba&barber=${autoAssigned.barberId}`);
  const slotFree = afterCancel.body.slots.find((s) => s.time === autoAssigned.time);
  check("cancelar libera la silla", slotFree && slotFree.available === true);
}

console.log("\n— Consulta por folio —");
if (created) {
  const byCode = await get(`/api/appointments?code=${created.code}`);
  check("encuentra la cita por folio", byCode.status === 200 && byCode.body.id === created.id);
  const nope = await get(`/api/appointments?code=CF-ZZZZ`);
  check("404 con folio inexistente", nope.status === 404);
}

console.log("\n— Anticipación del Ritual Executive —");

const tomorrow = iso(1);
const soon = await get(`/api/availability?date=${tomorrow}&service=ritual-executive&barber=any`);
check(
  "el Executive no se puede reservar para mañana",
  soon.body.closed === true && /anticipaci/i.test(soon.body.closedReason || ""),
  JSON.stringify(soon.body).slice(0, 140),
);

const later = nextWorkday(4);
const laterRes = await get(`/api/availability?date=${later}&service=ritual-executive&barber=any`);
check(
  "el Executive sí abre pasados los dos días",
  laterRes.body.closed === false,
  JSON.stringify(laterRes.body).slice(0, 140),
);

const tooSoon = await post("/api/appointments", {
  serviceId: "ritual-executive",
  barberId: null,
  date: tomorrow,
  time: "11:00",
  customer,
});
check("la API rechaza el Executive sin anticipación (409)", tooSoon.status === 409, `status ${tooSoon.status}`);

console.log("\n— Calendario del mes —");
const month = workday.slice(0, 7);
const monthRes = await get(`/api/availability/month?month=${month}&service=corte-sastre&barber=any`);
check("200 al consultar el mes", monthRes.status === 200);
check("devuelve un registro por día", monthRes.body.days.length >= 28);
check(
  "los domingos vienen cerrados",
  monthRes.body.days
    .filter((d) => new Date(d.date + "T00:00:00").getDay() === 0 && d.date >= iso(0))
    .every((d) => d.closed === true),
);
check(
  "los días pasados vienen cerrados",
  monthRes.body.days.filter((d) => d.date < iso(0)).every((d) => d.closed === true),
);

function addMinutes(time, mins) {
  const [h, m] = time.split(":").map(Number);
  const t = h * 60 + m + mins;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function subMinutes(time, mins) {
  return addMinutes(time, -mins);
}

console.log(`\n${pass} pruebas pasadas, ${fail} fallidas\n`);
process.exit(fail > 0 ? 1 : 0);
