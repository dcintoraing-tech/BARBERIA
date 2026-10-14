"use client";


import { CountUp } from "@/components/ui/CountUp";
import { Marquee } from "@/components/ui/Marquee";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { RevealImage } from "@/components/ui/RevealImage";
import { SplitText } from "@/components/ui/SplitText";
import { IMG } from "@/data/images";

const FACTS = [
  { value: "2016", label: "Dos sillas prestadas" },
  { value: "4", label: "Barberos de planta" },
  { value: "11 400", label: "Cortes hasta hoy" },
  { value: "38 min", label: "Promedio en la silla" },
];

/**
 * Después del golpe del hero, silencio. Esta sección es casi sólo tipografía
 * y aire: el contraste es lo que hace que la siguiente vuelva a pegar.
 */
export function Manifesto() {
  return (
    <section className="relative overflow-hidden">
      <Marquee
        items={["Corte sastre", "Navaja caliente", "Barba", "Executive", "Cadete"]}
        speed={48}
        className="border-y border-bone/8 py-5 text-bone/15"
      />

      <div className="mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-44">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Reveal className="flex items-center gap-4">
              <span className="label text-brass">01</span>
              <span className="h-px w-8 bg-bone/15" aria-hidden />
              <span className="label text-ash">La casa</span>
            </Reveal>

            <Reveal delay={0.1} className="mt-8 space-y-5 text-[0.9375rem] leading-relaxed text-ash">
              <p>
                Abrimos en un segundo patio de la Chapultepec porque la renta de
                la calle no daba. Diez años después seguimos en el mismo local, con
                dos sillas más y la misma puerta de madera que se atora en agosto.
              </p>
              <p>
                No damos consejos de estilo que nadie pidió ni vendemos paquetes.
                Preguntamos a qué te dedicas, a qué hora te levantas y qué tanto te
                aguanta el pelo. Con eso se decide el corte.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-8 lg:pl-10">
            <h2 className="display text-[clamp(2rem,6vw,4.75rem)] leading-[1.02]">
              <SplitText text="Un corte no es un servicio." className="block" />
              <SplitText
                text="Es una decisión que cargas"
                delay={0.08}
                className="block text-bone/45"
              />
              <SplitText
                text="todos los días."
                delay={0.16}
                className="accent block text-[1.1em] text-brass"
              />
            </h2>

            <div className="mt-14 grid gap-10 sm:grid-cols-[1fr_auto] sm:items-end">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-9 sm:max-w-md">
                {FACTS.map((fact, i) => (
                  <div key={fact.value}>
                    <dt>
                      <CountUp
                        value={fact.value}
                        delay={i * 0.1}
                        className="display block text-[clamp(1.75rem,4vw,2.75rem)] leading-none text-bone"
                      />
                    </dt>
                    <Reveal as="div" delay={0.2 + i * 0.1} distance={10}>
                      <dd className="label text-ash">{fact.label}</dd>
                    </Reveal>
                  </div>
                ))}
              </dl>

              <Parallax distance={34} className="relative">
                <div className="relative">
                  <RevealImage
                    src={IMG.manifiesto}
                    alt="Brochas y herramientas sobre la mesa de trabajo"
                    sizes="(max-width: 640px) 100vw, 520px"
                    frame="aspect-[3/4] w-full sm:w-56 lg:w-64"
                    from="up"
                    imageClassName="grayscale transition-[filter] duration-1000 hover:grayscale-0"
                  />
                  <Reveal delay={0.35} distance={10}>
                    <p className="mt-3 max-w-[16rem] text-xs leading-relaxed text-ash/70">
                      La mesa de Tadeo un martes a las 9:40, antes de abrir.
                    </p>
                  </Reveal>
                </div>
              </Parallax>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
