# 🔄 Workflow n8n para Guardar Mensajes de WhatsApp

## 📋 Descripción

Este workflow recibe los mensajes enviados desde la app y los guarda en dos tablas de Supabase:
1. **`mensajes_toi`** - Tabla principal de mensajes
2. **`n8n_chat_histories`** - Historial para el chatbot de n8n

## 🎯 Webhook Trigger

### URL del Webhook
```
https://novaisolutions.app.n8n.cloud/webhook/whatsapp-message-send
```

### Payload que Recibe
```json
{
  "numero": "5216645487274",
  "mensaje": "Texto del mensaje enviado",
  "tipo": "salida",
  "fecha": "2025-01-30T10:00:00.000Z",
  "messageId": "wamid.HBgNNTIxNjY0NTQ4NzI3NBUCABEYEkQyMkY5QjgwRTJERThDQTRERQA=",
  "conversation_id": null,
  "nombre": null,
  "session_id": "5216645487274brokers_julio2025_V2.1.7",
  "chat_message": {
    "type": "human",
    "data": {
      "content": "Texto del mensaje enviado",
      "additional_kwargs": {}
    }
  }
}
```

## 🔧 Configuración del Workflow

### Nodo 1: Webhook Trigger

```json
{
  "parameters": {
    "httpMethod": "POST",
        "path": "whatsapp-message-send",
    "options": {}
  },
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "name": "WhatsApp Message Sent Webhook"
}
```

### Nodo 2: Obtener conversation_id

**Purpose:** Buscar o crear la conversación en `conversaciones_toi`

```json
{
  "parameters": {
    "url": "=https://pudrykifftcwxjlvdgmu.supabase.co/rest/v1/conversaciones_toi?numero=eq.{{ $json.body.numero }}&select=id",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "apikey",
          "value": "{{  $env.SUPABASE_ANON_KEY }}"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ $env.SUPABASE_ANON_KEY }}"
        }
      ]
    },
    "options": {}
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "name": "Buscar Conversación"
}
```

### Nodo 3: IF - ¿Existe conversación?

```json
{
  "parameters": {
    "conditions": {
      "string": [
        {
          "value1": "={{ $json.length }}",
          "operation": "isNotEmpty"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.if",
  "typeVersion": 1,
  "name": "¿Existe Conversación?"
}
```

### Nodo 4a: Crear Conversación (si no existe)

```json
{
  "parameters": {
    "url": "https://pudrykifftcwxjlvdgmu.supabase.co/rest/v1/conversaciones_toi",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "apikey",
          "value": "{{ $env.SUPABASE_ANON_KEY }}"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ $env.SUPABASE_ANON_KEY }}"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Prefer",
          "value": "return=representation"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ { numero: $('WhatsApp Message Sent Webhook').item.json.body.numero, nombre_contacto: null, ultimo_mensaje_resumen: $('WhatsApp Message Sent Webhook').item.json.body.mensaje.substring(0, 100), ultimo_mensaje_fecha: $('WhatsApp Message Sent Webhook').item.json.body.fecha, ultimo_mensaje_tipo: 'salida', total_mensajes: 1, total_mensajes_salida: 1 } }}",
    "options": {}
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "name": "Crear Conversación"
}
```

### Nodo 5: Guardar en mensajes_toi

```json
{
  "parameters": {
    "url": "https://pudrykifftcwxjlvdgmu.supabase.co/rest/v1/mensajes_toi",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "apikey",
          "value": "{{ $env.SUPABASE_ANON_KEY }}"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ $env.SUPABASE_ANON_KEY }}"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Prefer",
          "value": "return=minimal"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ { tipo: $('WhatsApp Message Sent Webhook').item.json.body.tipo, numero: $('WhatsApp Message Sent Webhook').item.json.body.numero, mensaje: $('WhatsApp Message Sent Webhook').item.json.body.mensaje, fecha: $('WhatsApp Message Sent Webhook').item.json.body.fecha, nombre: $('WhatsApp Message Sent Webhook').item.json.body.nombre, media_url: null, leido: true, conversation_id: $('¿Existe Conversación?').item.json[0]?.id || $json[0]?.id } }}",
    "options": {}
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "name": "Guardar en mensajes_toi"
}
```

### Nodo 6: Guardar en n8n_chat_histories

```json
{
  "parameters": {
    "url": "https://pudrykifftcwxjlvdgmu.supabase.co/rest/v1/n8n_chat_histories",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "apikey",
          "value": "{{ $env.SUPABASE_ANON_KEY }}"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ $env.SUPABASE_ANON_KEY }}"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Prefer",
          "value": "return=minimal"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ { session_id: $('WhatsApp Message Sent Webhook').item.json.body.session_id, message: JSON.stringify($('WhatsApp Message Sent Webhook').item.json.body.chat_message) } }}",
    "options": {}
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "name": "Guardar en n8n_chat_histories"
}
```

### Nodo 7: Actualizar Conversación

