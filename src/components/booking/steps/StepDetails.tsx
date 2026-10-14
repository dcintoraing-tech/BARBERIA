"use client";

import { useId } from "react";

import { useBooking } from "../BookingProvider";
import { StepIntro } from "./StepService";

export function StepDetails() {
  const { draft, setCustomer, fieldErrors } = useBooking();
  const { customer } = draft;

  return (
    <div>
      <StepIntro
        label="Paso 05"
        title="Tus datos"
        hint="Te mandamos el recordatorio por WhatsApp un día antes. Nada más."
      />

      <div className="mt-8 space-y-5">
        <Field
          label="Nombre completo"
          value={customer.name}
          onChange={(name) => setCustomer({ name })}
          error={fieldErrors.name}
          autoComplete="name"
          placeholder="Como quieres que te llamemos"
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Teléfono"
            value={customer.phone}
            onChange={(phone) => setCustomer({ phone })}
            error={fieldErrors.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="33 1234 5678"
            required
          />
          <Field
            label="Correo"
            value={customer.email}
            onChange={(email) => setCustomer({ email })}
            error={fieldErrors.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            required
          />
        </div>

        <Field
          label="Nota para el barbero"
          optional
          value={customer.notes ?? ""}
          onChange={(notes) => setCustomer({ notes })}
          error={fieldErrors.notes}
          multiline
          maxLength={400}
          placeholder="Referencias, remolinos, alergias a producto, si traes prisa…"
        />

        <p className="text-xs leading-relaxed text-ash/70">
          Al confirmar aceptas que te contactemos por este medio. Si no puedes
          llegar, avísanos con cuatro horas de anticipación: ese lugar lo está
          esperando alguien más.
        </p>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  inputMode?: "text" | "tel" | "email";
  autoComplete?: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  required?: boolean;
  optional?: boolean;
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  multiline,
  maxLength,
  required,
  optional,
}: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : undefined;

  const base = [
    "w-full border-0 border-b bg-transparent pb-3 pt-2 text-[0.9375rem] text-bone",
    "placeholder:text-ash/35 focus:outline-none focus:ring-0",
    "transition-colors duration-300",
    error ? "border-oxide" : "border-bone/15 focus:border-brass",
  ].join(" ");

  return (
    <div>
      <label
        htmlFor={id}
        className="label flex items-baseline justify-between text-ash"
      >
        <span>{label}</span>
        {optional && <span className="text-ash/50">Opcional</span>}
      </label>

      {multiline ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={base}
        />
      )}

      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs text-oxide">
          {error}
        </p>
      )}
    </div>
  );
}
