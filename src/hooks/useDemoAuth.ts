import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface DemoUser {
  id: string;
  email: string;
  role: 'demo_user' | 'demo_admin';
  permissions: {
    can_view_real_data: boolean;
    can_edit_demo: boolean;
    can_configure_apis: boolean;
    can_manage_users?: boolean;
  };
  is_active: boolean;
  last_login?: string;
}

export interface AuthContextType {
  user: User | null;
  demoUser: DemoUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  canViewRealData: () => boolean;
  canEditDemo: () => boolean;
  canConfigureAPIs: () => boolean;
  canManageUsers: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useDemoAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
};

export const useDemoAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión existente
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Obtener datos del usuario demo
          const { data: demoUserData } = await supabase
            .from('demo_users')
            .select('*')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();
            
          if (demoUserData) {
            setDemoUser(demoUserData);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Obtener datos del usuario demo
          const { data: demoUserData } = await supabase
            .from('demo_users')
            .select('*')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();
            
          if (demoUserData) {
            setDemoUser(demoUserData);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setDemoUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Verificar si es un usuario demo válido
      const { data: demoUserData, error: demoError } = await supabase
        .from('demo_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (demoError || !demoUserData) {
        return { success: false, error: 'Credenciales inválidas para THE ONE Inmobiliaria' };
      }

      // Intentar autenticación con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: 'Error de autenticación. Verifica tus credenciales.' };
      }

      // Actualizar último login
      await supabase
        .from('demo_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', demoUserData.id);

      setUser(authData.user);
      setDemoUser(demoUserData);

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Error inesperado. Intenta nuevamente.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setDemoUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const canViewRealData = () => {
    return demoUser?.permissions?.can_view_real_data || false;
  };

  const canEditDemo = () => {
    return demoUser?.permissions?.can_edit_demo || false;
  };

  const canConfigureAPIs = () => {
    return demoUser?.permissions?.can_configure_apis || false;
  };

  const canManageUsers = () => {
    return demoUser?.permissions?.can_manage_users || false;
  };

  return {
    user,
    demoUser,
    loading,
    signIn,
    signOut,
    canViewRealData,
    canEditDemo,
    canConfigureAPIs,
    canManageUsers,
  };
};