```json
{
  "parameters": {
    "url": "=https://pudrykifftcwxjlvdgmu.supabase.co/rest/v1/conversaciones_toi?id=eq.{{ $('¿Existe Conversación?').item.json[0]?.id || $('Crear Conversación').item.json[0]?.id }}",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "apikey",
          "value": "{{ $env.SUPABASE_ANON_KEY }}"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ $env.SUPABASE_ANON_KEY }}"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "method": "PATCH",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ { ultimo_mensaje_resumen: $('WhatsApp Message Sent Webhook').item.json.body.mensaje.substring(0, 100), ultimo_mensaje_fecha: $('WhatsApp Message Sent Webhook').item.json.body.fecha, ultimo_mensaje_tipo: 'salida', ultimo_mensaje_salida_fecha: $('WhatsApp Message Sent Webhook').item.json.body.fecha, total_mensajes_salida: $('¿Existe Conversación?').item.json[0]?.total_mensajes_salida + 1 || 1, total_mensajes: $('¿Existe Conversación?').item.json[0]?.total_mensajes + 1 || 1, updated_at: $('WhatsApp Message Sent Webhook').item.json.body.fecha } }}",
    "options": {}
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "name": "Actualizar Conversación"
}
```

## 🔗 Diagrama de Flujo

```
┌─────────────────────────────────────┐
│ 1. Webhook Trigger                  │
│ (Recibe mensaje enviado)            │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│ 2. Buscar Conversación              │
│ GET conversaciones_toi?numero=eq... │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│ 3. ¿Existe Conversación?            │
└──────────────┬──────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
      ↓ No              ↓ Sí
┌──────────────┐  ┌─────────────┐
│ 4a. Crear    │  │ 4b. Usar    │
│ Conversación │  │ Existente   │
└──────┬───────┘  └──────┬──────┘
       │                 │
       └────────┬────────┘
                │
                ↓
┌─────────────────────────────────────┐
│ 5. Guardar en mensajes_toi          │
│ POST mensajes_toi                   │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│ 6. Guardar en n8n_chat_histories    │
│ POST n8n_chat_histories             │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│ 7. Actualizar Conversación          │
│ PATCH conversaciones_toi            │
│ (contadores y último mensaje)       │
└─────────────────────────────────────┘
```

## 🔐 Variables de Entorno en n8n

Configura estas variables de entorno en n8n:

```bash
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Formato de n8n_chat_histories

El mensaje se guarda en este formato:

```json
{
  "session_id": "5216645487274brokers_julio2025_V2.1.7",
  "message": {
    "type": "human",
    "data": {
      "content": "Texto del mensaje enviado",
      "additional_kwargs": {}
    }
  }
}
```

### Estructura del session_id

```
{numero}brokers_julio2025_V2.1.7
```

Ejemplo: `5216645487274brokers_julio2025_V2.1.7`

## ✅ Testing

### Paso 1: Probar el Webhook

```bash
curl -X POST https://novaisolutions.app.n8n.cloud/webhook/whatsapp-message-send \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "5216645487274",
    "mensaje": "Mensaje de prueba",
    "tipo": "salida",
    "fecha": "2025-01-30T10:00:00.000Z",
    "messageId": "test_123",
    "conversation_id": null,
    "nombre": null,
    "session_id": "5216645487274brokers_julio2025_V2.1.7",
    "chat_message": {
      "type": "human",
      "data": {
        "content": "Mensaje de prueba",
        "additional_kwargs": {}
      }
    }
  }'
```

### Paso 2: Verificar en Supabase

```sql
-- Verificar en mensajes_toi
SELECT * FROM mensajes_toi 
WHERE numero = '5216645487274' 
AND tipo = 'salida' 
ORDER BY fecha DESC 
LIMIT 1;

-- Verificar en n8n_chat_histories
SELECT * FROM n8n_chat_histories 
WHERE session_id = '5216645487274brokers_julio2025_V2.1.7' 
ORDER BY id DESC 
LIMIT 1;

-- Verificar conversación actualizada
SELECT 
  id,
  numero,
  ultimo_mensaje_resumen,
  ultimo_mensaje_fecha,
  total_mensajes,
  total_mensajes_salida
FROM conversaciones_toi 
WHERE numero = '5216645487274';
```

## 🔧 Configuración en Netlify

Agregar la variable de entorno en Netlify:

```bash
N8N_WEBHOOK_URL=https://novaisolutions.app.n8n.cloud/webhook/whatsapp-message-send
```

## 📝 Notas Importantes

1. **El webhook es no bloqueante:** Si falla, el mensaje se envía de todos modos
2. **conversation_id se completa en n8n:** Se busca o crea automáticamente
3. **Formato específico para n8n_chat_histories:** Compatible con el chatbot de n8n
4. **Session ID incluye versión:** `brokers_julio2025_V2.1.7` para identificar la versión del bot

## 🐛 Troubleshooting

### Problema: No se guardan los mensajes

**Solución:**
1. Verificar que el webhook de n8n esté activo
2. Revisar logs en n8n para ver errores
3. Verificar que `SUPABASE_ANON_KEY` esté configurado en n8n

### Problema: conversation_id es null

**Solución:**
1. Verificar que el nodo "Buscar Conversación" esté funcionando
2. Asegurarse de que la lógica de creación de conversación funcione

### Problema: Formato incorrecto en n8n_chat_histories

**Solución:**
1. Verificar que el `session_id` tenga el formato correcto
2. Asegurarse de que `chat_message` sea un objeto JSON válido

---

**Última actualización:** 30 de Enero, 2025  
**Status:** ✅ Documentado y listo para implementar

