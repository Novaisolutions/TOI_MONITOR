# 🏗️ Arquitectura de la Integración WhatsApp

## 📐 Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Navegador (React App)                                     │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  ChatView.tsx                                        │  │  │
│  │  │  ┌──────────────────────────────────────────────┐   │  │  │
│  │  │  │  MessageInput                                 │   │  │  │
│  │  │  │  [Usuario escribe: "Hola"]                   │   │  │  │
│  │  │  │  [Presiona Enter] ──────────────────────┐    │   │  │  │
│  │  │  └──────────────────────────────────────────│────┘   │  │  │
│  │  │                                              │        │  │  │
│  │  │  handleSendMessage()                        │        │  │  │
│  │  │  ↓                                           │        │  │  │
│  │  │  useWhatsApp.sendMessage({                  │        │  │  │
│  │  │    to: "521234567890",                      │        │  │  │
│  │  │    message: "Hola"                          │        │  │  │
│  │  │  })                                          │        │  │  │
│  │  └──────────────────────────────────────────────┼────────┘  │  │
│  │                                                  │           │  │
│  └──────────────────────────────────────────────────┼───────────┘  │
│                                                     │              │
└─────────────────────────────────────────────────────┼──────────────┘
                                                      │
                                                      │ fetch()
                                                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NETLIFY (SERVERLESS)                          │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /.netlify/functions/whatsapp-send                         │  │
│  │                                                             │  │
│  │  Recibe:                                                    │  │
│  │  {                                                          │  │
│  │    to: "521234567890",                                     │  │
│  │    message: "Hola"                                         │  │
│  │  }                                                          │  │
│  │                                                             │  │
│  │  ┌────────────────────────────────────────────┐            │  │
│  │  │  Validación                                │            │  │
│  │  │  • ¿Tiene 'to' y 'message'?                │            │  │
│  │  │  • ¿Token configurado?                     │            │  │
│  │  │  • Limpiar número                          │            │  │
│  │  └────────────────────────────────────────────┘            │  │
│  │                                                             │  │
│  │  Lee variable de entorno:                                  │  │
│  │  WHATSAPP_ACCESS_TOKEN = "EAAxxxxxxxxxxxxx..." 🔒          │  │
│  │  ↓                                                          │  │
│  │  Construye payload:                                        │  │
│  │  {                                                          │  │
│  │    messaging_product: "whatsapp",                          │  │
│  │    to: "521234567890",                                     │  │
│  │    type: "text",                                           │  │
│  │    text: { body: "Hola" }                                  │  │
│  │  }                                                          │  │
│  │                                                             │  │
│  └──────────────────────────────────────────────────┼──────────┘  │
│                                                      │             │
└──────────────────────────────────────────────────────┼─────────────┘
                                                       │
                                                       │ fetch()
                                                       │ + Bearer Token
                                                       ↓
┌─────────────────────────────────────────────────────────────────┐
│              FACEBOOK GRAPH API (WhatsApp)                       │
│                                                                   │
│  POST https://graph.facebook.com/v21.0/                         │
│       1689375181774438/messages                                  │
│                                                                   │
│  Headers:                                                        │
│    Authorization: Bearer EAAxxxxxxxxxxxxx...                     │
│    Content-Type: application/json                               │
│                                                                   │
│  Body: { ... }                                                   │
│                                                                   │
│  ┌────────────────────────────────────────┐                     │
│  │  Procesamiento de WhatsApp              │                     │
│  │  • Valida token                         │                     │
│  │  • Valida número destino                │                     │
│  │  • Envía mensaje                        │                     │
│  └────────────────────────────────────────┘                     │
│                                                                   │
│  Responde:                                                       │
│  {                                                                │
│    messages: [{                                                  │
│      id: "wamid.HBgNNTE..."                                     │
│    }]                                                            │
│  }                                                                │
│                                                                   │
└──────────────────────────────────────────────┼───────────────────┘
                                               │
                                               │ Response
                                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NETLIFY (SERVERLESS)                          │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /.netlify/functions/whatsapp-send                         │  │
│  │                                                             │  │
│  │  Procesa respuesta:                                        │  │
│  │  {                                                          │  │
│  │    success: true,                                          │  │
│  │    messageId: "wamid.HBgNNTE..."                          │  │
│  │  }                                                          │  │
│  │                                                             │  │
│  └──────────────────────────────────────────────┼──────────────┘  │
│                                                 │                │
└─────────────────────────────────────────────────┼────────────────┘
                                                  │
                                                  │ JSON Response
                                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Navegador (React App)                                     │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  ChatView.tsx                                        │  │  │
