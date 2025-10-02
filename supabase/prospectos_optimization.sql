-- Función para obtener prospectos ordenados por fecha del último mensaje
-- Esto permite que los prospectos se muestren en el mismo orden que la bandeja de entrada

CREATE OR REPLACE FUNCTION get_prospectos_with_last_message_date()
RETURNS TABLE (
  id integer,
  nombre text,
  carrera_interes text,
  plantel_interes text,
  turno text,
  numero_telefono text,
  estado_embudo text,
  prioridad text,
  sentimiento_conversacion text,
  score_interes integer,
  probabilidad_conversion integer,
  notas_manuales jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  real_last_message_date timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER  -- Permite que la función se ejecute con privilegios elevados, evitando problemas de RLS
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

-- Índices para optimizar la consulta
CREATE INDEX IF NOT EXISTS idx_mensajes_mkt_numero_fecha 
ON mensajes_mkt(numero, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_prospectos_mkt_numero_telefono 
ON prospectos_mkt(numero_telefono);

CREATE INDEX IF NOT EXISTS idx_prospectos_mkt_created_at 
ON prospectos_mkt(created_at DESC);

-- Comentarios para documentación
COMMENT ON FUNCTION get_prospectos_with_last_message_date() IS 
'Obtiene todos los prospectos ordenados por fecha del último mensaje. 
Si un prospecto no tiene mensajes, usa su fecha de creación.
Esto permite que los prospectos se muestren en el mismo orden de actividad que la bandeja de entrada.'; 