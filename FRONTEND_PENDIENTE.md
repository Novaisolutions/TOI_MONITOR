# 🎯 Frontend Pendiente - Sistema de Asignación TOI

## ✅ **LO QUE YA ESTÁ IMPLEMENTADO EN BACKEND**

- ✅ Todas las tablas y funciones SQL
- ✅ Round Robin automático
- ✅ RLS (cada asesor ve solo lo suyo)
- ✅ Admin puede ver y reasignar todo
- ✅ Folios únicos automáticos
- ✅ Múltiples oportunidades por lead
- ✅ Historial completo de asignaciones
- ✅ Vistas helper para consultas rápidas

## 📋 **COMPONENTES FRONTEND PENDIENTES**

### **Para TODOS los usuarios:**
1. ✅ Tipos TypeScript creados (`src/types/database.ts`)
2. ✅ Hook `useCurrentUserTOI` creado
3. ⏳ Integrar detección de rol en `App.tsx`

### **Para ADMIN:**
4. ⏳ `AdminDashboard.tsx` - Vista de todos los leads
5. ⏳ `ReassignLeadModal.tsx` - Modal para reasignar
6. ⏳ `MetricasAsesores.tsx` - Reportes y KPIs
7. ⏳ `GestionUsuarios.tsx` - CRUD de asesores

### **Para ASESORES:**
8. ⏳ `MisLeadsView.tsx` - Vista filtrada por RLS
9. ⏳ `KanbanOportunidades.tsx` - Pipeline visual
10. ⏳ `DetalleOportunidad.tsx` - Vista detallada
11. ⏳ `NuevaOportunidad.tsx` - Crear oportunidad

## 🚀 **IMPLEMENTACIÓN RÁPIDA**

Como el tiempo y tokens son limitados, te recomiendo:

### **Opción A: Frontend Manual (15 min)**
Usa las **consultas SQL directas** desde Supabase Dashboard:

```sql
-- 👑 ADMIN: Ver todos los leads
SELECT * FROM view_leads_completo
ORDER BY created_at DESC;

-- 👤 ASESOR: Ver mis leads (cambia el email)
SELECT * FROM view_leads_completo
WHERE asesor_email = 'david.sandoval@toi.com.mx'
ORDER BY created_at DESC;

-- 📊 REPORTES: Métricas de todos
SELECT * FROM view_metricas_asesores
ORDER BY tasa_conversion DESC;

-- 🔄 REASIGNAR (como admin)
SELECT * FROM reassign_lead_manual(
  15,  -- ID del lead
  'carlos.ruiz@toi.com.mx',  -- Nuevo asesor
  'admin@toi.com.mx',  -- Tu email
  'Motivo del cambio'
);
```

### **Opción B: Frontend Automático con IA (30 min)**
Usa el código que generé y pídele a Claude/Cursor que:

1. Implemente `AdminDashboard.tsx` leyendo `view_leads_completo`
2. Agregue botón "Reasignar" que llame a `reassign_lead_manual()`
3. Cree `MisLeadsView.tsx` que lea la misma vista (RLS filtra automáticamente)
4. Agregue tab switcher en `App.tsx` según `currentUser.rol`

### **Opción C: Usar lo que ya funciona (0 min)**
El sistema **YA FUNCIONA** en el backend. Puedes:

- ✅ Ver leads desde Supabase Dashboard
- ✅ Reasignar usando SQL
- ✅ n8n sigue funcionando igual
- ✅ RLS protege los datos

---

## 🔧 **QUERIES ÚTILES PARA USAR AHORA**

### **Ver estado actual del sistema**
```sql
SELECT 
  u.nombre as asesor,
  u.email,
  u.rol,
  COUNT(DISTINCT l.id) as leads,
  COUNT(DISTINCT o.id) as oportunidades,
  COUNT(DISTINCT o.id) FILTER (WHERE o.estado = 'abierta') as abiertas
FROM usuarios_toi u
LEFT JOIN leads_toi l ON l.assigned_to = u.id
LEFT JOIN oportunidades_toi o ON o.assigned_to = u.id
GROUP BY u.id, u.nombre, u.email, u.rol
ORDER BY u.rol, leads DESC;
```

### **Crear oportunidad desde frontend (o n8n)**
```javascript
const { data, error } = await supabase.rpc('create_oportunidad_from_n8n', {
  p_numero_telefono: '+5215551234567',
  p_tipo: 'venta_departamento',
  p_descripcion: 'Cliente interesado',
  p_valor_estimado: 5000000
});

console.log('Folio generado:', data.folio);
console.log('Asignado a:', data.asesor_nombre);
```

### **Reasignar lead (admin)**
```javascript
const { data, error } = await supabase.rpc('reassign_lead_manual', {
  p_lead_id: 15,
  p_new_asesor_email: 'jose.manuel@toi.com.mx',
  p_admin_email: 'admin@toi.com.mx',
  p_motivo: 'Cambio solicitado por cliente'
});

if (data.success) {
  console.log(data.message);
}
```

---

## 📦 **ARCHIVOS CREADOS**

✅ `/src/types/database.ts` - Todos los tipos TypeScript
✅ `/src/hooks/useCurrentUserTOI.ts` - Hook para obtener usuario actual
✅ `/SISTEMA_ASIGNACION_TOI.md` - Documentación completa
✅ Este archivo - Guía de implementación frontend

---

## 🎯 **PRÓXIMO PASO RECOMENDADO**

**Opción más rápida**: Usa Supabase Dashboard para gestionar mientras desarrollas el frontend completo.

**Opción completa**: Pídeme que genere los componentes específicos que necesites (uno a la vez para evitar límite de tokens).

¿Qué prefieres? 🚀

