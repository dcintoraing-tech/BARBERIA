"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

import { Monogram } from "@/components/brand/Monogram";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/useDialog";
import { BARBER_BY_ID } from "@/data/barbers";
import { SERVICE_BY_ID } from "@/data/services";
import { IMG } from "@/data/images";
import { SITE } from "@/data/site";
import { duration, money, shortDate } from "@/lib/format";
import { Confirmation } from "./Confirmation";
import { STEPS, useBooking, type StepIndex } from "./BookingProvider";
import { StepBarber } from "./steps/StepBarber";
import { StepDate } from "./steps/StepDate";
import { StepDetails } from "./steps/StepDetails";
import { StepReview } from "./steps/StepReview";
import { StepService } from "./steps/StepService";
import { StepTime } from "./steps/StepTime";

export function BookingSheet() {
  const booking = useBooking();
  const {
    open,
    step,
    direction,
    draft,
    appointment,
    submitting,
    error,
    canAdvance,
    closeBooking,
    reset,
    goTo,
    next,
    back,
    submit,
  } = booking;

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => closeBooking(), [closeBooking]);
  useDialog(open, dismiss, panelRef);

  // Cada paso empieza arriba: en el teléfono, si no, se abre a medio formulario.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, appointment]);

  const service = draft.serviceId ? SERVICE_BY_ID[draft.serviceId] : null;
  const barber = draft.barberId ? BARBER_BY_ID[draft.barberId] : null;
  const cover = service?.image ?? IMG.heroLateral;

  const finish = () => {
    closeBooking();
    window.setTimeout(reset, 450);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex"
          role="dialog"
          aria-modal="true"
          aria-label="Agendar cita en Casa Filo"
        >
          <motion.div
            className="absolute inset-0 bg-ink/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeBooking}
          />

          <motion.div
            ref={panelRef}
            className="relative ml-auto flex h-full w-full flex-col bg-ink-2 shadow-[0_0_120px_rgba(0,0,0,0.6)] lg:flex-row"
            initial={{ y: "4%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "3%", opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
          >
            {appointment ? (
              <div className="flex h-full w-full flex-col overflow-y-auto">
                <TopBar onClose={finish} compact />
                <Confirmation appointment={appointment} onClose={finish} />
              </div>
            ) : (
              <>
                {/* Riel izquierdo: sólo en pantallas grandes */}
                <aside className="relative hidden w-[38%] max-w-[26rem] shrink-0 overflow-hidden border-r border-bone/8 lg:block">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={cover}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
                    >
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 860px, 1px"
                        className="object-cover opacity-45"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/35" />

                  <div className="relative flex h-full flex-col justify-between p-9">
                    <div className="flex items-center gap-3">
                      <Monogram className="h-7 w-7 text-brass" strokeWidth={7} />
                      <span className="display text-sm tracking-[0.26em] pl-[0.26em]">
                        CASA FILO
                      </span>
                    </div>

                    <ol className="space-y-1">
                      {STEPS.map((item, i) => {
                        const done = i < step;
                        const current = i === step;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              disabled={i > step}
                              onClick={() => goTo(i as StepIndex)}
                              className="group flex w-full items-center gap-4 py-2 text-left disabled:cursor-default"
                            >
                              <span
                                className={`label w-6 transition-colors duration-400 ${
                                  current ? "text-brass" : done ? "text-bone/50" : "text-ash/30"
                                }`}
                              >
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span
                                className={`h-px transition-all duration-500 ease-[var(--ease-filo)] ${
                                  current
                                    ? "w-10 bg-brass"
                                    : done
                                      ? "w-5 bg-bone/30"
                                      : "w-5 bg-bone/8"
                                }`}
                                aria-hidden
                              />
                              <span
                                className={`text-sm transition-colors duration-400 ${
                                  current
                                    ? "text-bone"
                                    : done
                                      ? "text-bone/55 group-hover:text-brass"
                                      : "text-ash/35"
                                }`}
                              >
                                {item.label}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>

                    <LiveSummary
                      service={service}
                      barberName={barber?.name ?? null}
                      date={draft.date}
                      time={draft.time}
                    />
                  </div>
                </aside>

                {/* Columna de contenido */}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  <TopBar onClose={closeBooking} />

                  <ProgressRail step={step} />

                  <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-9 sm:py-12">
                      <AnimatePresence>
                        {error && (
                          <motion.p
                            key="error"
                            role="alert"
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 28 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                            className="overflow-hidden border border-oxide/45 bg-oxide/10 px-4 py-3.5 text-sm"
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <AnimatePresence mode="wait" custom={direction} initial={false}>
                        <motion.div
                          key={step}
                          custom={direction}
                          initial={{ opacity: 0, x: direction * 34 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: direction * -34 }}
                          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                        >
                          {step === 0 && <StepService />}
                          {step === 1 && <StepBarber />}
                          {step === 2 && <StepDate />}
                          {step === 3 && <StepTime />}
                          {step === 4 && <StepDetails />}
                          {step === 5 && <StepReview />}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  <footer className="border-t border-bone/10 bg-ink-2/95 px-5 py-4 backdrop-blur sm:px-9">
                    <div className="mx-auto flex w-full max-w-2xl items-center gap-3">
                      <Button
                        tone="ghost"
                        onClick={back}
                        disabled={step === 0}
                        className="shrink-0"
                        aria-label="Regresar al paso anterior"
                      >
                        Atrás
                      </Button>

                      <MobileSummary
                        service={service}
                        date={draft.date}
                        time={draft.time}
                      />

                      {step < 5 ? (
                        <Button
                          tone="brass"
                          onClick={next}
                          disabled={!canAdvance}
                          className="ml-auto shrink-0"
                        >
                          Continuar
                        </Button>
                      ) : (
                        <Button
                          tone="brass"
                          onClick={submit}
                          disabled={submitting}
                          className="ml-auto shrink-0"
                        >
                          {submitting ? "Agendando…" : "Confirmar cita"}
                        </Button>
                      )}
                    </div>
                  </footer>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TopBar({ onClose, compact }: { onClose: () => void; compact?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-bone/8 px-5 py-4 sm:px-9">
      <div className={`flex items-center gap-3 ${compact ? "" : "lg:invisible"}`}>
        <Monogram className="h-6 w-6 text-brass" strokeWidth={8} />
        <span className="display text-xs tracking-[0.26em] pl-[0.26em]">CASA FILO</span>
      </div>

      <div className="flex items-center gap-5">
        <a
          href={SITE.phoneHref}
          className="hidden text-xs text-ash transition-colors duration-300 hover:text-brass sm:block"
        >
          {SITE.phone}
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="group flex h-9 w-9 items-center justify-center border border-bone/12 transition-colors duration-300 hover:border-brass"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-bone transition-colors duration-300 group-hover:text-brass" fill="none" stroke="currentColor" strokeWidth={1.4}>
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ProgressRail({ step }: { step: number }) {
  return (
    <div className="px-5 pt-5 sm:px-9 lg:hidden">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <span className="label text-brass">
            {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
          <span className="label text-ash">{STEPS[step].label}</span>
        </div>
        <div className="mt-3 h-px w-full bg-bone/10">
          <motion.div
            className="h-px bg-brass"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          />
        </div>
      </div>
    </div>
  );
}

function LiveSummary({
  service,
  barberName,
  date,
  time,
}: {
  service: { name: string; durationMin: number; price: number } | null;
  barberName: string | null;
  date: string | null;
  time: string | null;
}) {
  if (!service) {
    return (
      <p className="max-w-[16rem] text-sm leading-relaxed text-ash">
        Seis pasos. Dos minutos. Al final te damos un folio y la opción de
        guardarla en tu calendario.
      </p>
    );
  }

  return (
    <motion.dl
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-2.5 border-t border-bone/10 pt-6 text-sm"
    >
      <SummaryLine term="Servicio" value={service.name} />
      <SummaryLine term="Duración" value={duration(service.durationMin)} />
      <SummaryLine term="Barbero" value={barberName ?? "Sin preferencia"} />
      {date && <SummaryLine term="Fecha" value={shortDate(date)} />}
      {time && <SummaryLine term="Hora" value={`${time} h`} />}
      <div className="flex items-baseline justify-between border-t border-bone/10 pt-3">
        <dt className="label text-ash">Total</dt>
        <dd className="display text-xl text-brass">{money(service.price)}</dd>
      </div>
    </motion.dl>
  );
}

function SummaryLine({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="label text-ash/70">{term}</dt>
      <dd className="truncate text-right text-bone/85">{value}</dd>
    </div>
  );
}

/** En móvil el resumen vive en la barra inferior, entre los dos botones. */
function MobileSummary({
  service,
  date,
  time,
}: {
  service: { name: string; price: number } | null;
  date: string | null;
  time: string | null;
}) {
  if (!service) return null;
  return (
    <div className="hidden min-w-0 flex-1 px-2 text-center sm:block lg:hidden">
      <div className="truncate text-xs text-ash">
        {service.name}
        {date ? ` · ${shortDate(date)}` : ""}
        {time ? ` · ${time}` : ""}
      </div>
      <div className="text-sm text-brass">{money(service.price)}</div>
    </div>
  );
}
