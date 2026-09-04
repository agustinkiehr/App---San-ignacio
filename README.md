# San Ignacio Rugby — App de Socios (MVP)

PWA para socios de San Ignacio Rugby. Alcance de esta iteración: **Login +
Solicitar Acceso**, **Carnet Digital** (al día / en mora) y **Panel de
Portería** con validación de acceso por QR, DNI o número de socio.
Construida sobre el UI kit real de Stitch
(`stitch_san_ignacio_rugby_socios_app`) y el PRD del club — ver
`docs/prd_san_ignacio_rugby_club.md` para el roadmap completo (Fases 1-3).

Con esto queda completa la Fase 1 del PRD. El panel de portería sigue **sin
su propio login** (queda como dispositivo de confianza física en el club;
ver "Sobre RLS y autenticación" más abajo).

## Stack

- **Vite + React + TypeScript**, PWA vía `vite-plugin-pwa` (manifest + service
  worker, instalable en el teléfono del socio y en la tablet de portería).
- **Tailwind CSS** con la paleta y tipografía oficiales **"San Ignacio
  Heritage"** (ver `tailwind.config.js`): verde ivy `#2D5233`, rojo cardinal
  `#D12D2E`, ocre `#B8791F` (cuota por vencer), vino `#9B1C1D` (vencida/mora),
  `Libre Caslon Text` (títulos) + `Inter` (cuerpo/datos) + Material Symbols
  Outlined (iconografía, igual que el export de Stitch).
- **Supabase** (`@supabase/supabase-js`) para datos **y Auth** (login por
  email/DNI + contraseña). El MCP de Supabase del proyecto
  (`djlfujusrdtqcgfdnztj`) está declarado en `.mcp.json`.
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
    RequireAuth.tsx             # Guard de ruta: sin sesión, redirige a /login
    porteria/
      ScanResultCard.tsx        # Resultado de la última lectura + override
      RecentAccessList.tsx       # Últimos accesos en vivo
      ManualEntryForm.tsx         # Ingreso manual por DNI/N° de socio
  lib/
    supabase.ts             # Cliente Supabase
    AuthContext.tsx           # Sesión de Supabase Auth (useAuth)
    socios.ts                   # Acceso a datos de socios + caché offline
    solicitudes.ts                # signUp + alta pendiente + resolver DNI->email
    types.ts                        # Tipos Socio / RegistroAcceso / SolicitudAcceso
    useWakeLock.ts                    # Hook para "subir brillo" (Wake Lock API)
  pages/
    HomePage.tsx               # Selección Mi Carnet / Panel de Portería
    LoginPage.tsx                 # Email o DNI + contraseña
    SolicitarAccesoPage.tsx         # Alta de socio (queda pendiente de aprobación)
    CarnetPage.tsx                    # Carnet del socio logueado (con caché offline)
    PorteriaPage.tsx                    # Dashboard de portería completo
supabase/
  schema.sql                            # DDL completo (tablas, RLS, triggers, RPC, datos demo)
