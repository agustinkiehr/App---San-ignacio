# San Ignacio Rugby — App de Socios (MVP)

PWA para socios de San Ignacio Rugby. Alcance activo hoy: **Carnet Digital**
(al día / en mora, por número de socio, sin login) y **Panel de Portería**
con validación de acceso por QR, DNI o número de socio. Construida sobre el
UI kit real de Stitch (`stitch_san_ignacio_rugby_socios_app`) y el PRD del
club — ver `docs/prd_san_ignacio_rugby_club.md` para el roadmap completo
(Fases 1-3).

## ⏸️ Login + Solicitar Acceso: en pausa

Se llegó a implementar completo (Supabase Auth, alta con aprobación manual de
secretaría, `/carnet` protegido por sesión) pero **se pausó a pedido del
club**: complicaba demasiado la operativa del día a día. Se volvió al flujo
anterior — cualquiera con el número de socio ve su carnet, sin login.

Nada de ese trabajo se perdió, queda listo para retomar cuando el club esté
preparado para el cambio operativo que implica:

- **Frontend**: `src/pages/LoginPage.tsx`, `src/pages/SolicitarAccesoPage.tsx`,
  `src/lib/AuthContext.tsx`, `src/components/RequireAuth.tsx`,
  `src/lib/solicitudes.ts`. Están completos y compilan, sólo no están
  enrutados en `src/App.tsx` (no se importan, así que ni siquiera suman al
  bundle de producción).
- **Backend**: la migración ya corrió contra Supabase — existen `socios.user_id`,
  `socios.email`, la tabla `solicitudes_acceso`, el trigger de
  auto-vinculación y la función `dni_to_email`. No se tocó nada de esto al
  pausar; conviven sin interferir con el flujo actual (RLS de `socios` sigue
  pública, como siempre).

**Para retomarlo**: volver a enrutar en `App.tsx` (envolver en `AuthProvider`,
agregar `/login` y `/solicitar-acceso`, envolver `/carnet` en `RequireAuth`) y
restaurar la versión de `CarnetPage.tsx` que usa `useAuth()` en vez de la
búsqueda por número (está en el historial de git, commit `51d41b1`).

## Stack

- **Vite + React + TypeScript**, PWA vía `vite-plugin-pwa` (manifest + service
  worker, instalable en el teléfono del socio y en la tablet de portería).
- **Tailwind CSS** con la paleta y tipografía oficiales **"San Ignacio
  Heritage"** (ver `tailwind.config.js`): verde ivy `#2D5233`, rojo cardinal
  `#D12D2E`, ocre `#B8791F` (cuota por vencer), vino `#9B1C1D` (vencida/mora),
  `Libre Caslon Text` (títulos) + `Inter` (cuerpo/datos) + Material Symbols
  Outlined (iconografía, igual que el export de Stitch).
- **Supabase** (`@supabase/supabase-js`) para el modelo de datos (y Auth,
  disponible pero en pausa — ver arriba). El MCP de Supabase del proyecto
  (`djlfujusrdtqcgfdnztj`) está declarado en `.mcp.json`.
- **qrcode.react** para el QR dinámico del carnet (nivel de corrección `H`,
  con el isologo incrustado y excavado automáticamente).
- **html5-qrcode** para el escáner de cámara del panel de portería.

## Assets de marca

`public/brand/` tiene el isologo y el lockup oficiales, extraídos del zip de
Stitch (`logo_san_ignacio.jpeg`, `logo_nombre.jpeg`) con el fondo blanco
removido por chroma-key:

- `crest-color.png` / `lockup-color.png`: versión a color (verde + contorno
  rojo). **Es la que se usa en todos los headers de la app**, siempre dentro
  de un círculo/tarjeta blanca — el logo a color directo sobre un fondo verde
  se veía mal (poco contraste, se pierde el contorno rojo), así que en vez de
  usar la versión reversada en blanco se decidió mantener el logo a color
  sobre blanco en todos lados, incluso en fondos verdes/oscuros.
- `crest-white.png` / `lockup-white.png`: versión reversada en blanco, para
  cuando haga falta poner el logo directo sobre un fondo de color sin tarjeta
  blanca detrás (hoy no se usa en ninguna pantalla activa, pero queda
  disponible).

Los íconos de PWA (`public/icons/`, `apple-touch-icon.png`, `favicon.png`) sí
usan `crest-white.png` sobre fondo sólido `#2D5233` — ahí funciona bien
porque es un ícono cuadrado con fondo sólido propio, no un logo flotando
sobre otro contenido.

## Estructura

