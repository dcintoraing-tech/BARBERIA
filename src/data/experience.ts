import { IMG } from "./images";

export interface ExperienceNote {
  index: string;
  title: string;
  body: string;
}

export const EXPERIENCE_NOTES: ExperienceNote[] = [
  {
    index: "01",
    title: "Nadie te apura",
    body: "Agendamos cuatro citas menos de las que cabrían en el día. El tiempo extra es para que la silla no se sienta una línea de producción.",
  },
  {
    index: "02",
    title: "El café es de olla",
    body: "Lo hace Tere a las nueve y a las cuatro. Si llegas entre medias, hay mezcal de Tepextate en la repisa de arriba.",
  },
  {
    index: "03",
    title: "La música no se consulta",
    body: "Bruno pone los sábados. Soul, cumbia rebajada y algo de jazz cuando cae la tarde. Nunca por encima de la conversación.",
  },
  {
    index: "04",
    title: "Producto que sí usamos",
    body: "Las cinco piezas del mostrador son las mismas que están en la mesa de trabajo. No vendemos nada que no nos pongamos.",
  },
];

export const EXPERIENCE_SHOTS = {
  salon: IMG.casaSalon,
  silla: IMG.casaSilla,
  espejos: IMG.casaEspejos,
  barra: IMG.casaBarra,
  piso: IMG.casaPiso,
} as const;
