import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Barbers } from "@/components/sections/Barbers";
import { BookingBand } from "@/components/sections/BookingBand";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { InstagramStrip } from "@/components/sections/InstagramStrip";
import { Manifesto } from "@/components/sections/Manifesto";
import { Products } from "@/components/sections/Products";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";

/**
 * El orden importa tanto como cada sección: impacto, silencio, carta, color,
 * equipo, trabajo, luz, voz, reserva, dirección.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Services />
        <Experience />
        <Barbers />
        <Gallery />
        <Products />
        <Testimonials />
        <BookingBand />
        <InstagramStrip />
        <Contact />
      </main>
      <Footer />
      <StructuredData />
    </>
  );
}

/** Datos estructurados: para Google esto es una barbería real con horario. */
function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: SITE.name,
    description: SITE.claim,
    telephone: SITE.phone,
    email: SITE.email,
    foundingDate: String(SITE.founded),
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      postalCode: SITE.address.zip,
      addressCountry: "MX",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "10:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday"],
        opens: "10:00",
        closes: "21:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "20:00",
      },
    ],
    sameAs: [SITE.social.instagram, SITE.social.tiktok],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios",
      itemListElement: SERVICES.map((service) => ({
        "@type": "Offer",
        name: service.name,
        price: service.price,
        priceCurrency: "MXN",
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
