# 📅 Nuestro Calendario

Calendario compartido en pareja con interfaz estilo **Outlook**. Planeen, editen y
recuerden sus actividades juntos.

- **Frontend:** React + TypeScript + Vite + Fluent UI + react-big-calendar
- **Backend:** Node + Express + TypeScript + Mongoose
- **Base de datos:** MongoDB Atlas

## Estructura

```
nuestro-calendario/
├── client/   # App React (Vite)
└── server/   # API Express
```

## Requisitos

- Node.js 20+ (probado con Node 24)
- Una cuenta y un cluster gratis (M0) en MongoDB Atlas

## Puesta en marcha

### 1. Instalar dependencias (desde la raiz)

```bash
npm install
```

### 2. Configurar el backend

Copia el archivo de ejemplo y completa tu cadena de conexion de Atlas:

```bash
cp server/.env.example server/.env
```

Edita `server/.env`:

```
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/nuestro-calendario?retryWrites=true&w=majority
JWT_SECRET=<una-cadena-larga-y-aleatoria>
CLIENT_ORIGIN=http://localhost:5173
```

> En Atlas: **Cluster → Connect → Drivers → Node.js** te da la cadena. Recuerda
> permitir tu IP en **Network Access** y crear un usuario en **Database Access**.

### 3. Arrancar todo (frontend + backend a la vez)

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

También puedes arrancarlos por separado con `npm run dev:server` y `npm run dev:client`.

## Primer uso

1. Abre http://localhost:5173 y crea tu cuenta.
2. Crea un **espacio de pareja** (te dará un código de invitación).
3. Tu pareja crea su cuenta y se une con ese código.
4. ¡A planear! Haz clic en un hueco del calendario o en **Nueva actividad**.

## API (resumen)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuario actual |
| POST | `/api/spaces` | Crear espacio |
| POST | `/api/spaces/join` | Unirse con código |
| GET | `/api/spaces/current` | Espacio + categorías |
| GET | `/api/activities?from=&to=` | Actividades en rango |
| GET | `/api/activities/memories` | Listar recuerdos (actividades vividas) |
| GET | `/api/activities/on-this-day` | Recuerdos de la misma fecha en años anteriores |
| POST | `/api/activities` | Crear actividad |
| PATCH | `/api/activities/:id` | Editar actividad (incluye `status`, `reminders`, `memory`, `recurrence`) |
| DELETE | `/api/activities/:id` | Eliminar actividad (o toda la serie) |
| POST | `/api/activities/:id/exceptions` | Excluir una ocurrencia (borrar solo esta) |
| POST | `/api/activities/:id/detach` | Desprender una ocurrencia editada (editar solo esta) |
| GET | `/api/categories` | Listar categorías |
| GET | `/api/wishlist` | Listar deseos |
| POST | `/api/wishlist` | Crear deseo |
| PATCH | `/api/wishlist/:id` | Editar deseo |
| DELETE | `/api/wishlist/:id` | Eliminar deseo |
| POST | `/api/wishlist/:id/schedule` | Agendar deseo (crea actividad y lo saca de la lista) |
| GET | `/api/ideas?kind=place\|watch` | Listar ideas (lugares o pelis/series) |
| POST | `/api/ideas` | Crear idea (desde búsqueda o a mano) |
| PATCH | `/api/ideas/:id` | Editar idea (notas, marcar visto/visitado) |
| DELETE | `/api/ideas/:id` | Eliminar idea |
| GET | `/api/ideas/search/movies?q=` | Buscar pelis/series en TMDB (proxy) |
| GET | `/api/ideas/search/places?q=` | Buscar lugares en Google Places (proxy) |
| GET | `/api/ideas/discover/movies` | Pelis/series **mejor valoradas** (TMDB, para mostrar de inicio) |
| GET | `/api/ideas/discover/places?lat=&lng=` | Lugares **imprescindibles** cerca de una ubicación (Places Nearby) |
| POST | `/api/ideas/:id/rate` | Valorar una serie/peli (una valoración por persona) |
| GET | `/api/stats` | Estadísticas de la relación |
| GET | `/api/gifts` | Listar regalos (oculta las reservas de los tuyos) |
| POST | `/api/gifts` | Añadir un regalo a tu lista |
| PATCH | `/api/gifts/:id` | Editar tu regalo |
| DELETE | `/api/gifts/:id` | Eliminar tu regalo |
| POST | `/api/gifts/:id/reserve` | Reservar / comprar un regalo del otro (`reserved`/`bought`/`none`) |
| GET | `/api/countdowns` | Listar fechas clave |
| POST | `/api/countdowns` | Crear fecha clave |
| PATCH | `/api/countdowns/:id` | Editar fecha clave |
| DELETE | `/api/countdowns/:id` | Eliminar fecha clave |
| POST | `/api/suggest` | Sugerir planes con IA (Claude) |

## Lista de deseos (bucket list)

Abre el panel con el botón **⭐ Lista de deseos** de la barra superior. Ahí puedes:

