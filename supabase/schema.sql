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

comment on table socios is 'Padrón de socios del club, con el estado de cuota vigente.';
comment on column socios.numero_socio is 'Número de socio en texto plano, tal como se codifica en el QR físico del carnet (5 dígitos, con ceros a la izquierda).';
comment on column socios.dni is 'DNI del socio, para el ingreso manual en portería cuando el QR falla y para un futuro login por DNI.';
comment on column socios.vencimiento is 'Próximo vencimiento de cuota mostrado en el carnet (informativo; no hay pasarela de pago en el MVP).';

create index if not exists idx_socios_numero_socio on socios (numero_socio);
create index if not exists idx_socios_dni on socios (dni);
create index if not exists idx_socios_estado_cuota on socios (estado_cuota);

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
-- Row Level Security
-- =========================================================
-- MVP: todavía sin login (la app usa la anon key tanto desde el teléfono del
-- socio como desde la tablet de portería, que en esta fase se asume un
-- dispositivo de confianza física en el club, sin autenticación propia).
--
-- Se habilita lectura pública de socios (necesaria para resolver el QR/DNI) y
-- lectura + inserción pública de registros_acceso (el panel de portería
-- necesita mostrar "ingresos hoy" y los últimos accesos en vivo). Esto es un
-- trade-off deliberado del MVP: cualquiera con la anon key puede leer el
-- padrón completo y el historial de accesos. Cuando se sume autenticación de
-- socios/portero (Fase 1 del PRD: Login + Solicitar Acceso), hay que
-- reemplazar estas políticas por reglas basadas en auth.uid() / rol
-- ('socio' sólo ve su propia fila; 'portero' autenticado es el único que lee
-- registros_acceso).

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
-- Datos de ejemplo (opcional, útil para probar el MVP)
-- =========================================================
insert into socios (numero_socio, dni, nombre, apellido, categoria, estado_cuota, vencimiento)
values
    ('01850', '30123456', 'Agustin', 'Kiehr', 'Rugby Plantel Superior', 'AL_DIA', '2026-12-31'),
    ('00234', '28456789', 'Maria', 'Gonzalez', 'Hockey Intermedia', 'PENDIENTE', '2026-07-31'),
    ('00099', '15678901', 'Carlos', 'Perez', 'Vitalicio', 'INACTIVO', '2025-01-31')
on conflict (numero_socio) do nothing;
