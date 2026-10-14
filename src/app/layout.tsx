import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif, Space_Grotesk } from "next/font/google";

import { BookingProvider } from "@/components/booking/BookingProvider";
import { BookingSheet } from "@/components/booking/BookingSheet";
import { Cursor } from "@/components/layout/Cursor";
import { Motion } from "@/components/layout/Motion";
import { Preloader } from "@/components/layout/Preloader";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SectionIndicator } from "@/components/layout/SectionIndicator";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { SITE } from "@/data/site";
import "./globals.css";

/**
 * Tres voces, un solo sistema.
 *
 * Bricolage Grotesque da el titular: grotesca contemporánea, de formas
 * ligeramente irregulares, que en caja alta y con el tracking cerrado suena a
 * streetwear caro y no a revista de moda.
 * Instrument Serif sólo aparece en cursiva, para los acentos y las citas.
 * Space Grotesk sostiene interfaz y texto corrido.
 */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-family",
  display: "swap",
});

const accent = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-accent-family",
  display: "swap",
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-family",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://casafilo.mx"),
  title: {
    default: `${SITE.name} · Barbería de autor en Guadalajara`,
    template: `%s · ${SITE.name}`,
  },
  description:
    "Barbería de autor en Col. Americana, Guadalajara. Corte, barba y afeitado a navaja con cita. Cuatro barberos, cinco servicios, sin prisa.",
  keywords: [
    "barbería Guadalajara",
    "barber shop Col. Americana",
    "afeitado a navaja",
    "corte de caballero GDL",
    "agendar cita barbería",
  ],
  authors: [{ name: SITE.legal }],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: SITE.name,
    title: `${SITE.name} · ${SITE.claim}`,
    description:
      "Barbería de autor en Col. Americana, Guadalajara. Reserva en línea con disponibilidad real.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} · ${SITE.claim}`,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${display.variable} ${accent.variable} ${sans.variable}`}>
      <body>
        <a
          href="#servicios"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400] focus:bg-brass focus:px-5 focus:py-3 focus:text-ink"
        >
          Saltar al contenido
        </a>

        <Motion>
          <BookingProvider>
            <Preloader />
            <SmoothScroll />
            <Cursor />
            <ScrollProgress />
            <SectionIndicator />
            {children}
            <BookingSheet />
          </BookingProvider>
        </Motion>
      </body>
    </html>
  );
}
