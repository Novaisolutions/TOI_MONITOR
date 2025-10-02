// Tipo para datos JSON genéricos
type Json = Record<string, any> | any[] | string | number | boolean | null;

export interface Conversacion {
  id: number;
  numero: string;
  resumen: string | null;
  status: string;
  updated_at: string;
  reactivacion_intentos: number;
  ultimo_intento_reactivacion: string | null;
  proximo_seguimiento: string | null;
  nombre_contacto: string | null;
  ultimo_mensaje_resumen: string | null;
  tiene_no_leidos: boolean;
  no_leidos_count: number;
  plantel: string | null;
  resumen_ia?: string | null;
  real_last_message_date?: string; // Campo auxiliar para ordenamiento por último mensaje real
}

export interface Mensaje {
  id: number;
  tipo: string;
  numero: string;
  mensaje: string;
  fecha: string;
  nombre: string | null;
  media_url: string | null;
  leido: boolean;
  conversation_id: number | null;
}

export interface ProspectoMkt {
  id: number;
  created_at: string;
  updated_at: string;
  nombre: string | null;
  carrera_interes: string | null;
  plantel_interes: string | null;
  turno: string | null;
  numero_telefono: string | null;
  estado_embudo: string | null;
  prioridad: string | null;
  resumen_ia: string | null;
  ultima_intencion: string | null;
  sentimiento_conversacion: string | null;
  score_interes: number | null;
  probabilidad_conversion: number | null;
  fecha_ultimo_contacto: string | null;
  proximo_seguimiento: string | null;
  notas_ia: string | null;
  tags_automaticas: string[] | null;
  historial_estados: Json | null;
  metricas_conversacion: Json | null;
  alertas_ia: string[] | null;
  presupuesto_mencionado: number | null;
  objeciones_detectadas: string[] | null;
  momento_optimo_contacto: string | null;
  perfil_comunicacion: string | null;
  urgencia_detectada: string | null;
  competencia_mencionada: string[] | null;
  fecha_decision_estimada: string | null;
  canal_preferido: string | null;
  horario_preferido: string | null;
  motivaciones_principales: string[] | null;
  barreras_identificadas: string[] | null;
  conversation_id: number | null;
  notas_manuales: { content: string; timestamp: string; author?: string }[] | null;
  real_last_message_date?: string; // Campo auxiliar para ordenamiento por último mensaje real
  
  // 🆕 CAMPOS DE SEGUIMIENTO 4H
  proximo_seguimiento_4h: string | null;
  necesita_seguimiento_4h: boolean | null;
  minutos_restantes_4h: number | null;
  
  // 🚫 CAMPOS NO CONTACTAR
  no_contactar: boolean | null;
  no_contactar_motivo: string | null;
}

// ========================================
// 🏠 THE ONE INMOBILIARIA - NUEVAS INTERFACES
// ========================================

export interface ProspectoTOI {
  id: number;
  created_at: string;
  updated_at: string;
  nombre: string | null;
  numero_telefono: string | null;
  email: string | null;
  estado_embudo: string | null;
  prioridad: string | null;
  resumen_ia: string | null;
  ultima_intencion: string | null;
  sentimiento_conversacion: string | null;
  score_interes: number | null;
  probabilidad_conversion: number | null;
  fecha_ultimo_contacto: string | null;
  proximo_seguimiento: string | null;
  notas_ia: string | null;
  tags_automaticas: string[] | null;
  historial_estados: Json | null;
  metricas_conversacion: Json | null;
  alertas_ia: string[] | null;
  presupuesto_mencionado: number | null;
  objeciones_detectadas: string[] | null;
  momento_optimo_contacto: string | null;
  perfil_comunicacion: string | null;
  urgencia_detectada: string | null;
  competencia_mencionada: string[] | null;
  fecha_decision_estimada: string | null;
  canal_preferido: string | null;
  horario_preferido: string | null;
  motivaciones_principales: string[] | null;
  barreras_identificadas: string[] | null;
  conversation_id: number | null;
  notas_manuales: { content: string; timestamp: string; author?: string }[] | null;
  real_last_message_date?: string;
  
  // 🏠 CAMPOS ESPECÍFICOS THE ONE INMOBILIARIA - BIENES RAÍCES
  tipo_propiedad_interes: string | null; // Casa, Departamento, Terreno, Oficina, etc.
  ubicacion_preferida: string | null; // Zona o colonia de interés
  rango_precio_min: number | null;
  rango_precio_max: number | null;
  tipo_operacion: string | null; // Compra, Venta, Renta
  caracteristicas_deseadas: string[] | null; // [Estacionamiento, Jardín, Alberca, etc.]
  metros_cuadrados_min: number | null;
  numero_recamaras: number | null;
  numero_banos: number | null;
  tiene_credito_preaprobado: boolean | null;
  institucion_credito: string | null;
  
  // 🏨 CAMPOS ESPECÍFICOS THE ONE INMOBILIARIA - HOSPEDAJE
  tipo_hospedaje_interes: string | null; // Hotel, Airbnb, Casa vacacional, etc.
  destino_interes: string | null; // Ciudad o lugar de interés
  fecha_checkin_deseada: string | null;
  fecha_checkout_deseada: string | null;
  numero_huespedes: number | null;
  presupuesto_por_noche: number | null;
  servicios_deseados: string[] | null; // [WiFi, Desayuno, Spa, etc.]
  motivo_viaje: string | null; // Negocios, Placer, Familia, etc.
  experiencia_previa_marca: string | null;
  
