"use client";

import { Parallax } from "@/components/ui/Parallax";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { RevealImage } from "@/components/ui/RevealImage";
import { SplitText } from "@/components/ui/SplitText";
import { EXPERIENCE_NOTES, EXPERIENCE_SHOTS } from "@/data/experience";

/**
 * Bloque de color: el verde navaja parte la página en dos y da el respiro
 * cromático antes de la galería.
 */
export function Experience() {
  return (
    <section
      id="nosotros"
      className="relative scroll-mt-20 overflow-hidden bg-navaja"
    >
      <div className="grain pointer-events-none absolute inset-0 opacity-25" aria-hidden />

      <div className="relative mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <Reveal className="flex items-center gap-4">
              <span className="label text-brass">03</span>
              <span className="h-px w-8 bg-bone/20" aria-hidden />
              <span className="label text-bone/50">La experiencia</span>
            </Reveal>

            <h2 className="display mt-7 text-[clamp(2.5rem,8vw,6rem)] leading-[0.95]">
              <SplitText text="No es sólo" className="block" />
              <SplitText text="un corte." delay={0.08} className="accent block text-[1.1em] text-brass" />
            </h2>

            <Reveal delay={0.12} className="mt-8 max-w-md text-[0.9375rem] leading-relaxed text-bone/65">
              Entre que te sientas y te levantas pasan cuarenta minutos en los que
              nadie te pide nada. Para mucha gente es el único rato de la semana
              en que alguien se ocupa de ellos.
            </Reveal>

            <RevealGroup className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2" stagger={0.1}>
              {EXPERIENCE_NOTES.map((note) => (
                <RevealItem key={note.index}>
                  <div className="label text-brass/80">{note.index}</div>
                  <h3 className="display mt-3 text-xl">{note.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-bone/55">
                    {note.body}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          {/* Collage de tres planos a distinta velocidad. Las proporciones
              están cerca de las del negativo original para que el recorte no
              obligue a ampliar la fotografía. */}
          <div className="lg:col-span-6 lg:pl-6">
            <div className="grid grid-cols-2 items-start gap-3 sm:gap-4">
              <Parallax distance={-22} className="pt-10 sm:pt-16">
                <RevealImage
                  src={EXPERIENCE_SHOTS.silla}
                  alt="Detalle del respaldo de piel de una silla de barbero"
                  sizes="(max-width: 1024px) 50vw, 420px"
                  frame="aspect-square"
                  from="left"
                  delay={0.1}
                />
              </Parallax>

              <Parallax distance={34}>
                <RevealImage
                  src={EXPERIENCE_SHOTS.salon}
                  alt="El salón de Casa Filo al caer la tarde"
                  sizes="(max-width: 1024px) 50vw, 620px"
                  frame="aspect-[3/4]"
                  from="up"
                >
                  <figcaption className="absolute bottom-0 left-0 bg-navaja px-3.5 py-2.5">
                    <span className="label text-bone/60">Jueves · 19:40</span>
                  </figcaption>
                </RevealImage>
              </Parallax>

              <Parallax distance={16} className="col-span-2">
                <RevealImage
                  src={EXPERIENCE_SHOTS.barra}
                  alt="La barra de ladrillo y el mostrador de producto"
                  sizes="(max-width: 1024px) 100vw, 660px"
                  frame="aspect-[16/9]"
                  from="right"
                  delay={0.15}
                />
              </Parallax>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
