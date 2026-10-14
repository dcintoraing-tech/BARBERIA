"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import { ApiError, createAppointment } from "@/lib/api-client";
import type { Appointment, BarberId, BookingDraft, Customer, ServiceId } from "@/lib/types";

export const STEPS = [
  { id: "servicio", label: "Servicio" },
  { id: "barbero", label: "Barbero" },
  { id: "fecha", label: "Fecha" },
  { id: "hora", label: "Hora" },
  { id: "datos", label: "Datos" },
  { id: "resumen", label: "Resumen" },
] as const;

export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;

const EMPTY_CUSTOMER: Customer = { name: "", phone: "", email: "", notes: "" };

interface State {
  open: boolean;
  step: StepIndex;
  /** Dirección del último cambio de paso, para animar en el sentido correcto */
  direction: 1 | -1;
  draft: BookingDraft;
  submitting: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  appointment: Appointment | null;
}

const INITIAL: State = {
  open: false,
  step: 0,
  direction: 1,
  draft: { serviceId: null, barberId: null, date: null, time: null, customer: EMPTY_CUSTOMER },
  submitting: false,
  error: null,
  fieldErrors: {},
  appointment: null,
};

type Action =
  | { type: "open"; serviceId?: ServiceId; barberId?: BarberId; step?: StepIndex }
  | { type: "close" }
  | { type: "reset" }
  | { type: "goto"; step: StepIndex }
  | { type: "next" }
  | { type: "back" }
  | { type: "service"; value: ServiceId }
  | { type: "barber"; value: BarberId | null }
  | { type: "date"; value: string }
  | { type: "time"; value: string }
  | { type: "customer"; value: Partial<Customer> }
  | { type: "submitting" }
  | { type: "confirmed"; appointment: Appointment }
  | { type: "failed"; message: string; fields?: Record<string, string> };

/**
 * Último paso al que el borrador da derecho. Sirve de tope para que la
 * interfaz nunca pueda quedarse en un paso sin los datos que necesita
 * (un enlace del riel, un doble toque, el botón atrás del navegador).
 */
function furthestStep(draft: BookingDraft): StepIndex {
  if (!draft.serviceId) return 0;
  if (!draft.date) return 2;
  if (!draft.time) return 3;
  return 5;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open": {
      // Si llega con servicio o barbero prellenado, arranca en el paso útil.
      const draft: BookingDraft = {
        ...INITIAL.draft,
        serviceId: action.serviceId ?? null,
        barberId: action.barberId ?? null,
      };
      const requested = action.step ?? (action.serviceId ? 1 : 0);
      const step = Math.min(requested, furthestStep(draft)) as StepIndex;
      return { ...INITIAL, open: true, step, draft };
    }
    case "close":
      return { ...state, open: false };
    case "reset":
      return { ...INITIAL };
    case "goto": {
      const step = Math.min(action.step, furthestStep(state.draft)) as StepIndex;
      return {
        ...state,
        step,
        direction: step >= state.step ? 1 : -1,
        error: null,
      };
    }
    case "next": {
      const step = Math.min(state.step + 1, furthestStep(state.draft)) as StepIndex;
      return { ...state, step, direction: 1, error: null };
    }
    case "back":
      return {
        ...state,
        step: Math.max(0, state.step - 1) as StepIndex,
        direction: -1,
        error: null,
      };

    // Cambiar de servicio o de barbero invalida el horario elegido: la
    // duración y la agenda ya no son las mismas.
    case "service":
      return {
        ...state,
        draft: { ...state.draft, serviceId: action.value, time: null },
        error: null,
      };
    case "barber":
      return {
        ...state,
        draft: { ...state.draft, barberId: action.value, time: null },
        error: null,
      };
    case "date":
      return {
        ...state,
        draft: { ...state.draft, date: action.value, time: null },
        error: null,
      };
    case "time":
      return { ...state, draft: { ...state.draft, time: action.value }, error: null };
    case "customer":
      return {
        ...state,
        draft: { ...state.draft, customer: { ...state.draft.customer, ...action.value } },
        fieldErrors: {},
      };

    case "submitting":
      return { ...state, submitting: true, error: null, fieldErrors: {} };
    case "confirmed":
      return { ...state, submitting: false, appointment: action.appointment };
    case "failed":
      return {
        ...state,
        submitting: false,
        error: action.message,
        fieldErrors: action.fields ?? {},
      };
    default:
      return state;
  }
}

interface BookingContextValue extends State {
  openBooking: (options?: { serviceId?: ServiceId; barberId?: BarberId; step?: StepIndex }) => void;
  closeBooking: () => void;
  reset: () => void;
  goTo: (step: StepIndex) => void;
  next: () => void;
  back: () => void;
  setService: (value: ServiceId) => void;
  setBarber: (value: BarberId | null) => void;
  setDate: (value: string) => void;
  setTime: (value: string) => void;
  setCustomer: (value: Partial<Customer>) => void;
  submit: () => Promise<void>;
  canAdvance: boolean;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const submit = useCallback(async () => {
    const { serviceId, barberId, date, time, customer } = state.draft;
    if (!serviceId || !date || !time) return;

    dispatch({ type: "submitting" });
    try {
      const appointment = await createAppointment({
        serviceId,
        barberId,
        date,
        time,
        customer,
      });
      dispatch({ type: "confirmed", appointment });
    } catch (error) {
      if (error instanceof ApiError) {
        // El reposicionamiento va primero: mover de paso limpia el error, así
        // que el mensaje se emite al final para que siga visible.
        if (error.code === "slot_taken" || error.code === "barber_busy") {
          // Se suelta el horario tomado y se vuelve a la rejilla actualizada.
          dispatch({ type: "date", value: date });
          dispatch({ type: "goto", step: 3 });
        } else if (error.fields) {
          dispatch({ type: "goto", step: 4 });
        }
        dispatch({ type: "failed", message: error.message, fields: error.fields });
      } else {
        dispatch({ type: "failed", message: "No pudimos conectar con la agenda" });
      }
    }
  }, [state.draft]);

  const canAdvance = useMemo(() => {
    const { serviceId, date, time, customer } = state.draft;
    switch (state.step) {
      case 0:
        return serviceId !== null;
      case 1:
        return true; // "Sin preferencia" es una respuesta válida
      case 2:
        return date !== null;
      case 3:
        return time !== null;
      case 4:
        return (
          customer.name.trim().length >= 3 &&
          /^\+?[\d\s()-]{10,20}$/.test(customer.phone.trim()) &&
          /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email.trim())
        );
      default:
        return true;
    }
  }, [state.draft, state.step]);

  const value = useMemo<BookingContextValue>(
    () => ({
      ...state,
      canAdvance,
      openBooking: (options) => dispatch({ type: "open", ...options }),
      closeBooking: () => dispatch({ type: "close" }),
      reset: () => dispatch({ type: "reset" }),
      goTo: (step) => dispatch({ type: "goto", step }),
      next: () => dispatch({ type: "next" }),
      back: () => dispatch({ type: "back" }),
      setService: (value) => dispatch({ type: "service", value }),
      setBarber: (value) => dispatch({ type: "barber", value }),
      setDate: (value) => dispatch({ type: "date", value }),
      setTime: (value) => dispatch({ type: "time", value }),
      setCustomer: (value) => dispatch({ type: "customer", value }),
      submit,
    }),
    [state, canAdvance, submit],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking debe usarse dentro de <BookingProvider>");
  }
  return context;
}