  // 📊 CAMPOS DE SEGUIMIENTO THE ONE INMOBILIARIA
  fuente_lead: string | null; // Website, Redes sociales, Referido, etc.
  agente_asignado: string | null;
  fecha_primera_cita: string | null;
  status_seguimiento: string | null;
  proximo_seguimiento_4h: string | null;
  necesita_seguimiento_4h: boolean | null;
  minutos_restantes_4h: number | null;
  no_contactar: boolean | null;
  no_contactar_motivo: string | null;
}

export interface ConversacionTOI {
  id: number;
  numero: string;
  resumen: string | null;
  status: string;
  updated_at: string;
  reactivacion_intentos: number;
  ultimo_intento_reactivacion: string | null;
  proximo_seguimiento: string | null;
  nombre_contacto: string | null;
  ultimo_mensaje_resumen: string | null;
  tiene_no_leidos: boolean;
  no_leidos_count: number;
  plantel?: string | null;
  resumen_ia?: string | null;
  real_last_message_date?: string;
  canal?: 'whatsapp' | 'messenger' | 'instagram';
}

export interface MensajeTOI {
  id: number;
  tipo: string;
  numero: string;
  mensaje: string;
  fecha: string;
  nombre: string | null;
  media_url: string | null;
  leido: boolean;
  conversation_id: number | null;
  canal?: 'whatsapp' | 'messenger' | 'instagram';
}

// =====================================================
// 🎯 SISTEMA DE ASIGNACIÓN Y OPORTUNIDADES
// =====================================================

export interface UsuarioTOI {
  id: string; // UUID
  email: string;
  nombre: string;
  rol: 'admin' | 'asesor' | 'gerente';
  equipo_id: string | null;
  activo: boolean;
  total_leads_asignados: number;
  total_oportunidades: number;
  oportunidades_ganadas: number;
  oportunidades_perdidas: number;
  tasa_conversion: number;
  telefono: string | null;
  avatar_url: string | null;
  configuracion: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LeadTOI {
  id: number;
  numero_telefono: string;
  nombre: string | null;
  email: string | null;
  assigned_to: string | null; // UUID del asesor
  assigned_at: string | null;
  assigned_by: string | null;
  ultimo_cambio_asignacion: string | null;
  fuente: 'whatsapp' | 'facebook' | 'instagram' | 'web' | 'referido' | 'llamada' | 'otro';
  campana: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  estado_general: 'nuevo' | 'contactado' | 'calificado' | 'en_atencion' | 'cliente' | 'perdido' | 'pausado';
  score_calidad: number;
  tags: string[];
  notas: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OportunidadTOI {
  id: number;
  folio: string;
  lead_id: number | null;
  prospecto_id: number | null;
  tipo: 'venta_departamento' | 'venta_casa' | 'venta_terreno' | 'venta_comercial' | 
        'renta_departamento' | 'renta_casa' | 'renta_oficina' | 'renta_local' |
        'visita_showroom' | 'cotizacion' | 'asesoria' | 'otro';
  descripcion: string | null;
  valor_estimado: number | null;
  moneda: string;
  etapa: 'contacto_inicial' | 'calificacion' | 'presentacion' | 'propuesta' | 'negociacion' | 'cierre' | 'postventa';
  probabilidad: number;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  assigned_to: string | null; // UUID del asesor
  assigned_by: string | null;
  assigned_at: string | null;
  proximo_seguimiento: string | null;
  dias_en_etapa: number;
  total_interacciones: number;
  ultimo_contacto: string | null;
  estado: 'abierta' | 'ganada' | 'perdida' | 'pausada' | 'cancelada';
  razon_ganada: string | null;
  razon_perdida: string | null;
  competidor_perdido: string | null;
  fecha_cierre_estimada: string | null;
  fecha_cierre_real: string | null;
  fecha_primer_contacto: string | null;
  tags: string[];
  notas_ia: string | null;
  notas_manuales: Array<{
    texto: string;
    autor: string;
    fecha: string;
  }>;
  metricas: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AsignacionLogTOI {
  id: number;
  tipo: 'lead' | 'oportunidad';
  entidad_id: number;
  assigned_from: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  motivo: string | null;
  metodo: 'manual' | 'round_robin' | 'automatico' | 'por_carga' | 'reasignacion';
  metadata: Record<string, any>;
  created_at: string;
}

// Vistas helper
export interface ViewLeadCompleto extends LeadTOI {
  asesor_id: string | null;
  asesor_nombre: string | null;
  asesor_email: string | null;
  equipo_nombre: string | null;
  prospecto_id: number | null;
  estado_embudo: string | null;
  resumen_ia: string | null;
  nivel_interes: number | null;
  conversation_id: number | null;
  ultimo_mensaje_fecha: string | null;
  tiene_no_leidos: boolean | null;
  no_leidos_count: number | null;
  total_mensajes: number | null;
  total_oportunidades: number;
  oportunidades_abiertas: number;
  oportunidades_ganadas: number;
  oportunidades_perdidas: number;
}

export interface ViewOportunidadCompleta extends OportunidadTOI {
  lead_nombre: string | null;
  lead_email: string | null;
  asesor_id: string | null;
  asesor_nombre: string | null;
  asesor_email: string | null;
  numero_telefono: string | null;
}

export interface ViewMetricasAsesor {
  asesor_id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  total_leads_asignados: number;
  total_oportunidades: number;
  oportunidades_ganadas: number;
  oportunidades_perdidas: number;
  tasa_conversion: number;
  leads_activos: number;
  leads_nuevos: number;
  leads_en_atencion: number;
  oportunidades_totales: number;
  oportunidades_abiertas: number;
  pipeline_valor: number | null;
  equipo_nombre: string | null;
}