- Añadir cosas que quieren hacer juntos (con categoría, prioridad y notas), sin fecha aún.
- **Agendarlas** de dos formas:
  1. **Arrastrando** el deseo a un hueco del calendario → se agenda en ese momento.
  2. Botón **Agendar** → abre el diálogo prellenado para elegir fecha/hora.
- Marcar un deseo como cumplido, editarlo o eliminarlo.

Al agendar, el deseo se convierte en actividad y sale de la lista. Además, en el
calendario puedes **arrastrar** una actividad para moverla o **estirar su borde**
para cambiar su duración.

## Recuerdos

Convierte una actividad vivida en un recuerdo para guardarla:

- Abre una actividad y pulsa **Marcar como vivida** → se abre el diálogo de recuerdo.
- Añade ⭐ **valoración** (1-5), **notas** y **fotos** (se redimensionan y comprimen
  en el navegador antes de guardarse, así ocupan poco).
- Las actividades vividas se marcan con **★** en el calendario.
- El botón **❤️ Recuerdos** de la barra abre la **galería** con todos los recuerdos
  (portada, fecha, valoración y notas); haz clic en una foto para verla en grande.

> Las fotos se guardan como data URIs dentro del documento en Mongo (sin servicios
> externos). Para muchas fotos o alta resolución, más adelante conviene mover el
> almacenamiento a un servicio como Cloudinary o S3.

## Recordatorios

Cada actividad puede tener uno o varios recordatorios (al crear/editar, campo
**Recordatorios**): al comenzar, 5/10/30 min, 1/2 horas o 1 día antes.

- La **campana** 🔔 de la barra superior muestra las **próximas 48 horas** y el botón
  para **activar las notificaciones del navegador**.
- Con la app abierta, un **motor en el cliente** revisa cada 30 s y, cuando llega el
  momento de un recordatorio, lanza una **notificación del navegador** (si diste
  permiso) o un **aviso in-app** (toast). Lo ya avisado se recuerda en `localStorage`
  para no repetir.

> **Limitación (por diseño del MVP):** los recordatorios funcionan mientras la app
> esté abierta en el navegador. Para avisos reales en segundo plano (app cerrada) hace
> falta un **Service Worker + Web Push (VAPID)** y guardar las suscripciones en el
> backend — queda anotado como fase futura.

## Eventos recurrentes

Al crear/editar una actividad, en **Repetir** eliges: no se repite, cada día, cada
semana o cada mes, con una fecha **"Repetir hasta"** opcional. Ejemplo: noche de cita
**cada semana** (con el `start` en viernes = todos los viernes).

- Las ocurrencias **no se almacenan**: el backend las **expande al vuelo** en el rango
  que consultas (patrón tipo iCal). Se marcan con **🔁** en el calendario.
- **Editar / eliminar** una ocurrencia pregunta el alcance:
  - **Solo esta:** al eliminar crea una *excepción* en la serie; al editar *desprende*
    esa ocurrencia como actividad suelta con tus cambios (la serie sigue igual).
  - **Toda la serie:** actúa sobre el evento maestro.
- **Arrastrar** una ocurrencia la desprende (mueve solo esa), igual que Outlook/Google.

> Alcance del MVP: frecuencias diaria/semanal/mensual con intervalo 1. No incluye
> reglas avanzadas (varios días por semana, "el 3.er martes de cada mes", excepción de
> fin de mes en meses cortos). El modelo ya guarda `interval` para ampliarlo luego.

## Ideas: lugares y pelis/series

Apartado **💡 Ideas** (barra superior) con dos pestañas:

- **Lugares:** al entrar muestra los **imprescindibles cerca de ti** (con permiso de
  ubicación del navegador → Places *Nearby* por popularidad); también buscas por nombre con
  **Google Places (New)** (foto, dirección, rating). Marca cualquiera como **favorito** (❤️).
- **Pelis / Series:** al entrar muestra las **mejor valoradas** (TMDB) de inicio, sin
  buscar; y puedes buscar cualquier título con póster, sinopsis, año y rating.

De cada ítem guardado puedes: marcarlo **favorito** (❤️, se ordena primero),
**agendarlo** al calendario, marcarlo **visitado/visto**, abrir su enlace o eliminarlo.
Desde los resultados/recomendaciones, el corazón lo añade directo a favoritos.

### Configurar las APIs (opcional)

Sin keys, Ideas funciona en **modo manual** (botón "A mano"). Para la búsqueda real,
añade en `server/.env`:

- `TMDB_API_KEY` — cuenta en TMDB → *Settings → API → API Key (v3 auth)*. **Gratis**.
- `GOOGLE_PLACES_KEY` — Google Cloud Console → habilita **Places API (New)** → crea una
  API key. Requiere **activar facturación** (tu uso cae en el free tier).

