# 📱 Instrucciones Rápidas - WhatsApp Business API

## ✅ Lo que ya está hecho

1. ✅ Función serverless de Netlify creada (`netlify/functions/whatsapp-send.js`)
2. ✅ Hook de React para enviar mensajes (`src/hooks/useWhatsApp.ts`)
3. ✅ Interfaz integrada en ChatView con barra de mensajería
4. ✅ Sistema de notificaciones (éxito/error)
5. ✅ Protección del token (nunca expuesto en el frontend)

## 🔧 Lo que DEBES hacer

### Paso 1: Configurar el Token en Netlify

1. **Ve a Netlify Dashboard**
   - URL: https://app.netlify.com
   - Inicia sesión con tu cuenta

2. **Selecciona tu sitio** (Demo brokers / Monitor_TOI)

3. **Ve a Site settings > Environment variables**

4. **Agrega una nueva variable:**
   - **Key:** `WHATSAPP_ACCESS_TOKEN`
   - **Value:** `[TU_TOKEN_AQUI]` ← Pega tu token
   - **Scopes:** Marca "Functions" y "Builds"

5. **Guarda y redeploy** tu sitio

### Paso 2: Obtener Phone Number ID (si no usas el Business Account ID)

Tu Business Account ID actual: `1689375181774438`

Si necesitas el Phone Number ID específico:
1. Ve a Facebook Developers > Tu App
2. WhatsApp > API Setup
3. Copia el "Phone number ID"
4. Úsalo en lugar del Business Account ID

### Paso 3: Probar el Envío

1. **Deploy a Netlify:**
   ```bash
   git add .
   git commit -m "feat: Integrar envío de mensajes WhatsApp"
   git push origin main
   ```

2. **Espera a que termine el deploy** (2-3 minutos)

3. **Abre tu aplicación** y ve a la pestaña de Chats

4. **Selecciona una conversación**

5. **Escribe un mensaje** y presiona Enter

6. **Verás una notificación:**
   - Verde ✓ = Mensaje enviado
   - Roja ✗ = Error (revisa los logs)

## 🔍 Debugging

### Ver logs en tiempo real

```bash
# Si tienes Netlify CLI instalado:
netlify functions:log whatsapp-send
```

O ve al dashboard de Netlify > Functions > whatsapp-send

### Errores comunes

| Error | Solución |
|-------|----------|
| "Token no configurado" | Agrega `WHATSAPP_ACCESS_TOKEN` en Netlify |
| "WhatsApp API error" | Verifica que el token sea válido |
| "Número inválido" | El número debe incluir código de país (ej: 521234567890) |

## 📝 Datos de tu configuración

```javascript
Business Account ID: 1689375181774438
API Version: v21.0
Endpoint: https://graph.facebook.com/v21.0/{phone-number-id}/messages
```

## 🎨 Personalización

### Cambiar Phone Number ID

Edita `netlify/functions/whatsapp-send.js`:

```javascript
// Línea 5
const BUSINESS_ACCOUNT_ID = 'TU_PHONE_NUMBER_ID_AQUI';
```

### Agregar archivos adjuntos (futuro)

El componente `MessageInput` ya tiene un botón de adjuntos preparado. Para habilitarlo:

1. Modifica `useWhatsApp.ts` para aceptar archivos
2. Actualiza `whatsapp-send.js` para enviar tipo `image`, `document`, etc.
3. Sube el archivo a un CDN o usa Media API de WhatsApp

## 🚀 Deployment

### Opción 1: Auto-deploy (recomendado)

Netlify detecta cambios en GitHub automáticamente:

```bash
git add .
git commit -m "Configurar WhatsApp"
git push
```

### Opción 2: Deploy manual

```bash
npm run build
netlify deploy --prod
```

## 📚 Documentación completa

Lee `README_WHATSAPP.md` para más detalles técnicos.

## 🎯 Checklist Final

- [ ] Token agregado en Netlify Environment Variables
- [ ] Token válido (verificar en Facebook Developers)
- [ ] Deploy completado exitosamente
- [ ] Probado envío de mensaje en la app
- [ ] Notificaciones funcionando correctamente

---

**¿Necesitas ayuda?**

1. Revisa los logs en Netlify Functions
2. Abre la consola del navegador (F12) y busca `[ChatView]` o `[useWhatsApp]`
3. Verifica que el número tenga formato internacional

