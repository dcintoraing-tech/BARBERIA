/**
 * Dirección fotográfica de CASA FILO.
 *
 * Una sola fuente para todas las imágenes: luz baja, piel real, metal y
 * madera. Cada entrada apunta a una fotografía verificada; `u()` entrega la
 * URL base y deja que el optimizador de Next resuelva tamaño y formato.
 */
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1800`;

export const IMG = {
  // Portada y atmósfera
  heroPrincipal: u("1596728325488-58c87691e9af"),
  heroLateral: u("1604355240616-5e907f42b431"),
  manifiesto: u("1527799820374-dcf8d9d4a388"),
  neon: u("1546641082-f149d4c3c907"),

  // Servicios
  svCorte: u("1599351431408-433ef72fe40b"),
  svCorteBarba: u("1599011176306-4a96f1516d4d"),
  svNavaja: u("1553265576-8533b2cdc606"),
  svExecutive: u("1517832606299-7ae9b720a186"),
  svCadete: u("1521490214993-bfb6f7dc096d"),

  // Equipo
  brIsmael: u("1553521041-d168abd31de3"),
  brTadeo: u("1618284554746-71a7b3e923c6"),
  brBruno: u("1544225917-1bf66feace19"),
  brNico: u("1521572267360-ee0c2909d518"),

  // Galería
  g01: u("1672642150228-3fcd5826ec26"),
  g02: u("1640301133543-41fe25ad6450"),
  g03: u("1599351431202-1e0f0137899a"),
  g04: u("1532710093739-9470acff878f"),
  g05: u("1568339434343-2a640a1a9946"),
  g06: u("1599351431408-433ef72fe40b"),
  g07: u("1553265576-8533b2cdc606"),
  g08: u("1648221122323-572c13a31663"),
  g09: u("1582771498000-8ad44e6c84db"),
  g10: u("1682325741756-1b5bfea9ae1a"),
  g11: u("1605497787865-e6d4762b386f"),
  g12: u("1618049049816-43a00d5b0c3d"),
  g13: u("1512864084360-7c0c4d0a0845"),
  g14: u("1593702275687-f8b402bf1fb5"),

  // La casa
  casaSalon: u("1672257493626-038f96997ade"),
  casaSilla: u("1512690459411-b9245aed614b"),
  casaEspejos: u("1621645582931-d1d3e6564943"),
  casaBarra: u("1675599193990-33d71150902b"),
  casaPiso: u("1611313151697-d626e818dddf"),

  // Mostrador
  pPomada: u("1631438420064-8f1b2b52b2e6"),
  pAceite: u("1608571424237-381e6b43a2a7"),
  pJabon: u("1612800083994-d568da6256ba"),
  pBrocha: u("1524230616393-d6229fcd2eff"),
  pPerfume: u("1633793565780-deeea84f167b"),

  // Detalle / herramientas
  dTijeras: u("1593269211259-b2367de7dba6"),
  dMaquina: u("1678356163587-6bb3afb89679"),
  dMesa: u("1675599193741-e6f078a65fbd"),

  // Rostros
  cJulian: u("1558730234-d8b2281b0d00"),
  cRodrigo: u("1598226863630-2826f1d31532"),
  cMauricio: u("1649058047388-b49c028df9ac"),
  cEmilio: u("1653914900849-beb53df7f5ea"),
} as const;
