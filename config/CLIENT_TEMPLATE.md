# 🎯 Template de Configuración por Cliente

## Información del Cliente

```json
{
  "client": {
    "name": "Nombre del Cliente",
    "slug": "nombre-cliente",
    "industry": "real_estate|services|education|healthcare|retail|consulting",
    "website": "https://www.cliente.com",
    "primary_color": "#hexcolor",
    "secondary_color": "#hexcolor"
  },
  "contacts": {
    "admin_email": "admin@cliente.com",
    "support_email": "soporte@cliente.com",
    "phone": "+52 XXX XXX XXXX"
  },
  "supabase": {
    "project_url": "https://xxx.supabase.co",
    "project_id": "xxxxxxxxxxxxx",
    "region": "us-east-1|sa-east-1|etc",
    "created_date": "YYYY-MM-DD"
  },
  "features": {
    "whatsapp_integration": false,
    "kommo_integration": false,
    "ai_features": false,
    "n8n_automation": false
  },
  "custom_fields": {
    "prospectos": [
      {
        "name": "campo_personalizado_1",
        "type": "text|number|boolean|date",
        "required": false,
        "default": null
      }
    ],
    "oportunidades": []
  },
  "deployment": {
    "platform": "netlify",
    "url": "https://monitor-cliente.netlify.app",
    "custom_domain": "monitor.cliente.com",
    "deployed_date": "YYYY-MM-DD"
  }
}
```

## Pasos de Configuración

### 1. Variables de Entorno (.env)

```env
# Cliente: [NOMBRE_CLIENTE]
# Configurado: [FECHA]

VITE_SUPABASE_URL=https://[proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=[key_aqui]

# Opcional
# VITE_OPENAI_KEY=
# VITE_KOMMO_ACCESS_TOKEN=
# WHATSAPP_ACCESS_TOKEN=
```

### 2. Branding

- [ ] Logo principal: `public/bot-logo.png`
- [ ] Logo alternativo: `public/Logo_cenyca.jpeg` → renombrar
- [ ] Favicon: `public/favicon.ico`
- [ ] Título en `index.html`
- [ ] Nombre en `package.json`
- [ ] Manifest en `public/manifest.webmanifest`

### 3. Colores del Tema

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: '#color-primario',
      secondary: '#color-secundario'
    }
  }
}
```

### 4. Base de Datos - Scripts SQL

Ejecutar en orden en Supabase SQL Editor:

- [ ] `supabase/update_tables_structure.sql`
- [ ] `supabase/rls.sql`
- [ ] `supabase/conversations_optimization.sql`
- [ ] `supabase/prospectos_optimization.sql`
- [ ] `supabase/seguimiento_optimizado.sql`
- [ ] `supabase/prospect_creation_trigger.sql`
- [ ] `supabase/auto_prospect_movement.sql`

### 5. Campos Personalizados (Opcional)

```sql
-- Agregar a prospectos_toi
ALTER TABLE prospectos_toi 
ADD COLUMN campo_custom1 TEXT,
ADD COLUMN campo_custom2 INTEGER;

-- Agregar a oportunidades
ALTER TABLE oportunidades
ADD COLUMN campo_custom1 TEXT;
```

### 6. Usuarios Iniciales

```sql
-- Crear en Supabase Auth o manualmente:
Email: admin@[cliente].com
Password: [segura]
Role: admin
```

### 7. Deploy Netlify

Variables de entorno en Netlify:
```
VITE_SUPABASE_URL=[url]
VITE_SUPABASE_ANON_KEY=[key]
WHATSAPP_ACCESS_TOKEN=[si aplica]
```

## Checklist de Entrega

### Pre-Deploy
- [ ] Variables de entorno configuradas
- [ ] Scripts SQL ejecutados
- [ ] Branding personalizado
- [ ] Usuario admin creado
- [ ] Pruebas locales completadas

### Deploy
- [ ] Deploy a Netlify exitoso
- [ ] Variables de entorno en producción
- [ ] Custom domain configurado (opcional)
- [ ] SSL/HTTPS activo

### Post-Deploy
- [ ] Credenciales entregadas al cliente
- [ ] Manual de usuario entregado
- [ ] Capacitación realizada
- [ ] Soporte configurado

## Tiempo Estimado

- ⏱️ Configuración base: **30 minutos**
- ⏱️ Personalización: **1-2 horas**
- ⏱️ Deploy: **15 minutos**
- ⏱️ Pruebas: **30 minutos**

**Total: 2.5 - 3.5 horas** (primer cliente)  
**Total: 1 - 1.5 horas** (clientes subsecuentes)

## Notas

- Mantener documentación de cada cliente en carpeta separada
- Backup de configuraciones en repositorio privado
- Versionar cambios específicos por cliente
