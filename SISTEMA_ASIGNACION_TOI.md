# 🎯 Sistema de Asignación de Leads y Oportunidades - TOI

## 📊 ESTADO ACTUAL DEL SISTEMA

### ✅ **Implementación Completada**

| Componente | Estado | Descripción |
|---|---|---|
| 🏢 **Equipos** | ✅ Activo | Organización de asesores en equipos |
| 👥 **Usuarios/Asesores** | ✅ Activo | 5 usuarios (1 admin + 4 asesores) |
| 📇 **Leads Master** | ✅ Activo | 26 leads con asignación automática |
| 💼 **Oportunidades** | ✅ Activo | 12 oportunidades con folios únicos |
| 📝 **Log de Asignaciones** | ✅ Activo | Historial completo de cambios |
| 🔒 **RLS Policies** | ✅ Activo | Cada asesor ve solo lo suyo |
| 🔄 **Round Robin** | ✅ Activo | Distribución automática equitativa |

---

## 👥 USUARIOS CONFIGURADOS

### **Admin**
```
Email: admin@toi.com.mx
Password: password123
Rol: admin
Permisos: 👑 VE TODO + puede reasignar manualmente
```

### **Asesores Activos**

| Nombre | Email | Leads Asignados | Oportunidades |
|---|---|---|---|
| David Sandoval | david.sandoval@toi.com.mx | 7 | 6 |
| José Manuel | jose.manuel@toi.com.mx | 7 | 6 |
| Carlos Ruiz | carlos.ruiz@toi.com.mx | 7 | 0 |
| María López | maria.lopez@toi.com.mx | 5 | 0 |

**Password para todos:** `password123`

---

## 🔄 FUNCIONAMIENTO DEL ROUND ROBIN

### **1. Asignación Automática**

Cada vez que entra un **nuevo prospecto/lead**, el sistema:

1. ✅ Busca el asesor activo con **menos leads asignados**
2. ✅ Le asigna el lead automáticamente
3. ✅ Actualiza su contador interno
4. ✅ Registra la asignación en el log
5. ✅ Notifica al asesor (pendiente integración frontend)

```sql
-- Ejemplo: Crear nuevo prospecto (se asigna automáticamente)
INSERT INTO prospectos_toi (nombre, numero_telefono, estado_embudo, nivel_interes)
VALUES ('Juan Pérez', '5215551234567', 'lead', 7);

-- El trigger automáticamente:
-- 1. Crea el lead en leads_toi
-- 2. Lo asigna al siguiente asesor en rotación
-- 3. Registra la asignación
```

### **2. Distribución Equitativa**

El sistema garantiza que todos los asesores reciban **aproximadamente la misma cantidad de leads**.

**Orden de asignación actual:**
```
Lead 1  → Carlos Ruiz (tiene 7)
Lead 2  → María López (tiene 5) ⬅️ Siguiente en recibir
Lead 3  → David Sandoval (tiene 7)
Lead 4  → José Manuel (tiene 7)
Lead 5  → Carlos Ruiz (ahora tiene 8)
...
```

---

## 🎫 GENERACIÓN AUTOMÁTICA DE FOLIOS

Cada **oportunidad** recibe un folio único automáticamente:

### **Formato**
```
OPP-TOI-YYYYMM-NNNNN

Ejemplos:
OPP-TOI-202510-00001
OPP-TOI-202510-00002
OPP-TOI-202510-00015
OPP-TOI-202511-00001  ← Reinicia en nuevo mes
```

### **Características**
- ✅ Se genera automáticamente al crear oportunidad
- ✅ Reinicia contador cada mes
- ✅ Siempre único (constraint en DB)
- ✅ Formato fijo e identificable

```sql
-- Crear oportunidad (folio se genera automáticamente)
INSERT INTO oportunidades_toi (lead_id, tipo, descripcion, valor_estimado)
VALUES (5, 'venta_departamento', 'Depa 2 rec Polanco', 5500000);

-- Retorna: OPP-TOI-202510-00013
```

---

## 📚 MÚLTIPLES OPORTUNIDADES POR LEAD

Un mismo lead puede tener **varias oportunidades** simultáneas:

