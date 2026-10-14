import { IMG } from "./images";
import type { Service } from "@/lib/types";

export const SERVICES: Service[] = [
  {
    id: "corte-sastre",
    name: "Corte Sastre",
    short: "Corte",
    tagline: "El corte de la casa",
    description:
      "Se mide la cabeza antes de tocarla: remolinos, nuca, línea de frente. Lavado tibio, tijera y máquina, perfilado a navaja y peinado con el producto que mejor aguante tu pelo.",
    durationMin: 45,
    price: 380,
    includes: ["Diagnóstico de cabello", "Lavado y masaje", "Perfilado a navaja", "Peinado final"],
    image: IMG.svCorte,
  },
  {
    id: "corte-barba",
    name: "Corte & Barba",
    short: "Corte + barba",
    tagline: "Lo más pedido del jueves",
    description:
      "Corte completo y barba trabajada en la misma sesión. Contorno a navaja, toalla caliente y aceite. Sales con la cara despejada y el cuello limpio.",
    durationMin: 75,
    price: 520,
    includes: ["Corte Sastre completo", "Diseño de contorno", "Toalla caliente", "Aceite de sellado"],
    image: IMG.svCorteBarba,
    featured: true,
  },
  {
    id: "navaja-caliente",
    name: "Navaja Caliente",
    short: "Barba",
    tagline: "Afeitado clásico",
    description:
      "Afeitado tradicional a navaja en tres pasadas, con jabón batido en bol y dos toallas calientes. Para barba cerrada o rostro limpio. No se hace con prisa.",
    durationMin: 45,
    price: 320,
    includes: ["Jabón batido en bol", "Tres pasadas de navaja", "Dos toallas calientes", "Bálsamo frío"],
    image: IMG.svNavaja,
  },
  {
    id: "ritual-executive",
    name: "Ritual Executive",
    short: "Executive",
    tagline: "Hora y media para ti",
    description:
      "La sesión larga. Corte, barba, exfoliación, mascarilla de carbón y masaje de cuello y hombros. Café de olla o mezcal, según la hora. Reserva con dos días de anticipación.",
    durationMin: 100,
    price: 780,
    leadDays: 2,
    includes: [
      "Corte y barba completos",
      "Exfoliación y mascarilla de carbón",
      "Masaje de cuello y hombros",
      "Café de olla o mezcal",
    ],
    image: IMG.svExecutive,
  },
  {
    id: "cadete",
    name: "Cadete",
    short: "Kids",
    tagline: "Menores de 12",
    description:
      "Para los que todavía no alcanzan el reposabrazos. Silla alta, caricatura puesta y paciencia de sobra. El primer corte se lo llevan en un sobre con su nombre.",
    durationMin: 30,
    price: 260,
    includes: ["Silla alta", "Corte a tijera o máquina", "Sobre del primer corte"],
    image: IMG.svCadete,
  },
];

export const SERVICE_BY_ID = Object.fromEntries(
  SERVICES.map((s) => [s.id, s]),
) as Record<Service["id"], Service>;
