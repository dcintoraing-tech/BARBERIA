"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { PRODUCTS } from "@/data/products";
import { money } from "@/lib/format";

const STOCK_LABEL: Record<string, string> = {
  disponible: "En mostrador",
  ultimas: "Últimas piezas",
  agotado: "Agotado",
};

/**
 * Inversión cromática: hueso sobre tinta. Aquí la página respira claro y el
 * mostrador se lee como una página de catálogo impreso.
 */
export function Products() {
  return (
    <section className="relative overflow-hidden bg-bone text-ink">
      <div className="mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            index="06"
            label="Mostrador"
            title="Cinco piezas."
            titleAccent="Formulación propia."
            tone="ink"
            className="max-w-xl"
          />
          <Reveal delay={0.1} className="max-w-xs text-sm leading-relaxed text-ink/55 lg:pb-3">
            Se hacen en lotes chicos en Tlaquepaque. Se venden en el local y, a
            partir del próximo año, también en línea.
          </Reveal>
        </div>
      </div>

      {/* Carrusel a sangre: se arrastra o se desliza con el dedo */}
      <div className="no-scrollbar -mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-24 sm:gap-7 sm:px-8 sm:pb-32 lg:px-12">
        {PRODUCTS.map((product, i) => (
          <motion.article
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.07, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="group w-[72vw] shrink-0 snap-start xs:w-[58vw] sm:w-[20rem] lg:w-[22rem]"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-ink/[0.06]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 680px"
                className="object-cover transition-transform duration-[1.1s] ease-[var(--ease-filo)] group-hover:scale-105"
              />
              {product.stock === "ultimas" && (
                <span className="label absolute left-3 top-3 bg-oxide px-2.5 py-1.5 text-bone">
                  {STOCK_LABEL[product.stock]}
                </span>
              )}
            </div>

            <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
              <h3 className="display text-2xl">{product.name}</h3>
              <span className="shrink-0 tabular-nums">{money(product.price)}</span>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-4">
              <span className="label text-ink/45">{product.line}</span>
              <span className="label text-ink/45">{product.size}</span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-ink/65">{product.note}</p>
          </motion.article>
        ))}

        {/* Cierre del carrusel: la nota del taller, no otra tarjeta */}
        <Reveal className="flex w-[72vw] shrink-0 snap-start items-center xs:w-[58vw] sm:w-[20rem] lg:w-[22rem]">
          <div className="border-l border-ink/20 pl-6">
            <p className="accent text-[clamp(1.625rem,4.4vw,2.25rem)] text-ink/80">
              Si te sobra producto al mes, te lo pusiste de más.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink/55">
              Una pomada de 100 g dura cuatro meses. Si se te acaba antes, pregúntale
              a tu barbero: casi siempre es que estás usando el triple de lo que
              necesitas.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
