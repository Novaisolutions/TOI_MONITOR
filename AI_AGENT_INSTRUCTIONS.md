# 🤖 Instrucciones para Agente LLM - Setup Automático

## CONTEXTO
Eres un asistente de IA que ayudará a configurar el Monitor Base para un nuevo cliente. Este proyecto es un CRM completo que requiere conexión a Supabase.

---

## 📋 TAREA PRINCIPAL
Configurar el Monitor Base localmente y conectarlo a un proyecto Supabase que el usuario proporcionará.

---

## 🎯 PASO A PASO DETALLADO

### FASE 1: VERIFICACIÓN DE REQUISITOS

**Acción:** Verificar que el sistema tenga los requisitos instalados.

```bash
# Verificar Node.js (requiere 18+)
node -v

# Verificar npm
npm -v

# Verificar Git
git --version
```

**Si falta algo:**
- Node.js < 18: Solicitar al usuario instalar desde https://nodejs.org
- npm faltante: Viene con Node.js
- Git faltante: Solicitar instalar desde https://git-scm.com

---

### FASE 2: CLONAR REPOSITORIO

**Acción:** Clonar el proyecto desde GitHub.

```bash
# Preguntar al usuario dónde quiere clonar el proyecto
# Ejemplo: ~/Projects/cliente-nombre

cd [DIRECTORIO_ELEGIDO]
git clone https://github.com/Novaisolutions/TOI_MONITOR.git
cd TOI_MONITOR
```

**Confirmar:** "✅ Repositorio clonado correctamente"

---

### FASE 3: INSTALAR DEPENDENCIAS

**Acción:** Instalar todas las dependencias del proyecto.

```bash
npm install
```

**Esperar a que termine.** Puede tomar 2-3 minutos.

**Confirmar:** "✅ Dependencias instaladas (debe haber ~478 paquetes)"

---

### FASE 4: SOLICITAR CREDENCIALES DE SUPABASE

**Acción:** Solicitar al usuario la siguiente información:

```
Por favor, proporciona las siguientes credenciales de Supabase:

1. VITE_SUPABASE_URL: 
   (Ejemplo: https://xxxxxxxxxxxxx.supabase.co)
   
2. VITE_SUPABASE_ANON_KEY: 
   (Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....)

📍 ¿Dónde encontrarlas?
   - Ve a tu proyecto en https://supabase.com/dashboard
   - Settings → API
   - Copia "Project URL" y "anon public key"
```

**Validar:**
- URL debe empezar con `https://` y terminar en `.supabase.co`
- ANON_KEY debe empezar con `eyJ`

---

### FASE 5: CREAR ARCHIVO .env

**Acción:** Crear archivo `.env` con las credenciales.

```bash
# Copiar template
cp .env.example .env
```

**Luego editar `.env` con las credenciales proporcionadas:**

```bash
# Usar herramienta de edición de archivos para modificar .env
# Reemplazar:
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Con los valores reales proporcionados por el usuario
```

**Confirmar:** "✅ Archivo .env creado con credenciales"

---

### FASE 6: CONFIGURAR BASE DE DATOS

**Acción:** Guiar al usuario para ejecutar scripts SQL en Supabase.

```
📊 CONFIGURACIÓN DE BASE DE DATOS

Ahora necesito que ejecutes los siguientes scripts SQL en Supabase.
Te guiaré paso a paso:

1. Abre tu proyecto Supabase en: https://supabase.com/dashboard
2. Ve a "SQL Editor" (menú lateral izquierdo)
3. Ejecuta los siguientes scripts EN ORDEN:

   Script 1: Estructura de Tablas
   📁 Archivo: supabase/update_tables_structure.sql
   ⏱️  Tiempo: ~30 segundos
   
   Script 2: Políticas de Seguridad (RLS)
   📁 Archivo: supabase/rls.sql
   ⏱️  Tiempo: ~20 segundos
   
   Script 3: Optimización de Conversaciones
   📁 Archivo: supabase/conversations_optimization.sql
   ⏱️  Tiempo: ~10 segundos
   
   Script 4: Optimización de Prospectos
   📁 Archivo: supabase/prospectos_optimization.sql
   ⏱️  Tiempo: ~10 segundos
   
   Script 5: Optimización de Seguimientos
   📁 Archivo: supabase/seguimiento_optimizado.sql
   ⏱️  Tiempo: ~10 segundos
   
   Script 6: Trigger de Creación de Prospectos
   📁 Archivo: supabase/prospect_creation_trigger.sql
   ⏱️  Tiempo: ~5 segundos
   
   Script 7: Movimiento Automático de Prospectos
   📁 Archivo: supabase/auto_prospect_movement.sql
   ⏱️  Tiempo: ~5 segundos

💡 CÓMO EJECUTAR:
   - Abre el archivo SQL en tu editor
   - Copia todo el contenido
   - Pégalo en el SQL Editor de Supabase
   - Click en "Run" o Ctrl+Enter
   - Espera a que diga "Success"
```

