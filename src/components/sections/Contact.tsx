"use client";

import { useBooking } from "@/components/booking/BookingProvider";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { RevealImage } from "@/components/ui/RevealImage";
import { SectionHead } from "@/components/ui/SectionHead";
import { IMG } from "@/data/images";
import { SITE } from "@/data/site";
import { whatsappUrl } from "@/lib/calendar";

const MAP_EMBED =
  "https://www.google.com/maps?q=Av.%20Chapultepec%20Sur%20215%2C%20Americana%2C%20Guadalajara%2C%20Jalisco&z=16&output=embed";

export function Contact() {
  const { openBooking } = useBooking();

  return (
    <section id="contacto" className="relative scroll-mt-20">
      <div className="mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHead
              index="08"
              label="Dónde estamos"
              title="Segundo patio,"
              titleAccent="puerta de madera."
            />

            <div className="mt-12 space-y-10">
              <div>
                <h3 className="label text-ash">Dirección</h3>
                <address className="mt-4 not-italic leading-relaxed">
                  {SITE.address.street}
                  <br />
                  {SITE.address.district}, {SITE.address.zip}
                  <br />
                  {SITE.address.city}
                </address>
                <p className="mt-3 text-sm text-ash">{SITE.address.note}</p>
                <a
                  href={SITE.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label mt-4 inline-flex items-center gap-2 text-brass underline decoration-brass/30 underline-offset-4 transition-colors duration-300 hover:decoration-brass"
                >
                  Cómo llegar <span aria-hidden>&#8599;</span>
                </a>
              </div>

              <div>
                <h3 className="label text-ash">Horario</h3>
                <dl className="mt-4 divide-y divide-bone/8 border-y border-bone/8">
                  {SITE.hours.map((row) => (
                    <div key={row.days} className="flex items-baseline justify-between gap-4 py-3">
                      <dt className={row.closed ? "text-ash/50" : ""}>{row.days}</dt>
                      <dd
                        className={`tabular-nums ${
                          row.closed ? "text-ash/50" : "text-bone/85"
                        }`}
                      >
                        {row.time}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-ash/60">
                  Última cita una hora antes del cierre.
                </p>
              </div>

              <div>
                <h3 className="label text-ash">Contacto</h3>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <a
                      href={SITE.phoneHref}
                      className="transition-colors duration-300 hover:text-brass"
                    >
                      {SITE.phone}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="text-ash transition-colors duration-300 hover:text-brass"
                    >
                      {SITE.email}
                    </a>
                  </li>
                </ul>

                <div className="mt-7 flex flex-col gap-3 xs:flex-row">
                  <Button tone="brass" onClick={() => openBooking()}>
                    Agendar cita
                  </Button>
                  <a
                    href={whatsappUrl(
                      "Hola Casa Filo, quiero preguntar por disponibilidad.",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center border border-bone/20 px-7 text-[0.6875rem] font-medium uppercase tracking-[0.22em] transition-colors duration-400 hover:border-brass hover:text-brass"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <RevealImage
              src={IMG.neon}
              alt="El letrero de neón de la entrada encendido de noche"
              sizes="(max-width: 1024px) 100vw, 55vw"
              frame="aspect-[16/10] w-full sm:aspect-[16/9]"
              from="up"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <figcaption className="absolute bottom-0 left-0 p-5">
                <span className="label text-bone/70">
                  Viernes · cerramos a las 21:00
                </span>
              </figcaption>
            </RevealImage>

            <Reveal delay={0.1} className="mt-4">
              <div className="relative aspect-[16/10] w-full overflow-hidden border border-bone/10 bg-carbon sm:aspect-[16/8]">
                {/* El mapa llega en claro; se invierte y se rota el matiz para
                    pasarlo a oscuro sin perder la legibilidad de las calles. */}
                <iframe
                  src={MAP_EMBED}
                  title="Mapa con la ubicación de Casa Filo"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full invert hue-rotate-180 grayscale-[0.55] contrast-[0.88] brightness-[0.92] saturate-[0.7]"
                  style={{ border: 0 }}
                />
                {/* Velo de latón, muy leve, para integrarlo con la paleta */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-brass/[0.06]"
                />
              </div>
              <p className="mt-3 text-xs text-ash/60">
                Hay estacionamiento público sobre Robles Gil, a media cuadra.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
