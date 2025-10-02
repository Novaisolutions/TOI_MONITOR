# 🤖 Formato de Mensajes Compatible con IA

## 📋 Descripción

Los mensajes enviados desde el sistema ahora se guardan en `n8n_chat_histories` con el mismo formato estructurado que usa la IA, lo que permite:

- ✅ **Compatibilidad completa** con el sistema de IA
- ✅ **Análisis automático** de conversaciones
- ✅ **Tracking de estados** del prospecto
- ✅ **Metadatos enriquecidos** para cada mensaje

---

## 🔧 Estructura del Mensaje

### **Campo `message` en `n8n_chat_histories`:**

```json
{
  "type": "ai",
  "content": "{JSON stringificado}",
  "tool_calls": [],
  "additional_kwargs": {},
  "response_metadata": {
    "message_id": "wamid.HBg...",
    "sent_via": "whatsapp_business_api",
    "phone_number_id": "794042540450605"
  },
  "invalid_tool_calls": []
}
```

### **Estructura del `content` (JSON stringificado):**

```json
{
  "respuesta_para_cliente": "Texto del mensaje enviado",
  "estado_interno": {
    "nombre": null,
    "telefono": "5216645487274",
    "vertical": "bienes_raices",
    "interes": "informacion",
    "dolor_o_motivo": "mensaje enviado desde sistema",
    "nivel_interes": 5,
    "listo_para_equipo": false,
    "estado_de_embudo": "contactado",
    "resumen_ia": "Mensaje enviado: ...",
    "fecha_preferida": null,
    "numero_personas": null,
    "tipo_unidad": null,
    "presupuesto_aproximado": null
  },
  "herramientas_usar": [],
  "meta": {
    "siguiente_objetivo": "esperar_respuesta",
    "nueva_info_capturada": false,
    "origen": "whatsapp_manual",
    "timestamp": "2025-01-30T10:00:00.000Z"
  }
}
```

---

## 📊 Campos Explicados

### **1. Nivel Superior (`message`)**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `type` | `string` | Tipo de mensaje: `"ai"` para mensajes del sistema |
| `content` | `string` | JSON stringificado con la estructura completa |
| `tool_calls` | `array` | Herramientas llamadas (vacío para mensajes manuales) |
| `additional_kwargs` | `object` | Argumentos adicionales |
| `response_metadata` | `object` | Metadatos de respuesta (message_id, etc.) |
| `invalid_tool_calls` | `array` | Llamadas inválidas (vacío normalmente) |

### **2. Contenido (`content` parseado)**

#### **`respuesta_para_cliente`**
- El texto real del mensaje enviado al cliente
- Se muestra en WhatsApp exactamente como está aquí

#### **`estado_interno`**
Información del estado del prospecto:

| Campo | Descripción | Valores Posibles |
|-------|-------------|------------------|
| `nombre` | Nombre del cliente | `null` o string |
| `telefono` | Número de teléfono | `"5216645487274"` |
| `vertical` | Línea de negocio | `"bienes_raices"`, `"hospedaje"`, `"general"` |
| `interes` | Tipo de interés | `"informacion"`, `"visita"`, `"cotizacion"`, `"reserva"` |
| `dolor_o_motivo` | Razón del contacto | string descriptivo |
| `nivel_interes` | Nivel de interés (1-10) | número del 1 al 10 |
| `listo_para_equipo` | ¿Listo para ventas? | `true` / `false` |
| `estado_de_embudo` | Etapa del embudo | `"lead"`, `"contactado"`, `"interesado"`, etc. |
| `resumen_ia` | Resumen automático | string descriptivo |
| `fecha_preferida` | Fecha preferida de contacto | `null` o timestamp |
| `numero_personas` | Número de personas | `null` o número |
| `tipo_unidad` | Tipo de unidad/propiedad | `null` o string |
| `presupuesto_aproximado` | Presupuesto del cliente | `null` o número |

#### **`herramientas_usar`**
- Array de herramientas que la IA debería usar
- Vacío para mensajes manuales

#### **`meta`**
Metadatos del mensaje:

| Campo | Descripción |
|-------|-------------|
| `siguiente_objetivo` | Próximo paso sugerido |
| `nueva_info_capturada` | ¿Se capturó información nueva? |
| `origen` | Origen del mensaje (`"whatsapp_manual"`, `"whatsapp_ia"`) |
| `timestamp` | Timestamp del mensaje |

---

## 🔄 Flujo de Guardado

