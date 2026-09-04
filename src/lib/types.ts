export type EstadoCuota = 'AL_DIA' | 'PENDIENTE' | 'INACTIVO'
export type ResultadoAcceso = 'PERMITIDO' | 'DENEGADO'
export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'

export interface Socio {
  id: string
  numero_socio: string
  dni: string | null
  nombre: string
  apellido: string
  categoria: string | null
  foto_url: string | null
  vencimiento: string | null
  estado_cuota: EstadoCuota
  user_id: string | null
  email: string | null
  created_at: string
}

export interface SolicitudAcceso {
  id: string
  user_id: string
  numero_socio: string | null
  dni: string
  email: string
  telefono: string
  estado: EstadoSolicitud
  notas: string | null
  created_at: string
  revisado_at: string | null
}

export interface RegistroAcceso {
  id: string
  socio_id: string
  fecha_hora: string
  resultado: ResultadoAcceso
  excepcion: boolean
}

export interface RegistroAccesoConSocio extends RegistroAcceso {
  socio: Pick<Socio, 'nombre' | 'apellido' | 'categoria' | 'numero_socio'> | null
}

export const ESTADO_LABEL: Record<EstadoCuota, string> = {
  AL_DIA: 'Cuota al día',
  PENDIENTE: 'Cuota pendiente',
  INACTIVO: 'Socio inactivo',
}
