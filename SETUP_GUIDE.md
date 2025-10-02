# 🚀 Guía de Configuración - Monitor Base

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Netlify](https://netlify.com) (opcional, para deploy)

---

## ⚡ Setup Rápido (5 minutos)

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/Novaisolutions/TOI_MONITOR.git
cd TOI_MONITOR
npm install
```

### 2️⃣ Crear Proyecto en Supabase

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click en "New Project"
3. Configura:
   - **Name:** `Monitor-NombreCliente`
   - **Database Password:** Guárdala en un lugar seguro
   - **Region:** Closest to your users
4. Espera ~2 minutos a que se cree el proyecto

### 3️⃣ Obtener Credenciales de Supabase

En tu proyecto de Supabase:
1. Ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public** key

### 4️⃣ Configurar Variables de Entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus valores
nano .env  # o usa tu editor favorito
```

Completa:
```env
VITE_SUPABASE_URL=https://tu-proyecto-xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5️⃣ Ejecutar Scripts SQL en Supabase

En el **SQL Editor** de Supabase, ejecuta EN ORDEN:

```bash
# 1. Estructura de tablas
supabase/update_tables_structure.sql

# 2. Políticas de seguridad
supabase/rls.sql

# 3. Optimizaciones
supabase/conversations_optimization.sql
supabase/prospectos_optimization.sql
supabase/seguimiento_optimizado.sql

# 4. Triggers automáticos
supabase/prospect_creation_trigger.sql
supabase/auto_prospect_movement.sql
```

### 6️⃣ Iniciar Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

---

## 👥 Crear Usuarios de Prueba

### Opción A: Desde Supabase Dashboard

1. Ve a **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Completa:
   - Email: `admin@tucliente.com`
   - Password: `password123`
   - Auto Confirm User: ✅ ON

### Opción B: Desde SQL

```sql
-- En SQL Editor de Supabase
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@tucliente.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  '',
  '',
  '',
  now(),
  now()
);
```

---

## 🎨 Personalización por Cliente

### Cambiar Branding

Edita `package.json`:
```json
{
  "name": "monitor-nombre-cliente",
  "version": "1.0.0"
}
```

Edita `index.html`:
```html
<title>Monitor - Nombre Cliente</title>
```

Edita `public/manifest.webmanifest`:
```json
{
  "name": "Monitor - Nombre Cliente",
  "short_name": "Monitor"
}
```

### Cambiar Logos

Reemplaza estos archivos en `public/`:
- `favicon.ico`
- `favicon.svg`
- `bot-logo.png` (logo principal)
- `Logo_cenyca.jpeg` (reemplazar con logo del cliente)

---

## 🚀 Deploy a Producción (Netlify)

### Setup Inicial

1. Sube tu código a GitHub
2. Ve a [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Conecta tu repositorio GitHub
5. Configuración automática (detecta Vite)

### Variables de Entorno en Netlify

En **Site settings** → **Environment variables**, agrega:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Deploy

```bash
# Netlify desplegará automáticamente al hacer push a main
git push origin main
```

---

## 🔐 Configurar WhatsApp (Opcional)

Si necesitas integración con WhatsApp Business API:

### 1. Obtener Access Token de Meta

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Crea una app de WhatsApp Business
3. Obtén el **Access Token**

### 2. Configurar en Netlify

Agrega variable de entorno:
```
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
```

### 3. Verificar Webhook

La función está en `netlify/functions/whatsapp-send.js`

---

## 📊 Estructura de Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `prospectos_toi` | Leads/clientes |
| `conversaciones_toi` | Hilos de conversación |
| `mensajes_toi` | Mensajes individuales |
| `seguimientos` | Seguimiento y notas |
| `oportunidades` | Oportunidades de venta |
| `usuarios_toi` | Usuarios del sistema |
| `equipos` | Equipos de trabajo |

### Personalización de Tablas

Para adaptar a tu cliente, modifica:
```sql
-- En update_tables_structure.sql
ALTER TABLE prospectos_toi 
ADD COLUMN campo_personalizado TEXT;
```

---

## 🔧 Troubleshooting

### Error: "Invalid API credentials"
- Verifica que las variables en `.env` sean correctas
- Asegúrate de que el proyecto Supabase esté activo

### Error: "Table does not exist"
- Ejecuta los scripts SQL en orden
- Verifica que RLS esté configurado correctamente

### No aparecen datos
- Verifica que tengas usuarios creados en Supabase Auth
- Revisa las políticas RLS en Supabase

---

## 📞 Soporte

Para dudas o problemas:
- 📧 Email: soporte@novaisolutions.com
- 📚 Documentación completa en `/docs`

---

## 🎯 Checklist de Setup

```markdown
[ ] Proyecto Supabase creado
[ ] Variables de entorno configuradas (.env)
[ ] Scripts SQL ejecutados en orden
[ ] Usuario admin creado
[ ] npm install ejecutado
[ ] npm run dev funciona localmente
[ ] Branding personalizado (logos, nombre)
[ ] Deploy a Netlify (producción)
[ ] Variables en Netlify configuradas
[ ] Usuarios de producción creados
```

---

¡Listo! Tu Monitor Base está configurado y listo para usar. 🚀
