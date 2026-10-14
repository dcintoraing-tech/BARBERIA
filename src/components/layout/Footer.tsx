"use client";

import { useBooking } from "@/components/booking/BookingProvider";
import { Logo } from "@/components/brand/Logo";
import { Monogram } from "@/components/brand/Monogram";
import { NAV_LINKS, SITE } from "@/data/site";
import { SERVICES } from "@/data/services";

export function Footer() {
  const { openBooking } = useBooking();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-bone/8 bg-ink-2">
      <div className="mx-auto max-w-[100rem] px-5 pt-20 sm:px-8 lg:px-12">
        <div className="grid gap-12 pb-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo variant="horizontal" />
            <p className="mt-7 max-w-xs text-sm leading-relaxed text-ash">
              {SITE.claim} Barbería de autor en Col. Americana desde {SITE.founded}.
            </p>
            <button
              type="button"
              onClick={() => openBooking()}
              className="group mt-8 flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-brass"
            >
              <Monogram className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-filo)] group-hover:rotate-180" strokeWidth={9} />
              Agendar cita
              <span className="h-px w-8 bg-brass/40 transition-all duration-500 ease-[var(--ease-filo)] group-hover:w-14 group-hover:bg-brass" />
            </button>
          </div>

          <nav aria-label="Pie de página" className="lg:col-span-2">
            <h3 className="label text-ash">Sitio</h3>
            <ul className="mt-5 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-bone/70 transition-colors duration-300 hover:text-brass"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h3 className="label text-ash">Servicios</h3>
            <ul className="mt-5 space-y-2.5">
              {SERVICES.map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    onClick={() => openBooking({ serviceId: service.id })}
                    className="text-left text-sm text-bone/70 transition-colors duration-300 hover:text-brass"
                  >
                    {service.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="label text-ash">Contacto</h3>
            <ul className="mt-5 space-y-2.5 text-sm text-bone/70">
              <li>
                <a href={SITE.phoneHref} className="transition-colors duration-300 hover:text-brass">
                  {SITE.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="transition-colors duration-300 hover:text-brass">
                  {SITE.email}
                </a>
              </li>
              <li className="pt-2 leading-relaxed text-ash">
                {SITE.address.street}
                <br />
                {SITE.address.district}, {SITE.address.city}
              </li>
            </ul>

            <div className="mt-6 flex gap-4">
              {[
                { label: "Instagram", href: SITE.social.instagram },
                { label: "TikTok", href: SITE.social.tiktok },
                { label: "WhatsApp", href: `https://wa.me/${SITE.whatsapp}` },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label text-ash transition-colors duration-300 hover:text-brass"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Firma grande: el logotipo como cierre, recortado por el borde */}
      <div className="relative select-none overflow-hidden border-t border-bone/8">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12">
          <div
            className="display translate-y-[0.1em] whitespace-nowrap text-center text-[clamp(2.75rem,15.2vw,13.5rem)] leading-[0.78] tracking-[0.02em] text-bone/[0.05]"
            aria-hidden
          >
            CASA FILO
          </div>
        </div>
      </div>

      <div className="border-t border-bone/8">
        <div className="mx-auto flex max-w-[100rem] flex-col gap-3 px-5 py-6 text-xs text-ash/60 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>
            © {year} {SITE.legal}. Guadalajara, México.
          </p>
          <p className="text-ash/40">
            Proyecto de demostración · marca, diseño y desarrollo ficticios.
          </p>
        </div>
      </div>
    </footer>
  );
}
