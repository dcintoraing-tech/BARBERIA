import { IMG } from "./images";

export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
  since: string;
  avatar: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Llevaba años explicando mi corte con fotos del celular. Aquí Ismael me preguntó a qué hora me levanto y cuánto tiempo le dedico al pelo en la mañana. No volví a enseñar una foto.",
    name: "Julián Ocampo",
    detail: "Arquitecto · cliente de Ismael",
    since: "Desde 2019",
    avatar: IMG.cJulian,
  },
  {
    quote:
      "Pedí el afeitado un sábado pensando que eran veinte minutos. Fueron cuarenta y cinco y salí dormido a medias. Es lo más cerca que he estado de no pensar en nada.",
    name: "Rodrigo Villaseñor",
    detail: "Cliente de Tadeo",
    since: "Desde 2021",
    avatar: IMG.cRodrigo,
  },
  {
    quote:
      "Mi hijo tenía pánico a las máquinas. Nico le dejó sostener una apagada diez minutos antes de empezar. Ahora pide él solo que lo llevemos.",
    name: "Mauricio Prado",
    detail: "Papá de un cadete",
    since: "Desde 2022",
    avatar: IMG.cMauricio,
  },
  {
    quote:
      "Lo único que les reclamo es que los viernes a las siete es imposible conseguir lugar. Ya aprendí a reservar el lunes.",
    name: "Emilio Santacruz",
    detail: "Cliente de Bruno",
    since: "Desde 2018",
    avatar: IMG.cEmilio,
  },
];