```

## Reglas de negocio implementadas

- El QR físico del club codifica **solo el número de socio**, 5 dígitos con
  ceros a la izquierda (`01850`). `normalizeNumeroSocio()` en
  `src/lib/socios.ts` hace ese padding tanto al generar el carnet como al leer
  el QR en portería.
- **Login**: el socio ingresa con email **o DNI** + contraseña. Si escribe un
  DNI, el login llama a la función `dni_to_email` (RPC en Postgres,
  `security definer`, sólo devuelve el email — nunca expone `auth.users`) para
  resolverlo antes de autenticar. `/carnet` está protegido por `RequireAuth`:
  sin sesión, redirige a `/login`.
- **Solicitar Acceso**: crea la cuenta en Supabase Auth (`signUp`) y una fila
  en `solicitudes_acceso` con `estado = 'PENDIENTE'`. **Secretaría aprueba a
  mano** en el Table Editor de Supabase (no hay panel de admin propio
  todavía — ver más abajo). Al pasar `estado` a `'APROBADA'`, un trigger
  (`link_socio_on_approval`) vincula automáticamente `socios.user_id` si el
  DNI o número de socio ya existe en el padrón; si no matchea (padrón
  incompleto, error de tipeo), hay que setear `socios.user_id` a mano.
- **Carnet**: variante "al día" (chip verde) vs. "en mora" (badge "Acceso
  limitado" + chip ocre/vino + caja de aviso), según `estado_cuota`. Si la
  red falla, usa la última copia guardada en `localStorage`
  (`cacheMiSocio`/`getCachedMiSocio`, por `user_id`) para que el carnet siga
  funcionando sin conexión, con un aviso visible de que los datos son los
  últimos guardados. Si la cuenta todavía no está vinculada a un socio,
  muestra el estado de la solicitud (pendiente/rechazada/sin solicitud).
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
   romper nada). Crea `socios`, `registros_acceso`, `solicitudes_acceso`,
   índices, RLS, el trigger de auto-vinculación, la función `dni_to_email` y
   4 socios de ejemplo (incluye `01850 - Kiehr, Agustín - AL_DIA`, igual al
   carnet de referencia, con DNI y vencimiento de ejemplo).
3. Copiar la URL del proyecto y la `anon key` (Project Settings → API) a
   `.env`.

### Cómo aprobar una solicitud de alta (secretaría)

1. Supabase Dashboard → **Table Editor** → `solicitudes_acceso`.
2. Buscar la fila `PENDIENTE`, revisar los datos (DNI, teléfono, email) contra
   el padrón real del club.
3. Editar la fila y cambiar `estado` a `APROBADA` (o `RECHAZADA`).
4. Si el DNI o número de socio coincide con una fila de `socios`, la cuenta
   queda vinculada automáticamente. Si no (padrón incompleto todavía, o el
   dato no coincide), abrir `socios`, buscar al socio correcto y pegar a mano
   el `user_id` de la solicitud en su fila.

### Sobre RLS y autenticación

Los socios ya tienen login real (Supabase Auth). El panel de portería **sigue
sin login propio** — es un trade-off deliberado del PRD (Fase 1 no lo pide
todavía) y por eso `socios`/`registros_acceso` se mantienen de lectura (y en
el caso de `registros_acceso`, también inserción) **pública** con la anon
key: portería necesita resolver cualquier socio por QR/DNI y mostrar
"ingresos hoy"/últimos accesos sin sesión. Cualquiera con la anon key puede
seguir leyendo el padrón completo y el historial de accesos.

Cuando el panel de portería tenga su propio login (rol `portero`), hay que:

- Restringir el `select` de `socios` a `auth.uid() = user_id` (el socio sólo
  ve su fila) más una condición de rol `portero` para el escaneo.
- Restringir `registros_acceso` (select e insert) al rol `portero`.

## Próximos pasos (fuera de esta iteración)

- **Panel de portería con su propio login** (rol `portero`), para cerrar el
  trade-off de RLS descripto arriba.
- **Beneficios, Parrillas, Club, Perfil** — Fase 2/3 del PRD. El `BottomNav`
  ya muestra esas 4 pestañas (deshabilitadas, con tooltip "Próximamente")
  para no perder la identidad de la IA completa.
- **Panel de admin para secretaría** en vez de aprobar altas a mano en el
  Table Editor de Supabase (por ahora, decisión deliberada para no sumar una
  pantalla + rol de admin todavía).
- El botón "Escanear carnet físico rápido" y el link de WhatsApp a
  secretaría del diseño de Stitch quedaron afuera: el primero implicaría
  autenticar con el mismo QR público del carnet (no es un mecanismo seguro
  real), y el segundo necesita el número real de WhatsApp del club, que no
  tengo — pasámelo y lo sumo.
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