```
Lead: Juan Pérez (+5215551234567)
├── OPP-TOI-202510-00015 → Venta Departamento Polanco ($5.5M)
├── OPP-TOI-202510-00018 → Renta Oficina Roma ($35k/mes)
└── OPP-TOI-202510-00021 → Visita Showroom (sin valor)
```

Cada oportunidad tiene:
- ✅ Folio único
- ✅ Pipeline independiente
- ✅ Seguimiento separado
- ✅ Puede tener diferente asesor asignado

---

## 👑 FUNCIONES DE ADMIN

### **Ver TODO**
El admin puede ver **todos los leads y oportunidades** de todos los asesores:

```sql
-- Login como admin@toi.com.mx
-- RLS automáticamente permite ver todo

SELECT * FROM view_leads_completo;
-- Retorna TODOS los leads (26)

SELECT * FROM view_oportunidades_completo;
-- Retorna TODAS las oportunidades (12)
```

### **Reasignar Manualmente**

El admin puede cambiar la asignación de cualquier lead:

```sql
-- Reasignar lead de un asesor a otro
SELECT * FROM reassign_lead_manual(
  15,  -- ID del lead
  'carlos.ruiz@toi.com.mx',  -- Nuevo asesor
  'admin@toi.com.mx',  -- Email del admin (tú)
  'Cliente prefiere horario de Carlos'  -- Motivo
);

-- Retorna:
-- success: true
-- message: "Lead 'Ana García' reasignado exitosamente"
-- old_asesor: "María López"
-- new_asesor: "Carlos Ruiz"
```

### **Ver Historial de Asignaciones**

```sql
-- Ver todos los cambios de asignación de un lead
SELECT 
  l.nombre as lead_nombre,
  u_from.nombre as desde_asesor,
  u_to.nombre as hacia_asesor,
  u_by.nombre as reasignado_por,
  al.metodo,
  al.motivo,
  al.created_at
FROM asignaciones_log_toi al
JOIN leads_toi l ON al.entidad_id = l.id
LEFT JOIN usuarios_toi u_from ON al.assigned_from = u_from.id
LEFT JOIN usuarios_toi u_to ON al.assigned_to = u_to.id
LEFT JOIN usuarios_toi u_by ON al.assigned_by = u_by.id
WHERE l.id = 15
ORDER BY al.created_at DESC;
```

---

## 🔒 ROW LEVEL SECURITY (RLS)

### **Permisos por Rol**

| Rol | Puede Ver | Puede Editar | Puede Asignar |
|---|---|---|---|
| **admin** | ✅ TODO | ✅ TODO | ✅ Sí |
| **gerente** | ✅ TODO | ✅ TODO | ✅ Sí |
| **asesor** | ⚠️ Solo los suyos | ⚠️ Solo los suyos | ❌ No |

### **Ejemplos de RLS en Acción**

```sql
-- Login como: david.sandoval@toi.com.mx (asesor)
SELECT * FROM leads_toi;
-- Retorna: Solo 7 leads (los asignados a David)

-- Login como: admin@toi.com.mx (admin)
SELECT * FROM leads_toi;
-- Retorna: TODOS los 26 leads
```

---

## 🔗 INTEGRACIÓN CON N8N

### **100% Compatible con Sistema Actual**

Las tablas existentes **NO se modificaron**, solo se extendieron:

| Tabla | Cambios | Compatibilidad |
|---|---|---|
| `mensajes_toi` | ✅ Sin cambios | 100% |
| `conversaciones_toi` | ✅ Sin cambios | 100% |
| `prospectos_toi` | ✅ Agregadas 3 columnas | 100% (retrocompatible) |

### **Nuevas Funciones para n8n**

#### **1. Crear Oportunidad Automáticamente**

```javascript
// En n8n, agregar nodo "Supabase - Execute SQL"
const { data } = await supabase.rpc('create_oportunidad_from_n8n', {
  p_numero_telefono: '+5215551234567',
  p_tipo: 'venta_departamento',
  p_descripcion: 'Cliente interesado en 2 recámaras zona Polanco',
  p_valor_estimado: 5500000
});

// Retorna:
// {
//   oportunidad_id: 15,
//   folio: 'OPP-TOI-202510-00015',
//   lead_id: 5,
//   assigned_to: 'uuid-david',
//   asesor_nombre: 'David Sandoval'
// }
```