```
src/
  components/
    CarnetCard.tsx        # Carnet visual (avatar, N°/vence, estado, QR)
    SocioAvatar.tsx         # Foto o iniciales
    StatusBadge.tsx          # Chip de estado de cuota (al día/pendiente/inactivo)
    BottomNav.tsx             # Nav inferior de 5 pestañas (sólo "Carnet" activa)
    QrScanner.tsx              # Wrapper de cámara sobre html5-qrcode
    RequireAuth.tsx             # Guard de sesión — en pausa, no enrutado (ver arriba)
    porteria/
      ScanResultCard.tsx        # Resultado de la última lectura + override
      RecentAccessList.tsx       # Últimos accesos en vivo
      ManualEntryForm.tsx         # Ingreso manual por DNI/N° de socio
  lib/
    supabase.ts             # Cliente Supabase
    AuthContext.tsx           # Sesión de Supabase Auth — en pausa, no enrutado
    socios.ts                   # Acceso a datos de socios + caché offline
    solicitudes.ts                # signUp + alta pendiente — en pausa, no enrutado
    types.ts                        # Tipos Socio / RegistroAcceso / SolicitudAcceso
    useWakeLock.ts                    # Hook para "subir brillo" (Wake Lock API)
  pages/
    HomePage.tsx               # Selección Mi Carnet / Panel de Portería
    LoginPage.tsx                 # En pausa, no enrutado (ver arriba)
    SolicitarAccesoPage.tsx         # En pausa, no enrutado (ver arriba)
    CarnetPage.tsx                    # Carnet por número de socio (sin login)
    PorteriaPage.tsx                    # Dashboard de portería completo
supabase/
  schema.sql                            # DDL completo (tablas, RLS, triggers, RPC, datos demo)
```

## Reglas de negocio implementadas

- El QR físico del club codifica **solo el número de socio**, 5 dígitos con
  ceros a la izquierda (`01850`). `normalizeNumeroSocio()` en
  `src/lib/socios.ts` hace ese padding tanto al generar el carnet como al leer
  el QR en portería.
- **Carnet**: el socio escribe su número (sin login) y ve su carnet. Variante
  "al día" (chip verde) vs. "en mora" (badge "Acceso limitado" + chip
  ocre/vino + caja de aviso), según `estado_cuota`. Si la red falla, usa la
  última copia guardada en `localStorage` (`cacheSocio`/`getCachedSocio`, por
  número de socio) para que el carnet siga funcionando sin conexión, con un
  aviso visible de que los datos son los últimos guardados.
- **Portería**, al resolver un socio (por cámara, DNI o número manual):
  1. Busca el socio (`fetchSocioByNumero` para QR, `fetchSocioByDniOrNumero`
     para el ingreso manual).
  2. Determina **ACCESO PERMITIDO** si `estado_cuota = AL_DIA`, o
     **ACCESO DENEGADO** si está `PENDIENTE` o `INACTIVO`.
  3. Inserta un registro en `registros_acceso` (`resultado`, `excepcion`).
  4. Si fue denegado, un supervisor puede tocar **"Permitir de todas
     formas"**: registra el ingreso igual, marcando `excepcion = true` para
     auditoría (visible en "Últimos ingresos" con el tag "Excepción").
  5. El contador "Ingresos hoy" y la lista de últimos accesos se refrescan
     después de cada resolución (`fetchIngresosHoy`, `fetchUltimosAccesos`).
  6. Tiene un cooldown de reescaneo (4s) para no duplicar registros cuando la
     cámara sigue leyendo el mismo QR en frames sucesivos, y un botón
     "Reiniciar lector" que remonta la cámara si se traba.

## Setup

```bash
npm install
cp .env.example .env   # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

### Base de datos (Supabase)

El proyecto Supabase (`djlfujusrdtqcgfdnztj`) ya está declarado como MCP en
`.mcp.json` — en una sesión nueva de Claude Code se puede pedir que corra la
migración directamente contra el proyecto. Si preferís hacerlo a mano:

1. Abrir el SQL Editor del proyecto en supabase.com.
2. Correr `supabase/schema.sql` (es idempotente, se puede re-correr sin
   romper nada). Crea `socios`, `registros_acceso`, `solicitudes_acceso`
   (esta última en desuso mientras el login esté pausado), índices, RLS, y 4
   socios de ejemplo (incluye `01850 - Kiehr, Agustín - AL_DIA`, igual al
   carnet de referencia).
3. Copiar la URL del proyecto y la `anon key` (Project Settings → API) a
   `.env`.

### Sobre RLS

`socios` y `registros_acceso` tienen lectura (y en el caso de
`registros_acceso`, también inserción) **pública** con la anon key: tanto el
carnet como portería necesitan resolver cualquier socio por número/QR/DNI sin
sesión. Cualquiera con la anon key puede leer el padrón completo y el
historial de accesos — trade-off deliberado del MVP mientras no haya login.

## Próximos pasos (fuera de esta iteración)

- **Retomar Login + Solicitar Acceso** cuando el club esté listo para el
  cambio operativo — ver la sección de arriba, el trabajo ya está hecho.
- **Beneficios, Parrillas, Club, Perfil** — Fase 2/3 del PRD. El `BottomNav`
  ya muestra esas 4 pestañas (deshabilitadas, con tooltip "Próximamente")
  para no perder la identidad de la IA completa.
- Reemplazar el avatar por foto real (`socios.foto_url`) cuando haya carga
  de fotos del padrón.
- Cargar el padrón real de socios (hoy sólo hay 4 filas de prueba).

## Build

```bash
npm run build   # tsc -b && vite build
npm run preview
```

## PWA

Manifest e íconos ya usan el isologo oficial (`vite.config.ts`,
`public/icons/`, generados desde `public/brand/crest-white.png`).
