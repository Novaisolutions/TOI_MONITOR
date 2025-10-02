import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useDemoAuth } from './useDemoAuth';

interface UseRestrictedDataOptions {
  tableName: string;
  select?: string;
  filters?: Record<string, any>;
  requireRealDataAccess?: boolean;
}

export const useRestrictedData = <T = any>({
  tableName,
  select = '*',
  filters = {},
  requireRealDataAccess = false
}: UseRestrictedDataOptions) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, demoUser, canViewRealData } = useDemoAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar si el usuario tiene permisos para datos reales
        if (requireRealDataAccess && !canViewRealData()) {
          setError('No tienes permisos para acceder a estos datos');
          setData([]);
          setLoading(false);
          return;
        }

        // Verificar si el usuario está autenticado
        if (!user) {
          setError('Debes iniciar sesión para acceder a estos datos');
          setData([]);
          setLoading(false);
          return;
        }

        // Construir query
        let query = supabase.from(tableName).select(select);

        // Aplicar filtros
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });

        const { data: result, error: queryError } = await query;

        if (queryError) {
          setError(`Error al obtener datos: ${queryError.message}`);
          setData([]);
        } else {
          setData(result || []);
        }
      } catch (err) {
        setError('Error inesperado al obtener datos');
        console.error('Error fetching restricted data:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, select, JSON.stringify(filters), requireRealDataAccess, user, canViewRealData]);

  return { data, loading, error };
};

// Hook específico para datos reales (con restricciones)
export const useRealData = <T = any>(tableName: string, select = '*', filters = {}) => {
  return useRestrictedData<T>({
    tableName,
    select,
    filters,
    requireRealDataAccess: true
  });
};

// Hook específico para datos demo (sin restricciones)
export const useDemoData = <T = any>(tableName: string, select = '*', filters = {}) => {
  return useRestrictedData<T>({
    tableName,
    select,
    filters,
    requireRealDataAccess: false
  });
};