```
1. Usuario envía mensaje desde frontend
       ↓
2. whatsapp-send.js envía mensaje a WhatsApp
       ↓
3. whatsapp-send.js crea payload con formato IA
       ↓
4. Webhook a n8n con estructura completa
       ↓
5. n8n guarda en mensajes_toi (texto simple)
       ↓
6. n8n guarda en n8n_chat_histories (formato IA)
       ↓
7. IA puede procesar el mensaje con contexto completo
```

---

## 🎯 Beneficios del Formato

### **1. Compatibilidad con IA**
- Los mensajes manuales se integran perfectamente con los de la IA
- El historial de chat es consistente
- La IA puede analizar conversaciones completas

### **2. Tracking Mejorado**
- Cada mensaje incluye estado del prospecto
- Metadatos enriquecidos para análisis
- Origen claramente identificado

### **3. Análisis Automático**
- `estado_interno` permite análisis de conversión
- `nivel_interes` para scoring automático
- `estado_de_embudo` para reporting

### **4. Integración con Herramientas**
- Compatible con n8n workflows
- Formato estándar para exportación
- Fácil de procesar con herramientas de análisis

---

## 📝 Ejemplo Completo

### **Mensaje Enviado:**
```
"Hola, tenemos departamentos desde $4,273,711.88 con entrega en 2026"
```

### **Guardado en `n8n_chat_histories`:**
```json
{
  "type": "ai",
  "content": "{\"respuesta_para_cliente\":\"Hola, tenemos departamentos desde $4,273,711.88 con entrega en 2026\",\"estado_interno\":{\"nombre\":null,\"telefono\":\"5216645487274\",\"vertical\":\"bienes_raices\",\"interes\":\"informacion\",\"dolor_o_motivo\":\"mensaje enviado desde sistema\",\"nivel_interes\":5,\"listo_para_equipo\":false,\"estado_de_embudo\":\"contactado\",\"resumen_ia\":\"Mensaje enviado: Hola, tenemos departamentos desde $4,273,711.88 con entrega en 2026\",\"fecha_preferida\":null,\"numero_personas\":null,\"tipo_unidad\":null,\"presupuesto_aproximado\":null},\"herramientas_usar\":[],\"meta\":{\"siguiente_objetivo\":\"esperar_respuesta\",\"nueva_info_capturada\":false,\"origen\":\"whatsapp_manual\",\"timestamp\":\"2025-01-30T10:00:00.000Z\"}}",
  "tool_calls": [],
  "additional_kwargs": {},
  "response_metadata": {
    "message_id": "wamid.HBgNNTIxNjY0NTQ4NzI3NBUCABEYEjJBQkJGMTI2QThBMTVBOUM5NwA=",
    "sent_via": "whatsapp_business_api",
    "phone_number_id": "794042540450605"
  },
  "invalid_tool_calls": []
}
```

### **Guardado en `mensajes_toi`:**
```sql
tipo: 'salida'
numero: '5216645487274'
mensaje: 'Hola, tenemos departamentos desde $4,273,711.88 con entrega en 2026'
conversation_id: 1
```

---

## 🔧 Personalización

### **Cambiar Vertical:**
```javascript
vertical: 'hospedaje' // o 'bienes_raices', 'general'
```

### **Cambiar Nivel de Interés:**
```javascript
nivel_interes: 8 // número del 1-10
```

### **Agregar Información del Prospecto:**
```javascript
estado_interno: {
  nombre: 'Juan Pérez',
  tipo_unidad: '2 recámaras',
  presupuesto_aproximado: 5000000,
  // ... otros campos
}
```

---

## 📊 Consultas Útiles

### **Ver mensajes con formato completo:**
```sql
SELECT 
    id,
    session_id,
    message->>'type' as tipo,
    message->'content' as contenido_estructurado,
    message->'response_metadata'->>'message_id' as whatsapp_id
FROM n8n_chat_histories 
WHERE session_id LIKE '5216645487274%'
ORDER BY id DESC;
```

### **Extraer estado del prospecto:**
```sql
SELECT 
    session_id,
    (message->'content'::jsonb)->>'respuesta_para_cliente' as mensaje,
    ((message->'content'::jsonb)->'estado_interno'->>'nivel_interes')::int as nivel_interes,
    (message->'content'::jsonb)->'estado_interno'->>'estado_de_embudo' as embudo
FROM n8n_chat_histories 
WHERE message->>'type' = 'ai'
ORDER BY id DESC;
```

---

## ✅ **Estado: IMPLEMENTADO**

**Fecha:** 30 de Enero, 2025  
**Versión:** 1.0  
**Compatibilidad:** ✅ 100% compatible con sistema de IA

