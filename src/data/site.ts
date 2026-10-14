export const SITE = {
  name: "Casa Filo",
  nameUpper: "CASA FILO",
  legal: "Casa Filo Barbería S. de R.L.",
  claim: "Tu estilo habla antes que tú.",
  descriptor: "Barbería de autor",
  founded: 2016,
  address: {
    street: "Av. Chapultepec Sur 215, interior 4",
    district: "Col. Americana",
    city: "Guadalajara, Jalisco",
    zip: "44160",
    note: "Entrada por el pasaje, segundo patio.",
  },
  phone: "+52 33 1486 2290",
  phoneHref: "tel:+523314862290",
  whatsapp: "523314862290",
  email: "hola@casafilo.mx",
  hours: [
    { days: "Lunes — Jueves", time: "10:00 — 20:00", closed: false },
    { days: "Viernes", time: "10:00 — 21:00", closed: false },
    { days: "Sábado", time: "09:00 — 20:00", closed: false },
    { days: "Domingo", time: "Cerrado", closed: true },
  ],
  social: {
    instagram: "https://instagram.com/casafilo.mx",
    instagramHandle: "@casafilo.mx",
    tiktok: "https://tiktok.com/@casafilo.mx",
    tiktokHandle: "@casafilo.mx",
  },
  maps: "https://maps.google.com/?q=Av.+Chapultepec+Sur+215+Guadalajara",
} as const;

export const NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Barberos", href: "#barberos" },
  { label: "Galería", href: "#galeria" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
] as const;
