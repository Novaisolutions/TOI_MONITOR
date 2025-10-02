-- ========================================
-- ACTUALIZACIÓN DE ESTRUCTURA DE TABLAS
-- Agrega columnas necesarias para el sistema de seguimiento
-- ========================================

-- 1. ACTUALIZAR TABLA CONVERSACIONES_MKT
-- ========================================
-- Agregar columnas de seguimiento 4h si no existen
DO $$
BEGIN
    -- Verificar y agregar columna necesita_seguimiento_4h
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversaciones_mkt' 
        AND column_name = 'necesita_seguimiento_4h'
    ) THEN
        ALTER TABLE conversaciones_mkt 
        ADD COLUMN necesita_seguimiento_4h BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Columna necesita_seguimiento_4h agregada a conversaciones_mkt';
    ELSE
        RAISE NOTICE 'Columna necesita_seguimiento_4h ya existe en conversaciones_mkt';
    END IF;

    -- Verificar y agregar columna proximo_seguimiento_4h
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversaciones_mkt' 
        AND column_name = 'proximo_seguimiento_4h'
    ) THEN
        ALTER TABLE conversaciones_mkt 
        ADD COLUMN proximo_seguimiento_4h TIMESTAMPTZ;
        RAISE NOTICE 'Columna proximo_seguimiento_4h agregada a conversaciones_mkt';
    ELSE
        RAISE NOTICE 'Columna proximo_seguimiento_4h ya existe en conversaciones_mkt';
    END IF;

    -- Verificar y agregar columna ultimo_mensaje_entrada_fecha
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversaciones_mkt' 
        AND column_name = 'ultimo_mensaje_entrada_fecha'
    ) THEN
        ALTER TABLE conversaciones_mkt 
        ADD COLUMN ultimo_mensaje_entrada_fecha TIMESTAMPTZ;
        RAISE NOTICE 'Columna ultimo_mensaje_entrada_fecha agregada a conversaciones_mkt';
    ELSE
        RAISE NOTICE 'Columna ultimo_mensaje_entrada_fecha ya existe en conversaciones_mkt';
    END IF;

    -- Verificar y agregar columna ultimo_mensaje_salida_fecha
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversaciones_mkt' 
        AND column_name = 'ultimo_mensaje_salida_fecha'
    ) THEN
        ALTER TABLE conversaciones_mkt 
        ADD COLUMN ultimo_mensaje_salida_fecha TIMESTAMPTZ;
        RAISE NOTICE 'Columna ultimo_mensaje_salida_fecha agregada a conversaciones_mkt';
    ELSE
        RAISE NOTICE 'Columna ultimo_mensaje_salida_fecha ya existe en conversaciones_mkt';
    END IF;

    -- Verificar y agregar columna total_mensajes_entrada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversaciones_mkt' 
        AND column_name = 'total_mensajes_entrada'
    ) THEN
        ALTER TABLE conversaciones_mkt 
        ADD COLUMN total_mensajes_entrada INTEGER DEFAULT 0;
        RAISE NOTICE 'Columna total_mensajes_entrada agregada a conversaciones_mkt';
    ELSE
        RAISE NOTICE 'Columna total_mensajes_entrada ya existe en conversaciones_mkt';
    END IF;

    -- Verificar y agregar columna total_mensajes_salida
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversaciones_mkt' 
        AND column_name = 'total_mensajes_salida'
    ) THEN
        ALTER TABLE conversaciones_mkt 
        ADD COLUMN total_mensajes_salida INTEGER DEFAULT 0;
        RAISE NOTICE 'Columna total_mensajes_salida agregada a conversaciones_mkt';
    ELSE
        RAISE NOTICE 'Columna total_mensajes_salida ya existe en conversaciones_mkt';
    END IF;

    -- Verificar y agregar columna ultimo_mensaje_fecha
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversaciones_mkt' 
        AND column_name = 'ultimo_mensaje_fecha'
    ) THEN
        ALTER TABLE conversaciones_mkt 
        ADD COLUMN ultimo_mensaje_fecha TIMESTAMPTZ;
        RAISE NOTICE 'Columna ultimo_mensaje_fecha agregada a conversaciones_mkt';
    ELSE
        RAISE NOTICE 'Columna ultimo_mensaje_fecha ya existe en conversaciones_mkt';
    END IF;

    -- Verificar y agregar columna ultimo_mensaje_tipo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversaciones_mkt' 
        AND column_name = 'ultimo_mensaje_tipo'
    ) THEN
        ALTER TABLE conversaciones_mkt 
        ADD COLUMN ultimo_mensaje_tipo TEXT;
        RAISE NOTICE 'Columna ultimo_mensaje_tipo agregada a conversaciones_mkt';
    ELSE
        RAISE NOTICE 'Columna ultimo_mensaje_tipo ya existe en conversaciones_mkt';
    END IF;

    -- Verificar y agregar columna ultimo_mensaje_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversaciones_mkt' 
        AND column_name = 'ultimo_mensaje_id'
    ) THEN
        ALTER TABLE conversaciones_mkt 
        ADD COLUMN ultimo_mensaje_id INTEGER;
        RAISE NOTICE 'Columna ultimo_mensaje_id agregada a conversaciones_mkt';
    ELSE
        RAISE NOTICE 'Columna ultimo_mensaje_id ya existe en conversaciones_mkt';
    END IF;

    -- Verificar y agregar columna total_mensajes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversaciones_mkt' 
        AND column_name = 'total_mensajes'
    ) THEN
        ALTER TABLE conversaciones_mkt 
        ADD COLUMN total_mensajes INTEGER DEFAULT 0;
        RAISE NOTICE 'Columna total_mensajes agregada a conversaciones_mkt';
    ELSE
        RAISE NOTICE 'Columna total_mensajes ya existe en conversaciones_mkt';
    END IF;

    -- Verificar y agregar columna resumen_ia
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversaciones_mkt' 
        AND column_name = 'resumen_ia'
    ) THEN
        ALTER TABLE conversaciones_mkt 
        ADD COLUMN resumen_ia TEXT;
        RAISE NOTICE 'Columna resumen_ia agregada a conversaciones_mkt';
    ELSE
        RAISE NOTICE 'Columna resumen_ia ya existe en conversaciones_mkt';
    END IF;
