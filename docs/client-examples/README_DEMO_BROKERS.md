# 🏠 Demo Brokers - Monitor de Conversaciones

Sistema de monitoreo de conversaciones especializado para **Demo Brokers**, adaptado para el sector inmobiliario y de hospedaje.

## 📋 Características Principales

### 🏘️ Gestión de Prospectos Inmobiliarios
- **Tipos de Operación**: Compra, Venta, Renta, Inversión
- **Propiedades**: Casas, Departamentos, Terrenos, Oficinas, etc.
- **Características**: Recámaras, baños, metros cuadrados, ubicación
- **Presupuesto**: Rangos de precio personalizables
- **Seguimiento**: Estados del embudo inmobiliario

### 🏨 Gestión de Hospedaje
- **Tipos de Hospedaje**: Hoteles, Airbnb, Casas vacacionales
- **Reservas**: Fechas de check-in/out, número de huéspedes
- **Servicios**: WiFi, Desayuno, Spa, etc.
- **Motivo de Viaje**: Negocios, Placer, Familia

### 💬 Sistema de Conversaciones
- **Chat en Tiempo Real**: Mensajes instantáneos
- **Búsqueda Inteligente**: Encuentra conversaciones rápidamente  
- **Notificaciones**: Mensajes no leídos
- **Multimedia**: Soporte para imágenes y archivos

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Novaisolutions/Monitor_MKT.git
cd Monitor_MKT
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` basado en `.env.example`:

```env
# Configuración de Supabase (Proyecto NOVAI)
VITE_SUPABASE_URL=https://pudrykifftcwxjlvdgmu.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Configuración de la aplicación
VITE_APP_NAME=Demo Brokers Monitor
VITE_APP_VERSION=1.0.0
```

### 4. Configurar Base de Datos

El proyecto utiliza las siguientes tablas en Supabase:

#### 📊 Tablas Principales
- `prospectos_demobrokers` - Información de prospectos inmobiliarios
- `conversaciones_demobrokers` - Conversaciones del chat
- `mensajes_demobrokers` - Mensajes individuales

#### 🔧 Triggers Automáticos
- Actualización automática de conversaciones
- Creación de prospectos desde mensajes
- Seguimiento de mensajes no leídos
- Sincronización de fechas

### 5. Ejecutar la Aplicación
```bash
npm run dev
```

## 📱 Uso de la Aplicación

### 🏠 Gestión de Prospectos
1. **Crear Prospecto**: Botón "Nuevo Prospecto" en la pestaña Prospectos
2. **Campos Inmobiliarios**:
   - Tipo de operación (Compra/Venta/Renta)
   - Tipo de propiedad (Casa/Depto/Terreno)
   - Ubicación preferida
   - Rango de precios
   - Características (recámaras, baños, m²)
3. **Seguimiento**: Estados del embudo desde Lead hasta Cierre

### 💬 Chat de Conversaciones
1. **Lista de Conversaciones**: Panel izquierdo con conversaciones activas
2. **Búsqueda**: Buscar por nombre, número o contenido
3. **Chat**: Panel principal para intercambio de mensajes
4. **Estados**: Indicadores de mensajes leídos/no leídos

### 📊 Análisis y Reportes
- **Dashboard**: Métricas de conversiones y seguimiento
- **Estados del Embudo**: Visualización del pipeline inmobiliario
- **Actividad**: Seguimiento de interacciones por prospecto

## 🎯 Estados del Embudo Inmobiliario

| Estado | Descripción | Icono |
|--------|-------------|-------|
| **Lead** | Nuevo prospecto | ✨ |
| **Contactado** | Primera comunicación | 📞 |
| **Calificado** | Prospecto validado | 💬 |
| **Cita Agendada** | Reunión programada | 📅 |
| **Visita Realizada** | Propiedad visitada | 🏠 |
| **Negociación** | En proceso de negociación | 💰 |
| **Cierre** | Venta/Renta cerrada | 🏢 |
| **Perdido** | Oportunidad perdida | ❌ |

## 🔧 Configuración Técnica

### 📋 Tipos TypeScript
El proyecto incluye interfaces específicas para Demo Brokers:

```typescript
interface ProspectoDemoBrokers {
  // Campos básicos
  nombre: string;
  numero_telefono: string;
  email: string;
  
  // Campos inmobiliarios
  tipo_operacion: string; // Compra, Venta, Renta
  tipo_propiedad_interes: string;
  ubicacion_preferida: string;
  rango_precio_min: number;
  rango_precio_max: number;
  numero_recamaras: number;
  numero_banos: number;
  metros_cuadrados_min: number;
  
  // Campos de hospedaje
  tipo_hospedaje_interes: string;
  destino_interes: string;
  fecha_checkin_deseada: string;
  numero_huespedes: number;
  
  // Seguimiento
  agente_asignado: string;
  fuente_lead: string;
  estado_embudo: string;
}
```

### 🔄 Hooks Personalizados
- `useProspectosDemoBrokers` - Gestión de prospectos
- `useConversacionesDemoBrokers` - Manejo de conversaciones
- `useMensajesDemoBrokers` - Control de mensajes

### 🎨 Componentes Principales
- `ProspectosViewDemoBrokers` - Vista principal de prospectos
- `ConversationsSidebarDemoBrokers` - Sidebar de conversaciones
- `ProspectoDemoBrokersFormModal` - Formulario de prospecto

## 🔐 Seguridad y Permisos

### RLS (Row Level Security)
Las tablas tienen políticas de seguridad configuradas:
- Solo usuarios autenticados pueden acceder
- Filtrado por organización/proyecto
- Auditoría de cambios automática

### 🔑 Autenticación
- Login con email/password
- Sesiones persistentes
- Refresh automático de tokens

## 🚀 Despliegue

### Netlify (Recomendado)
```bash
npm run build
# Subir dist/ a Netlify
```

### Variables de Entorno en Producción
```env
VITE_SUPABASE_URL=https://pudrykifftcwxjlvdgmu.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_de_produccion
VITE_APP_NAME=Demo Brokers Monitor
```

## 📚 Documentación Adicional

### 🔗 Enlaces Útiles
- [Supabase Dashboard](https://supabase.com/dashboard/project/pudrykifftcwxjlvdgmu)
- [Documentación de Supabase](https://supabase.com/docs)
- [React + TypeScript](https://react-typescript-cheatsheet.netlify.app/)

### 📞 Soporte
Para soporte técnico contactar al equipo de desarrollo de Novai Solutions.

---

**Demo Brokers Monitor** - Especializado en bienes raíces y hospedaje 🏠🏨
