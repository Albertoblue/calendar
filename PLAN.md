# Plan de mejoras — Nuestro Calendario

Plan de trabajo para seguir puliendo la app. Las fases estan ordenadas por
prioridad recomendada; dentro de cada una, marca las casillas conforme avances.

> Leyenda de esfuerzo: 🟢 bajo · 🟡 medio · 🔴 alto

---

## ✅ Ya hecho (contexto)

- [x] Calendario base estilo Outlook + funcionalidades (deseos, recuerdos, recordatorios,
      eventos recurrentes, ideas, fechas clave, sync en tiempo real, sugeridor IA, historia, regalos)
- [x] Despliegue en Railway como servicio unico (Express sirve el frontend + API)
- [x] Interfaz responsiva en movil (TopBar con menu, sidebar/wishlist como drawers, calendario compacto)
- [x] Login rediseñado (dos paneles, gradiente, tarjeta elegante)
- [x] Onboarding rediseñado a juego con el login

---

## 🎨 Fase 1 — Identidad visual consistente

Objetivo: que **toda** la app comparta el lenguaje visual del nuevo login/onboarding.

- [ ] 🟢 Definir la identidad de marca (gradiente azul→morado→rosa) como constante/token reutilizable
- [ ] 🟡 Rediseñar los encabezados de los hubs (Ideas, Regalos, Historia, Sugerir, Fechas, Recuerdos)
      con el mismo estilo (icono en cuadro, titulo, subtitulo)
- [ ] 🟡 Afinar las tarjetas (deseos, ideas, recuerdos, regalos): sombras suaves, hover, radios consistentes
- [ ] 🟢 Estados vacios mas calidos (ilustracion o emoji + mensaje) en cada seccion
- [ ] 🟡 Skeletons de carga en vez de spinners sueltos donde tenga sentido
- [ ] 🟢 Revisar modo oscuro (que el gradiente y las tarjetas se vean bien en dark theme)

## 📱 Fase 2 — Pulido de la experiencia movil

- [ ] 🟡 Revisar cada hub/dialogo en pantallas pequeñas (que no se corten ni desborden)
- [ ] 🟢 Asegurar objetivos tactiles comodos (botones/iconos >= 40px)
- [ ] 🟡 Alternativa tactil al arrastrar deseos al calendario (el drag no funciona con el dedo)
- [ ] 🟢 Respetar safe-areas del notch (padding con env(safe-area-inset-*))
- [ ] 🟢 Vista Agenda como opcion destacada en movil (mas comoda que Semana)

## 🔎 Fase 3 — Funcionalidad

- [ ] 🟡 Buscador real en el TopBar (hoy el input es decorativo): filtrar actividades por texto
- [ ] 🔴 Notificaciones push reales (hoy los recordatorios son en-app mientras esta abierta)
- [ ] 🟡 Filtros/ordenamiento en las listas (deseos, ideas) por prioridad, categoria, fecha
- [ ] 🟡 Exportar/compartir (p. ej. agregar a Google Calendar, o compartir un plan)
- [ ] 🟢 Ajustes de perfil (cambiar nombre, color, foto de avatar)

## 🔒 Fase 4 — Tecnico, seguridad e infraestructura

- [ ] 🟡 Restringir las API keys de Google en Cloud Console (por API y por aplicacion)
- [ ] 🟡 Endurecer acceso a MongoDB Atlas (usuario con permisos minimos; valorar Static Outbound IP de Railway)
- [ ] 🔴 Code splitting del bundle del cliente (hoy > 1.3 MB; usar dynamic import por hub)
- [ ] 🟡 Tests: unitarios del backend (auth, controllers) y de utilidades del front
- [ ] 🟢 Accesibilidad: foco visible, labels ARIA, contraste, navegacion por teclado
- [ ] 🟢 Fijar version de Node en Railway (engines: node 20.x) para alinear con desarrollo
- [ ] 🟢 Monitoreo/logs de errores en produccion (p. ej. un endpoint de health enriquecido)

---

## Notas

- Ticket generico en uso para commits: `CAL-1` (sustituir por el real cuando exista).
- Despliegue: push a `main` → Railway redeploya solo (watchPatterns: `**`).
- Formato de commits: `CAL-1 - {tipo}: {descripcion en español}`.