END $$;

-- 2. ACTUALIZAR TABLA PROSPECTOS_MKT
-- ========================================
DO $$
BEGIN
    -- Verificar y agregar columna is_initialized
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'is_initialized'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN is_initialized BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Columna is_initialized agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna is_initialized ya existe en prospectos_mkt';
    END IF;

    -- Verificar y agregar columna ultimo_mensaje_fecha
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'ultimo_mensaje_fecha'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN ultimo_mensaje_fecha TIMESTAMPTZ;
        RAISE NOTICE 'Columna ultimo_mensaje_fecha agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna ultimo_mensaje_fecha ya existe en prospectos_mkt';
    END IF;

    -- Verificar y agregar columna conversacion_activa
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'conversacion_activa'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN conversacion_activa BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Columna conversacion_activa agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna conversacion_activa ya existe en prospectos_mkt';
    END IF;

    -- Verificar y agregar columna ultimo_mensaje_entrada_fecha
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'ultimo_mensaje_entrada_fecha'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN ultimo_mensaje_entrada_fecha TIMESTAMPTZ;
        RAISE NOTICE 'Columna ultimo_mensaje_entrada_fecha agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna ultimo_mensaje_entrada_fecha ya existe en prospectos_mkt';
    END IF;

    -- Verificar y agregar columna dias_sin_contacto_entrada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'dias_sin_contacto_entrada'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN dias_sin_contacto_entrada INTEGER DEFAULT 0;
        RAISE NOTICE 'Columna dias_sin_contacto_entrada agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna dias_sin_contacto_entrada ya existe en prospectos_mkt';
    END IF;

    -- Verificar y agregar columna requiere_seguimiento
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'requiere_seguimiento'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN requiere_seguimiento BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Columna requiere_seguimiento agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna requiere_seguimiento ya existe en prospectos_mkt';
    END IF;

    -- Verificar y agregar columna no_contactar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'no_contactar'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN no_contactar BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Columna no_contactar agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna no_contactar ya existe en prospectos_mkt';
    END IF;

    -- Verificar y agregar columna no_contactar_motivo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'no_contactar_motivo'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN no_contactar_motivo TEXT;
        RAISE NOTICE 'Columna no_contactar_motivo agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna no_contactar_motivo ya existe en prospectos_mkt';
    END IF;

    -- Verificar y agregar columna notas_manuales
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'notas_manuales'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN notas_manuales JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Columna notas_manuales agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna notas_manuales ya existe en prospectos_mkt';
    END IF;

    -- Verificar estructura de campos existentes de arrays y jsonb
    -- tags_automaticas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'tags_automaticas'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN tags_automaticas TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Columna tags_automaticas agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna tags_automaticas ya existe en prospectos_mkt';
    END IF;

    -- historial_estados
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'historial_estados'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN historial_estados JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Columna historial_estados agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna historial_estados ya existe en prospectos_mkt';
    END IF;

    -- metricas_conversacion
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'metricas_conversacion'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN metricas_conversacion JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Columna metricas_conversacion agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna metricas_conversacion ya existe en prospectos_mkt';
    END IF;

    -- alertas_ia
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'alertas_ia'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN alertas_ia TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Columna alertas_ia agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna alertas_ia ya existe en prospectos_mkt';
    END IF;

    -- objeciones_detectadas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'objeciones_detectadas'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN objeciones_detectadas TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Columna objeciones_detectadas agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna objeciones_detectadas ya existe en prospectos_mkt';
    END IF;

    -- motivaciones_principales
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'motivaciones_principales'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN motivaciones_principales TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Columna motivaciones_principales agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna motivaciones_principales ya existe en prospectos_mkt';
    END IF;

    -- barreras_identificadas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'barreras_identificadas'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN barreras_identificadas TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Columna barreras_identificadas agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna barreras_identificadas ya existe en prospectos_mkt';
    END IF;

    -- competencia_mencionada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospectos_mkt' 
        AND column_name = 'competencia_mencionada'
    ) THEN
        ALTER TABLE prospectos_mkt 
        ADD COLUMN competencia_mencionada TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Columna competencia_mencionada agregada a prospectos_mkt';
    ELSE
        RAISE NOTICE 'Columna competencia_mencionada ya existe en prospectos_mkt';
    END IF;
