# 🔄 INSTRUCCIONES DE REVERSIÓN - MCP GitHub

## 🎯 OBJETIVO
Revertir el repositorio Monitor_MKT a la versión correcta del 20 de agosto de 2025.

## 📋 PASOS PARA LA REVERSIÓN:

### 1. **IDENTIFICAR COMMIT CORRECTO**
```bash
# Commit objetivo del 20 de agosto:
SHA: d7d70c4662d314cbe6c20369db6d1e36c97e0c3c
Fecha: 2025-08-20T21:28:57Z
Mensaje: "📝 DOC: Actualizado README con información sobre la normalización de estados de citas agendadas"
```

### 2. **ELIMINAR COMMITS INCORRECTOS**
Los siguientes commits deben ser revertidos:
- `68ef2c5bca91209c1edcec39a50bcd7b1f7bfe89` (23 agosto - merge conflictivo)
- `aab76f3d309d1b606ee4974ef4029e6ab87b1273` (22 agosto - funciones Kommo)

### 3. **RESTAURAR ARCHIVOS CORRECTOS**
Mantener solo estos archivos de la normalización:
- ✅ `src/lib/utils.ts` - Función corregida
- ✅ `CHANGELOG_NORMALIZACION.md` - Changelog
- ✅ `CAMBIOS_PROSPECTOS_VIEW.md` - Cambios frontend
- ✅ `README.md` - Actualizado

### 4. **ELIMINAR ARCHIVOS INCORRECTOS**
- ❌ `netlify/functions/kommo-proxy.js`
- ❌ Cualquier configuración de Mayo Dental
- ❌ Archivos de merge conflictivo

## 🔧 COMANDOS GIT NECESARIOS:

```bash
# 1. Verificar estado actual
git log --oneline -10

# 2. Revertir a commit específico
git reset --hard d7d70c4662d314cbe6c20369db6d1e36c97e0c3c

# 3. Forzar push para limpiar historial
git push origin main --force

# 4. Verificar estado final
git log --oneline -5
```

## 📊 ESTADO ESPERADO DESPUÉS DE LA REVERSIÓN:

### **Commits en el historial:**
1. `d7d70c4662d314cbe6c20369db6d1e36c97e0c3c` - README actualizado (20 agosto)
2. `11c6d7e1da12e7bbcb7210e692b8a2638fe43387` - Documentación ProspectosView (20 agosto)
3. `3f3dddbcd7108d8536406d242237dfc3acc0374d` - Changelog normalización (20 agosto)
4. `9201437018a815647fcabf900edcd6efec522f46` - Función utils corregida (20 agosto)

### **Funcionalidades que deben funcionar:**
- ✅ Normalización de estados de citas agendadas
- ✅ 96 prospectos apareciendo correctamente
- ✅ Filtros funcionando en frontend
- ✅ Deployment en Netlify activo

## ⚠️ ADVERTENCIAS:

1. **PÉRDIDA DE DATOS**: Los commits del 22-23 de agosto se perderán permanentemente
2. **FORCE PUSH**: Se requiere `--force` para limpiar el historial
3. **COLABORADORES**: Notificar a otros colaboradores sobre la reversión
4. **BACKUP**: Asegurar que no hay trabajo importante en los commits a eliminar

## 🎯 RESULTADO FINAL:

**Repositorio limpio** con solo la funcionalidad de normalización de estados implementada el 20 de agosto, sin funciones de Kommo API ni configuraciones de Mayo Dental.

---

**Estado**: 🔄 LISTO PARA EJECUTAR
**Método**: Reset hard + Force push
**Objetivo**: Versión limpia del 20 de agosto