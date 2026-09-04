-- San Ignacio Rugby — Socios App (MVP)
-- Modelo de datos: Carnet Digital + Validación de Acceso por QR en Portería.
-- Ejecutar en el SQL Editor de Supabase (o vía `supabase db push`).
-- Este archivo es idempotente: se puede volver a correr sin romper una
-- instalación existente (usa IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

create extension if not exists pgcrypto;

-- =========================================================
-- Tabla: socios
-- =========================================================
create table if not exists socios (
    id uuid primary key default gen_random_uuid(),
    numero_socio varchar(10) unique not null, -- ej: '01850' (5 dígitos, ceros a la izquierda)
    dni varchar(20) unique,
    nombre varchar(100) not null,
    apellido varchar(100) not null,
    categoria varchar(50),
    foto_url text,
    vencimiento date,
    estado_cuota varchar(20) not null default 'AL_DIA'
        check (estado_cuota in ('AL_DIA', 'PENDIENTE', 'INACTIVO')),
    created_at timestamptz not null default now()
);

-- Columnas sumadas después de la primera versión del MVP (carnet con foto,
-- vencimiento y búsqueda por DNI; ver panel de portería con ingreso manual).
alter table socios add column if not exists dni varchar(20) unique;
alter table socios add column if not exists foto_url text;
alter table socios add column if not exists vencimiento date;

-- Login (ver sección "Solicitudes de acceso" más abajo): vincula el socio del
-- padrón con su cuenta de Supabase Auth una vez que la solicitud es aprobada.
alter table socios add column if not exists user_id uuid unique references auth.users(id) on delete set null;
alter table socios add column if not exists email varchar(255);

comment on table socios is 'Padrón de socios del club, con el estado de cuota vigente.';
comment on column socios.numero_socio is 'Número de socio en texto plano, tal como se codifica en el QR físico del carnet (5 dígitos, con ceros a la izquierda).';
comment on column socios.dni is 'DNI del socio, para el ingreso manual en portería cuando el QR falla y para un futuro login por DNI.';
comment on column socios.vencimiento is 'Próximo vencimiento de cuota mostrado en el carnet (informativo; no hay pasarela de pago en el MVP).';
comment on column socios.user_id is 'Cuenta de Supabase Auth vinculada, una vez que la solicitud de acceso del socio fue aprobada.';

create index if not exists idx_socios_numero_socio on socios (numero_socio);
create index if not exists idx_socios_dni on socios (dni);
create index if not exists idx_socios_estado_cuota on socios (estado_cuota);
create index if not exists idx_socios_user_id on socios (user_id);

-- =========================================================
-- Tabla: registros_acceso
-- =========================================================
create table if not exists registros_acceso (
    id uuid primary key default gen_random_uuid(),
    socio_id uuid references socios(id) on delete cascade,
    fecha_hora timestamptz not null default now(),
    resultado varchar(20) not null
        check (resultado in ('PERMITIDO', 'DENEGADO')),
    excepcion boolean not null default false
);

alter table registros_acceso add column if not exists excepcion boolean not null default false;

comment on table registros_acceso is 'Historial de intentos de acceso por portería, uno por cada escaneo (o ingreso manual) en portería.';
comment on column registros_acceso.excepcion is 'true cuando un supervisor forzó el ingreso de un socio en mora/inactivo ("Permitir de todas formas"), para auditoría.';

create index if not exists idx_registros_acceso_socio_id on registros_acceso (socio_id);
create index if not exists idx_registros_acceso_fecha_hora on registros_acceso (fecha_hora desc);

-- =========================================================
-- Tabla: solicitudes_acceso
-- =========================================================
-- Alta de socio (Login + Solicitar Acceso, Fase 1 del PRD). El socio se
-- autentica primero con Supabase Auth (signUp) y después queda en esta tabla
-- como PENDIENTE hasta que secretaría la revisa a mano en el Table Editor de
-- Supabase (Project > Table Editor > solicitudes_acceso > cambiar `estado` a
-- 'APROBADA' o 'RECHAZADA'). No hay panel de admin propio todavía.
create table if not exists solicitudes_acceso (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    numero_socio varchar(10),
    dni varchar(20) not null,
    email varchar(255) not null,
    telefono varchar(30) not null,
    estado varchar(20) not null default 'PENDIENTE'
        check (estado in ('PENDIENTE', 'APROBADA', 'RECHAZADA')),
    notas text,
    created_at timestamptz not null default now(),
    revisado_at timestamptz
);

comment on table solicitudes_acceso is 'Altas de socios pendientes de aprobación manual por secretaría (ver panel de Supabase: Table Editor > solicitudes_acceso).';

create index if not exists idx_solicitudes_estado on solicitudes_acceso (estado);
create index if not exists idx_solicitudes_dni on solicitudes_acceso (dni);

alter table solicitudes_acceso enable row level security;

drop policy if exists "solicitudes_insert_propia" on solicitudes_acceso;
create policy "solicitudes_insert_propia"
    on solicitudes_acceso for insert
    with check (auth.uid() = user_id);

drop policy if exists "solicitudes_select_propia" on solicitudes_acceso;
create policy "solicitudes_select_propia"
    on solicitudes_acceso for select
    using (auth.uid() = user_id);

-- Al aprobar (estado -> APROBADA), vincula automáticamente el socio del
-- padrón que matchee por DNI o número de socio. Si no hay match (padrón no
-- cargado aún, DNI no coincide), secretaría vincula a mano seteando
-- socios.user_id en el Table Editor.
create or replace function link_socio_on_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.estado = 'APROBADA' and (old.estado is distinct from 'APROBADA') then
    update socios
    set user_id = new.user_id, email = new.email
    where user_id is null
      and (dni = new.dni or (new.numero_socio is not null and numero_socio = new.numero_socio));

    new.revisado_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_link_socio_on_approval on solicitudes_acceso;
create trigger trg_link_socio_on_approval
before update on solicitudes_acceso
for each row
execute function link_socio_on_approval();

-- link_socio_on_approval es una función de trigger, nunca debería exponerse
-- como endpoint RPC público. Revocar el EXECUTE no afecta al trigger: dispara
-- a nivel del motor, no a través de la capa de roles de PostgREST.
revoke execute on function link_socio_on_approval() from anon, authenticated, public;

-- RPC segura: resuelve DNI -> email para el login sin exponer auth.users.
-- Intencionalmente ejecutable por `anon`: el login por DNI necesita esto
-- ANTES de que el usuario tenga sesión. Sólo devuelve el email, nada más.
create or replace function dni_to_email(p_dni text)
returns text
language sql
security definer
set search_path = public, auth
stable
as $$
  select u.email
  from socios s
  join auth.users u on u.id = s.user_id
  where s.dni = p_dni
  limit 1;
$$;

grant execute on function dni_to_email(text) to anon, authenticated;

-- =========================================================
-- Row Level Security
-- =========================================================
-- Los socios ya tienen login (arriba), pero el panel de portería sigue sin
-- autenticación propia (Fase 1 del PRD no la incluye todavía; la tablet de
-- portería se asume un dispositivo de confianza física en el club). Por eso
-- `socios` y `registros_acceso` se mantienen de lectura pública: portería
-- necesita poder resolver cualquier socio por QR/DNI, y mostrar "ingresos
-- hoy"/últimos accesos sin sesión. Esto es un trade-off deliberado: cualquiera
-- con la anon key puede seguir leyendo el padrón completo y el historial de
-- accesos. Cuando el panel de portería tenga su propio login (rol 'portero'),
-- hay que restringir estas políticas a auth.uid()/rol en vez de `using (true)`.

alter table socios enable row level security;
alter table registros_acceso enable row level security;

drop policy if exists "socios_select_publico" on socios;
create policy "socios_select_publico"
    on socios for select
    using (true);

drop policy if exists "registros_acceso_insert_publico" on registros_acceso;
create policy "registros_acceso_insert_publico"
    on registros_acceso for insert
    with check (true);

drop policy if exists "registros_acceso_select_service_role" on registros_acceso;
drop policy if exists "registros_acceso_select_publico" on registros_acceso;
create policy "registros_acceso_select_publico"
    on registros_acceso for select
    using (true);

-- =========================================================
-- Tabla: beneficios (Fase 2 del PRD)
-- =========================================================
-- Comercios adheridos con descuentos para socios. Se gestiona a mano desde
-- el Table Editor de Supabase (altas, bajas y ediciones) — no hay panel de
-- admin propio todavía, mismo patrón que solicitudes_acceso.
create table if not exists beneficios (
    id uuid primary key default gen_random_uuid(),
    nombre_comercio varchar(150) not null,
    rubro varchar(30) not null
        check (rubro in ('GASTRONOMIA', 'DEPORTES', 'SALUD', 'INDUMENTARIA', 'OTROS')),
    subtitulo varchar(150),
    descuento varchar(50) not null,
    descripcion text not null,
    condiciones text[] not null default '{}',
    direccion text,
    telefono varchar(30),
    whatsapp varchar(30),
    mapa_url text,
    vigencia_hasta date,
    destacado boolean not null default false,
    activo boolean not null default true,
    orden int not null default 0,
    created_at timestamptz not null default now()
);

comment on table beneficios is 'Comercios adheridos con descuentos para socios (Fase 2 del PRD). Se gestiona a mano desde el Table Editor de Supabase, no hay panel de admin propio.';
comment on column beneficios.rubro is 'Categoría para los chips de filtro: GASTRONOMIA, DEPORTES, SALUD, INDUMENTARIA, OTROS.';
comment on column beneficios.condiciones is 'Lista de condiciones de uso, una por elemento (se muestran como bullets en el detalle).';
comment on column beneficios.destacado is 'true = aparece en la sección "Destacado de la semana" arriba del listado.';

create index if not exists idx_beneficios_rubro on beneficios (rubro);
create index if not exists idx_beneficios_activo on beneficios (activo);

alter table beneficios enable row level security;

drop policy if exists "beneficios_select_publico" on beneficios;
create policy "beneficios_select_publico"
    on beneficios for select
    using (activo = true);

-- =========================================================
-- Datos de ejemplo (opcional, útil para probar el MVP)
-- =========================================================
insert into socios (numero_socio, dni, nombre, apellido, categoria, estado_cuota, vencimiento)
values
    ('01850', '30123456', 'Agustin', 'Kiehr', 'Rugby Plantel Superior', 'AL_DIA', '2026-12-31'),
    ('00234', '28456789', 'Maria', 'Gonzalez', 'Hockey Intermedia', 'PENDIENTE', '2026-07-31'),
    ('00099', '15678901', 'Carlos', 'Perez', 'Vitalicio', 'INACTIVO', '2025-01-31'),
    ('00002', null, 'Gabriel', 'Cabrera', 'Jugador Activo', 'AL_DIA', '2026-12-31')
on conflict (numero_socio) do nothing;

-- Placeholder deliberadamente ficticio (no un comercio real): reemplazar o
-- desactivar cuando se carguen los sponsors/comercios adheridos reales.
insert into beneficios (nombre_comercio, rubro, subtitulo, descuento, descripcion, condiciones, destacado, orden, activo)
values (
    'EJEMPLO — reemplazar por un comercio real', 'OTROS', 'Placeholder de prueba', 'XX% OFF',
    'Esta fila es sólo un ejemplo de cómo se ve una tarjeta de beneficio. Reemplazar o desactivar cuando se carguen los sponsors reales.',
    array['Editar esta fila en el Table Editor de Supabase (tabla beneficios) con los datos reales.'],
    false, 0, true
)
on conflict do nothing;
