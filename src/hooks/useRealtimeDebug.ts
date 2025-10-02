import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface RealtimeStatus {
  isConnected: boolean;
  lastEvent: string | null;
  eventCount: number;
  errors: string[];
}

export const useRealtimeDebug = () => {
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastEvent: null,
    eventCount: 0,
    errors: []
  });

  const addError = useCallback((error: string) => {
    setStatus(prev => ({
      ...prev,
      errors: [...prev.errors.slice(-4), error] // Mantener solo los últimos 5 errores
    }));
  }, []);

  const addEvent = useCallback((event: string) => {
    setStatus(prev => ({
      ...prev,
      lastEvent: event,
      eventCount: prev.eventCount + 1
    }));
  }, []);

  const setConnected = useCallback((connected: boolean) => {
    setStatus(prev => ({
      ...prev,
      isConnected: connected
    }));
  }, []);

  // Test de conexión a Supabase
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('mensajes_toi')
          .select('id')
          .limit(1);
        
        if (error) {
          addError(`DB Error: ${error.message}`);
        } else {
          console.log('✅ Supabase DB connection OK');
        }
      } catch (err) {
        addError(`Connection Error: ${err}`);
      }
    };

    testConnection();
  }, [addError]);

  return {
    status,
    addError,
    addEvent,
    setConnected
  };
};

export default useRealtimeDebug;
