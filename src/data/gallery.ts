import { IMG } from "./images";

export interface GalleryShot {
  src: string;
  caption: string;
  meta: string;
  /** Peso en la retícula editorial: la composición no es uniforme a propósito */
  span: "tall" | "wide" | "sq" | "xl";
}

export const GALLERY: GalleryShot[] = [
  { src: IMG.g01, caption: "Fade cerrado", meta: "Ismael · 45 min", span: "tall" },
  { src: IMG.g03, caption: "Textura arriba, piel abajo", meta: "Bruno", span: "wide" },
  { src: IMG.g02, caption: "Línea de frente recta", meta: "Nico", span: "sq" },
  { src: IMG.g04, caption: "Perfilado a navaja", meta: "Tadeo", span: "tall" },
  { src: IMG.g05, caption: "Degradado medio", meta: "Ismael", span: "sq" },
  { src: IMG.g13, caption: "Jueves, 19:40", meta: "Salón", span: "xl" },
  { src: IMG.g06, caption: "Nuca cuadrada", meta: "Nico", span: "tall" },
  { src: IMG.g07, caption: "Contorno con navaja", meta: "Tadeo", span: "wide" },
  { src: IMG.g08, caption: "Antes del secado", meta: "Bruno", span: "sq" },
  { src: IMG.g09, caption: "Pompadour corto", meta: "Ismael", span: "tall" },
  { src: IMG.g10, caption: "Afeitado completo", meta: "Tadeo · 45 min", span: "sq" },
  { src: IMG.g11, caption: "Segunda silla", meta: "Salón", span: "wide" },
  { src: IMG.g12, caption: "Quiff con raya marcada", meta: "Nico", span: "tall" },
  { src: IMG.g14, caption: "Máquina a cero", meta: "Bruno", span: "sq" },
];
