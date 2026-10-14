# CASA FILO

Sitio completo para una barbería premium ficticia, construido como demostración
profesional: marca, dirección de arte, interfaz y un sistema de citas con
disponibilidad real calculada en el servidor.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # build de producción
npm run typecheck    # TypeScript sin emitir
npm run test:booking # 42 pruebas del motor de reservas (con el servidor levantado)
npm run test:visual  # recorrido visual y responsive en Chromium (deja capturas en shots/)
```

---

## La marca

**Casa Filo** — barbería de autor en Av. Chapultepec Sur 215, Col. Americana,
Guadalajara. Abierta en 2016.

> Tu estilo habla antes que tú.

**El monograma** (`src/components/brand/Monogram.tsx`) es un arco abierto —la
**C**— atravesado por un trazo vertical que lo rebasa por arriba y por abajo: el
filo. Dos brazos cortos convierten ese trazo en **F**. Se dibuja sólo con cuatro
paths, hereda `currentColor` y se anima trazándose a sí mismo, así que la misma
pieza sirve en navbar, hero, pie, pantalla de carga y favicon sin exportar
variantes.

**Paleta** (`src/app/globals.css`, bloque `@theme`)

| Token | Valor | Uso |
| --- | --- | --- |
| `ink` | `#0b0b0c` | Fondo dominante |
| `bone` | `#ece6da` | Texto y fondo invertido del mostrador |
| `brass` | `#c2a04c` | Acento único: filetes, acentos en cursiva, acciones |
| `navaja` | `#15241f` | Bloque de color de la sección de experiencia |
| `oxide` | `#a0402a` | Avisos y señal de "casi lleno" |
| `ash` | `#8c8781` | Texto secundario |

**Tipografía** — tres voces y una regla para cada una:

| Familia | Papel | Dónde |
| --- | --- | --- |
| **Bricolage Grotesque** (`.display`) | Titulares. Grotesca contemporánea de formas algo irregulares; en caja alta y con `letter-spacing: -0.035em` suena a streetwear caro, no a revista de moda. | Nombre de la casa, titulares de sección, nombres de servicio y barbero |
| **Instrument Serif** (`.accent`) | La única cursiva del sitio. Nunca en caja alta. | Eslogan, segunda línea de cada titular, firmas de los barberos, testimonios |
| **Space Grotesk** | Interfaz y texto corrido. | Navegación, párrafos, formularios, precios |

La clase `.label` fija el rótulo de taller: 11 px, versalitas,
`letter-spacing: .24em`.

**Ritmo visual** — las secciones no se parecen entre sí a propósito: impacto
fotográfico → silencio tipográfico → carta en lista → bloque verde → retícula
desfasada → masonry editorial → **inversión a fondo hueso** → cita a toda
página → banda con parallax → cinta a sangre → contacto.

---

## Arquitectura

```
src/
├ app/
│  ├ api/
│  │  ├ availability/route.ts          GET  horarios de un día
│  │  ├ availability/month/route.ts    GET  carga de cada día del mes
│  │  ├ appointments/route.ts          POST crear · GET por folio
│  │  └ appointments/[id]/route.ts     GET  · PATCH estado
│  ├ layout.tsx · page.tsx · globals.css · icon.svg
├ components/
│  ├ brand/      Monogram, Logo
│  ├ layout/     Nav, Footer, Preloader, Cursor, SmoothScroll, Motion
│  ├ booking/    BookingProvider, BookingSheet, Calendar, Confirmation, steps/
│  ├ sections/   Hero, Manifesto, Services, Experience, Barbers, Gallery,
│  │             Products, Testimonials, BookingBand, InstagramStrip, Contact
│  └ ui/         Reveal, SplitText, Parallax, Magnetic, Marquee, Button,
│                SectionHead, useDialog
├ data/          site, services, barbers, products, testimonials, gallery,
│                experience, images
└ lib/           types, schedule, repository, api-client, calendar, format
```

Los datos de demostración viven aislados en `src/data/`. Cambiar precios,
barberos, fotografías o textos no toca ni un componente.

---

## El sistema de citas

### Flujo

Seis pasos en un panel a pantalla completa: servicio → barbero → fecha → hora →
datos → resumen, y después la confirmación con folio, alta en calendario
(Google o `.ics`) y contacto por WhatsApp.

Se puede entrar al flujo ya precargado: cada tarjeta de servicio abre el panel
en el paso 2, y cada ficha de barbero lo abre con esa persona elegida.

### Disponibilidad

**El cliente nunca decide qué está libre.** Toda la disponibilidad se calcula en
`src/lib/schedule.ts`, en el servidor:

- Horario del local por día de la semana (domingo cerrado, viernes hasta las
  21:00, sábado desde las 09:00).
- Rejilla de 30 minutos, pero un horario sólo aparece si **el servicio completo
  cabe antes del cierre** — el Ritual Executive de 100 minutos desaparece de la
  tarde mucho antes que un Cadete de 30.
- Cada barbero tiene sus días y su lista de servicios: pedir *Navaja Caliente*
  deja fuera a quien no la hace.
- Las citas vivas (`pendiente`, `confirmada`) bloquean el intervalo completo
  `[inicio, fin)`; una cancelación libera la silla de inmediato.
- Anticipación mínima de 90 minutos para el mismo día y horizonte de 45 días.

### Dos personas no pueden quedarse con la misma silla

`InMemoryAppointmentRepository.create()` serializa las escrituras y **recalcula
la disponibilidad contra el estado vivo** antes de insertar, no contra lo que el
cliente traía. Si el horario se ocupó mientras alguien llenaba sus datos, la API
responde `409 slot_taken`, la interfaz suelta ese horario y devuelve al usuario a
la rejilla ya actualizada, con el aviso visible.

