-- ========================================
-- SISTEMA AUTOMÁTICO DE MOVIMIENTO DE PROSPECTOS
-- ========================================
-- Este script instala un sistema completo que detecta automáticamente
-- cuando se agenda una cita en los mensajes y mueve el prospecto
-- a la pestaña "Agendó Cita" automáticamente.

-- 1. FUNCIÓN PARA NORMALIZAR ESTADOS DE EMBUDO
-- ========================================
CREATE OR REPLACE FUNCTION normalize_estado_embudo(estado TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Normalizar el estado a lowercase y limpiar espacios
  IF estado IS NULL THEN
    RETURN 'lead';
  END IF;
  
  -- Convertir a lowercase y limpiar
  estado := LOWER(TRIM(estado));
  
  -- Normalizar variaciones del estado "agendó cita"
  IF estado IN ('agendó cita', 'agendó cita.', 'agendo cita', 'cita agendada', 'cita programada', 'cita confirmada') THEN
    RETURN 'agendó cita.';
  END IF;
  
  -- Normalizar otros estados comunes
  CASE estado
    WHEN 'contactado' THEN RETURN 'contactado';
    WHEN 'lead', 'nuevo lead' THEN RETURN 'lead';
    WHEN 'llamar_mas_tarde', 'llamar mas tarde', 'contactar mas tarde' THEN RETURN 'llamar_mas_tarde';
    WHEN 'inscrito', 'inscripto' THEN RETURN 'inscrito';
    WHEN 'se_brindaron_costos', 'costos brindados' THEN RETURN 'se_brindaron_costos';
    WHEN 'interes_concreto', 'interés concreto' THEN RETURN 'interes_concreto';
    WHEN 'informacion_solicitada', 'información solicitada' THEN RETURN 'informacion_solicitada';
    WHEN 'cita_solicitada', 'cita solicitada' THEN RETURN 'cita_solicitada';
    ELSE RETURN estado;
  END CASE;
END;
$$;

-- 2. FUNCIÓN PARA DETECTAR CITAS EN MENSAJES
-- ========================================
CREATE OR REPLACE FUNCTION detect_appointment_in_message(mensaje_text TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  mensaje_lower TEXT;
BEGIN
  IF mensaje_text IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Convertir a minúsculas para análisis
  mensaje_lower := LOWER(mensaje_text);
  
  -- Patrones que indican que se agendó una cita
  IF mensaje_lower ~ '.*(cita.*agend|agend.*cita|cita.*confirm|confirm.*cita).*' THEN
    RETURN TRUE;
  END IF;
  
  IF mensaje_lower ~ '.*(reserv.*cita|cita.*reserv).*' THEN
    RETURN TRUE;
  END IF;
  
  IF mensaje_lower ~ '.*(program.*cita|cita.*program).*' THEN
    RETURN TRUE;
  END IF;
  
  -- Frases específicas que indican cita confirmada
  IF mensaje_lower ~ '.*(tu cita ha sido|cita confirmada|cita agendada|appointment confirmed|appointment scheduled).*' THEN
    RETURN TRUE;
  END IF;
  
  -- Patrones con fechas y horarios
  IF mensaje_lower ~ '.*(cita.*ma[ñn]ana|cita.*hoy|cita.*lunes|cita.*martes|cita.*miercoles|cita.*jueves|cita.*viernes).*' THEN
    RETURN TRUE;
  END IF;
  
  -- Patrones con horarios específicos
  IF mensaje_lower ~ '.*(cita.*[0-9]+:?[0-9]*\s*(am|pm|hrs|horas)|[0-9]+:?[0-9]*\s*(am|pm|hrs|horas).*cita).*' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- 3. FUNCIÓN PRINCIPAL DE ACTUALIZACIÓN AUTOMÁTICA
-- ========================================
CREATE OR REPLACE FUNCTION auto_update_prospect_on_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  prospect_record RECORD;
  appointment_detected BOOLEAN;
BEGIN
  -- Solo procesar mensajes nuevos de entrada
  IF TG_OP = 'INSERT' AND NEW.tipo = 'entrada' THEN
    
    -- Detectar si el mensaje indica que se agendó una cita
    appointment_detected := detect_appointment_in_message(NEW.mensaje);
    
    IF appointment_detected THEN
      -- Buscar el prospecto correspondiente por número de teléfono
      SELECT * INTO prospect_record 
      FROM prospectos_mkt 
      WHERE numero_telefono = NEW.numero 
      LIMIT 1;
      
      IF FOUND THEN
        -- Actualizar el estado del prospecto a "agendó cita."
        UPDATE prospectos_mkt 
        SET 
          estado_embudo = 'agendó cita.',
          fecha_ultimo_contacto = NEW.fecha,
          updated_at = NOW(),
          -- Agregar nota automática
          notas_manuales = COALESCE(notas_manuales, '[]'::jsonb) || jsonb_build_array(
            jsonb_build_object(
              'content', 'Cita detectada automáticamente en mensaje: ' || LEFT(NEW.mensaje, 100),
              'created_at', NOW(),
              'author', 'Sistema Automático'
            )
          )
        WHERE numero_telefono = NEW.numero;
        
        -- Log para debugging
        RAISE NOTICE 'Auto-updated prospect % to "agendó cita." state based on message: %', 
                     prospect_record.nombre, LEFT(NEW.mensaje, 50);
      ELSE
        -- Si no existe el prospecto, crearlo automáticamente
        INSERT INTO prospectos_mkt (
          nombre,
          numero_telefono,
          estado_embudo,
          fecha_ultimo_contacto,
          created_at,
          updated_at,
          notas_manuales
        ) VALUES (
          COALESCE(NEW.nombre, 'Prospecto Automático'),
          NEW.numero,
          'agendó cita.',
          NEW.fecha,
          NOW(),
          NOW(),
          jsonb_build_array(
            jsonb_build_object(
              'content', 'Prospecto creado automáticamente. Cita detectada en mensaje: ' || LEFT(NEW.mensaje, 100),
              'created_at', NOW(),
              'author', 'Sistema Automático'
            )
          )
        );
        
        RAISE NOTICE 'Auto-created new prospect for % with "agendó cita." state', NEW.numero;
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4. CREAR TRIGGER PARA DETECCIÓN AUTOMÁTICA
-- ========================================
DROP TRIGGER IF EXISTS trigger_auto_detect_appointment ON mensajes_mkt;

CREATE TRIGGER trigger_auto_detect_appointment
  AFTER INSERT ON mensajes_mkt
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_prospect_on_appointment();

-- 5. NORMALIZAR DATOS EXISTENTES
-- ========================================
-- Normalizar todos los estados existentes en la base de datos
UPDATE prospectos_mkt 
SET estado_embudo = normalize_estado_embudo(estado_embudo)
WHERE estado_embudo IS NOT NULL;

-- 6. COMENTARIOS DE DOCUMENTACIÓN
-- ========================================
COMMENT ON FUNCTION normalize_estado_embudo IS 
'Normaliza los estados de embudo para mantener consistencia. 
Convierte variaciones como "Agendó cita" y "agendo cita" a "agendó cita."';

COMMENT ON FUNCTION detect_appointment_in_message IS 
'Detecta automáticamente si un mensaje indica que se agendó una cita.
Usa patrones regex para identificar frases como "cita agendada", "appointment confirmed", etc.';

COMMENT ON FUNCTION auto_update_prospect_on_appointment IS 
'Función principal que actualiza automáticamente el estado del prospecto a "agendó cita."
cuando se detecta en un mensaje que se agendó una cita. También crea el prospecto si no existe.';

COMMENT ON TRIGGER trigger_auto_detect_appointment ON mensajes_mkt IS
'Trigger que ejecuta la detección automática de citas en cada mensaje nuevo de entrada.';

-- 7. FUNCIÓN PARA CALCULAR PRÓXIMO SEGUIMIENTO INTELIGENTE
-- ========================================
CREATE OR REPLACE FUNCTION calcular_proximo_seguimiento_inteligente(fecha_mensaje TIMESTAMP WITH TIME ZONE)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
    seguimiento_normal TIMESTAMP WITH TIME ZONE;
    seguimiento_normal_tijuana TIMESTAMP;
    hora_seguimiento_tijuana INTEGER;
    fecha_siguiente_8am_tijuana TIMESTAMP;
    fecha_siguiente_8am_utc TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calcular seguimiento normal (4 horas después)
    seguimiento_normal := fecha_mensaje + INTERVAL '4 hours';
    
    -- 🌎 CONVERTIR a hora de Tijuana para evaluar correctamente
    seguimiento_normal_tijuana := seguimiento_normal AT TIME ZONE 'America/Tijuana';
    
    -- Obtener la hora del seguimiento en Tijuana (0-23)
    hora_seguimiento_tijuana := EXTRACT(HOUR FROM seguimiento_normal_tijuana);
    
    -- 🌙 LÓGICA DE HORARIOS INTELIGENTES (evaluando en hora Tijuana):
    -- Si el seguimiento cae entre 20:00 (8 PM) y 7:59 AM (Tijuana), mover a 8:00 AM
    IF hora_seguimiento_tijuana >= 20 OR hora_seguimiento_tijuana < 8 THEN
        -- Calcular las 8:00 AM del día siguiente en hora Tijuana
        IF hora_seguimiento_tijuana >= 20 THEN
            -- Pasadas las 8 PM, mover a 8 AM del día siguiente
            fecha_siguiente_8am_tijuana := DATE_TRUNC('day', seguimiento_normal_tijuana) + INTERVAL '1 day' + INTERVAL '8 hours';
        ELSE
            -- Entre medianoche y 7:59 AM, mover a 8 AM del mismo día
            fecha_siguiente_8am_tijuana := DATE_TRUNC('day', seguimiento_normal_tijuana) + INTERVAL '8 hours';
        END IF;
        
        -- 🌎 CONVERTIR de vuelta a UTC para almacenar
        fecha_siguiente_8am_utc := fecha_siguiente_8am_tijuana AT TIME ZONE 'America/Tijuana';
        
        RETURN fecha_siguiente_8am_utc;
    ELSE
        -- Horario normal está bien (entre 8:00 AM y 7:59 PM Tijuana)
        RETURN seguimiento_normal;
    END IF;
END;
$$;

-- 8. FUNCIÓN PRINCIPAL DE SEGUIMIENTO 4H INTELIGENTE
-- ========================================
CREATE OR REPLACE FUNCTION procesar_mensaje_seguimiento_4h_v3()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    conversacion_record RECORD;
    es_nueva_conversacion BOOLEAN := FALSE;
    horas_inactiva NUMERIC;
    proximo_seguimiento_calculado TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Solo procesar mensajes de entrada
    IF NEW.tipo != 'entrada' THEN
        RETURN NEW;
    END IF;

    -- 🕐 CALCULAR horario inteligente de seguimiento
    proximo_seguimiento_calculado := calcular_proximo_seguimiento_inteligente(NEW.fecha);

    -- Buscar conversación existente
    SELECT * FROM conversaciones_mkt 
    WHERE numero = NEW.numero 
    INTO conversacion_record;

    -- CASO 1: NUEVA CONVERSACIÓN
    IF conversacion_record IS NULL THEN
        es_nueva_conversacion := TRUE;
        
        INSERT INTO conversaciones_mkt (
            numero,
            necesita_seguimiento_4h,
            ultimo_mensaje_entrada_fecha,
            proximo_seguimiento_4h,
            ultimo_mensaje_fecha,
            ultimo_mensaje_tipo,
            ultimo_mensaje_id,
            ultimo_mensaje_resumen,
            total_mensajes_entrada,
            total_mensajes,
            reactivacion_intentos,
            updated_at
        ) VALUES (
            NEW.numero,
            TRUE,
            NEW.fecha,
            proximo_seguimiento_calculado, -- 🕐 HORARIO INTELIGENTE
            NEW.fecha,
            'entrada',
            NEW.id,
            LEFT(NEW.mensaje, 200),
            1,
            1,
            0,
            NOW()
        );

    ELSE
        -- CASO 2: CONVERSACIÓN EXISTENTE
        SELECT EXTRACT(EPOCH FROM (NEW.fecha - conversacion_record.ultimo_mensaje_entrada_fecha))/3600 
        INTO horas_inactiva;

        UPDATE conversaciones_mkt 
        SET 
            necesita_seguimiento_4h = TRUE,
            ultimo_mensaje_entrada_fecha = NEW.fecha,
            proximo_seguimiento_4h = proximo_seguimiento_calculado, -- 🕐 HORARIO INTELIGENTE
            ultimo_mensaje_fecha = NEW.fecha,
            ultimo_mensaje_tipo = 'entrada',
            ultimo_mensaje_id = NEW.id,
            ultimo_mensaje_resumen = LEFT(NEW.mensaje, 200),
            total_mensajes_entrada = COALESCE(total_mensajes_entrada, 0) + 1,
            total_mensajes = COALESCE(total_mensajes, 0) + 1,
            updated_at = NOW()
        WHERE numero = NEW.numero;
    END IF;

    -- Actualizar prospecto
    INSERT INTO prospectos_mkt (
        numero_telefono,
        conversation_id,
        ultimo_mensaje_entrada_fecha,
        ultimo_mensaje_fecha,
        conversacion_activa,
        updated_at
    ) VALUES (
        NEW.numero,
        NEW.conversation_id,
        NEW.fecha,
        NEW.fecha,
        TRUE,
        NOW()
    )
    ON CONFLICT (numero_telefono)
    DO UPDATE SET
        ultimo_mensaje_entrada_fecha = NEW.fecha,
        ultimo_mensaje_fecha = NEW.fecha,
        conversacion_activa = TRUE,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- 9. CREAR TRIGGER PARA SEGUIMIENTO 4H INTELIGENTE
-- ========================================
DROP TRIGGER IF EXISTS trigger_seguimiento_4h_tijuana_inteligente ON mensajes_mkt;

CREATE TRIGGER trigger_seguimiento_4h_tijuana_inteligente
  AFTER INSERT ON mensajes_mkt
  FOR EACH ROW
  EXECUTE FUNCTION procesar_mensaje_seguimiento_4h_v3();

-- 10. FUNCIÓN PARA ACTUALIZAR CONVERSACIONES
-- ========================================
CREATE OR REPLACE FUNCTION actualizar_conversacion_mkt()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    conversacion_id_var INTEGER;
    prospect_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar si ya existe una conversación con este número
    IF EXISTS (SELECT 1 FROM public.conversaciones_mkt WHERE numero = NEW.numero) THEN
        -- Actualizar la conversación existente
        UPDATE public.conversaciones_mkt
        SET updated_at = CURRENT_TIMESTAMP,
            ultimo_mensaje_resumen = SUBSTRING(NEW.mensaje FROM 1 FOR 100),
            tiene_no_leidos = CASE WHEN NEW.tipo = 'entrada' AND COALESCE(NEW.leido, FALSE) = FALSE THEN TRUE ELSE tiene_no_leidos END,
            no_leidos_count = CASE 
                                WHEN NEW.tipo = 'entrada' AND COALESCE(NEW.leido, FALSE) = FALSE 
                                THEN COALESCE(conversaciones_mkt.no_leidos_count, 0) + 1 
                                ELSE conversaciones_mkt.no_leidos_count 
                              END
        WHERE numero = NEW.numero
        RETURNING id INTO conversacion_id_var;
    ELSE
        -- Crear una nueva conversación
        INSERT INTO public.conversaciones_mkt (
            numero, 
            resumen, 
            status, 
            updated_at, 
            nombre_contacto,
            ultimo_mensaje_resumen,
            tiene_no_leidos,
            no_leidos_count
        ) VALUES (
            NEW.numero,
            'Conversación iniciada',
            'pendiente',
            CURRENT_TIMESTAMP,
            NEW.nombre,
            SUBSTRING(NEW.mensaje FROM 1 FOR 100),
            CASE WHEN NEW.tipo = 'entrada' AND COALESCE(NEW.leido, FALSE) = FALSE THEN TRUE ELSE FALSE END,
            CASE WHEN NEW.tipo = 'entrada' AND COALESCE(NEW.leido, FALSE) = FALSE THEN 1 ELSE 0 END
        )
        RETURNING id INTO conversacion_id_var;
    END IF;
    
    -- Actualizar el campo conversation_id en el mensaje si está vacío
    IF NEW.conversation_id IS NULL THEN
        UPDATE public.mensajes_mkt 
        SET conversation_id = conversacion_id_var
        WHERE id = NEW.id;
    END IF;
    
    -- Crear o vincular prospecto automáticamente
    SELECT EXISTS(
        SELECT 1 FROM public.prospectos_mkt 
        WHERE numero_telefono = NEW.numero
    ) INTO prospect_exists;
    
    IF NOT prospect_exists THEN
        -- Crear un nuevo prospecto básico
        INSERT INTO public.prospectos_mkt (
            nombre,
            numero_telefono,
            conversation_id,
            created_at,
            updated_at,
            estado_embudo,
            prioridad
        ) VALUES (
            COALESCE(NEW.nombre, 'Prospecto Automático'),
            NEW.numero,
            conversacion_id_var,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            'lead',
            'media'
        );
    ELSE
        -- Si ya existe el prospecto, actualizar la relación con la conversación
        UPDATE public.prospectos_mkt 
        SET conversation_id = conversacion_id_var,
            updated_at = CURRENT_TIMESTAMP,
            nombre = CASE 
                        WHEN nombre IS NULL OR nombre = 'Prospecto Automático' 
                        THEN COALESCE(NEW.nombre, nombre)
                        ELSE nombre 
                     END
        WHERE numero_telefono = NEW.numero;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 11. CREAR TRIGGER PARA ACTUALIZAR CONVERSACIONES
-- ========================================
DROP TRIGGER IF EXISTS actualizar_conversacion_mkt_trigger ON mensajes_mkt;

CREATE TRIGGER actualizar_conversacion_mkt_trigger
  AFTER INSERT ON mensajes_mkt
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_conversacion_mkt();

-- 12. FUNCIÓN PARA ACTUALIZAR NO LEÍDOS
-- ========================================
CREATE OR REPLACE FUNCTION actualizar_no_leidos_conversacion_mkt()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si el mensaje ha cambiado de no leído a leído
    IF OLD.leido = FALSE AND NEW.leido = TRUE AND NEW.conversation_id IS NOT NULL THEN
        -- Actualizar el contador de no leídos en la conversación
        UPDATE public.conversaciones_mkt
        SET no_leidos_count = (
                SELECT COUNT(*) 
                FROM public.mensajes_mkt 
                WHERE conversation_id = NEW.conversation_id AND leido = FALSE
            ),
            tiene_no_leidos = (
                SELECT COUNT(*) > 0
                FROM public.mensajes_mkt 
                WHERE conversation_id = NEW.conversation_id AND leido = FALSE
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 13. CREAR TRIGGER PARA NO LEÍDOS
-- ========================================
DROP TRIGGER IF EXISTS actualizar_no_leidos_conversacion_mkt_trigger ON mensajes_mkt;

CREATE TRIGGER actualizar_no_leidos_conversacion_mkt_trigger
  AFTER UPDATE ON mensajes_mkt
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_no_leidos_conversacion_mkt();

-- 14. VERIFICACIÓN DE INSTALACIÓN COMPLETA
-- ========================================
DO $$
BEGIN
  -- Verificar función de normalización
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'normalize_estado_embudo') THEN
    RAISE EXCEPTION 'Error: normalize_estado_embudo function not created';
  END IF;
  
  -- Verificar función de detección
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'detect_appointment_in_message') THEN
    RAISE EXCEPTION 'Error: detect_appointment_in_message function not created';
  END IF;
  
  -- Verificar función principal
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'auto_update_prospect_on_appointment') THEN
    RAISE EXCEPTION 'Error: auto_update_prospect_on_appointment function not created';
  END IF;
  
  -- Verificar función de seguimiento 4h
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'procesar_mensaje_seguimiento_4h_v3') THEN
    RAISE EXCEPTION 'Error: procesar_mensaje_seguimiento_4h_v3 function not created';
  END IF;

  -- Verificar función de horario inteligente
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calcular_proximo_seguimiento_inteligente') THEN
    RAISE EXCEPTION 'Error: calcular_proximo_seguimiento_inteligente function not created';
  END IF;
  
  -- Verificar triggers
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_auto_detect_appointment') THEN
    RAISE EXCEPTION 'Error: trigger_auto_detect_appointment not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_seguimiento_4h_tijuana_inteligente') THEN
    RAISE EXCEPTION 'Error: trigger_seguimiento_4h_tijuana_inteligente not created';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'actualizar_conversacion_mkt_trigger') THEN
    RAISE EXCEPTION 'Error: actualizar_conversacion_mkt_trigger not created';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SISTEMA COMPLETO DE SEGUIMIENTOS INSTALADO';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Funciones instaladas:';
  RAISE NOTICE '  • normalize_estado_embudo';
  RAISE NOTICE '  • detect_appointment_in_message';
  RAISE NOTICE '  • auto_update_prospect_on_appointment';
  RAISE NOTICE '  • procesar_mensaje_seguimiento_4h_v3';
  RAISE NOTICE '  • calcular_proximo_seguimiento_inteligente';
  RAISE NOTICE '  • actualizar_conversacion_mkt';
  RAISE NOTICE '  • actualizar_no_leidos_conversacion_mkt';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers activados:';
  RAISE NOTICE '  • trigger_auto_detect_appointment (mensajes_mkt)';
  RAISE NOTICE '  • trigger_seguimiento_4h_tijuana_inteligente (mensajes_mkt)';
  RAISE NOTICE '  • actualizar_conversacion_mkt_trigger (mensajes_mkt)';
  RAISE NOTICE '  • actualizar_no_leidos_conversacion_mkt_trigger (mensajes_mkt)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Estados normalizados: % registros', (SELECT COUNT(*) FROM prospectos_mkt);
  RAISE NOTICE '🚀 Sistema listo para seguimientos automáticos';
  RAISE NOTICE '========================================';
END;
$$; 