-- Función RPC optimizada para obtener conversaciones con fecha del último mensaje
-- Esto mejora significativamente el rendimiento al evitar múltiples queries

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

-- Crear índice compuesto para optimizar la consulta de mensajes por conversation_id y fecha
CREATE INDEX IF NOT EXISTS idx_mensajes_mkt_conversation_fecha 
ON mensajes_mkt(conversation_id, fecha DESC);

-- Crear índice en updated_at de conversaciones para el fallback
CREATE INDEX IF NOT EXISTS idx_conversaciones_mkt_updated_at 
ON conversaciones_mkt(updated_at DESC);

-- Comentarios de documentación
COMMENT ON FUNCTION get_conversations_with_last_message_date IS 
'Función optimizada para obtener conversaciones ordenadas por fecha del último mensaje. 
Utiliza un LEFT JOIN con una subconsulta agrupada para obtener la fecha del último mensaje 
de cada conversación de manera eficiente, evitando múltiples queries individuales.'; 