import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeEstadoEmbudo(estado?: string | null): string {
  if (!estado) return 'lead';
  
  // Convertir a lowercase y limpiar espacios
  const normalized = estado.toLowerCase().trim();
  
  // Normalizar variaciones del estado "agendó cita"
  if (['agendó cita', 'agendó cita.', 'agendo cita', 'cita agendada', 'cita programada', 'cita confirmada', 'cita_agendada'].includes(normalized)) {
    return 'cita_agendada';
  }
  
  // Normalizar otros estados comunes
  switch (normalized) {
    case 'contactado':
      return 'contactado';
    case 'lead':
    case 'nuevo lead':
      return 'lead';
    case 'llamar_mas_tarde':
    case 'llamar mas tarde':
    case 'contactar mas tarde':
      return 'llamar_mas_tarde';
    case 'inscrito':
    case 'inscripto':
      return 'inscrito';
    case 'se_brindaron_costos':
    case 'costos brindados':
      return 'se_brindaron_costos';
    case 'interes_concreto':
    case 'interés concreto':
      return 'interes_concreto';
    case 'informacion_solicitada':
    case 'información solicitada':
      return 'informacion_solicitada';
    case 'cita_solicitada':
    case 'cita solicitada':
      return 'cita_solicitada';
    default:
      return normalized;
  }
}