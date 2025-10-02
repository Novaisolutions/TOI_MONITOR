import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ApiConfiguration {
  id?: string;
  service_name: string;
  service_type: 'google_ads' | 'facebook_pixel';
  credentials: any;
  is_active: boolean;
  is_configured: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function useApiConfigurations() {
  const [configurations, setConfigurations] = useState<ApiConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuraciones existentes
  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('api_configurations_TOI')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching API configurations:', fetchError);
        setError('Error al cargar configuraciones');
        return;
      }

      setConfigurations(data || []);
    } catch (err) {
      console.error('Error in fetchConfigurations:', err);
      setError('Error inesperado al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  // Guardar o actualizar configuración
  const saveConfiguration = async (
    serviceType: 'google_ads' | 'facebook_pixel',
    credentials: any
  ) => {
    try {
      setError(null);
      
      const serviceName = serviceType === 'google_ads' ? 'google_ads_api' : 'facebook_pixel_api';
      
      // Buscar configuración existente
      const existingConfig = configurations.find(
        config => config.service_type === serviceType
      );

      if (credentials === null) {
        // Eliminar configuración
        if (existingConfig?.id) {
          const { error: deleteError } = await supabase
            .from('api_configurations_TOI')
            .delete()
            .eq('id', existingConfig.id);

          if (deleteError) {
            console.error('Error deleting configuration:', deleteError);
            setError('Error al eliminar configuración');
            return false;
          }
        }
      } else if (existingConfig) {
        // Actualizar configuración existente
        const { error: updateError } = await supabase
          .from('api_configurations_TOI')
          .update({
            credentials: credentials,
            is_active: true,
            is_configured: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);

        if (updateError) {
          console.error('Error updating configuration:', updateError);
          setError('Error al actualizar configuración');
          return false;
        }
      } else {
        // Crear nueva configuración
        const { error: insertError } = await supabase
          .from('api_configurations_TOI')
          .insert({
            service_name: serviceName,
            service_type: serviceType,
            credentials: credentials,
            is_active: true,
            is_configured: true
          });

        if (insertError) {
          console.error('Error creating configuration:', insertError);
          setError('Error al crear configuración');
          return false;
        }
      }

      // Recargar configuraciones
      await fetchConfigurations();
      return true;
    } catch (err) {
      console.error('Error in saveConfiguration:', err);
      setError('Error inesperado al guardar configuración');
      return false;
    }
  };

  // Obtener configuración específica
  const getConfiguration = (serviceType: 'google_ads' | 'facebook_pixel') => {
    return configurations.find(config => config.service_type === serviceType);
  };

  // Verificar si un servicio está configurado
  const isServiceConfigured = (serviceType: 'google_ads' | 'facebook_pixel') => {
    const config = getConfiguration(serviceType);
    return config?.is_configured && config?.is_active;
  };

  // Obtener credenciales de un servicio
  const getServiceCredentials = (serviceType: 'google_ads' | 'facebook_pixel') => {
    const config = getConfiguration(serviceType);
    return config?.credentials || null;
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  return {
    configurations,
    loading,
    error,
    saveConfiguration,
    getConfiguration,
    isServiceConfigured,
    getServiceCredentials,
    refetch: fetchConfigurations
  };
}
