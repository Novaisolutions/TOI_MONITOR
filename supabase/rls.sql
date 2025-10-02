-- Habilitar RLS para las tablas principales
alter table public.conversaciones_mkt enable row level security;
alter table public.mensajes_mkt     enable row level security;

-- Eliminar políticas previas (si existen) para evitar conflictos
DROP POLICY IF EXISTS "Usuario solo lee sus conversaciones" ON public.conversaciones_mkt;
DROP POLICY IF EXISTS "Usuario solo lee sus mensajes" ON public.mensajes_mkt;

-- Política de lectura: El usuario autenticado solo puede leer
-- conversaciones o mensajes asociados a su número de teléfono.
-- Esta política parece incorrecta para un monitor, la comentaremos por ahora.
-- create policy "Usuario solo lee sus conversaciones"
--   on public.conversaciones_mkt
--   for select
--   using ( auth.jwt() ->> 'phone' = numero );

-- create policy "Usuario solo lee sus mensajes"
--   on public.mensajes_mkt
--   for select
--   using ( auth.jwt() ->> 'phone' = numero );

-- PERMITIR LECTURA A CUALQUIER USUARIO AUTENTICADO
DROP POLICY IF EXISTS "Permitir select a usuarios autenticados en conversaciones_mkt" ON public.conversaciones_mkt;
CREATE POLICY "Permitir select a usuarios autenticados en conversaciones_mkt" ON public.conversaciones_mkt FOR SELECT USING (auth.role() = 'authenticated');

-- Cambiar de SELECT a ALL para permitir la suscripción en tiempo real
DROP POLICY IF EXISTS "Permitir select a usuarios autenticados en mensajes_mkt" ON public.mensajes_mkt;
DROP POLICY IF EXISTS "Permitir todas las operaciones a usuarios autenticados en mensajes_mkt" ON public.mensajes_mkt;
CREATE POLICY "Permitir todas las operaciones a usuarios autenticados en mensajes_mkt" ON public.mensajes_mkt FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- NOTA: Faltan políticas para INSERT, UPDATE, DELETE.
-- Por ahora, solo estamos restringiendo la LECTURA.
-- Necesitarás añadir políticas INSERT/UPDATE/DELETE según tu lógica de negocio
-- (ej. permitir insertar si auth.uid() coincide con user_id, etc.)

-- Política de inserción para conversaciones
DROP POLICY IF EXISTS "Usuario solo inserta sus conversaciones" ON public.conversaciones_mkt;
CREATE POLICY "Usuario solo inserta sus conversaciones"
  ON public.conversaciones_mkt
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política de inserción para mensajes
DROP POLICY IF EXISTS "Usuario solo inserta sus mensajes" ON public.mensajes_mkt;
CREATE POLICY "Usuario solo inserta sus mensajes"
  ON public.mensajes_mkt
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política de actualización para conversaciones: PERMITIR A CUALQUIER USUARIO AUTENTICADO
DROP POLICY IF EXISTS "Usuario solo actualiza sus conversaciones" ON public.conversaciones_mkt;
DROP POLICY IF EXISTS "Permitir a usuarios autenticados actualizar conversaciones" ON public.conversaciones_mkt;
DROP POLICY IF EXISTS "Permitir a usuarios autenticados actualizar conversaciones_mkt" ON public.conversaciones_mkt;
CREATE POLICY "Permitir a usuarios autenticados actualizar conversaciones_mkt"
  ON public.conversaciones_mkt
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- Política de actualización para mensajes
DROP POLICY IF EXISTS "Usuario solo actualiza sus mensajes" ON public.mensajes_mkt;
DROP POLICY IF EXISTS "Permitir a usuarios autenticados actualizar mensajes" ON public.mensajes_mkt;
DROP POLICY IF EXISTS "Permitir a usuarios autenticados actualizar mensajes_mkt" ON public.mensajes_mkt;
CREATE POLICY "Permitir a usuarios autenticados actualizar mensajes_mkt"
  ON public.mensajes_mkt
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');