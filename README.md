# 🎯 Monitor Base - Sistema CRM Multi-Cliente

Sistema modular de gestión de conversaciones, leads y oportunidades. Listo para personalizar por cliente en minutos.

---

## ✨ Características Principales

### 🏢 Multi-Industria
- **Inmobiliaria**: Gestión de propiedades, leads de compra/venta/renta
- **Servicios**: Seguimiento de clientes y oportunidades
- **Educación**: Gestión de prospectos estudiantiles
- **Cualquier sector**: 100% personalizable

### 💬 Gestión de Conversaciones
- ✅ Chat en tiempo real con Supabase Realtime
- ✅ Búsqueda inteligente de mensajes
- ✅ Indicadores de mensajes leídos/no leídos
- ✅ Soporte multimedia (imágenes, documentos)
- ✅ Integración WhatsApp Business API (opcional)

### 👥 Sistema de Leads/Prospectos
- ✅ CRUD completo de prospectos
- ✅ Asignación automática Round Robin
- ✅ Estados personalizables del embudo
- ✅ Seguimiento y notas
- ✅ Score de interés (IA opcional)

### 💼 Gestión de Oportunidades
- ✅ Folios únicos automáticos
- ✅ Pipeline de ventas
- ✅ Pronósticos y montos
- ✅ Historial completo

### 👨‍💼 Multi-Usuario
- ✅ Roles: Admin, Asesor, Usuario
- ✅ RLS (Row Level Security) - cada quien ve lo suyo
- ✅ Equipos de trabajo
- ✅ Log de asignaciones

### 📊 Analytics
- ✅ Dashboard en tiempo real
- ✅ Métricas de conversión
- ✅ Rendimiento por asesor
- ✅ Reportes personalizables

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **UI** | Tailwind CSS + Radix UI + Lucide Icons |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) |
| **Deploy** | Netlify + Netlify Functions |
| **Integraciones** | WhatsApp API, Kommo CRM, N8N |
| **PWA** | Service Worker + Offline Support |

---

## 📦 Instalación Rápida

```bash
# 1. Clonar repositorio
git clone https://github.com/Novaisolutions/TOI_MONITOR.git
cd TOI_MONITOR

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# 4. Ejecutar en desarrollo
npm run dev
```

