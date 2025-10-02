# 🔧 Instrucciones para Actualizar Workflow n8n

## ⚠️ **IMPORTANTE: El workflow necesita ser actualizado en n8n**

Los últimos mensajes de prueba (ID 5883 y 5884) se guardaron con formato incorrecto porque **el workflow en n8n aún no tiene el cambio de `JSON.stringify()`**.

---

## 🎯 **OPCIÓN 1: Importar Workflow Actualizado** ⭐ **MÁS FÁCIL**

### **Paso 1: Ir a n8n**
Ve a: https://novaisolutions.app.n8n.cloud

### **Paso 2: Eliminar Workflow Anterior**
1. Busca el workflow "WhatsApp - Guardar Mensajes Enviados"
2. Haz clic en los **3 puntos** (menú)
3. Selecciona **"Delete"** o **"Eliminar"**
4. Confirma la eliminación

### **Paso 3: Importar Workflow Nuevo**
1. Haz clic en el botón **"+"** (nuevo workflow) o **"Import from File"**
2. Selecciona el archivo: **`n8n-workflow-whatsapp-complete.json`**
3. El workflow se importará automáticamente

### **Paso 4: Configurar Variable de Entorno**
1. En el workflow, busca cualquier nodo
2. Ve a **Settings** → **Environment Variables**
3. Agrega:
   ```
   Nombre: SUPABASE_ANON_KEY
   Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZHJ5a2lmZnRjd3hqbHZkZ211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxODc5NjQsImV4cCI6MjA0Nzc2Mzk2NH0.fGHkvYHpZRxiHSzqlqGAoY3ronqvmh0v5HBkqT_JdB0
   ```

### **Paso 5: Activar el Workflow** 🟢
1. Encuentra el **toggle/switch** en la esquina superior derecha
2. **ACTÍVALO** (debe cambiar a verde o azul)
3. Deberías ver: **"Workflow activated"** o **"Active"**

---

## 🎯 **OPCIÓN 2: Editar Manualmente** 

Si prefieres editar el workflow existente:

### **Paso 1: Abrir Workflow**
1. Ve a: https://novaisolutions.app.n8n.cloud
2. Abre el workflow "WhatsApp - Guardar Mensajes Enviados"

### **Paso 2: Encontrar el Nodo**
1. Busca el nodo llamado **"Guardar en n8n_chat_histories"**
2. Haz clic en él para editarlo

### **Paso 3: Editar el Campo `jsonBody`**

**BUSCA ESTO:**
```javascript
{
  session_id: $('WhatsApp Message Send').item.json.body.session_id,
  message: $('WhatsApp Message Send').item.json.body.chat_message
}
```

**CÁMBIALO POR:**
```javascript
{
  session_id: $('WhatsApp Message Send').item.json.body.session_id,
  message: JSON.stringify($('WhatsApp Message Send').item.json.body.chat_message)
}
```

**Clave:** Agregar `JSON.stringify()` alrededor de `chat_message`

### **Paso 4: Guardar**
1. Haz clic en **"Save"** o **"Guardar"**
2. Verifica que el workflow esté **ACTIVO** (toggle verde)

---

## ✅ **VERIFICACIÓN**

### **Después de actualizar, prueba:**

```bash
curl -X POST https://demobroker.netlify.app/.netlify/functions/whatsapp-send \
  -H "Content-Type: application/json" \
  -d '{"to": "5216645487274", "message": "✅ Test después de actualizar n8n"}'
```

### **Luego verifica en Supabase:**

```sql
-- Debería mostrar "✓ JSON válido" para el nuevo mensaje
SELECT 
    id,
    session_id,
    CASE 
        WHEN message::jsonb->>'type' IS NOT NULL THEN '✓ JSON válido'
        ELSE '✗ NO es JSON'
    END as formato,
    message::jsonb->>'type' as tipo_mensaje,
    LEFT(message::text, 100) as preview
FROM n8n_chat_histories 
WHERE session_id LIKE '5216645487274%'
ORDER BY id DESC 
LIMIT 1;
```

**Resultado Esperado:**
```
formato: ✓ JSON válido
tipo_mensaje: ai
preview: {"type":"ai","content":"{\"respuesta_para_cliente\":\"✅ Test después de actualizar n8n\",...
```

---

## 🔍 **DIAGNÓSTICO**

### **Estado Actual (sin actualizar):**

| ID | Session ID | Formato | Tipo | Estado |
|----|------------|---------|------|--------|
| 5884 | ...brokers_julio2025_V2.1.7 | ✗ NO es JSON | null | ❌ Incorrecto |
| 5883 | ...brokers_julio2025_V2.1.7 | ✗ NO es JSON | null | ❌ Incorrecto |
| 5882 | ...novai_julio2025_V10 | ✓ JSON válido | ai | ✅ Correcto |

### **Estado Esperado (después de actualizar):**

| ID | Session ID | Formato | Tipo | Estado |
|----|------------|---------|------|--------|
| 5885+ | ...brokers_julio2025_V2.1.7 | ✓ JSON válido | ai | ✅ Correcto |
| 5884 | ...brokers_julio2025_V2.1.7 | ✗ NO es JSON | null | ❌ Anterior |
| 5883 | ...brokers_julio2025_V2.1.7 | ✗ NO es JSON | null | ❌ Anterior |

**Nota:** Los mensajes anteriores (5883, 5884) quedarán con formato incorrecto, pero los nuevos se guardarán correctamente.

---

## 🎯 **RESUMEN**

### **Para que funcione correctamente:**

1. ✅ **Código actualizado** - Ya está en `n8n-workflow-whatsapp-complete.json`
2. ⏳ **Workflow en n8n** - **NECESITAS ACTUALIZARLO** (Opción 1 o 2)
3. ✅ **Función Netlify** - Ya está desplegada y funcionando
4. ✅ **Formato en payload** - Ya está enviando estructura completa

### **Lo único que falta:**
🔴 **ACTUALIZAR EL WORKFLOW EN N8N** con el cambio de `JSON.stringify()`

---

## 📞 **Si tienes problemas:**

1. **Verifica que el workflow esté ACTIVO** (toggle verde)
2. **Verifica que la variable `SUPABASE_ANON_KEY` esté configurada**
3. **Prueba el webhook manualmente:**
   ```bash
   curl -X POST https://novaisolutions.app.n8n.cloud/webhook/whatsapp-message-send \
     -H "Content-Type: application/json" \
     -d '{"session_id":"test","chat_message":{"type":"test"}}'
   ```
4. **Revisa los logs** en n8n para ver si hay errores

---

**¡Una vez actualizado, todo funcionará perfectamente!** 🚀

