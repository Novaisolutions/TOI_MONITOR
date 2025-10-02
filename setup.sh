#!/bin/bash

# 🚀 Script de Setup Automatizado - Monitor Base
# Novai Solutions - 2025

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   🎯 MONITOR BASE - SETUP AUTOMATIZADO               ║"
echo "║   Novai Solutions                                     ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar Node.js
echo "📋 Verificando requisitos..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    echo "   Instala Node.js 18+ desde: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versión 18+ requerida (tienes: $(node -v))"
    exit 1
fi
print_success "Node.js $(node -v) instalado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi
print_success "npm $(npm -v) instalado"

echo ""
echo "🎨 CONFIGURACIÓN DEL CLIENTE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Pedir datos del cliente
read -p "📌 Nombre del cliente (ej: Mi Empresa): " CLIENT_NAME
read -p "🔗 URL de Supabase (ej: https://xxx.supabase.co): " SUPABASE_URL
read -p "🔑 Supabase ANON Key: " SUPABASE_KEY

# Validar URLs
if [[ ! "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
    print_warning "La URL de Supabase parece incorrecta"
    read -p "¿Continuar de todos modos? (y/n): " CONTINUE
    if [[ "$CONTINUE" != "y" ]]; then
        exit 1
    fi
fi

echo ""
echo "🔧 Instalando dependencias..."
npm install
print_success "Dependencias instaladas"

echo ""
echo "📝 Creando archivo .env..."
if [ -f .env ]; then
    print_warning "El archivo .env ya existe"
    read -p "¿Sobrescribir? (y/n): " OVERWRITE
    if [[ "$OVERWRITE" != "y" ]]; then
        print_warning "Manteniendo .env existente"
    else
        rm .env
    fi
fi

if [ ! -f .env ]; then
    cat > .env << EOF
# ============================================
# CONFIGURACIÓN: $CLIENT_NAME
# Generado: $(date)
# ============================================

# 🗄️ SUPABASE - Requerido
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY

# 🤖 OPENAI - Opcional (para features de IA)
# VITE_OPENAI_KEY=sk-proj-xxxxxxxxxxxxxxxx

# 🔗 KOMMO CRM - Opcional (integración externa)
# VITE_KOMMO_ACCESS_TOKEN=tu_token_aqui

# 📊 N8N WEBHOOKS - Opcional (automatización)
# VITE_N8N_PROMPT_GET=https://tu-n8n.com/webhook/prompt-config
# VITE_N8N_PROMPT_SET=https://tu-n8n.com/webhook/prompt-config

# 🐛 SENTRY - Opcional (monitoreo de errores)
# VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
EOF
    print_success "Archivo .env creado"
else
    print_warning ".env no modificado"
fi

echo ""
echo "🎨 Personalizando proyecto..."

# Actualizar package.json
CLIENT_SLUG=$(echo "$CLIENT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
if command -v jq &> /dev/null; then
    jq --arg name "monitor-$CLIENT_SLUG" '.name = $name' package.json > package.json.tmp
    mv package.json.tmp package.json
    print_success "package.json actualizado"
else
    print_warning "jq no instalado - actualiza package.json manualmente"
fi

# Actualizar index.html
if [ -f index.html ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/<title>.*<\/title>/<title>Monitor - $CLIENT_NAME<\/title>/g" index.html
    else
        sed -i "s/<title>.*<\/title>/<title>Monitor - $CLIENT_NAME<\/title>/g" index.html
    fi
    print_success "index.html actualizado"
fi

echo ""
echo "📊 SIGUIENTE PASO: CONFIGURAR BASE DE DATOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Ve al SQL Editor de Supabase: $SUPABASE_URL/project/_/sql"
echo ""
echo "2. Ejecuta los siguientes scripts EN ORDEN:"
echo "   a) supabase/update_tables_structure.sql"
echo "   b) supabase/rls.sql"
echo "   c) supabase/conversations_optimization.sql"
echo "   d) supabase/prospectos_optimization.sql"
echo "   e) supabase/seguimiento_optimizado.sql"
echo "   f) supabase/prospect_creation_trigger.sql"
echo "   g) supabase/auto_prospect_movement.sql"
echo ""
echo "3. Crea un usuario admin en Authentication > Users:"
echo "   Email: admin@$(echo "$CLIENT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '').com"
echo "   Password: (elige una segura)"
echo ""

read -p "¿Scripts SQL ejecutados? (y/n): " SQL_DONE

if [[ "$SQL_DONE" == "y" ]]; then
    print_success "¡Excelente! Todo listo para iniciar"
    echo ""
    echo "🚀 INICIAR DESARROLLO"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "¿Iniciar servidor de desarrollo ahora? (y/n): " START_DEV
    
    if [[ "$START_DEV" == "y" ]]; then
        echo ""
        print_success "Iniciando npm run dev..."
        echo ""
        npm run dev
    else
        echo ""
        print_success "Setup completado"
        echo ""
        echo "Para iniciar el servidor de desarrollo:"
        echo "  $ npm run dev"
        echo ""
    fi
else
    print_warning "No olvides ejecutar los scripts SQL en Supabase"
    echo ""
    echo "Cuando termines, ejecuta:"
    echo "  $ npm run dev"
    echo ""
fi

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   ✅ SETUP COMPLETADO - MONITOR $CLIENT_NAME"
echo "╚═══════════════════════════════════════════════════════╝"
