import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UsuarioTOI } from '../types/database';

export default function useCurrentUserTOI() {
  const [currentUser, setCurrentUser] = useState<UsuarioTOI | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAsesor, setIsAsesor] = useState(false);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        console.log('[useCurrentUserTOI] Iniciando fetch...');
        
        // Obtener sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('[useCurrentUserTOI] Sesión:', session?.user?.email);
        
        if (sessionError) {
          console.error('[useCurrentUserTOI] Error de sesión:', sessionError);
          setLoading(false);
          return;
        }
        
        if (!session?.user?.email) {
          console.log('[useCurrentUserTOI] No hay sesión activa');
          setLoading(false);
          return;
        }

        console.log('[useCurrentUserTOI] Buscando usuario en usuarios_toi con email:', session.user.email);

        // Buscar usuario en usuarios_toi (SIN filtro de activo primero para debugging)
        const { data, error } = await supabase
          .from('usuarios_toi')
          .select('*')
          .eq('email', session.user.email)
          .single();

        console.log('[useCurrentUserTOI] Resultado query:', { data, error });

        if (error) {
          console.error('[useCurrentUserTOI] Error fetching user:', error);
          // Si no se encuentra, no es un error crítico
          if (error.code === 'PGRST116') {
            console.warn('[useCurrentUserTOI] Usuario no encontrado en usuarios_toi:', session.user.email);
          }
        } else if (data) {
          console.log('[useCurrentUserTOI] ✅ Usuario encontrado:', data.nombre, 'Rol:', data.rol);
          
          // Verificar si está activo
          if (!data.activo) {
            console.warn('[useCurrentUserTOI] Usuario inactivo:', data.email);
            setLoading(false);
            return;
          }
          
          setCurrentUser(data);
          setIsAdmin(data.rol === 'admin' || data.rol === 'gerente');
          setIsAsesor(data.rol === 'asesor');
          
          console.log('[useCurrentUserTOI] Estado actualizado - isAdmin:', data.rol === 'admin', 'isAsesor:', data.rol === 'asesor');
        }
      } catch (error) {
        console.error('[useCurrentUserTOI] Error general:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useCurrentUserTOI] Auth cambió:', event, session?.user?.email);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchCurrentUser();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAdmin(false);
        setIsAsesor(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    currentUser,
    loading,
    isAdmin,
    isAsesor
  };
}

