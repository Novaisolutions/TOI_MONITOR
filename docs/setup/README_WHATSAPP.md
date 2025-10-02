# Configuración de WhatsApp Business API

## 📱 Información de la Cuenta

- **Phone Number ID:** `794042540450605`
- **Business Account ID:** `1689375181774438` (para administración)
- **Endpoint Base:** `https://graph.facebook.com/v21.0`

## 🔐 Configuración del Token (IMPORTANTE)

### ⚠️ Seguridad del Token

El token de WhatsApp **NUNCA** debe estar expuesto en el código del frontend. Por eso utilizamos una función serverless de Netlify que actúa como proxy seguro.

### Pasos para Configurar

#### 1. Obtener tu Token de WhatsApp

1. Ve a [Facebook Developers](https://developers.facebook.com/apps/)
2. Selecciona tu aplicación de WhatsApp Business
3. Ve a **WhatsApp > API Setup**
4. Copia el token temporal o genera uno permanente

#### 2. Configurar en Netlify

1. Ve a tu dashboard de Netlify
2. Selecciona tu sitio
3. Ve a **Site settings > Environment variables**
4. Agrega una nueva variable:
   - **Key:** `WHATSAPP_ACCESS_TOKEN`
   - **Value:** Tu token de WhatsApp
   - **Scopes:** Selecciona "Functions" y "Builds"

#### 3. Variables de Entorno Locales (Desarrollo)

Para desarrollo local, crea un archivo `.env` en la raíz del proyecto:

```bash
# .env
WHATSAPP_ACCESS_TOKEN=tu_token_aqui
```

⚠️ **Importante:** Este archivo `.env` ya está en `.gitignore` y nunca debe subirse a GitHub.

## 🚀 Cómo Funciona

### Arquitectura de Seguridad

```
Frontend (React)
    ↓
    ↓ fetch('/.netlify/functions/whatsapp-send')
    ↓
Netlify Function (Node.js)
    ↓ Token protegido en variables de entorno
    ↓
WhatsApp Business API
```

### Flujo de Envío de Mensajes

1. El usuario escribe un mensaje en `ChatView`
2. Se presiona "Enviar" o Enter
3. El hook `useWhatsApp` envía una petición a la función serverless
4. La función serverless usa el token seguro para llamar a WhatsApp API
5. WhatsApp envía el mensaje
6. La respuesta se muestra al usuario (éxito o error)

## 📂 Archivos Importantes

### Frontend

- **`src/hooks/useWhatsApp.ts`** - Hook para envío de mensajes
- **`src/components/layout/ChatView.tsx`** - UI con barra de mensajería
- **`src/components/chat/MessageInput.tsx`** - Componente de entrada de mensajes

### Backend (Netlify Functions)

- **`netlify/functions/whatsapp-send.js`** - Función serverless que protege el token

## 🧪 Pruebas

### Desarrollo Local con Netlify Dev

Para probar las funciones serverless localmente:

```bash
# Instalar Netlify CLI si no lo tienes
npm install -g netlify-cli

# Ejecutar el proyecto con Netlify Dev
netlify dev
```

Esto iniciará:
- Tu aplicación React en `localhost:8888`
- Las funciones serverless en `/.netlify/functions/*`

### Enviar un Mensaje de Prueba

1. Abre la aplicación
2. Selecciona una conversación
3. Escribe un mensaje en la barra inferior
4. Presiona Enter o el botón de envío
5. Verás una notificación verde si se envió correctamente

## 📋 Formato del Número de Teléfono

El sistema acepta números en cualquier formato y los limpia automáticamente:

```javascript
// Todos estos formatos funcionan:
"+52 123 456 7890"
"52-123-456-7890"
"521234567890"

// Se limpian a:
"521234567890"
```

## 🔍 Debugging

### Ver Logs en Netlify

1. Ve a tu sitio en Netlify
2. Click en **Functions** en el menú lateral
3. Selecciona `whatsapp-send`
4. Verás los logs de cada invocación

### Logs en el Navegador

Abre la consola del navegador (F12) y busca mensajes que comiencen con:
- `[ChatView]` - Logs de la interfaz
- `[useWhatsApp]` - Logs del hook
- `[WhatsApp Send]` - Logs de la función serverless (en Netlify)

## 🐛 Solución de Problemas Comunes

### Error: "Token de WhatsApp no configurado"

**Causa:** La variable de entorno no está configurada en Netlify.

**Solución:**
1. Ve a Netlify Settings > Environment variables
2. Agrega `WHATSAPP_ACCESS_TOKEN` con tu token
3. Redeploy el sitio

### Error: "WhatsApp API error"

**Causa:** Puede ser token expirado, número inválido, o límites de la API.

**Solución:**
1. Verifica que el token sea válido en Facebook Developers
2. Verifica que el número tenga formato correcto (con código de país)
3. Revisa los límites de mensajes de tu cuenta de WhatsApp Business

### El mensaje no se envía

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña Network
3. Busca la petición a `whatsapp-send`
4. Revisa la respuesta para ver el error específico

## 📚 Documentación Adicional

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp/business-management-api)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Graph API Reference](https://developers.facebook.com/docs/graph-api)

## 🎨 Personalización

### Cambiar el Phone Number ID

Si necesitas usar un número diferente al Business Account ID:

1. Obtén el Phone Number ID de Facebook Developers
2. Pásalo como parámetro al hook:

```typescript
const result = await sendMessage({
  to: recipientNumber,
  message: messageText,
  phoneNumberId: 'tu_phone_number_id_aqui'
});
```

### Agregar Plantillas de WhatsApp

Para usar plantillas aprobadas de WhatsApp (más rápido y confiable):

1. Crea una plantilla en Facebook Business Manager
2. Modifica `whatsapp-send.js` para aceptar parámetro `template`
3. Cambia el payload de `text` a `template`

## ✅ Checklist de Deployment

- [ ] Token configurado en Netlify Environment Variables
- [ ] Función `whatsapp-send.js` desplegada
- [ ] Business Account ID verificado
- [ ] Número de WhatsApp Business activo
- [ ] Plantillas aprobadas (si se usan)
- [ ] Límites de mensajes verificados

---

**Última actualización:** Septiembre 2025
**Versión de API:** Graph API v21.0

