"use client";

import Image from "next/image";

import { IMG } from "@/data/images";
import { SITE } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";

const FEED = [
  IMG.g01, IMG.dTijeras, IMG.g05, IMG.casaPiso, IMG.g07,
  IMG.dMaquina, IMG.g09, IMG.casaEspejos, IMG.g12, IMG.dMesa,
];

/** Cinta a sangre: el feed se lee de reojo, como se lee Instagram. */
export function InstagramStrip() {
  return (
    <section className="relative overflow-hidden border-y border-bone/8 py-16 sm:py-20">
      <div className="mx-auto mb-10 flex max-w-[100rem] flex-col gap-4 px-5 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:px-12">
        <Reveal>
          <div className="label text-ash">Lo de esta semana</div>
          <h2 className="display mt-3 text-[clamp(1.75rem,5vw,3rem)]">
            {SITE.social.instagramHandle}
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="flex gap-3">
          <a
            href={SITE.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-11 items-center gap-3 border border-bone/15 px-5 text-[0.6875rem] font-medium uppercase tracking-[0.22em] transition-colors duration-400 hover:border-brass hover:text-brass"
          >
            Instagram
            <span className="transition-transform duration-400 group-hover:translate-x-1">
              &#8599;
            </span>
          </a>
          <a
            href={SITE.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-11 items-center gap-3 border border-bone/15 px-5 text-[0.6875rem] font-medium uppercase tracking-[0.22em] transition-colors duration-400 hover:border-brass hover:text-brass"
          >
            TikTok
            <span className="transition-transform duration-400 group-hover:translate-x-1">
              &#8599;
            </span>
          </a>
        </Reveal>
      </div>

      <div className="relative flex">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 animate-[marquee_58s_linear_infinite] gap-3 pr-3 sm:gap-4 sm:pr-4"
          >
            {FEED.map((src, i) => (
              <a
                key={`${copy}-${i}`}
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={copy === 1 ? -1 : 0}
                className="group relative block h-40 w-40 shrink-0 overflow-hidden sm:h-56 sm:w-56"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 240px, 340px"
                  className="object-cover grayscale transition-all duration-700 ease-[var(--ease-filo)] group-hover:scale-105 group-hover:grayscale-0"
                />
                <span className="absolute inset-0 bg-ink/35 transition-colors duration-500 group-hover:bg-ink/0" />
              </a>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
