# 🤖 Prompt para Agente LLM - Setup Monitor Base

## PROMPT COMPLETO (Copiar y pegar a otro LLM)

```
Eres un asistente técnico especializado en configurar proyectos React + Supabase. 

Tu tarea es ayudar al usuario a instalar y configurar el Monitor Base, un CRM completo para gestión de conversaciones y leads.

REPOSITORIO: https://github.com/Novaisolutions/TOI_MONITOR

OBJETIVO: Configurar el proyecto localmente y conectarlo a un proyecto Supabase nuevo.

PROCESO:
1. Verificar requisitos (Node.js 18+, npm, Git)
2. Clonar repositorio desde GitHub
3. Instalar dependencias con npm install
4. Solicitar credenciales de Supabase al usuario
5. Crear archivo .env con las credenciales
6. Guiar ejecución de 7 scripts SQL en Supabase
7. Ayudar a crear usuario administrador
8. Iniciar servidor de desarrollo
9. Validar que funcione correctamente

INSTRUCCIONES DETALLADAS:
Lee el archivo AI_AGENT_INSTRUCTIONS.md del repositorio para el paso a paso completo.

CARACTERÍSTICAS:
- Ser paciente y explicar cada paso
- Validar éxito antes de continuar
- Ofrecer troubleshooting si hay errores
- No almacenar credenciales en logs
- Confirmar cada fase completada

TIEMPO ESTIMADO: 15-20 minutos

CRITERIO DE ÉXITO:
- npm run dev corre sin errores
- Usuario puede hacer login
- Dashboard carga correctamente

¿Comenzamos con la configuración?
```

---

## 📋 PROMPT ALTERNATIVO (Más directo)

```
Ayúdame a instalar este proyecto:
https://github.com/Novaisolutions/TOI_MONITOR

Es un CRM en React + TypeScript + Supabase.

Necesito:
1. Clonarlo localmente
2. Instalar dependencias
3. Conectarlo a mi proyecto Supabase
4. Ejecutar scripts SQL
5. Crear un usuario
6. Correr en localhost

Guíame paso a paso. Mis credenciales Supabase son:
- URL: [usuario proporciona]
- ANON_KEY: [usuario proporciona]

Revisa AI_AGENT_INSTRUCTIONS.md del repo para el proceso completo.
```

---

## 🎯 PROMPT PARA CLAUDE/ChatGPT/Copilot

```
# CONTEXTO
Soy desarrollador y necesito configurar un proyecto CRM open-source.

# PROYECTO
- Nombre: Monitor Base
- Repo: https://github.com/Novaisolutions/TOI_MONITOR
- Stack: React 18, TypeScript, Vite, Supabase
- Propósito: CRM para gestión de leads y conversaciones

# LO QUE NECESITO
Ayuda paso a paso para:
1. Clonar el repositorio
2. Instalar dependencias
3. Configurar variables de entorno
4. Conectar a Supabase (tengo las credenciales)
5. Ejecutar migraciones SQL
6. Crear usuario inicial
7. Correr localmente

# MIS DATOS
Tengo listas las credenciales de Supabase:
- Project URL: [pendiente por proporcionar]
- Anon Key: [pendiente por proporcionar]

# INSTRUCCIONES DETALLADAS
Existe un archivo AI_AGENT_INSTRUCTIONS.md en el repo con el proceso completo.
Por favor síguelo y guíame.

¿Empezamos?
```

---

## 🔄 PROMPT PARA CONTINUAR DESPUÉS DE ERROR

```
Estoy configurando Monitor Base y encontré este error:

[USUARIO PEGA ERROR]

Contexto:
- Estaba en la fase: [NÚMERO DE FASE]
- Ejecutando: [COMANDO O ACCIÓN]
- Sistema: [Windows/Mac/Linux]
- Node version: [VERSION]

¿Cómo lo soluciono?

Referencia: AI_AGENT_INSTRUCTIONS.md en el repo tiene troubleshooting.
```

---

## 📝 EJEMPLO DE CONVERSACIÓN COMPLETA

