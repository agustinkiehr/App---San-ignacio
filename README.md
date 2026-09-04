# San Ignacio Rugby — App de Socios (MVP)

PWA para socios de San Ignacio Rugby. Alcance de esta iteración: **Carnet
Digital** (al día / en mora) + **Panel de Portería** con validación de acceso
por QR, DNI o número de socio. Construida sobre el UI kit real de Stitch
(`stitch_san_ignacio_rugby_socios_app`) y el PRD del club — ver
`docs/prd_san_ignacio_rugby_club.md` para el roadmap completo (Fases 1-3).

Todavía **no hay login** (Fase 1 del PRD incluye "Login + Solicitar Acceso"
con Supabase Auth; quedó fuera de esta iteración a propósito — ver
"Próximos pasos" más abajo). Mientras tanto, el socio ingresa su número para
ver su carnet, y la tablet de portería opera como dispositivo de confianza
física sin su propio login.

## Stack

- **Vite + React + TypeScript**, PWA vía `vite-plugin-pwa` (manifest + service
  worker, instalable en el teléfono del socio y en la tablet de portería).
- **Tailwind CSS** con la paleta y tipografía oficiales **"San Ignacio
  Heritage"** (ver `tailwind.config.js`): verde ivy `#2D5233`, rojo cardinal
  `#D12D2E`, ocre `#B8791F` (cuota por vencer), vino `#9B1C1D` (vencida/mora),
  `Libre Caslon Text` (títulos) + `Inter` (cuerpo/datos) + Material Symbols
  Outlined (iconografía, igual que el export de Stitch).
- **Supabase** (`@supabase/supabase-js`) para el modelo de datos. El MCP de
  Supabase del proyecto (`djlfujusrdtqcgfdnztj`) está declarado en
  `.mcp.json` — se conecta la primera vez que Claude Code lo usa en una
  sesión nueva.
- **qrcode.react** para el QR dinámico del carnet (nivel de corrección `H`,
  con el isologo incrustado y excavado automáticamente).
- **html5-qrcode** para el escáner de cámara del panel de portería.

## Assets de marca

`public/brand/` tiene el isologo y el lockup oficiales, extraídos del zip de
Stitch (`logo_san_ignacio.jpeg`, `logo_nombre.jpeg`) con el fondo blanco
removido por chroma-key:

- `crest-color.png` / `lockup-color.png`: versión a color (verde + contorno
  rojo), para fondos claros.
- `crest-white.png` / `lockup-white.png`: versión reversada en blanco, para
  fondos verdes/oscuros (headers, hero de portería).

Los íconos de PWA (`public/icons/`, `apple-touch-icon.png`, `favicon.png`) se
regeneraron a partir de `crest-white.png` sobre fondo `#2D5233`.

## Estructura

```
src/
  components/
    CarnetCard.tsx        # Carnet visual (avatar, N°/vence, estado, QR)
    SocioAvatar.tsx         # Foto o iniciales
    StatusBadge.tsx          # Chip de estado de cuota (al día/pendiente/inactivo)
    BottomNav.tsx             # Nav inferior de 5 pestañas (sólo "Carnet" activa)
    QrScanner.tsx              # Wrapper de cámara sobre html5-qrcode
    porteria/
      ScanResultCard.tsx        # Resultado de la última lectura + override
      RecentAccessList.tsx       # Últimos accesos en vivo
      ManualEntryForm.tsx         # Ingreso manual por DNI/N° de socio
  lib/
    supabase.ts             # Cliente Supabase
    socios.ts                 # Acceso a datos (ver más abajo) + caché offline
    types.ts                    # Tipos Socio / RegistroAcceso / EstadoCuota
    useWakeLock.ts                # Hook para "subir brillo" (Wake Lock API)
  pages/
    HomePage.tsx               # Selección Mi Carnet / Panel de Portería
    CarnetPage.tsx                # Vista de carnet del socio (con caché offline)
    PorteriaPage.tsx                # Dashboard de portería completo
supabase/
  schema.sql                        # DDL completo (tablas, índices, RLS, datos demo)
```

## Reglas de negocio implementadas

- El QR físico del club codifica **solo el número de socio**, 5 dígitos con
  ceros a la izquierda (`01850`). `normalizeNumeroSocio()` en
  `src/lib/socios.ts` hace ese padding tanto al generar el carnet como al leer
  el QR en portería.
- **Carnet**: variante "al día" (chip verde) vs. "en mora" (badge "Acceso
  limitado" + chip ocre/vino + caja de aviso), según `estado_cuota`. Si la
  red falla, usa la última copia guardada en `localStorage`
  (`cacheSocio`/`getCachedSocio`) para que el carnet siga funcionando sin
  conexión, con un aviso visible de que los datos son los últimos guardados.
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
   romper nada). Crea `socios`, `registros_acceso`, índices, políticas de
   RLS y 3 socios de ejemplo (incluye `01850 - Kiehr, Agustín - AL_DIA`,
   igual al carnet de referencia, con DNI y vencimiento de ejemplo).
3. Copiar la URL del proyecto y la `anon key` (Project Settings → API) a
   `.env`.

### Sobre RLS y autenticación (siguiente paso, Fase 1 del PRD)

Sin login todavía, las políticas de RLS permiten **lectura y escritura
pública** de `socios` y `registros_acceso` con la anon key — necesario para
que tanto el carnet como el dashboard de portería (contador, últimos
accesos) funcionen sin backend propio. Es un trade-off deliberado: cualquiera
con la anon key puede leer el padrón completo y el historial de accesos.

Cuando se implemente Login + Solicitar Acceso (Fase 1, pantallas ya
diseñadas en Stitch: `inicio_de_sesion`, `solicitar_acceso`), hay que:

- Vincular `socios` a `auth.users` (`user_id uuid references auth.users(id)`).
- Restringir el `select` de `socios` a `auth.uid() = user_id` para la vista
  del socio, y a un rol `portero` autenticado para el escaneo/dashboard.
- Restringir `registros_acceso` (select e insert) al rol `portero`.
- Sumar una tabla de altas pendientes (`solicitudes_acceso`) que secretaría
  aprueba manualmente, tal como describe el PRD.

## Próximos pasos (fuera de esta iteración)

- **Login + Solicitar Acceso** (Supabase Auth, altas pendientes de
  aprobación por secretaría) — Fase 1 del PRD, ya diseñado en Stitch.
- **Beneficios, Parrillas, Club, Perfil** — Fase 2/3 del PRD. El `BottomNav`
  ya muestra esas 4 pestañas (deshabilitadas, con tooltip "Próximamente")
  para no perder la identidad de la IA completa.
- Reemplazar el avatar por foto real (`socios.foto_url`) cuando haya carga
  de fotos del padrón.

## Build

```bash
npm run build   # tsc -b && vite build
npm run preview
```

## PWA

Manifest e íconos ya usan el isologo oficial (`vite.config.ts`,
`public/icons/`, generados desde `public/brand/crest-white.png`).
