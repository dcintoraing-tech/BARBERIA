import { IMG } from "./images";

export interface Product {
  id: string;
  name: string;
  line: string;
  note: string;
  price: number;
  size: string;
  image: string;
  stock: "disponible" | "ultimas" | "agotado";
}

/** Mostrador reducido: cinco piezas, formulación propia, hechas en Jalisco. */
export const PRODUCTS: Product[] = [
  {
    id: "pomada-01",
    name: "Pomada 01",
    line: "Acabado mate",
    note: "Base de agua. Fijación firme sin brillo. Huele a cedro y un poco a tabaco.",
    price: 320,
    size: "100 g",
    image: IMG.pPomada,
    stock: "disponible",
  },
  {
    id: "aceite-sereno",
    name: "Aceite Sereno",
    line: "Barba",
    note: "Jojoba, argán y una gota de vetiver. Tres gotas bastan para barba cerrada.",
    price: 280,
    size: "30 ml",
    image: IMG.pAceite,
    stock: "ultimas",
  },
  {
    id: "jabon-carbon",
    name: "Jabón de carbón",
    line: "Rostro y barba",
    note: "Carbón activado y avena. Limpia sin dejar la piel tirante. Dura unos dos meses.",
    price: 180,
    size: "110 g",
    image: IMG.pJabon,
    stock: "disponible",
  },
  {
    id: "brocha-tejon",
    name: "Brocha de tejón",
    line: "Afeitado",
    note: "Mango de madera de parota torneado en Tlaquepaque. Pieza por pieza.",
    price: 690,
    size: "Pieza única",
    image: IMG.pBrocha,
    stock: "disponible",
  },
  {
    id: "esencia-filo",
    name: "Esencia Filo",
    line: "Perfume",
    note: "Cuero, bergamota y humo. El que preguntan en la silla cada semana.",
    price: 850,
    size: "50 ml",
    image: IMG.pPerfume,
    stock: "ultimas",
  },
];