#### **2. Obtener Asesor Asignado**

```javascript
// Saber a qué asesor está asignado un número
const { data } = await supabase.rpc('get_asesor_by_telefono', {
  p_numero_telefono: '+5215551234567'
});

// Retorna:
// {
//   asesor_id: 'uuid-david',
//   asesor_nombre: 'David Sandoval',
//   asesor_email: 'david.sandoval@toi.com.mx'
// }

// Úsalo para:
// - Notificar al asesor correcto
// - Enviar mensaje de WhatsApp al asesor
// - Crear tarea en su nombre
```

#### **3. Workflow Recomendado en n8n**

```
Webhook (Mensaje entrante)
    ↓
Insertar en mensajes_toi (actual)
    ↓
Actualizar conversaciones_toi (actual)
    ↓
¿Es primer contacto?
    ├─ Sí → Insertar en prospectos_toi
    │         ↓
    │       Trigger automático crea lead
    │         ↓
    │       Round robin asigna asesor
    │         ↓
    │       get_asesor_by_telefono()
    │         ↓
    │       Notificar al asesor asignado
    │
    └─ No → Buscar asesor actual
              ↓
            Notificar asesor existente
```

---

## 📊 VISTAS ÚTILES

### **1. view_leads_completo**
Vista completa de leads con toda la información:

```sql
SELECT * FROM view_leads_completo
WHERE asesor_email = 'david.sandoval@toi.com.mx';

-- Retorna:
-- - Información del lead
-- - Asesor asignado
-- - Prospecto vinculado (compatibilidad)
-- - Conversación activa
-- - Estadísticas de oportunidades
```

### **2. view_oportunidades_completo**
Oportunidades con información del lead y asesor:

```sql
SELECT * FROM view_oportunidades_completo
WHERE estado = 'abierta'
ORDER BY probabilidad DESC;

-- Ideal para dashboard de ventas
```

### **3. view_metricas_asesores**
Métricas y KPIs por asesor:

```sql
SELECT * FROM view_metricas_asesores
ORDER BY tasa_conversion DESC;

-- Retorna:
-- - Leads asignados
-- - Oportunidades totales/abiertas/ganadas/perdidas
-- - Tasa de conversión
-- - Valor del pipeline
```

---

## 🚀 CASOS DE USO

### **Caso 1: Nuevo Lead desde WhatsApp**

```sql
-- n8n inserta prospecto (como siempre)
INSERT INTO prospectos_toi (nombre, numero_telefono, estado_embudo, nivel_interes)
VALUES ('María González', '5215551234999', 'lead', 7);

-- Automáticamente:
-- 1. ✅ Se crea lead en leads_toi
-- 2. ✅ Se asigna a María López (tiene menos leads)
-- 3. ✅ Se registra en asignaciones_log_toi
-- 4. ✅ Se actualiza contador de María

-- Opcional: Notificar a María
SELECT * FROM get_asesor_by_telefono('5215551234999');
-- Retorna email de María para enviarle notificación
```

### **Caso 2: Cliente Calificado → Crear Oportunidad**

```sql
-- Cliente muestra alto interés, crear oportunidad
SELECT * FROM create_oportunidad_from_n8n(
  '5215551234999',
  'venta_departamento',
  'Cliente calificado, quiere 2 rec con vista',
  4800000
);

-- Retorna:
-- folio: OPP-TOI-202510-00025
-- assigned_to: María López (heredado del lead)
```

### **Caso 3: Admin Reasigna por Vacaciones**

```sql
-- David está de vacaciones, reasignar sus leads a José
SELECT * FROM reassign_lead_manual(
  (SELECT id FROM leads_toi WHERE assigned_to = (
    SELECT id FROM usuarios_toi WHERE email = 'david.sandoval@toi.com.mx'
  ) LIMIT 1),
  'jose.manuel@toi.com.mx',
  'admin@toi.com.mx',
  'David de vacaciones hasta 15/Oct'
);
```

---

## 📈 MÉTRICAS Y REPORTES

### **Dashboard de Asesores**

