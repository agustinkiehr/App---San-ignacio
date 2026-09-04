export type EstadoCuota = 'AL_DIA' | 'PENDIENTE' | 'INACTIVO'
export type ResultadoAcceso = 'PERMITIDO' | 'DENEGADO'

export interface Socio {
  id: string
  numero_socio: string
  nombre: string
  apellido: string
  categoria: string | null
  estado_cuota: EstadoCuota
  created_at: string
}

export interface RegistroAcceso {
  id: string
  socio_id: string
  fecha_hora: string
  resultado: ResultadoAcceso
}

export const ESTADO_LABEL: Record<EstadoCuota, string> = {
  AL_DIA: 'Al día',
  PENDIENTE: 'Cuota pendiente',
  INACTIVO: 'Inactivo',
}
