-- ========================================
-- FUNCIONES ADICIONALES DE SEGUIMIENTO OPTIMIZADO
-- Sistema completo compatible con Cenyca y Bizmaker
-- ========================================

-- 1. FUNCIÓN RPC OPTIMIZADA PARA OBTENER CONVERSACIONES
-- ========================================
CREATE OR REPLACE FUNCTION get_conversations_with_last_message_date(
  page_limit INTEGER DEFAULT 30,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id INTEGER,
  numero TEXT,
  nombre_contacto TEXT,
  updated_at TIMESTAMPTZ,
  status TEXT,
  ultimo_mensaje_resumen TEXT,
  tiene_no_leidos BOOLEAN,
  no_leidos_count INTEGER,
  plantel TEXT,
  resumen_ia TEXT,
  resumen TEXT,
  reactivacion_intentos INTEGER,
  ultimo_intento_reactivacion TIMESTAMPTZ,
  proximo_seguimiento TIMESTAMPTZ,
  real_last_message_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.numero,
    c.nombre_contacto,
    c.updated_at,
    c.status,
    c.ultimo_mensaje_resumen,
    c.tiene_no_leidos,
    c.no_leidos_count,
    c.plantel,
    c.resumen_ia,
    c.resumen,
    c.reactivacion_intentos,
    c.ultimo_intento_reactivacion,
    c.proximo_seguimiento,
    COALESCE(m.last_message_date, c.updated_at) as real_last_message_date
  FROM conversaciones_mkt c
  LEFT JOIN (
    SELECT 
      conversation_id,
      MAX(fecha) as last_message_date
    FROM mensajes_mkt 
    GROUP BY conversation_id
  ) m ON m.conversation_id = c.id
  ORDER BY COALESCE(m.last_message_date, c.updated_at) DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;

-- 2. FUNCIÓN PARA OBTENER PROSPECTOS CON FECHA DE ÚLTIMO MENSAJE
-- ========================================
CREATE OR REPLACE FUNCTION get_prospectos_with_last_message_date()
RETURNS TABLE(
  id INTEGER,
  nombre TEXT,
  carrera_interes TEXT,
  plantel_interes TEXT,
  turno TEXT,
  numero_telefono TEXT,
  estado_embudo TEXT,
  prioridad TEXT,
  sentimiento_conversacion TEXT,
  score_interes INTEGER,
  probabilidad_conversion INTEGER,
  notas_manuales JSONB,
  no_contactar BOOLEAN,
  no_contactar_motivo TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  real_last_message_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nombre,
    p.carrera_interes,
    p.plantel_interes,
    p.turno,
    p.numero_telefono,
    p.estado_embudo,
    p.prioridad,
    p.sentimiento_conversacion,
    p.score_interes,
    p.probabilidad_conversion,
    p.notas_manuales,
    p.no_contactar,
    p.no_contactar_motivo,
    p.created_at,
    p.updated_at,
    COALESCE(
      (
        SELECT MAX(m.fecha) 
        FROM mensajes_mkt m 
        WHERE m.numero = p.numero_telefono
      ), 
      p.created_at
    ) as real_last_message_date
  FROM prospectos_mkt p
  ORDER BY COALESCE(
    (
      SELECT MAX(m.fecha) 
      FROM mensajes_mkt m 
      WHERE m.numero = p.numero_telefono
    ), 
    p.created_at
  ) DESC NULLS LAST;
END;
$$;

-- 3. FUNCIÓN PARA IDENTIFICAR CONVERSACIONES QUE NECESITAN SEGUIMIENTO 4H
-- ========================================
CREATE OR REPLACE FUNCTION identificar_conversaciones_seguimiento_4h_v2()
RETURNS TABLE(
  conversation_id BIGINT,
  numero TEXT,
  ultimo_mensaje_entrada_fecha TIMESTAMPTZ,
  horas_transcurridas NUMERIC,
  reactivacion_intentos INTEGER,
  estado_embudo TEXT,
  requiere_seguimiento BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::bigint as conversation_id,
    c.numero::text,
    c.ultimo_mensaje_entrada_fecha,
    EXTRACT(EPOCH FROM (NOW() - c.ultimo_mensaje_entrada_fecha))/3600 as horas_transcurridas,
    COALESCE(c.reactivacion_intentos, 0)::integer,
    COALESCE(p.estado_embudo, 'lead')::text,
    (
      -- ✅ PRODUCCIÓN: 4 horas normales
      c.ultimo_mensaje_entrada_fecha < NOW() - INTERVAL '4 hours'
      AND c.ultimo_mensaje_entrada_fecha IS NOT NULL
      -- Máximo 3 intentos de reactivación
      AND COALESCE(c.reactivacion_intentos, 0) < 3
      -- No necesita seguimiento actualmente
      AND (c.necesita_seguimiento_4h = false OR c.necesita_seguimiento_4h IS NULL)
      -- Estado de embudo no es "Agendó cita"
      AND COALESCE(p.estado_embudo, 'lead') != 'agendó cita.'
    ) as requiere_seguimiento
  FROM conversaciones_mkt c
  LEFT JOIN prospectos_mkt p ON p.conversation_id = c.id
  WHERE c.ultimo_mensaje_entrada_fecha IS NOT NULL
  ORDER BY c.ultimo_mensaje_entrada_fecha DESC;
END;
$$;

-- 4. FUNCIÓN PARA OBTENER CONVERSACIONES QUE NECESITAN SEGUIMIENTO 4H (VERSIÓN 2)
-- ========================================
CREATE OR REPLACE FUNCTION obtener_conversaciones_seguimiento_4h_v2()
RETURNS TABLE(
  conversation_id INTEGER,
  numero TEXT,
  nombre_contacto TEXT,
  ultimo_mensaje_entrada_fecha TIMESTAMPTZ,
  horas_transcurridas NUMERIC,
  reactivacion_intentos INTEGER,
  proximo_seguimiento_4h TIMESTAMPTZ,
  caso_seguimiento TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conversation_id,
        c.numero,
        c.nombre_contacto,
        c.ultimo_mensaje_entrada_fecha,
        ROUND(EXTRACT(EPOCH FROM (NOW() - c.ultimo_mensaje_entrada_fecha))/3600::numeric, 2) as horas_transcurridas,
        c.reactivacion_intentos,
        c.proximo_seguimiento_4h,
        CASE 
            WHEN c.total_mensajes_entrada = 1 THEN 'NUEVA_CONVERSACION'
            ELSE 'CONVERSACION_REACTIVADA'
        END as caso_seguimiento
    FROM conversaciones_mkt c
    WHERE c.necesita_seguimiento_4h = true
      AND c.proximo_seguimiento_4h <= NOW()
      AND c.ultimo_mensaje_entrada_fecha IS NOT NULL
    ORDER BY c.ultimo_mensaje_entrada_fecha ASC;
END;
$$;

-- 5. FUNCIÓN PARA OBTENER ÚLTIMOS MENSAJES PARA SEGUIMIENTO
-- ========================================
CREATE OR REPLACE FUNCTION obtener_ultimos_mensajes_para_seguimiento(p_conversation_id INTEGER)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  mensajes_json JSON;
  total_mensajes INTEGER;
BEGIN
  -- Contar total de mensajes de entrada para esta conversación
  SELECT COUNT(*) INTO total_mensajes
  FROM mensajes_mkt 
  WHERE conversation_id = p_conversation_id AND tipo = 'entrada';
  
  -- Obtener últimos 15 mensajes formateados para n8n
  SELECT json_agg(
    json_build_object(
      'tipo', CASE WHEN tipo = 'entrada' THEN 'U' ELSE 'A' END,
      'mensaje', mensaje,
      'fecha', TO_CHAR(fecha, 'YYYY-MM-DD HH24:MI'),
      'timestamp', fecha,
      'id', id
    ) ORDER BY fecha DESC
  ) INTO mensajes_json
  FROM (
    SELECT * FROM mensajes_mkt 
    WHERE conversation_id = p_conversation_id 
    ORDER BY fecha DESC 
    LIMIT 15
  ) sub;
  
  RETURN json_build_object(
    'mensajes', COALESCE(mensajes_json, '[]'::json),
    'total_mensajes_entrada', total_mensajes,
    'conversation_id', p_conversation_id
  );
END;
$$;

-- 6. FUNCIÓN PARA MARCAR CONVERSACIÓN COMO PROCESADA
-- ========================================
CREATE OR REPLACE FUNCTION marcar_conversacion_seguimiento_procesada(p_conversation_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE conversaciones_mkt 
  SET 
    necesita_seguimiento_4h = false,
    proximo_seguimiento_4h = NOW() + INTERVAL '23 hours', -- Próximo seguimiento en 23 horas
    updated_at = NOW()
  WHERE id = p_conversation_id;
  
  RETURN FOUND;
END;
$$;

-- 7. FUNCIÓN PARA BÚSQUEDA DE CONVERSACIONES Y MENSAJES
-- ========================================
CREATE OR REPLACE FUNCTION search_conversations_and_messages(
  search_term TEXT, 
  max_conversations INTEGER DEFAULT 15, 
  max_messages INTEGER DEFAULT 25
)
RETURNS TABLE(
  conversation_id INTEGER,
  conversation_numero TEXT,
  conversation_nombre_contacto TEXT,
  conversation_updated_at TIMESTAMPTZ,
  conversation_ultimo_mensaje_resumen TEXT,
  conversation_match_type TEXT,
  message_id INTEGER,
  message_numero TEXT,
  message_nombre TEXT,
  message_mensaje TEXT,
  message_fecha TIMESTAMPTZ,
  message_conversation_id INTEGER,
  message_match_type TEXT,
  result_type TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  clean_term TEXT;
BEGIN
  -- Limpiar el término de búsqueda
  clean_term := TRIM(search_term);
  
  -- Devolver resultados de conversaciones
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.numero as conversation_numero,
    c.nombre_contacto as conversation_nombre_contacto,
    c.updated_at as conversation_updated_at,
    c.ultimo_mensaje_resumen as conversation_ultimo_mensaje_resumen,
    CASE 
      WHEN c.nombre_contacto ILIKE '%' || clean_term || '%' THEN 'nombre'
      WHEN c.numero ILIKE '%' || clean_term || '%' THEN 'numero'
      WHEN c.ultimo_mensaje_resumen ILIKE '%' || clean_term || '%' THEN 'mensaje'
      ELSE 'otro'
    END as conversation_match_type,
    -- Campos de mensaje vacíos
    NULL::INTEGER as message_id,
    NULL::TEXT as message_numero,
    NULL::TEXT as message_nombre,
    NULL::TEXT as message_mensaje,
    NULL::TIMESTAMPTZ as message_fecha,
    NULL::INTEGER as message_conversation_id,
    NULL::TEXT as message_match_type,
    'conversation' as result_type
  FROM conversaciones_mkt c
  WHERE 
    c.nombre_contacto ILIKE '%' || clean_term || '%'
    OR c.numero ILIKE '%' || clean_term || '%'
    OR c.ultimo_mensaje_resumen ILIKE '%' || clean_term || '%'
  ORDER BY 
    -- Priorizar coincidencias exactas en nombre
    CASE WHEN c.nombre_contacto ILIKE clean_term THEN 1
         WHEN c.nombre_contacto ILIKE clean_term || '%' THEN 2
         WHEN c.numero ILIKE clean_term || '%' THEN 3
         ELSE 4 END,
    c.updated_at DESC
  LIMIT max_conversations;

  -- Devolver resultados de mensajes
  RETURN QUERY
  SELECT 
    -- Campos de conversación vacíos
    NULL::INTEGER as conversation_id,
    NULL::TEXT as conversation_numero,
    NULL::TEXT as conversation_nombre_contacto,
    NULL::TIMESTAMPTZ as conversation_updated_at,
    NULL::TEXT as conversation_ultimo_mensaje_resumen,
    NULL::TEXT as conversation_match_type,
    -- Campos de mensaje
    m.id as message_id,
    m.numero as message_numero,
    m.nombre as message_nombre,
    LEFT(m.mensaje, 100) as message_mensaje, -- Limitar texto del mensaje
    m.fecha as message_fecha,
    m.conversation_id as message_conversation_id,
    CASE 
      WHEN m.nombre ILIKE '%' || clean_term || '%' THEN 'nombre'
      WHEN m.numero ILIKE '%' || clean_term || '%' THEN 'numero'
      WHEN m.mensaje ILIKE '%' || clean_term || '%' THEN 'contenido'
      ELSE 'otro'
    END as message_match_type,
    'message' as result_type
  FROM mensajes_mkt m
  WHERE 
    m.nombre ILIKE '%' || clean_term || '%'
    OR m.numero ILIKE '%' || clean_term || '%'
    OR m.mensaje ILIKE '%' || clean_term || '%'
  ORDER BY 
    -- Priorizar coincidencias recientes y relevantes
    CASE WHEN m.nombre ILIKE clean_term THEN 1
         WHEN m.nombre ILIKE clean_term || '%' THEN 2
         WHEN m.numero ILIKE clean_term || '%' THEN 3
         ELSE 4 END,
    m.fecha DESC
  LIMIT max_messages;
END;
$$;

-- 8. FUNCIÓN PARA SINCRONIZAR RESUMEN DE PROSPECTO A CONVERSACIÓN
-- ========================================
CREATE OR REPLACE FUNCTION sync_prospecto_summary_to_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if resumen_ia was updated. Using IS DISTINCT FROM handles NULLs correctly.
    IF NEW.resumen_ia IS DISTINCT FROM OLD.resumen_ia THEN
        UPDATE public.conversaciones_mkt
        SET resumen_ia = NEW.resumen_ia
        WHERE id = NEW.conversation_id;
    END IF;
    RETURN NEW;
END;
$$;

-- 9. CREAR TRIGGER PARA SINCRONIZACIÓN DE RESUMEN
-- ========================================
DROP TRIGGER IF EXISTS trigger_sync_prospecto_summary ON prospectos_mkt;

CREATE TRIGGER trigger_sync_prospecto_summary
  AFTER UPDATE ON prospectos_mkt
  FOR EACH ROW
  EXECUTE FUNCTION sync_prospecto_summary_to_conversation();

-- 10. FUNCIÓN PARA MANEJO DE NUEVAS CONVERSACIONES
-- ========================================
CREATE OR REPLACE FUNCTION handle_new_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar si ya existe un prospecto para esta conversation_id y evitar duplicados.
  IF NOT EXISTS (SELECT 1 FROM public.prospectos_mkt WHERE conversation_id = NEW.id) THEN
    -- Insertar el nuevo prospecto en la tabla `prospectos_mkt`.
    INSERT INTO public.prospectos_mkt (
      nombre,
      numero_telefono,
      estado_embudo,
      prioridad,
      conversation_id,
      created_at,
      updated_at
    )
    VALUES (
      NEW.nombre_contacto, -- Usar el nombre de perfil de WhatsApp.
      NEW.numero,
      'lead',              -- Estado inicial por defecto.
      'media',             -- Prioridad inicial por defecto.
      NEW.id,              -- Vincular con el ID de la conversación.
      NOW(),               -- Establecer la fecha de creación.
      NOW()                -- Establecer la fecha de actualización.
    );
  END IF;
  
  -- Devolver el nuevo registro de conversación.
  RETURN NEW;
END;
$$;

-- 11. CREAR TRIGGER PARA NUEVAS CONVERSACIONES
-- ========================================
DROP TRIGGER IF EXISTS on_mkt_conversation_created_create_prospect ON conversaciones_mkt;

CREATE TRIGGER on_mkt_conversation_created_create_prospect
  AFTER INSERT ON conversaciones_mkt
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_conversation();

-- 12. FUNCIÓN PARA MANEJO DE NUEVOS MENSAJES (CREAR PROSPECTO)
-- ========================================
CREATE OR REPLACE FUNCTION handle_new_message_create_prospect()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if a prospect with this phone number already exists
  IF NOT EXISTS (SELECT 1 FROM public.prospectos_mkt WHERE numero_telefono = NEW.numero) THEN
    -- If not, insert a new, uninitialized prospect.
    -- Use the phone number as a temporary name.
    INSERT INTO public.prospectos_mkt (numero_telefono, nombre, is_initialized, estado_embudo)
    VALUES (NEW.numero, NEW.numero, FALSE, 'lead');
  END IF;
  RETURN NEW;
END;
$$;

-- 13. CREAR TRIGGER PARA NUEVOS MENSAJES
-- ========================================
DROP TRIGGER IF EXISTS on_new_message_create_prospect_trigger ON mensajes_mkt;

CREATE TRIGGER on_new_message_create_prospect_trigger
  AFTER INSERT ON mensajes_mkt
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_message_create_prospect();

-- 14. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ========================================
-- Crear índice compuesto para optimizar la consulta de mensajes por conversation_id y fecha
CREATE INDEX IF NOT EXISTS idx_mensajes_mkt_conversation_fecha 
ON mensajes_mkt(conversation_id, fecha DESC);

-- Crear índice en updated_at de conversaciones para el fallback
CREATE INDEX IF NOT EXISTS idx_conversaciones_mkt_updated_at 
ON conversaciones_mkt(updated_at DESC);

-- Índice para seguimientos 4h
CREATE INDEX IF NOT EXISTS idx_conversaciones_mkt_seguimiento_4h 
ON conversaciones_mkt(necesita_seguimiento_4h, proximo_seguimiento_4h) 
WHERE necesita_seguimiento_4h = true;

-- Índice para prospecto por número de teléfono
CREATE INDEX IF NOT EXISTS idx_prospectos_mkt_numero_telefono 
ON prospectos_mkt(numero_telefono);

-- 15. COMENTARIOS DE DOCUMENTACIÓN
-- ========================================
COMMENT ON FUNCTION get_conversations_with_last_message_date IS 
'Función optimizada para obtener conversaciones ordenadas por fecha del último mensaje. 
Utiliza un LEFT JOIN con una subconsulta agrupada para obtener la fecha del último mensaje 
de cada conversación de manera eficiente, evitando múltiples queries individuales.';

COMMENT ON FUNCTION get_prospectos_with_last_message_date IS 
'Obtiene todos los prospectos con la fecha del último mensaje calculada dinámicamente.';

COMMENT ON FUNCTION identificar_conversaciones_seguimiento_4h_v2 IS 
'Identifica conversaciones que requieren seguimiento después de 4 horas de inactividad.';

COMMENT ON FUNCTION obtener_ultimos_mensajes_para_seguimiento IS 
'Obtiene los últimos 15 mensajes de una conversación formateados para webhooks de seguimiento.';

-- 16. VERIFICACIÓN FINAL
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ FUNCIONES ADICIONALES DE SEGUIMIENTO INSTALADAS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Funciones RPC instaladas:';
  RAISE NOTICE '  • get_conversations_with_last_message_date';
  RAISE NOTICE '  • get_prospectos_with_last_message_date';
  RAISE NOTICE '  • identificar_conversaciones_seguimiento_4h_v2';
  RAISE NOTICE '  • obtener_conversaciones_seguimiento_4h_v2';
  RAISE NOTICE '  • obtener_ultimos_mensajes_para_seguimiento';
  RAISE NOTICE '  • marcar_conversacion_seguimiento_procesada';
  RAISE NOTICE '  • search_conversations_and_messages';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers adicionales:';
  RAISE NOTICE '  • trigger_sync_prospecto_summary (prospectos_mkt)';
  RAISE NOTICE '  • on_mkt_conversation_created_create_prospect (conversaciones_mkt)';
  RAISE NOTICE '  • on_new_message_create_prospect_trigger (mensajes_mkt)';
  RAISE NOTICE '';
  RAISE NOTICE 'Índices de optimización creados:';
  RAISE NOTICE '  • idx_mensajes_mkt_conversation_fecha';
  RAISE NOTICE '  • idx_conversaciones_mkt_updated_at';
  RAISE NOTICE '  • idx_conversaciones_mkt_seguimiento_4h';
  RAISE NOTICE '  • idx_prospectos_mkt_numero_telefono';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Sistema optimizado y listo para producción';
  RAISE NOTICE '========================================';
END;
$$;
