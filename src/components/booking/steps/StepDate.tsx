"use client";

import { BARBER_BY_ID } from "@/data/barbers";
import { useBooking } from "../BookingProvider";
import { Calendar } from "../Calendar";
import { StepIntro } from "./StepService";

export function StepDate() {
  const { draft, setDate, goTo } = useBooking();
  if (!draft.serviceId) return null;

  const barber = draft.barberId ? BARBER_BY_ID[draft.barberId] : null;

  return (
    <div>
      <StepIntro
        label="Paso 03"
        title="Elige el día"
        hint={
          barber
            ? `Sólo se muestran los días que ${barber.name.split(" ")[0]} está en el local.`
            : "Los días cerrados y los llenos aparecen apagados."
        }
      />

      <div className="mt-8">
        <Calendar
          value={draft.date}
          serviceId={draft.serviceId}
          barberId={draft.barberId}
          onChange={(date) => {
            setDate(date);
            window.setTimeout(() => goTo(3), 280);
          }}
        />
      </div>
    </div>
  );
}
