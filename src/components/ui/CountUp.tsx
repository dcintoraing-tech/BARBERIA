"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Props {
  /** Valor final. Los no numéricos se muestran tal cual. */
  value: string;
  className?: string;
  duration?: number;
  delay?: number;
}

/** Separa "11 400" o "38 min" en número y cola. */
function split(value: string): { target: number; prefix: string; suffix: string } | null {
  const match = value.match(/^(\D*)([\d\s.,]+)(\D*)$/);
  if (!match) return null;

  // El grupo numérico se come los espacios de los lados ("38 min"); se los
  // devolvemos al prefijo y al sufijo para no perder la separación.
  const raw = match[2];
  const lead = raw.match(/^\s*/)?.[0] ?? "";
  const trail = raw.match(/\s*$/)?.[0] ?? "";
  const target = Number(raw.replace(/[\s.,]/g, ""));
  if (!Number.isFinite(target)) return null;

  return { target, prefix: match[1] + lead, suffix: trail + match[3] };
}

/** Agrupa los miles con espacio fino, como en el valor original. */
function group(n: number, original: string): string {
  const grouped = n.toLocaleString("es-MX").replace(/,/g, " ");
  return original.includes(" ") || original.includes(" ") ? grouped : String(n);
}

/**
 * Cifra que sube al entrar en pantalla. Arranca rápido y se asienta al final,
 * como un cuentakilómetros que frena.
 */
export function CountUp({ value, className, duration = 1.6, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const parsed = split(value);
  const [shown, setShown] = useState(parsed ? "0" : value);

  useEffect(() => {
    if (!inView || !parsed) return;
    if (reduced) {
      setShown(group(parsed.target, value));
      return;
    }

    let frame = 0;
    const started = performance.now() + delay * 1000;

    const tick = (now: number) => {
      const elapsed = now - started;
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, elapsed / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 4);
      setShown(group(Math.round(parsed.target * eased), value));
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // `parsed` se deriva de `value`; no hace falta en las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value, duration, delay]);

  if (!parsed) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      {parsed.prefix}
      <span className="tabular-nums">{shown}</span>
      {parsed.suffix}
    </motion.span>
  );
}
