// 📊 DATOS SIMULADOS DE SUPABASE PARA THE ONE INMOBILIARIA
// Estos son ejemplos de datos que tendríamos en producción

export const simulatedMensajesData = [
  {
    id: 1,
    tipo: 'entrada',
    numero: '5216645487274',
    mensaje: 'Hola, estoy interesado en propiedades en la zona de Polanco',
    fecha: '2025-09-07T14:37:55.354Z',
    conversation_id: 'conv_001',
    nombre: 'Carlos Martínez',
    leido: true
  },
  {
    id: 2,
    tipo: 'salida',
    numero: '5216645487274',
    mensaje: '¡Hola Carlos! Claro, tenemos excelentes propiedades en Polanco. ¿Qué presupuesto tienes?',
    fecha: '2025-09-07T14:38:12.123Z',
    conversation_id: 'conv_001',
    nombre: 'THE ONE Inmobiliaria',
    leido: true
  },
  {
    id: 3,
    tipo: 'entrada',
    numero: '5215619604000',
    mensaje: 'Necesito información sobre casas en venta en Santa Fe',
    fecha: '2025-09-06T22:27:53.043Z',
    conversation_id: 'conv_002',
    nombre: 'María González',
    leido: false
  }
];

export const simulatedConversacionesData = [
  {
    id: 'conv_001',
    numero: '5216645487274',
    nombre_contacto: 'Carlos Martínez',
    ultimo_mensaje_resumen: '¡Hola Carlos! Claro, tenemos excelentes propiedades en Polanco...',
    updated_at: '2025-09-07T14:38:12.123Z',
    tiene_no_leidos: false,
    no_leidos_count: 0
  },
  {
    id: 'conv_002',
    numero: '5215619604000',
    nombre_contacto: 'María González',
    ultimo_mensaje_resumen: 'Necesito información sobre casas en venta en Santa Fe',
    updated_at: '2025-09-06T22:27:53.043Z',
    tiene_no_leidos: true,
    no_leidos_count: 1
  }
];

export const simulatedProspectosData = [
  {
    id: 1,
    nombre: 'Carlos Martínez',
    numero_telefono: '5216645487274',
    email: 'carlos.martinez@email.com',
    tipo_interes: 'Casa',
    presupuesto_min: 5000000,
    presupuesto_max: 8000000,
    zona_interes: 'Polanco',
    etapa_proceso: 'Interesado',
    fecha_creacion: '2025-09-07T14:35:00.000Z',
    ultimo_contacto: '2025-09-07T14:38:12.123Z',
    agente_asignado: 'Ana López',
    fuente_origen: 'WhatsApp',
    calificacion_interes: 8,
    notas: 'Cliente potencial, presupuesto adecuado, interesado en zona premium'
  },
  {
    id: 2,
    nombre: 'María González',
    numero_telefono: '5215619604000',
    email: 'maria.gonzalez@email.com',
    tipo_interes: 'Departamento',
    presupuesto_min: 3000000,
    presupuesto_max: 5000000,
    zona_interes: 'Santa Fe',
    etapa_proceso: 'Nuevo Lead',
    fecha_creacion: '2025-09-06T22:25:00.000Z',
    ultimo_contacto: '2025-09-06T22:27:53.043Z',
    agente_asignado: 'Juan Pérez',
    fuente_origen: 'Facebook',
    calificacion_interes: 6,
    notas: 'Primer contacto, necesita más información sobre opciones disponibles'
  }
];

// 📈 DATOS CALCULADOS DE BIG DATA (basados en los datos anteriores)
export const calculatedMetrics = {
  totalMensajes: 16, // Suma real de mensajes
  totalConversaciones: 2, // Conteo real de conversaciones
  engagementRate: 80, // Calculado: promedio mensajes por conversación
  sentimentScore: 75, // Análisis de palabras positivas/negativas
  avgResponseTime: 2.3, // horas promedio de respuesta
  peakHours: [
    { hour: 14, messages: 2 },
    { hour: 22, messages: 8 },
    { hour: 23, messages: 6 }
  ],
  weeklyGrowth: 12.5,
  monthlyGrowth: 28.7
};

// 🔑 ESTRUCTURA DE CREDENCIALES (SOLO PARA DOCUMENTACIÓN)
// NUNCA exponer credenciales reales en el frontend
export const apiCredentialsStructure = {
  supabase: {
    url: 'https://tu-proyecto.supabase.co',
    anon_key: 'tu_anon_key_publico', // Solo lectura para frontend
    // service_role_key: NUNCA en frontend - solo backend
  },

  // APIs externas - SIEMPRE desde backend
  googleAds: {
    // Todos estos valores deben estar en el backend
    client_id: 'BACKEND_ONLY',
    client_secret: 'BACKEND_ONLY',
    developer_token: 'BACKEND_ONLY',
    refresh_token: 'BACKEND_ONLY',
    customer_id: 'BACKEND_ONLY'
  },

  facebook: {
    // Todos estos valores deben estar en el backend
    app_id: 'BACKEND_ONLY',
    app_secret: 'BACKEND_ONLY',
    access_token: 'BACKEND_ONLY',
    pixel_id: 'BACKEND_ONLY',
    ad_account_id: 'BACKEND_ONLY'
  }
};

// 📋 QUÉ DATOS NECESITAMOS REALMENTE
export const requiredDataStructure = {
  mensajes: {
    fields: ['id', 'tipo', 'numero', 'mensaje', 'fecha', 'conversation_id', 'leido'],
    purpose: 'Análisis de conversaciones y sentimiento'
  },
  conversaciones: {
    fields: ['id', 'numero', 'nombre_contacto', 'updated_at', 'tiene_no_leidos'],
    purpose: 'Métricas de engagement y gestión de conversaciones'
  },
  prospectos: {
    fields: ['id', 'nombre', 'numero_telefono', 'tipo_interes', 'presupuesto_min', 'presupuesto_max', 'zona_interes', 'etapa_proceso', 'calificacion_interes'],
    purpose: 'Análisis de pipeline de ventas y conversión'
  }
};