```
USUARIO:
Necesito configurar este proyecto:
https://github.com/Novaisolutions/TOI_MONITOR

Tengo:
- URL: https://abcdefgh.supabase.co
- Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU5OTk5OTksImV4cCI6MjAxMTU3NTk5OX0.ejemplo

AGENTE:
¡Perfecto! Te ayudaré a configurar el Monitor Base.
Primero, verificaré tus requisitos del sistema...

[AGENTE EJECUTA VERIFICACIONES]
[AGENTE GUÍA CLONADO]
[AGENTE AYUDA CON npm install]
[AGENTE CREA .env]
[AGENTE GUÍA SCRIPTS SQL]
[AGENTE AYUDA CON USUARIO]
[AGENTE INICIA SERVIDOR]

✅ ¡Listo! Tu Monitor Base está corriendo en http://localhost:5173

USUARIO:
Perfecto, ya puedo hacer login. ¿Cómo lo personalizo para mi cliente?

AGENTE:
Para personalizar, necesitas cambiar:
1. Logo en public/bot-logo.png
2. Título en index.html
3. Nombre en package.json

¿Tienes el logo de tu cliente?
```

---

## 🎓 CAPACIDADES REQUERIDAS DEL AGENTE

El agente LLM debe poder:
- ✅ Leer archivos de texto (para ver instrucciones)
- ✅ Ejecutar comandos bash/terminal
- ✅ Editar archivos de texto
- ✅ Validar salidas de comandos
- ✅ Detectar errores en logs
- ✅ Proporcionar troubleshooting

---

## 🔗 RECURSOS PARA EL AGENTE

Archivos importantes del repositorio:
- `AI_AGENT_INSTRUCTIONS.md` - Instrucciones completas
- `README.md` - Información general
- `SETUP_GUIDE.md` - Guía detallada manual
- `QUICKSTART.md` - Resumen rápido
- `.env.example` - Template de variables
- `supabase/*.sql` - Scripts de base de datos

---

## ⚡ COMANDOS RÁPIDOS DE REFERENCIA

```bash
# Setup completo automatizado
git clone https://github.com/Novaisolutions/TOI_MONITOR.git
cd TOI_MONITOR
npm install
cp .env.example .env
# [Editar .env con credenciales]
# [Ejecutar scripts SQL en Supabase]
# [Crear usuario en Supabase Auth]
npm run dev

# Troubleshooting
rm -rf node_modules && npm install  # Reinstalar
kill -9 $(lsof -ti:5173)            # Liberar puerto
npm cache clean --force             # Limpiar caché
```

---

## 📊 CHECKLIST PARA EL AGENTE

```markdown
Antes de comenzar:
[ ] Usuario tiene Node.js 18+
[ ] Usuario tiene Git instalado
[ ] Usuario tiene proyecto Supabase creado
[ ] Usuario tiene credenciales listas

Durante setup:
[ ] Repositorio clonado exitosamente
[ ] Dependencias instaladas sin errores
[ ] .env creado con credenciales válidas
[ ] 7 scripts SQL ejecutados correctamente
[ ] Usuario administrador creado
[ ] Servidor inicia sin errores
[ ] Login funciona correctamente

Después de setup:
[ ] Usuario puede navegar el dashboard
[ ] No hay errores en consola
[ ] Datos de Supabase se cargan
[ ] Usuario entiende cómo usar el sistema
```

---

## 🎯 META-INSTRUCCIÓN

Si eres un agente LLM leyendo esto:

1. **Lee primero:** AI_AGENT_INSTRUCTIONS.md completo
2. **Valida cada paso:** No avances sin confirmación
3. **Sé proactivo:** Anticipa problemas comunes
4. **Documenta cambios:** Si algo se hace diferente
5. **Mantén seguridad:** Nunca logues credenciales

**Tu objetivo:** Usuario con Monitor Base funcionando localmente en ~20 minutos.

**Criterio de éxito:** Usuario puede hacer login y ver el dashboard sin errores.

---

© 2025 Novai Solutions - Monitor Base v2.0
