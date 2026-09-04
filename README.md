# San Ignacio Rugby — App de Socios (MVP)

PWA para socios de San Ignacio Rugby. Alcance del MVP: **Carnet Digital** +
**Validación de Acceso por QR en Portería**.

## Nota sobre el diseño de origen

Este proyecto se construyó **sin acceso** a la carpeta `/stitch` ni al zip
`stitch_san_ignacio_rugby_socios_app` mencionados en la consigna: este entorno
de ejecución remoto no tiene visibilidad sobre el sistema de archivos local ni
la carpeta de Descargas de quien lo ejecuta, sólo sobre lo que se adjunta
directamente en el chat. La UI se construyó desde cero siguiendo la identidad
de marca (verde ivy `#2D5233`, rojo cardinal `#D12D2E`, Libre Baskerville +
Inter) y el layout del carnet de referencia que se compartió como imagen.

Si tenés los archivos de Stitch a mano, decime y los integro: lo ideal es que
me los subas al chat (o los pegues en el repo) para adaptar los componentes
`CarnetCard`, `HomePage` y `PorteriaPage` a ese maquetado 1:1. También hay que
reemplazar `src/components/FsrCrest.tsx` (recreación aproximada del isologo)
por el archivo oficial del brand book en cuanto esté disponible como asset.

## Stack

- **Vite + React + TypeScript**, PWA vía `vite-plugin-pwa` (manifest + service
  worker, instalable en el teléfono del socio y en la tablet de portería).
- **Tailwind CSS**, con la paleta y tipografías de marca ya cargadas
  (`tailwind.config.js`): `ivy` (verde institucional), `cardinal` (rojo de
  acento), `status.{alDia,pendiente,inactivo}`.
- **Supabase** (`@supabase/supabase-js`) para el modelo de datos.
- **qrcode.react** para renderizar el QR del carnet.
- **html5-qrcode** para el escáner de cámara del panel de portería.

## Estructura

```
src/
  components/
    CarnetCard.tsx     # Carnet visual (logo, datos, QR)
    FsrCrest.tsx        # Isologo FSR (placeholder, reemplazar por el oficial)
    QrScanner.tsx        # Wrapper de cámara sobre html5-qrcode
    StatusBadge.tsx      # Badge de estado de cuota
  lib/
    supabase.ts          # Cliente Supabase
    socios.ts             # Acceso a datos: fetchSocioByNumero, registrarAcceso
    types.ts               # Tipos Socio / RegistroAcceso / EstadoCuota
  pages/
    HomePage.tsx           # Selección Mi Carnet / Panel de Portería
    CarnetPage.tsx          # Vista de carnet del socio
    PorteriaPage.tsx         # Escáner + validación en tiempo real
supabase/
  schema.sql                # DDL completo (tablas, índices, RLS, datos demo)
```

## Reglas de negocio implementadas

- El QR físico del club codifica **solo el número de socio**, 5 dígitos con
  ceros a la izquierda (`01850`). `normalizeNumeroSocio()` en
  `src/lib/socios.ts` hace ese padding tanto al generar el carnet como al leer
  el QR en portería, así que sirve tanto para QRs viejos como nuevos.
- El panel de portería, al escanear:
  1. Parsea el string leído como `numero_socio`.
  2. Busca el socio en Supabase (`fetchSocioByNumero`).
  3. Muestra **ACCESO PERMITIDO** (verde) si `estado_cuota = AL_DIA`, o
     **ACCESO DENEGADO** (rojo) si está `PENDIENTE` o `INACTIVO`.
  4. Inserta un registro en `registros_acceso` con el resultado
     (`PERMITIDO`/`DENEGADO`).
  5. Tiene un cooldown de reescaneo (4s) y vuelve a "listo para escanear" a
     los 3.5s de mostrar el resultado.

## Setup

```bash
npm install
cp .env.example .env   # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

### Base de datos (Supabase)

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. Correr `supabase/schema.sql` en el SQL Editor. Crea `socios`,
   `registros_acceso`, índices, políticas de RLS y 3 socios de ejemplo
   (incluye `01850 - Kiehr, Agustin - AL_DIA`, igual al carnet de referencia).
3. Copiar la URL del proyecto y la `anon key` (Project Settings → API) a
   `.env`.

### Sobre RLS y autenticación (siguiente paso, fuera del MVP)

Para este MVP, sin login todavía, las políticas de RLS permiten **lectura
pública** de `socios` (necesaria para resolver el QR desde cualquier
dispositivo) e **inserción pública** en `registros_acceso`, pero **nadie
puede leer el historial de accesos** desde el cliente (sólo `service_role`).
Cuando se sume autenticación real (socio logueado viendo *su* carnet, portero
autenticado), hay que:

- Vincular `socios` a `auth.users` (por ejemplo `user_id uuid references
  auth.users(id)`).
- Restringir el `select` de `socios` a `auth.uid() = user_id` para la vista
  del socio, o a un rol `portero` para el escaneo.
- Mover el `insert` en `registros_acceso` detrás de una Edge Function o RPC
  que valide el rol, en vez de hacerlo directo desde el cliente con la anon
  key.

## Build

```bash
npm run build   # tsc -b && vite build
npm run preview
```

## PWA

Manifest e íconos ya están armados (`vite.config.ts`, `public/icons/`). Los
íconos actuales son placeholders generados a partir del isologo aproximado;
reemplazar `public/icons/icon-192.png`, `icon-512.png`,
`icon-512-maskable.png` y `public/apple-touch-icon.png` por los assets
oficiales del brand book cuando estén disponibles.
