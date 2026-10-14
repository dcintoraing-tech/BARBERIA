"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Scroll suave global. Respeta `prefers-reduced-motion` y se desactiva en
 * pantallas táctiles, donde el scroll nativo ya se siente mejor.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // El panel de reserva bloquea el scroll de fondo mientras está abierto.
    const onLock = (event: Event) => {
      const locked = (event as CustomEvent<boolean>).detail;
      if (locked) lenis.stop();
      else lenis.start();
    };
    window.addEventListener("casafilo:scroll-lock", onLock);

    // Los anclas de la navegación pasan por Lenis para no cortar la animación.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72, duration: 1.35 });
      history.replaceState(null, "", id);
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("casafilo:scroll-lock", onLock);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}

/** Bloquea o libera el scroll de la página (panel de reserva, menú móvil). */
export function setScrollLock(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  window.dispatchEvent(new CustomEvent("casafilo:scroll-lock", { detail: locked }));
}
