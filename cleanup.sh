#!/bin/bash

# 🧹 Script de Limpieza Pre-Deploy
# Limpia archivos sensibles y temporales antes de subir a GitHub

set -e

echo "🧹 LIMPIANDO PROYECTO PARA GITHUB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar si estamos en un repo git
if [ ! -d .git ]; then
    echo "❌ Error: No es un repositorio Git"
    exit 1
fi

# Backup de archivos .env si existen
if [ -f .env ]; then
    echo "💾 Backup de .env a .env.backup.local"
    cp .env .env.backup.local
    echo "   ✅ Backup creado"
fi

# Remover .env del tracking
echo ""
echo "🔒 Removiendo archivos sensibles del tracking..."
git rm --cached .env ".env copy" 2>/dev/null || echo "   ℹ️  Archivos .env ya no están en tracking"

# Limpiar archivos temporales
echo ""
echo "🗑️  Limpiando archivos temporales..."
rm -rf supabase/.temp/* 2>/dev/null || true
rm -rf dev-dist/* 2>/dev/null || true
rm -rf .netlify 2>/dev/null || true
echo "   ✅ Temporales eliminados"

# Verificar .gitignore
echo ""
echo "📋 Verificando .gitignore..."
if ! grep -q "^\.env$" .gitignore; then
    echo ".env" >> .gitignore
    echo "   ✅ .env agregado a .gitignore"
fi

if ! grep -q "^\.env\.\*$" .gitignore; then
    echo ".env.*" >> .gitignore
    echo "   ✅ .env.* agregado a .gitignore"
fi

if ! grep -q "^!\.env\.example$" .gitignore; then
    echo "!.env.example" >> .gitignore
    echo "   ✅ Excepto .env.example"
fi

if ! grep -q "^\.env\.backup\.local$" .gitignore; then
    echo ".env.backup.local" >> .gitignore
    echo "   ✅ .env.backup.local agregado"
fi

echo "   ✅ .gitignore actualizado"

# Verificar que .env.example exista
echo ""
echo "📝 Verificando .env.example..."
if [ ! -f .env.example ]; then
    echo "   ❌ .env.example no existe!"
    echo "   Créalo antes de continuar"
    exit 1
else
    echo "   ✅ .env.example existe"
fi

# Mostrar status
echo ""
echo "📊 Estado actual de Git:"
git status --short

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ LIMPIEZA COMPLETADA"
echo ""
echo "📌 Archivos protegidos:"
echo "   • .env (backup en .env.backup.local)"
echo "   • .env copy (removido)"
echo "   • Temporales limpiados"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Revisar cambios: git status"
echo "   2. Agregar archivos: git add ."
echo "   3. Commit: git commit -m 'Preparación para Monitor Base'"
echo "   4. Push: git push origin main"
echo ""
echo "⚠️  IMPORTANTE: Tu .env local está en .env.backup.local"
echo ""
