# 🚀 Guía Rápida - Nuevo Cliente

## Setup en 5 Comandos

```bash
# 1. Clonar y entrar
git clone https://github.com/Novaisolutions/TOI_MONITOR.git mi-cliente
cd mi-cliente

# 2. Ejecutar setup automático
./setup.sh

# 3. (Manual) Ejecutar scripts SQL en Supabase
# Ver: SETUP_GUIDE.md sección 5

# 4. Iniciar desarrollo
npm run dev

# 5. Deploy a Netlify
# Push a GitHub y conectar con Netlify
```

## Archivos Clave a Personalizar

### 1. Variables de Entorno (`.env`)
```env
VITE_SUPABASE_URL=https://nuevo-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 2. Branding
- `public/bot-logo.png` - Logo principal
- `public/favicon.ico` - Icono del navegador  
- `index.html` - Título de la app
- `package.json` - Nombre del proyecto

### 3. Colores (opcional)
- `tailwind.config.js` - Tema de colores

## Tiempo Estimado

| Tarea | Tiempo |
|-------|--------|
| Setup automatizado | 5 min |
| Scripts SQL | 10 min |
| Personalización | 15 min |
| Deploy | 10 min |
| **TOTAL** | **~40 min** |

## Checklist

```markdown
[ ] Proyecto Supabase creado
[ ] ./setup.sh ejecutado
[ ] Scripts SQL ejecutados
[ ] Usuario admin creado
[ ] Logos personalizados
[ ] Deploy en Netlify
[ ] Variables en Netlify configuradas
[ ] Pruebas completadas
[ ] Cliente capacitado
```

## Soporte

📧 soporte@novaisolutions.com  
📚 Ver [SETUP_GUIDE.md](SETUP_GUIDE.md) para guía completa
