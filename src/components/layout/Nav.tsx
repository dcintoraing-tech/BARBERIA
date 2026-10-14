"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Monogram } from "@/components/brand/Monogram";
import { useBooking } from "@/components/booking/BookingProvider";
import { Magnetic } from "@/components/ui/Magnetic";
import { NAV_LINKS, SITE } from "@/data/site";
import { setScrollLock } from "./SmoothScroll";

export function Nav() {
  const { openBooking } = useBooking();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // En un ref, no en estado: esto cambia en cada evento de scroll y no debe
  // provocar un render por frame.
  const last = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    setSolid(y > 40);
    // Se esconde al bajar, vuelve al subir: el scroll nunca se siente estorbado.
    setHidden(y > 420 && y > last.current && !menuOpen);
    last.current = y;
  });

  useEffect(() => {
    setScrollLock(menuOpen);
    return () => setScrollLock(false);
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[120]"
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      >
        <div
          className={`transition-[background-color,backdrop-filter,border-color] duration-500 ${
            solid && !menuOpen
              ? "border-b border-bone/8 bg-ink/80 backdrop-blur-xl"
              : "border-b border-transparent"
          }`}
        >
          <div className="mx-auto flex h-[var(--nav-h)] max-w-[100rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
            <a
              href="#inicio"
              aria-label="Casa Filo, inicio"
              className="group relative z-10 transition-opacity duration-300 hover:opacity-80"
            >
              <Logo />
            </a>

            <nav aria-label="Principal" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="group relative block px-4 py-2 text-[0.8125rem] text-bone/70 transition-colors duration-300 hover:text-bone"
                    >
                      {link.label}
                      <span
                        aria-hidden
                        className="absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 bg-brass transition-transform duration-500 ease-[var(--ease-filo)] group-hover:scale-x-100"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              <a
                href={SITE.phoneHref}
                className="hidden text-[0.8125rem] text-bone/60 transition-colors duration-300 hover:text-brass xl:block"
              >
                {SITE.phone}
              </a>

              <Magnetic className="hidden sm:block" strength={0.22}>
                <button
                  type="button"
                  onClick={() => openBooking()}
                  className="group relative flex h-11 items-center overflow-hidden border border-brass px-6 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-brass transition-colors duration-500 hover:text-ink"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 origin-bottom scale-y-0 bg-brass transition-transform duration-500 ease-[var(--ease-filo)] group-hover:scale-y-100"
                  />
                  <span className="relative">Agendar cita</span>
                </button>
              </Magnetic>

              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                className="relative z-10 flex h-11 w-11 items-center justify-center lg:hidden"
              >
                <span className="relative block h-3 w-6">
                  <motion.span
                    className="absolute left-0 block h-px w-full bg-bone"
                    animate={menuOpen ? { top: 6, rotate: 45 } : { top: 0, rotate: 0 }}
                    transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                  />
                  <motion.span
                    className="absolute left-0 block h-px bg-bone"
                    animate={
                      menuOpen ? { top: 6, rotate: -45, width: "100%" } : { top: 12, rotate: 0, width: "65%" }
                    }
                    transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <MobileBookingBar hidden={menuOpen} />
    </>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openBooking } = useBooking();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex flex-col bg-ink lg:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="grain pointer-events-none absolute inset-0" aria-hidden />

          <nav
            aria-label="Menú móvil"
            className="relative flex flex-1 flex-col justify-center px-6 pb-28 pt-[var(--nav-h)]"
          >
            <ul>
              {NAV_LINKS.map((link, i) => (
                <li key={link.href} className="overflow-hidden border-b border-bone/8">
                  <motion.a
                    href={link.href}
                    onClick={onClose}
                    className="group flex items-baseline gap-4 py-4"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "60%", opacity: 0 }}
                    transition={{
                      delay: 0.18 + i * 0.06,
                      duration: 0.7,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                  >
                    <span className="label w-7 text-brass/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="display text-[clamp(2rem,10vw,3.25rem)] transition-colors duration-300 group-hover:text-brass">
                      {link.label}
                    </span>
                  </motion.a>
                </li>
              ))}
            </ul>

            <motion.div
              className="mt-10 flex flex-col gap-1 text-sm text-ash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <a href={SITE.phoneHref} className="transition-colors hover:text-brass">
                {SITE.phone}
              </a>
              <span>
                {SITE.address.street} · {SITE.address.district}
              </span>
              <div className="mt-4 flex gap-5">
                <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" className="label transition-colors hover:text-brass">
                  Instagram
                </a>
                <a href={SITE.social.tiktok} target="_blank" rel="noopener noreferrer" className="label transition-colors hover:text-brass">
                  TikTok
                </a>
              </div>
            </motion.div>
          </nav>

          <motion.div
            className="relative px-6 pb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            <button
              type="button"
              onClick={() => {
                onClose();
                window.setTimeout(() => openBooking(), 300);
              }}
              className="flex h-14 w-full items-center justify-center gap-3 bg-brass text-[0.75rem] font-medium uppercase tracking-[0.22em] text-ink"
            >
              <Monogram className="h-4 w-4" strokeWidth={9} />
              Agendar cita
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** En el teléfono, reservar nunca queda a más de un pulgar de distancia. */
function MobileBookingBar({ hidden }: { hidden: boolean }) {
  const { openBooking, open } = useBooking();
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 520));

  return (
    <AnimatePresence>
      {show && !hidden && !open && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:hidden"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          <button
            type="button"
            onClick={() => openBooking()}
            className="flex h-14 w-full items-center justify-between gap-3 bg-brass px-6 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-ink shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          >
            <span className="flex items-center gap-3">
              <Monogram className="h-4 w-4" strokeWidth={9} />
              Agendar cita
            </span>
            <span className="opacity-60">Mar — Sáb</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