📖 **Guía completa:** Ver [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 🎨 Configuración por Cliente

### 1️⃣ Crear Proyecto Supabase
- Nuevo proyecto en [supabase.com](https://supabase.com)
- Ejecutar scripts SQL de `/supabase`

### 2️⃣ Configurar Variables
```env
VITE_SUPABASE_URL=https://nuevo-cliente.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3️⃣ Personalizar Branding
- Cambiar logos en `/public`
- Actualizar nombre en `package.json`
- Modificar título en `index.html`

### 4️⃣ Deploy
```bash
# Push a GitHub
git push origin main

# Conectar con Netlify (auto-deploy)
```

**Tiempo total: ~5-10 minutos** ⚡

---

## 📁 Estructura del Proyecto

```
TOI_MONITOR/
├── src/
│   ├── components/      # Componentes React reutilizables
│   │   ├── admin/       # Vista administrativa
│   │   ├── auth/        # Login y autenticación
│   │   ├── chat/        # Chat y mensajes
│   │   ├── layout/      # Layouts principales
│   │   ├── prospectos/  # Gestión de leads
│   │   └── ui/          # Componentes UI base
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilidades y config
│   ├── types/           # TypeScript types
│   └── utils/           # Funciones helper
├── supabase/            # Scripts SQL y migrations
├── netlify/functions/   # Serverless functions
├── public/              # Assets estáticos
└── docs/                # Documentación adicional
```

---

## 🔐 Seguridad

- ✅ **RLS activado** - Cada usuario ve solo sus datos
- ✅ **Auth de Supabase** - Autenticación segura
- ✅ **Variables de entorno** - Secrets protegidos
- ✅ **HTTPS obligatorio** - En producción
- ✅ **Tokens en backend** - WhatsApp tokens en Netlify Functions

---

## 🎯 Casos de Uso

### Inmobiliaria (como TOI)
```typescript
// Prospecto inmobiliario
{
  tipo_operacion: 'compra' | 'venta' | 'renta',
  tipo_propiedad: 'casa' | 'departamento' | 'terreno',
  presupuesto_min: 1000000,
  presupuesto_max: 3000000,
  ubicacion_interes: 'Polanco, CDMX'
}
```

### Servicios/Consultoría
```typescript
// Prospecto servicios
{
  servicio_interes: 'Consultoría fiscal',
  empresa: 'Acme Corp',
  tamaño_empresa: 'Mediana',
  presupuesto_mensual: 50000
}
```

### Educación
```typescript
// Prospecto educativo
{
  carrera_interes: 'Ingeniería en Software',
  plantel_preferido: 'Campus Norte',
  nivel_educativo: 'Licenciatura',
  modalidad: 'En línea'
}
```

---

## 📊 Base de Datos

### Tablas Core (invariables)
- `usuarios_toi` - Usuarios del sistema
- `equipos` - Equipos de trabajo
- `conversaciones_toi` - Conversaciones
- `mensajes_toi` - Mensajes

### Tablas Personalizables (por cliente)
- `prospectos_toi` - **← Agregar campos custom aquí**
- `oportunidades` - **← Personalizar por industria**
- `seguimientos` - Notas y seguimiento

### Ejemplo: Agregar campo custom
```sql
-- En Supabase SQL Editor
ALTER TABLE prospectos_toi 
ADD COLUMN campo_personalizado TEXT;
```

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor dev (Vite)

# Producción
npm run build        # Build para producción
npm run preview      # Preview del build

# Calidad
npm run lint         # Linter ESLint
```

---

## 🌐 Deploy a Producción

### Netlify (Recomendado)
1. Conecta tu repo de GitHub
2. Configuración automática detectada
3. Agrega variables de entorno
4. Deploy automático en cada push

### Variables de Entorno en Netlify
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
WHATSAPP_ACCESS_TOKEN=EAAxxxxx (opcional)
```

---

## 📚 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Guía paso a paso de configuración |
| [README_DEMO_BROKERS.md](./README_DEMO_BROKERS.md) | Caso de uso: Sector inmobiliario |
| [ARQUITECTURA_WHATSAPP.md](./ARQUITECTURA_WHATSAPP.md) | Integración WhatsApp |
| [SISTEMA_ASIGNACION_TOI.md](./SISTEMA_ASIGNACION_TOI.md) | Sistema Round Robin |
| [MANUAL_DE_USO.md](./MANUAL_DE_USO.md) | Manual de usuario final |

---

## 🤝 Clientes Usando Este Monitor

- 🏠 **The One Inmobiliaria** - Gestión de leads inmobiliarios
- 🏢 **Cenyca** - Sector educativo/corporativo
- 🦷 **Mayo Dental** - Servicios médicos
- 📈 **BizMaker** - Consultoría empresarial

---

## 🛠️ Personalización Avanzada

### Cambiar colores del tema
Edita `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#tu-color-primario',
      secondary: '#tu-color-secundario'
    }
  }
}
```

### Agregar nuevos módulos
1. Crea componente en `src/components/`
2. Agrega hook en `src/hooks/`
3. Define tipos en `src/types/database.ts`
4. Registra ruta en `App.tsx`

---

## 📞 Soporte y Contacto

- 🌐 **Web:** [novaisolutions.com](https://novaisolutions.com)
- 📧 **Email:** soporte@novaisolutions.com
- 💬 **Slack:** [Workspace de Novai](https://novai.slack.com)

---

## 📄 Licencia

Propiedad de **Novai Solutions**  
Uso autorizado solo para clientes con licencia activa.

---

## ⭐ Roadmap

- [ ] Modo oscuro/claro (toggle)
- [ ] Exportar reportes a PDF
- [ ] Integración con más CRMs
- [ ] App móvil (React Native)
- [ ] IA para predicción de conversión
- [ ] Automatizaciones con n8n

---

## 🚀 Quick Start para Desarrolladores

```bash
# Setup completo en 1 comando
git clone https://github.com/Novaisolutions/TOI_MONITOR.git && \
cd TOI_MONITOR && \
npm install && \
cp .env.example .env && \
echo "✅ Ahora edita .env con tus credenciales" && \
echo "🚀 Luego ejecuta: npm run dev"
```

---

**¿Listo para empezar?** 👉 Ver [SETUP_GUIDE.md](./SETUP_GUIDE.md)
