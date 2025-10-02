# Demo Brokers - Sistema de Gestión Inmobiliaria

## 🏠 Descripción
Sistema de gestión de prospectos inmobiliarios y análisis de conversaciones para Demo Brokers.

## 🚀 Deploy en Netlify

### Paso 1: Preparación
1. Asegúrate de que el proyecto esté funcionando localmente
2. Verifica que todas las dependencias estén instaladas: `npm install`
3. Crea un build de producción: `npm run build`

### Paso 2: Configuración de Variables de Entorno en Netlify
En el panel de Netlify, ve a **Site settings > Environment variables** y agrega:

```
VITE_SUPABASE_URL=https://pudrykifftcwxjlvdgmu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZHJ5a2lmZnRjd3hqbHZkZ211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxODc5NjQsImV4cCI6MjA0Nzc2Mzk2NH0.fGHkvYHpZRxiHSzqlqGAoY3ronqvmh0v5HBkqT_JdB0
```

**⚠️ IMPORTANTE: NO agregues VITE_OPENAI_KEY en producción por seguridad**

### Paso 3: Configuraciones de Build
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

### Paso 4: Deploy
1. Conecta tu repositorio de GitHub con Netlify
2. Netlify detectará automáticamente la configuración desde `netlify.toml`
3. El deploy se ejecutará automáticamente

## 🔒 Consideraciones de Seguridad

### ✅ Implementado
- Variables de entorno protegidas con .gitignore
- Consultas SQL optimizadas para reducir transferencia de datos
- Solo campos necesarios en las consultas de Supabase
- RLS (Row Level Security) configurado en Supabase

### ⚠️ Recomendaciones Adicionales
- La clave de OpenAI debería manejarse desde el backend
- Implementar rate limiting para las APIs
- Considerar autenticación de usuarios para producción

## 📊 Optimizaciones Implementadas
- Consultas optimizadas a Supabase (solo campos necesarios)
- Componentes reutilizables y compatibles
- Carga lazy de componentes pesados
- Paginación en conversaciones y mensajes

## 🛠️ Tecnologías
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Deploy**: Netlify
- **Iconos**: Lucide React

## 📱 Características
- ✅ Gestión de prospectos inmobiliarios
- ✅ Sistema de conversaciones en tiempo real
- ✅ Dashboard de análisis
- ✅ Responsive design
- ✅ Modo oscuro
- ✅ Búsqueda avanzada
- ✅ Filtros por estado del prospecto