**Preguntar:** "¿Has ejecutado todos los scripts SQL correctamente? (sí/no)"

**Si responde NO:** Ofrecer ayuda con errores específicos.

---

### FASE 7: CREAR USUARIO ADMINISTRADOR

**Acción:** Guiar la creación del primer usuario.

```
👤 CREAR USUARIO ADMINISTRADOR

Necesitas crear un usuario para acceder al sistema:

Opción A - Desde Supabase Dashboard:
1. Ve a "Authentication" → "Users" en Supabase
2. Click "Add user" → "Create new user"
3. Completa:
   - Email: [SOLICITAR AL USUARIO, ej: admin@cliente.com]
   - Password: [SOLICITAR AL USUARIO, mínimo 6 caracteres]
   - Auto Confirm User: ✅ Activar
4. Click "Create user"

Opción B - Desde SQL Editor:
Ejecuta este script (reemplaza EMAIL y PASSWORD):

INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  '[EMAIL]',
  crypt('[PASSWORD]', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

**Confirmar:** "✅ Usuario administrador creado"

---

### FASE 8: INICIAR SERVIDOR DE DESARROLLO

**Acción:** Iniciar el servidor local.

```bash
npm run dev
```

**Esto abrirá el navegador automáticamente en:** `http://localhost:5173`

**Confirmar:** "✅ Servidor iniciado correctamente"

---

### FASE 9: VALIDAR ACCESO

**Acción:** Verificar que el usuario pueda acceder.

```
🔐 VALIDAR ACCESO

1. Abre http://localhost:5173 en tu navegador
2. Deberías ver la pantalla de login
3. Ingresa con las credenciales creadas en Fase 7
4. Si todo está bien, verás el dashboard

¿Puedes acceder correctamente? (sí/no)
```

**Si responde SÍ:** 
```
🎉 ¡CONFIGURACIÓN COMPLETADA!

El Monitor Base está funcionando correctamente.
```

**Si responde NO:** 
```
🔍 TROUBLESHOOTING

Errores comunes:

1. "Invalid API credentials"
   → Verifica .env con credenciales correctas
   
2. "Table does not exist"
   → Ejecuta los scripts SQL nuevamente
   
3. "User not found"
   → Crea el usuario en Supabase Auth
   
4. Página en blanco
   → Revisa la consola del navegador (F12)
   → Verifica que Supabase esté activo
```

---

## 🎨 PERSONALIZACIÓN (OPCIONAL)

Si el usuario quiere personalizar el proyecto:

### Cambiar Nombre y Branding

```bash
# 1. Actualizar package.json
# Editar "name": "monitor-nombre-cliente"

# 2. Actualizar index.html
# Editar <title>Monitor - Nombre Cliente</title>

# 3. Logos (proporcionar archivos)
# Reemplazar:
#   - public/bot-logo.png (logo principal)
#   - public/favicon.ico (icono navegador)
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

Marca cada paso completado:

```markdown
[ ] Node.js 18+ instalado
[ ] Repositorio clonado
[ ] npm install completado
[ ] Credenciales Supabase obtenidas
[ ] Archivo .env creado
[ ] 7 scripts SQL ejecutados
[ ] Usuario admin creado
[ ] npm run dev funcionando
[ ] Login exitoso
[ ] Dashboard visible
```

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### Error: "Module not found"
```bash
# Solución: Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 5173 already in use"
```bash
# Solución: Matar proceso en puerto 5173
kill -9 $(lsof -ti:5173)
npm run dev
```