END $$;

-- 3. CREAR FOREIGN KEY PARA ULTIMO_MENSAJE_ID SI NO EXISTE
-- ========================================
DO $$
BEGIN
    -- Verificar si existe la foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'conversaciones_mkt' 
        AND kcu.column_name = 'ultimo_mensaje_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Agregar foreign key constraint
        ALTER TABLE conversaciones_mkt
        ADD CONSTRAINT conversaciones_mkt_ultimo_mensaje_id_fkey
        FOREIGN KEY (ultimo_mensaje_id) REFERENCES mensajes_mkt(id);
        RAISE NOTICE 'Foreign key constraint agregada para ultimo_mensaje_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint ya existe para ultimo_mensaje_id';
    END IF;
END $$;

-- 4. ACTUALIZAR DATOS EXISTENTES
-- ========================================
-- Inicializar contadores para conversaciones existentes
UPDATE conversaciones_mkt 
SET 
    total_mensajes_entrada = (
        SELECT COUNT(*) 
        FROM mensajes_mkt m 
        WHERE m.conversation_id = conversaciones_mkt.id 
        AND m.tipo = 'entrada'
    ),
    total_mensajes_salida = (
        SELECT COUNT(*) 
        FROM mensajes_mkt m 
        WHERE m.conversation_id = conversaciones_mkt.id 
        AND m.tipo = 'salida'
    ),
    total_mensajes = (
        SELECT COUNT(*) 
        FROM mensajes_mkt m 
        WHERE m.conversation_id = conversaciones_mkt.id
    ),
    ultimo_mensaje_entrada_fecha = (
        SELECT MAX(m.fecha) 
        FROM mensajes_mkt m 
        WHERE m.conversation_id = conversaciones_mkt.id 
        AND m.tipo = 'entrada'
    ),
    ultimo_mensaje_salida_fecha = (
        SELECT MAX(m.fecha) 
        FROM mensajes_mkt m 
        WHERE m.conversation_id = conversaciones_mkt.id 
        AND m.tipo = 'salida'
    ),
    ultimo_mensaje_fecha = (
        SELECT MAX(m.fecha) 
        FROM mensajes_mkt m 
        WHERE m.conversation_id = conversaciones_mkt.id
    )
WHERE EXISTS (
    SELECT 1 FROM mensajes_mkt m 
    WHERE m.conversation_id = conversaciones_mkt.id
);

-- Actualizar prospectos existentes con fechas de mensajes
UPDATE prospectos_mkt 
SET 
    ultimo_mensaje_fecha = (
        SELECT MAX(m.fecha) 
        FROM mensajes_mkt m 
        WHERE m.numero = prospectos_mkt.numero_telefono
    ),
    ultimo_mensaje_entrada_fecha = (
        SELECT MAX(m.fecha) 
        FROM mensajes_mkt m 
        WHERE m.numero = prospectos_mkt.numero_telefono 
        AND m.tipo = 'entrada'
    )
WHERE EXISTS (
    SELECT 1 FROM mensajes_mkt m 
    WHERE m.numero = prospectos_mkt.numero_telefono
);

-- 5. VERIFICACIÓN FINAL
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ESTRUCTURA DE TABLAS ACTUALIZADA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Conversaciones actualizadas: %', (
    SELECT COUNT(*) FROM conversaciones_mkt 
    WHERE total_mensajes > 0
  );
  RAISE NOTICE 'Prospectos actualizados: %', (
    SELECT COUNT(*) FROM prospectos_mkt 
    WHERE ultimo_mensaje_fecha IS NOT NULL
  );
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Tablas listas para el sistema de seguimiento';
  RAISE NOTICE '========================================';
END;
$$;