Con «sin preferencia» el servidor asigna al barbero con el día más despejado y
marca la cita como `autoAssigned`, para que la confirmación diga quién tocó.

### Estados

```
pendiente ──▶ confirmada ──▶ completada
    │              │
    └──────────────┴────────▶ cancelada
```

Las transiciones válidas son parte del modelo de dominio
(`STATUS_TRANSITIONS` en `src/lib/types.ts`) y el repositorio las valida antes
de escribir: `completada → confirmada` devuelve `409`. La pantalla de
confirmación permite cancelar y se ve en vivo cómo la silla vuelve a quedar
libre.

### Listo para un backend real

`AppointmentRepository` es una interfaz. La implementación actual guarda en
memoria del proceso (con semilla determinista, así la agenda de demostración se
ve igual en cada arranque); sustituirla por Postgres, Supabase o Prisma no toca
ni las rutas de API ni un solo componente:

| Hoy | Con base de datos |
| --- | --- |
| Cola de escrituras en proceso | `BEGIN; SELECT … FOR UPDATE; INSERT; COMMIT` |
| `listByDate()` sobre un `Map` | `SELECT … WHERE date = $1 AND status IN (…)` |
| `updateStatus()` con validación en memoria | El mismo `STATUS_TRANSITIONS`, más una restricción en el esquema |

Toda la comunicación de la interfaz pasa por `src/lib/api-client.ts`: mover el
backend fuera de Next sólo cambia su constante `BASE`.

---

## Movimiento

`framer-motion` para lo que necesita estado y CSS para lo que no (hover,
filetes, cintas). `lenis` da el scroll suave en escritorio y se apaga solo en
pantallas táctiles, donde el scroll nativo se siente mejor.

Lo que se mueve, y por qué:

| Pieza | Gesto |
| --- | --- |
| Pantalla de carga | El monograma se traza solo y la cortina se abre en dos hojas: el mismo gesto de un corte. Una vez por sesión. |
| Hero | Fotografía con parallax y zoom lento, titular que sube por palabras detrás de una máscara, rótulos encadenados. |
| Filete de progreso | Línea de latón que mide el recorrido completo de la lectura. |
| Folio de sección | Número y nombre de la sección en curso, abajo a la derecha, con el riel deslizándose. Sólo a partir de 1760 px. |
| Cifras de la casa | Cuentan hacia arriba al entrar en pantalla, frenando al final. |
| Fotografías | Se descubren con cortina (`clip-path`) mientras la imagen, por dentro, se asienta desde una escala mayor. Dos capas a distinta velocidad. |
| Cintas de texto | La velocidad del scroll las empuja: al bajar aceleran, al subir se invierten, al soltar vuelven a su marcha. |
| Carta de servicios | Filete de latón que recorre la fila, número que se adelanta, atenuación de las filas vecinas y vista previa que sigue al puntero. |
| Barberos | Retrato que pasa de gris a color, firma que sube desde abajo y filete que cruza el pie de la tarjeta. |
| Galería | Apertura escalonada por columnas, ampliación con arrastre y navegación con flechas. |
| Testimonios | La cita se rearma palabra por palabra al cambiar de persona. |
| Reserva | Pasos que entran en el sentido del avance, calendario que cambia de mes con desplazamiento, horarios encadenados y un sello de latón que se abre al confirmar. |
| Cursor | Punto fijo y aro que lo persigue; sobre las piezas de galería se convierte en etiqueta. Sólo con puntero fino. |

Todo pasa por `<MotionConfig reducedMotion="user">`: quien tenga activada la
preferencia del sistema deja de recibir desplazamientos y escalas, conserva las
opacidades y no se queda con contenido invisible. `Parallax` y `Magnetic`
resuelven esa preferencia **después de montar**, nunca ramificando el árbol,
para no romper la hidratación.

Un detalle que costó encontrar y que conviene recordar: el disparador de una
cortina nunca puede ir en el mismo elemento que se recorta. Un elemento con
`clip-path` cerrado tiene rectángulo de intersección nulo, así que si se
observa a sí mismo no llega a entrar en pantalla y la cortina se queda cerrada
para siempre. Por eso `RevealImage` separa el envoltorio que observa del marco
que recorta.

## Responsive

Verificado con `npm run test:visual`, que recorre el sitio en Chromium a
360, 390, 768, 1280 y 1920 px, hace la reserva completa de principio a fin,
abre menú, galería y ficha de barbero, y falla si algo se sale del ancho del
documento, si el pie del panel no cabe en la pantalla o si la consola escupe
un error.

- Punto de quiebre extra `xs` (26 rem) para teléfonos angostos.
- `overflow-x: clip` en `body`; ninguna anchura se escapa en 360–1920 px.
- Menú a pantalla completa con cortina en `clip-path`.
- Botón de **Agendar cita** flotante en el teléfono a partir del primer scroll.
- Horarios en botones de 48 px de alto y calendario con celdas cuadradas, para
  el pulgar.
- `100svh` en el hero, para que la barra del navegador móvil no corte nada.
- Los campos del formulario usan 16 px en iOS para evitar el zoom automático.

---

## Accesibilidad

Estructura por secciones con `aria-label`, diálogos con `role="dialog"` y
`aria-modal`, foco que entra al abrir una capa y vuelve a su origen al cerrarla
(`src/components/ui/useDialog.ts`), estados `aria-pressed` en todas las
selecciones del flujo, celdas del calendario con etiqueta hablada
(«14 de octubre, 6 horarios libres»), enlace de salto al contenido y anillo de
foco visible en latón.

---

## Nota

Marca, barberos, testimonios, precios y dirección son ficticios. Las fotografías
provienen de Unsplash y se usan para el prototipo visual; para producción habría
que sustituirlas por fotografía propia del local.
