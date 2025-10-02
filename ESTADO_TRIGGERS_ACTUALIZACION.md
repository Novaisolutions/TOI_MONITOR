# 🔄 Estado de Actualización de Triggers - Demo Brokers

## ✅ **COMPLETADO**

### 1. **Triggers Identificados y Actualizados**

Los siguientes triggers de `mensajes_toi` están **ACTIVOS** y **ACTUALIZADOS**:

| Trigger | Función | Estado | Tablas Actualizadas |
|---------|---------|--------|-------------------|
| `actualizar_conversacion_demobrokers_trigger` | `actualizar_conversacion_demobrokers()` | ✅ **ACTUALIZADO** | `conversaciones_toi`, `prospectos_toi` |
| `actualizar_no_leidos_conversacion_demobrokers_trigger` | `actualizar_no_leidos_conversacion_demobrokers()` | ✅ **ACTUALIZADO** | `conversaciones_toi` |
| `on_new_message_create_prospect_demobrokers_trigger` | `handle_new_message_create_prospect_demobrokers()` | ✅ **ACTUALIZADO** | `prospectos_toi` |
| `trigger_auto_detect_appointment_demobrokers` | `auto_update_prospect_on_appointment_demobrokers()` | ✅ **ACTUALIZADO** | `prospectos_toi` |
| `zzz_master_sync_demobrokers_final` | `master_sync_conversacion_demobrokers()` | ✅ **ACTUALIZADO** | `conversaciones_toi`, `prospectos_toi` |

### 2. **Funciones Actualizadas**

Todas las funciones de triggers han sido actualizadas para usar las tablas `_toi`:

- ✅ `conversaciones_demobrokers` → `conversaciones_toi`
- ✅ `mensajes_demobrokers` → `mensajes_toi`  
- ✅ `prospectos_demobrokers` → `prospectos_toi`

### 3. **Sistema de Envío WhatsApp**

- ✅ **Envío de mensajes**: Funcionando correctamente
- ✅ **Webhook a n8n**: Funcionando (`whatsapp-message-send`)
- ✅ **Respuesta del webhook**: "Workflow was started" ✓

---

## ⚠️ **PROBLEMA IDENTIFICADO**

### **Los mensajes NO se están guardando en `mensajes_toi`**

**Síntomas:**
- ✅ El mensaje se envía por WhatsApp correctamente
- ✅ El webhook de n8n responde "Workflow was started"
- ❌ El mensaje NO aparece en la tabla `mensajes_toi`
- ❌ Los triggers NO se ejecutan (no hay actualización de contadores)

**Causa Probable:**
El workflow de n8n no está guardando correctamente en la tabla `mensajes_toi` o hay un error en la configuración.

---

## 🔍 **DIAGNÓSTICO NECESARIO**

### 1. **Verificar Workflow de n8n**

**Pasos:**
1. Ir a: https://novaisolutions.app.n8n.cloud
2. Abrir el workflow "WhatsApp - Guardar Mensajes Enviados"
3. Verificar que esté **ACTIVO** (toggle verde)
4. Revisar los logs de ejecución
5. Verificar que la variable `SUPABASE_ANON_KEY` esté configurada

### 2. **Verificar Configuración de Supabase**

**Verificar permisos:**
```sql
-- Verificar que el usuario anónimo puede insertar en mensajes_toi
SELECT has_table_privilege('anon', 'mensajes_toi', 'INSERT');
SELECT has_table_privilege('anon', 'conversaciones_toi', 'INSERT');
SELECT has_table_privilege('anon', 'prospectos_toi', 'INSERT');
```

### 3. **Probar Inserción Directa**

```sql
-- Probar inserción directa en mensajes_toi
INSERT INTO mensajes_toi (
    tipo, numero, mensaje, fecha, conversation_id, leido
) VALUES (
    'salida', '5216645487274', 'Test directo SQL', NOW(), 1, true
);
```

---

## 🛠️ **SOLUCIONES PROPUESTAS**

### **Opción 1: Revisar y Corregir Workflow n8n**

1. **Verificar configuración del nodo "Guardar en mensajes_toi"**
2. **Revisar headers de autenticación**
3. **Verificar URL de Supabase**
4. **Revisar logs de error en n8n**

### **Opción 2: Crear Función de Respaldo**

Crear una función que se ejecute directamente desde la función Netlify para guardar en `mensajes_toi` si el webhook de n8n falla.

### **Opción 3: Verificar RLS (Row Level Security)**

Verificar que las políticas RLS permitan la inserción desde n8n.

---

## 📊 **ESTADO ACTUAL DE LAS TABLAS**

### **conversaciones_toi**
```sql
-- Conversación existe pero contadores en 0
id: 1
numero: 5216645487274
total_mensajes: 0
total_mensajes_salida: 0
total_mensajes_entrada: 0
```

### **mensajes_toi**
```sql
-- Último mensaje del 19 de septiembre (no hay mensajes recientes)
-- No se están guardando los mensajes enviados vía WhatsApp
```

### **n8n_chat_histories**
```sql
-- Hay actividad pero no se correlaciona con mensajes_toi
-- Session ID: 5216645487274brokers_julio2025_V2.1.7
```

---

## 🎯 **PRÓXIMOS PASOS**

### **Inmediato:**
1. ✅ **Verificar workflow de n8n** - Revisar configuración y logs
2. ✅ **Probar inserción directa** - Verificar permisos de Supabase
3. ✅ **Revisar RLS** - Verificar políticas de seguridad

### **Si n8n no funciona:**
1. **Crear función de respaldo** en Netlify
2. **Guardar directamente** en `mensajes_toi` desde la función
3. **Mantener webhook** para `n8n_chat_histories`

---

## 📝 **NOTAS TÉCNICAS**

### **Triggers Configurados Correctamente:**
- Los triggers están **ACTIVOS** y **ACTUALIZADOS**
- Las funciones usan las tablas `_toi` correctas
- El sistema está listo para procesar mensajes

### **Problema de Flujo:**
- El problema está en el **workflow de n8n**
- Los triggers funcionarán una vez que los mensajes lleguen a `mensajes_toi`
- El sistema de envío WhatsApp está funcionando perfectamente

---

**Estado:** 🔄 **EN DIAGNÓSTICO**  
**Última actualización:** 30 de Enero, 2025  
**Prioridad:** 🔴 **ALTA** - Los mensajes no se están guardando

