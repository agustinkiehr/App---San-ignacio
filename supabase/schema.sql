-- San Ignacio Rugby — Socios App (MVP)
-- Modelo de datos: Carnet Digital + Validación de Acceso por QR en Portería.
-- Ejecutar en el SQL Editor de Supabase (o vía `supabase db push`).

create extension if not exists pgcrypto;

-- =========================================================
-- Tabla: socios
-- =========================================================
create table if not exists socios (
    id uuid primary key default gen_random_uuid(),
    numero_socio varchar(10) unique not null, -- ej: '01850' (5 dígitos, ceros a la izquierda)
    nombre varchar(100) not null,
    apellido varchar(100) not null,
    categoria varchar(50),
    estado_cuota varchar(20) not null default 'AL_DIA'
        check (estado_cuota in ('AL_DIA', 'PENDIENTE', 'INACTIVO')),
    created_at timestamptz not null default now()
);

comment on table socios is 'Padrón de socios del club, con el estado de cuota vigente.';
comment on column socios.numero_socio is 'Número de socio en texto plano, tal como se codifica en el QR físico del carnet (5 dígitos, con ceros a la izquierda).';

create index if not exists idx_socios_numero_socio on socios (numero_socio);
create index if not exists idx_socios_estado_cuota on socios (estado_cuota);

-- =========================================================
-- Tabla: registros_acceso
-- =========================================================
create table if not exists registros_acceso (
    id uuid primary key default gen_random_uuid(),
    socio_id uuid references socios(id) on delete cascade,
    fecha_hora timestamptz not null default now(),
    resultado varchar(20) not null
        check (resultado in ('PERMITIDO', 'DENEGADO'))
);

comment on table registros_acceso is 'Historial de intentos de acceso por portería, uno por cada escaneo de QR.';

create index if not exists idx_registros_acceso_socio_id on registros_acceso (socio_id);
create index if not exists idx_registros_acceso_fecha_hora on registros_acceso (fecha_hora desc);

-- =========================================================
-- Row Level Security
-- =========================================================
-- MVP: sin login todavía (la app usa la anon key desde el dispositivo del
-- socio y desde la tablet de portería). Se habilita lectura pública de
-- socios (necesaria para resolver el QR) y solo inserción en
-- registros_acceso (nadie puede leer ni alterar el historial desde el
-- cliente). Cuando se sume autenticación de socios/portero, reemplazar estas
-- políticas por reglas basadas en auth.uid() / rol.

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

-- Nadie puede leer, modificar o borrar registros de acceso desde el cliente;
-- sólo el service_role (backoffice) tiene esa visibilidad.
drop policy if exists "registros_acceso_select_service_role" on registros_acceso;
create policy "registros_acceso_select_service_role"
    on registros_acceso for select
    using (auth.role() = 'service_role');

-- =========================================================
-- Datos de ejemplo (opcional, útil para probar el MVP)
-- =========================================================
insert into socios (numero_socio, nombre, apellido, categoria, estado_cuota)
values
    ('01850', 'Agustin', 'Kiehr', 'Socio', 'AL_DIA'),
    ('00234', 'Maria', 'Gonzalez', 'Socio', 'PENDIENTE'),
    ('00099', 'Carlos', 'Perez', 'Socio', 'INACTIVO')
on conflict (numero_socio) do nothing;