│  │  │                                                       │  │  │
│  │  │  Recibe resultado:                                   │  │  │
│  │  │  { success: true, messageId: "..." }                │  │  │
│  │  │                                                       │  │  │
│  │  │  ┌──────────────────────────────────────────────┐   │  │  │
│  │  │  │  Notificación                                 │   │  │  │
│  │  │  │  ┌────────────────────────┐                   │   │  │  │
│  │  │  │  │ ✓ Mensaje enviado      │ (verde)           │   │  │  │
│  │  │  │  └────────────────────────┘                   │   │  │  │
│  │  │  └──────────────────────────────────────────────┘   │  │  │
│  │  │                                                       │  │  │
│  │  │  Input limpiado: ""                                  │  │  │
│  │  │                                                       │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Flujo de Seguridad del Token

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (React)                                                │
│  ❌ NO tiene acceso al token                                    │
│  ❌ NO puede ver el token                                       │
│  ❌ NO puede interceptarse desde el navegador                   │
└───────────────────────────────────┬─────────────────────────────┘
                                    │
                                    │ Solo envía:
                                    │ { to, message }
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  NETLIFY FUNCTIONS (Node.js Serverless)                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Environment Variables (Secure)                         │    │
│  │  🔒 WHATSAPP_ACCESS_TOKEN = "EAAxxxxxxxxx..."          │    │
│  │                                                          │    │
│  │  Solo accesible desde:                                  │    │
│  │  • Netlify Dashboard                                    │    │
│  │  • Build process                                        │    │
│  │  • Runtime de funciones                                │    │
│  │                                                          │    │
│  │  ❌ NO accesible desde:                                │    │
│  │  • Navegador del usuario                               │    │
│  │  • Código JavaScript del frontend                      │    │
│  │  • DevTools                                             │    │
│  │  • Inspección de red                                   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  function handler() {                                            │
│    const token = process.env.WHATSAPP_ACCESS_TOKEN; // 🔒      │
│    // Usa el token para llamar a WhatsApp API                   │
│  }                                                               │
└───────────────────────────────────┬─────────────────────────────┘
                                    │
                                    │ Request con token
                                    │ Authorization: Bearer xxx
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  WHATSAPP BUSINESS API                                           │
│  ✅ Recibe token válido                                         │
│  ✅ Procesa mensaje                                             │
│  ✅ Envía a destinatario                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Estructura de Archivos

```
Monitor_TOI/
│
├── src/                              # FRONTEND (React)
│   ├── components/
│   │   ├── layout/
│   │   │   └── ChatView.tsx          # 🎨 UI principal
│   │   │       • Renderiza MessageInput
│   │   │       • Maneja handleSendMessage()
│   │   │       • Muestra notificaciones
│   │   │
│   │   └── chat/
│   │       └── MessageInput.tsx      # 📝 Input de mensajes
│   │           • Input field
│   │           • Botón de envío
│   │           • Eventos (Enter, Click)
│   │
│   └── hooks/
│       └── useWhatsApp.ts            # 🔗 Hook de React
│           • sendMessage()
│           • Estados: sending, error
│           • Llamadas a API
│
├── netlify/                          # BACKEND (Serverless)
│   └── functions/
│       └── whatsapp-send.js          # 🔒 Función segura
│           • Lee WHATSAPP_ACCESS_TOKEN
│           • Valida requests
│           • Llama a WhatsApp API
│           • Retorna resultado
│
├── netlify.toml                      # ⚙️ Config de Netlify
│   • Build settings
│   • Redirect rules
│
└── Documentación/
    ├── START_HERE_WHATSAPP.md        # 👉 EMPIEZA AQUÍ
    ├── INSTRUCCIONES_WHATSAPP.md     # 📋 Guía paso a paso
    ├── README_WHATSAPP.md            # 📚 Doc técnica
    ├── PREVIEW_WHATSAPP.md           # 🎨 UI preview
    ├── RESUMEN_INTEGRACION_WHATSAPP.md # 📊 Resumen
    └── ARQUITECTURA_WHATSAPP.md      # 🏗️ Este archivo
```

---

## 🔄 Flujo de Estados

```
┌─────────────────────────────────────────────────────────────────┐
│  Estado Inicial                                                  │
│  • messageInput = ""                                             │
│  • sending = false                                               │
│  • notification = null                                           │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ Usuario escribe "Hola"
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  Estado: Usuario Escribiendo                                     │
│  • messageInput = "Hola"                                         │
│  • sending = false                                               │
│  • notification = null                                           │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ Usuario presiona Enter
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  Estado: Enviando                                                │
│  • messageInput = "" (limpiado inmediatamente)                   │
│  • sending = true                                                │
│  • notification = null                                           │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ API responde
                         ↓
           ┌─────────────┴─────────────┐
           │                           │
           ↓ Éxito                     ↓ Error
┌──────────────────────────┐  ┌──────────────────────────┐
│ Estado: Éxito            │  │ Estado: Error            │
│ • messageInput = ""      │  │ • messageInput = "Hola"  │
│ • sending = false        │  │   (restaurado)           │
│ • notification = {       │  │ • sending = false        │
│     type: 'success',     │  │ • notification = {       │
│     message: '✓ Enviado' │  │     type: 'error',       │
│   }                      │  │     message: 'Error...'  │
└──────────┬───────────────┘  │   }                      │
           │                  └──────────┬───────────────┘
           │                             │
           │ Después de 3 seg.           │ Después de 5 seg.
           ↓                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  Estado: Reset                                                   │
│  • messageInput = "" (o mensaje restaurado si hubo error)        │
│  • sending = false                                               │
│  • notification = null                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Frontend → Netlify Function
```
Method: POST
URL: /.netlify/functions/whatsapp-send
Headers: { Content-Type: 'application/json' }