```sql
-- KPIs individuales
SELECT 
  nombre,
  total_leads_asignados,
  total_oportunidades,
  oportunidades_ganadas,
  oportunidades_perdidas,
  tasa_conversion,
  CASE 
    WHEN tasa_conversion >= 30 THEN '🔥 Excelente'
    WHEN tasa_conversion >= 20 THEN '✅ Bueno'
    WHEN tasa_conversion >= 10 THEN '⚠️ Regular'
    ELSE '❌ Necesita apoyo'
  END as performance
FROM usuarios_toi
WHERE rol = 'asesor' AND activo = true
ORDER BY tasa_conversion DESC;
```

### **Pipeline de Ventas**

```sql
-- Valor total en pipeline por etapa
SELECT 
  etapa,
  COUNT(*) as cantidad,
  SUM(valor_estimado) as valor_total,
  AVG(probabilidad) as prob_promedio
FROM oportunidades_toi
WHERE estado = 'abierta'
GROUP BY etapa
ORDER BY 
  CASE etapa
    WHEN 'contacto_inicial' THEN 1
    WHEN 'calificacion' THEN 2
    WHEN 'presentacion' THEN 3
    WHEN 'propuesta' THEN 4
    WHEN 'negociacion' THEN 5
    WHEN 'cierre' THEN 6
  END;
```

---

## ⚙️ CONFIGURACIÓN AVANZADA

### **Cambiar Método de Asignación**

Por defecto usa **round_robin**, pero puedes cambiarlo por equipo:

```sql
UPDATE equipos_toi
SET metodo_asignacion = 'por_carga'  -- Asigna al menos ocupado
WHERE nombre = 'Equipo Ventas General';

-- Opciones:
-- - round_robin: Rotación equitativa (actual)
-- - por_carga: Al que tiene menos oportunidades abiertas
-- - manual: Solo asignación manual por admin
-- - geografico: Según ubicación (requiere config adicional)
```

### **Desactivar Asesor Temporalmente**

```sql
-- Asesor de vacaciones, no recibe nuevos leads
UPDATE usuarios_toi
SET activo = false
WHERE email = 'david.sandoval@toi.com.mx';

-- Los leads existentes se quedan con él
-- Nuevos leads se distribuyen entre los demás
```

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### **Frontend**
1. ✅ Vista "Mis Leads" filtrada por asesor
2. ✅ Panel de oportunidades por etapa (Kanban)
3. ✅ Dashboard de métricas personales
4. ✅ Botón "Reasignar" solo visible para admin

### **n8n**
1. ✅ Notificar asesor cuando recibe nuevo lead
2. ✅ Auto-crear oportunidad en keywords clave
3. ✅ Sincronizar con CRM externo si aplica

### **Automatizaciones**
1. ✅ Email diario a cada asesor con sus pendientes
2. ✅ Alerta si oportunidad lleva +7 días sin contacto
3. ✅ Auto-reasignar si asesor no responde en 24hrs

---

## 📞 SOPORTE

¿Dudas o problemas con el sistema?

**Verificar estado:**
```sql
-- Health check del sistema
SELECT 
  'usuarios' as tabla, COUNT(*) as total FROM usuarios_toi WHERE activo = true
UNION ALL
SELECT 'leads', COUNT(*) FROM leads_toi
UNION ALL
SELECT 'oportunidades', COUNT(*) FROM oportunidades_toi
UNION ALL
SELECT 'asignaciones_log', COUNT(*) FROM asignaciones_log_toi;
```

**Resetear contadores (si necesario):**
```sql
-- Recalcular contadores de asesores
UPDATE usuarios_toi u
SET total_leads_asignados = (
  SELECT COUNT(*) FROM leads_toi WHERE assigned_to = u.id
),
total_oportunidades = (
  SELECT COUNT(*) FROM oportunidades_toi WHERE assigned_to = u.id
);
```

---

## 🎉 RESUMEN EJECUTIVO

✅ **Sistema 100% funcional**
✅ **Round robin automático operando**
✅ **Admin puede ver y reasignar TODO**
✅ **Folios únicos generándose automáticamente**
✅ **RLS protegiendo datos de cada asesor**
✅ **Compatible con n8n existente (sin romper nada)**
✅ **Historial completo de asignaciones**
✅ **Listo para producción**

🚀 **El sistema está desplegado y funcionando en Supabase**

