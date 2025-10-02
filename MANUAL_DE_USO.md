# Manual de Uso: Monitor de Marketing (CRM Inteligente)

## 1. Introducción

Este documento describe el funcionamiento del "Monitor de Marketing", una aplicación diseñada para gestionar las interacciones con prospectos y clientes. La plataforma se conecta a una base de datos en Supabase y cuenta con un CRM impulsado por un agente de Inteligencia Artificial para analizar y enriquecer la información de los prospectos.

## 2. Acceso y Autenticación

-   **URL de Acceso**: La aplicación se ejecuta localmente. Debes iniciar el servidor de desarrollo (usualmente con `npm run dev`) y acceder a la URL proporcionada en la terminal (normalmente `http://localhost:5173`).
-   **Credenciales**: Para iniciar sesión, utiliza las siguientes credenciales específicas para el área de Marketing:
    -   **Usuario**: `marketing@monitor.novai`
    -   **Contraseña**: (La contraseña que se haya configurado para este usuario en Supabase).

## 3. Interfaz Principal

La interfaz se divide en tres secciones principales, accesibles desde la barra de navegación lateral izquierda:

-   **Conversaciones** (Icono de burbuja de chat): Muestra la lista de todas las conversaciones activas con los prospectos.
-   **Prospectos (CRM)** (Icono de usuario con estrella): Un dashboard avanzado para visualizar y gestionar la información de los prospectos, enriquecida por la IA.
-   **Mensajes**: No es una sección directa, sino la vista que aparece al seleccionar una conversación. Muestra el historial de mensajes intercambiados.

## 4. Módulo de Conversaciones y Mensajes

-   **Funcionalidad**: Estas vistas leen y muestran datos de las tablas `conversaciones_mkt` y `mensajes_mkt` de la base de datos. Su propósito es permitir el seguimiento de la comunicación directa.
-   **Uso**:
    1.  Haz clic en el ícono de **Conversaciones** en la barra lateral para ver la lista de chats.
    2.  Selecciona un chat para ver los mensajes detallados en la vista principal.
    3.  Puedes enviar nuevos mensajes desde esta vista para continuar la comunicación.

## 5. CRM Inteligente: Panel de Prospectos

Esta es la sección más potente de la herramienta. Ofrece una vista detallada de cada prospecto, analizada y calificada por un agente de IA.

### 5.1. Visualización y Flujo de Trabajo
El panel está diseñado para ser más intuitivo, presentando la información de manera progresiva.

-   **Vista Principal**: Muestra una lista limpia de prospectos con su nombre y un resumen clave (como el estado actual).
-   **Panel Lateral de Detalles**: Al hacer clic en un prospecto de la lista, se abre un panel lateral a la derecha con toda la información detallada, evitando una sobrecarga visual en la pantalla principal.

### 5.2. Filtros Avanzados

Puedes filtrar la lista de prospectos usando los controles en la parte superior para encontrar rápidamente lo que buscas:
-   **Estado en el Embudo**: Filtra por la etapa del ciclo de ventas (Ej: `Contactado`, `Calificado`, `Negociación`, `Cerrado`).
-   **Interés Detectado**: Filtra por el nivel de interés que la IA ha determinado (Ej: `Alto`, `Medio`, `Bajo`).
-   **Búsqueda por Tags**: Busca prospectos que tengan asociadas etiquetas específicas generadas por la IA (Ej: `interesado_en_beca`, `pregunta_por_costos`).

### 5.3. Anatomía de la Información de un Prospecto

Dentro del panel de detalle, encontrarás la información enriquecida por la IA:

-   **Información Básica**: Nombre, Carrera de Interés, Plantel, Teléfono.
-   **Resumen IA**: Un resumen conciso de la conversación, generado automáticamente para entender el contexto rápidamente.
-   **Score de Interés**: Una puntuación numérica (0-100) que indica el nivel de interés del prospecto.
-   **Probabilidad de Conversión**: El porcentaje de probabilidad de que el prospecto se inscriba, calculado por la IA.
-   **Estado del Embudo**: La etapa actual del prospecto en el ciclo de ventas.
-   **Tags Automáticas**: Palabras clave detectadas en la conversación que ayudan a categorizar al prospecto.
-   **Próxima Acción Sugerida**: Una recomendación clara de la IA sobre el siguiente paso a seguir (Ej: "Enviar información sobre becas por WhatsApp").
-   **Otros Campos Analíticos**: Sentimiento general de la conversación, objeciones detectadas, resumen de necesidades, etc.

### 5.4. Creación y Actualización de Prospectos

-   **Creación**: Puedes añadir nuevos prospectos manualmente usando el botón "Agregar Prospecto". Solo necesitas los datos básicos.
-   **Actualización (IA)**: El agente de IA es el principal responsable de rellenar y mantener actualizados los campos "inteligentes". Su análisis de las conversaciones se refleja automáticamente en el perfil del prospecto.

## 6. Arquitectura Técnica (Para Desarrolladores)

-   **Backend (Supabase)**:
    -   **Project ID**: `gbmtgnajixjzolfutpkr`
    -   **Tablas Clave**:
        -   `conversaciones_mkt`: Almacena las cabeceras de las conversaciones.
        -   `mensajes_mkt`: Almacena cada mensaje individual.
        -   `prospectos_mkt`: La tabla central del CRM, con más de 20 columnas para datos básicos y análisis de IA.
    -   **Seguridad**: Las tablas están protegidas con Políticas de Seguridad a Nivel de Fila (RLS) que restringen la escritura al rol y usuario de `marketing@monitor.novai`.

-   **Frontend (React + Vite)**:
    -   **Estructura de Carpetas**:
        -   `src/components`: Componentes reutilizables de la UI (`NavSidebar.tsx`, `ProspectosView.tsx`, `ProspectoCard.tsx`, etc.).
        -   `src/hooks`: Lógica de estado y fetching de datos (`useConversations.ts`, `useMessages.ts`, `useProspectos.ts`).
        -   `src/types`: Definiciones de tipos de TypeScript (`database.ts`), generadas desde el esquema de Supabase para asegurar la consistencia.
        -   `src/App.tsx`: Componente principal que orquesta el renderizado de las vistas.
        -   `src/lib/supabaseClient.ts`: Cliente de Supabase para la conexión con el backend.