> Las búsquedas pasan por el **backend (proxy)**, así las keys nunca llegan al navegador.
> Las fotos de Google se resuelven a URLs públicas en el servidor.
> TMDB exige mostrar el aviso "Este producto usa la API de TMDB pero no está avalado ni
> certificado por TMDB" — ya incluido en la pestaña de pelis.

## Fechas clave (cuenta regresiva)

Botón **⏳ Fechas** (barra superior): un panel con tarjetas de **cuenta regresiva** a
aniversarios, viajes, cumpleaños, etc.

- Marca una fecha como **anual** y calcula sola el próximo aniversario
  (p. ej. "3º aniversario · faltan 23 días").
- La **próxima fecha** aparece destacada en el **sidebar** cada día.
- Cada fecha tiene su icono (❤️ 🎉 ✈️ 🎂 …) y color.

## Tiempo real

Los cambios de un miembro aparecen **al instante** en el dispositivo del otro, sin
recargar. Con **Socket.io**: cada usuario entra en la "sala" de su espacio (autenticado
por JWT) y, cuando algo cambia en el servidor, se emite un aviso `change` que hace que el
cliente refresque **solo** esa parte (invalidando su query de React Query). Cubre
actividades, deseos, recuerdos, ideas, fechas clave y categorías/miembros.

> En desarrollo, Vite hace de proxy del WebSocket (`/socket.io`) hacia el backend, así el
> cliente se conecta al mismo origen sin problemas de CORS.

## Sugeridor de planes con IA

Botón **✨ Sugerir** (barra superior): eliges **momento**, **estilo** y **presupuesto**
(o los dejas en "Cualquiera") y la IA propone **4 planes de cita**. De cada uno puedes
**agendarlo** en el calendario o **añadirlo a la lista de deseos** (empareja la
categoría automáticamente).

- Usa **Claude** (`@anthropic-ai/sdk`) a través del **backend** como proxy, así la API
  key **nunca llega al navegador**. Modelo por defecto: `claude-opus-4-8` (cambiable en
  `server/src/lib/ai.ts`).
- Configura `ANTHROPIC_API_KEY` en `server/.env` (Anthropic Console → API Keys). **Sin
  key**, el sugeridor queda desactivado y el resto de la app funciona igual.

## Memoria e historia

Botón **📸 Historia** (barra superior): un hub con pestañas.

- **Línea de tiempo:** todos vuestros recuerdos en orden cronológico (foto, valoración, notas).
- **En este día:** recuerdos de la misma fecha (día y mes) en años anteriores ("hace 1 año…").
- **Mapa:** pines de los lugares guardados con ubicación (verde = visitado). Usa
  **Leaflet + OpenStreetMap** (gratis, sin API key). Los lugares vienen del apartado Ideas.
- **Estadísticas:** recuerdos, actividades, lugares visitados, categorías favoritas y
  actividades por mes.

**Tracking de series:** en **Ideas → Pelis/Series**, cada serie (tipo *tv*) muestra por
qué episodio vais (**+1 ep**) y una **valoración por persona** (cada miembro pone sus
estrellas).

## Wishlist de regalos (con sorpresa)

Botón **🎁 Regalos** (barra superior): cada uno lista lo que **quiere recibir** (cumple,
navidad…), con precio, enlace a la tienda, foto, ocasión y prioridad. Hub con una
**pestaña por persona**:

- **Mis regalos:** añades / editas / borras. **No ves quién ha reservado tus regalos** —
  esa es la sorpresa.
- **Lista del otro:** puedes **Reservar** / **Marcar comprado** / **Quitar**, para no
  comprar lo mismo los dos.

> 🔒 **La sorpresa se aplica en el servidor:** `GET /api/gifts` **oculta los campos de
> reserva** cuando el que consulta es el dueño del regalo (no se filtra ni por la API), y
> el endpoint de reserva rechaza reservar tu propio regalo. Cambios en vivo por Socket.io.

## Roadmap (siguientes fases)

- [x] Lista de deseos (bucket list) arrastrable al calendario
- [x] Mover / redimensionar actividades arrastrándolas en el calendario
- [x] Marcar actividad como "hecha" con ⭐ rating, notas y fotos (recuerdos) + galería
- [x] Recordatorios con notificación del navegador / aviso in-app + campana de próximas
- [x] Eventos recurrentes (diaria/semanal/mensual, editar/borrar esta vs toda la serie)
- [x] Apartado Ideas: lugares (Google Places) y pelis/series (TMDB) con búsqueda + agendar
- [x] Fechas clave con cuenta regresiva (anuales o de una vez) + widget en el sidebar
- [x] Sincronización en tiempo real (Socket.io) — cambios visibles al instante entre ambos
- [x] Sugeridor de planes con IA (Claude) — propone citas y las agendas o guardas
- [x] Memoria e historia: línea de tiempo, "en este día", mapa de lugares, estadísticas, tracking de series
- [x] Wishlist de regalos con sorpresa (reservas ocultas para el dueño)
- [ ] Push real en segundo plano (Service Worker + Web Push / VAPID)
- [ ] PWA para móvil