Request Body:
{
  "to": "521234567890",
  "message": "Hola, ¿cómo estás?",
  "phoneNumberId": "1689375181774438" // opcional
}

Response (Success):
{
  "success": true,
  "messageId": "wamid.HBgNNTExxxxxxxxxxx"
}

Response (Error):
{
  "error": "WhatsApp API error",
  "details": {
    "error": {
      "message": "Invalid phone number",
      "code": 100
    }
  }
}
```

### Netlify Function → WhatsApp API
```
Method: POST
URL: https://graph.facebook.com/v21.0/1689375181774438/messages
Headers:
  Authorization: Bearer {WHATSAPP_ACCESS_TOKEN}
  Content-Type: application/json

Request Body:
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "521234567890",
  "type": "text",
  "text": {
    "preview_url": true,
    "body": "Hola, ¿cómo estás?"
  }
}

Response (Success):
{
  "messaging_product": "whatsapp",
  "contacts": [{
    "input": "521234567890",
    "wa_id": "521234567890"
  }],
  "messages": [{
    "id": "wamid.HBgNNTExxxxxxxxxxx"
  }]
}
```

---

## ⚡ Performance

### Tiempos Esperados

```
┌─────────────────────────┬──────────────┬───────────────────┐
│ Acción                  │ Tiempo       │ Notas             │
├─────────────────────────┼──────────────┼───────────────────┤
│ Escribir mensaje        │ Instantáneo  │ React state       │
│ Click en Send           │ Instantáneo  │ Local             │
│ Limpiar input           │ Instantáneo  │ UI optimista      │
│ Netlify Function        │ 50-200ms     │ Cold start: +500ms│
│ WhatsApp API            │ 200-500ms    │ Depende de región │
│ Notificación            │ Instantáneo  │ Mientras se envía │
│ Total (user percibe)    │ 300-700ms    │ Promedio: 400ms   │
└─────────────────────────┴──────────────┴───────────────────┘
```

### Optimizaciones Implementadas

1. **UI Optimista:**
   - Input se limpia antes de confirmar envío
   - Usuario puede seguir escribiendo inmediatamente

2. **Notificaciones No Bloqueantes:**
   - Se muestran mientras el API procesa
   - Auto-hide automático

3. **Restauración en Error:**
   - Si falla, el mensaje vuelve al input
   - Usuario no pierde el texto escrito

---

## 🛡️ Capas de Seguridad

```
┌─────────────────────────────────────────────────────────────────┐
│  Capa 1: .gitignore                                             │
│  ✅ .env nunca se sube a Git                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Capa 2: Netlify Environment Variables                          │
│  🔒 Token solo accesible en runtime serverless                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Capa 3: CORS Configuration                                     │
│  ✅ Solo requests desde dominios permitidos                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Capa 4: Request Validation                                     │
│  ✅ Valida to, message antes de procesar                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Capa 5: WhatsApp API Token Validation                         │
│  ✅ Facebook valida token en cada request                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Monitoring y Logs

### Puntos de Logging

```
Frontend (Browser Console):
  [ChatView] Enviando mensaje: { to: "...", message: "..." }
  [ChatView] Mensaje enviado exitosamente: wamid.xxx...
  [useWhatsApp] Error: {...}

Backend (Netlify Functions):
  [WhatsApp Send] Enviando mensaje a: 521234567890
  [WhatsApp Send] Response status: 200
  [WhatsApp Send] Error: {...}

WhatsApp API:
  (Logs en Facebook Business Manager)
```

### Herramientas de Debugging

1. **Browser DevTools:**
   - Console: Ver logs de frontend
   - Network: Ver requests a Netlify Function

2. **Netlify Dashboard:**
   - Functions → whatsapp-send → Logs
   - Ver invocaciones, errores, tiempos

3. **Facebook Business Manager:**
   - Analytics de WhatsApp
   - Estado de mensajes enviados

---

## 🚀 Escalabilidad

### Límites Actuales

```
Netlify Functions (Free Tier):
  • 125,000 requests/mes
  • 100 horas de ejecución/mes
  • Promedio: ~4,166 mensajes/día

WhatsApp Business API:
  • Varía según tu cuenta
  • Tier 1 (nuevo): ~1,000 msgs/día
  • Incrementa con uso y verificación
```

### Para Escalar

1. **Upgrade Netlify:** 
   - Pro: 2M requests/mes
   - Business: Ilimitado

2. **WhatsApp Tier Up:**
   - Enviar más mensajes = tier más alto
   - Verificar negocio = límites más altos

3. **Caché:**
   - Implementar rate limiting
   - Queue de mensajes si se exceden límites

---

**Última actualización:** 30 de Septiembre, 2025  
**Versión:** 1.0.0  
**Status:** ✅ Production Ready