### Error: "EACCES permission denied"
```bash
# Solución: Limpiar caché de npm
npm cache clean --force
sudo chown -R $(whoami) ~/.npm
npm install
```

### Error: "Invalid credentials"
**Solución:** Verificar que el archivo `.env` tenga las credenciales correctas sin espacios extra.

---

## 🎯 COMANDOS RÁPIDOS DE REFERENCIA

```bash
# Iniciar desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Limpiar y reinstalar
rm -rf node_modules && npm install

# Ver logs en tiempo real
# (ya incluido en npm run dev)
```

---

## 📞 SIGUIENTE NIVEL: DEPLOY A PRODUCCIÓN

Cuando el usuario esté listo para producción:

```
🚀 DEPLOY A NETLIFY

1. Sube el proyecto a GitHub:
   git remote add origin [URL_REPO_CLIENTE]
   git push -u origin main

2. Ve a https://netlify.com
3. "Add new site" → "Import an existing project"
4. Conecta GitHub y selecciona el repo
5. Configuración detectada automáticamente
6. Agrega variables de entorno:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
7. Deploy!

⏱️  Tiempo: ~5-10 minutos
```

---

## 💡 TIPS PARA EL AGENTE LLM

1. **Ser paciente:** Algunos pasos toman tiempo (npm install, scripts SQL)
2. **Validar cada paso:** No avanzar sin confirmar éxito
3. **Explicar errores:** Si algo falla, explicar en términos simples
4. **Ofrecer alternativas:** Siempre tener plan B
5. **Documentar:** Si algo se hace diferente, documentarlo

---

## 📝 TEMPLATE DE CONVERSACIÓN

```
[INICIO]
Hola, te ayudaré a configurar el Monitor Base. 
Este proceso tomará aproximadamente 15-20 minutos.

¿Estás listo para comenzar? (sí/no)

[SI USUARIO DICE SÍ]
Perfecto. Primero verificaré los requisitos de tu sistema...

[EJECUTAR FASE 1]
[EJECUTAR FASE 2]
[... continuar ...]

[AL FINALIZAR]
🎉 ¡Configuración completada!

Tu Monitor Base está funcionando en: http://localhost:5173
Usuario: [email proporcionado]
Password: [recordar al usuario]

¿Necesitas ayuda con algo más? (personalización/deploy/otro)
```

---

## 🔐 SEGURIDAD - IMPORTANTE

**NUNCA:**
- ❌ Almacenar credenciales en logs
- ❌ Compartir archivos .env
- ❌ Hacer commit de credenciales

**SIEMPRE:**
- ✅ Validar formato de credenciales
- ✅ Confirmar que .env está en .gitignore
- ✅ Recordar al usuario guardar sus credenciales

---

## 📊 TIEMPO ESTIMADO POR FASE

| Fase | Descripción | Tiempo |
|------|-------------|--------|
| 1 | Verificación | 1 min |
| 2 | Clonar repo | 2 min |
| 3 | npm install | 3 min |
| 4 | Solicitar credenciales | 2 min |
| 5 | Crear .env | 1 min |
| 6 | Scripts SQL | 5 min |
| 7 | Crear usuario | 2 min |
| 8 | Iniciar servidor | 1 min |
| 9 | Validar | 2 min |
| **TOTAL** | | **~20 min** |

---

## ✅ CRITERIOS DE ÉXITO

El setup está completo cuando:
1. ✅ `npm run dev` corre sin errores
2. ✅ Navegador abre en `localhost:5173`
3. ✅ Login muestra pantalla de autenticación
4. ✅ Usuario puede hacer login
5. ✅ Dashboard carga correctamente
6. ✅ No hay errores en consola del navegador

---

**Última actualización:** 2 de octubre de 2025  
**Versión del Monitor:** 2.0  
**Compatible con:** Node.js 18+, Supabase, cualquier OS
