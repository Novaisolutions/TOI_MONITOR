import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, Lock, Mail, Building } from 'lucide-react';

interface DemoLoginProps {
  onLoginSuccess: () => void;
}

export const DemoLogin: React.FC<DemoLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        // Verificar credenciales hardcodeadas para simplificar
        const validCredentials = [
          { email: 'demo@theoneinmobiliaria.com', password: 'demo123', role: 'demo_user' },
          { email: 'admin@theoneinmobiliaria.com', password: 'admin123', role: 'demo_admin' },
          // Usuarios TOI agregados
          { email: 'david.sandoval@toi.com.mx', password: 'password123', role: 'demo_user' },
          { email: 'jose.manuel@toi.com.mx', password: 'password123', role: 'demo_user' }
        ];

      const validUser = validCredentials.find(
        cred => cred.email === email && cred.password === password
      );

      if (!validUser) {
        setError('Credenciales inválidas. Usa: demo@theoneinmobiliaria.com/demo123 o david.sandoval@toi.com.mx/password123');
        setLoading(false);
        return;
      }

      // Crear sesión demo
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        email: validUser.email,
        role: validUser.role,
        permissions: {
          can_view_real_data: validUser.role === 'demo_admin',
          can_edit_demo: true,
          can_configure_apis: true,
          can_manage_users: validUser.role === 'demo_admin'
        },
        is_active: true,
        created_at: new Date().toISOString()
      };

      // Almacenar sesión en localStorage
      localStorage.setItem('demo_user_session', JSON.stringify({
        user: demoUser,
        authenticated: true,
        timestamp: Date.now()
      }));

      console.log('Login exitoso para:', validUser.email);
      onLoginSuccess();

    } catch (err) {
      setError('Error inesperado. Intenta nuevamente.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            THE ONE Inmobiliaria
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sistema CRM Demo - Acceso exclusivo para demostración
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="david.sandoval@toi.com.mx"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Acceder a THE ONE CRM'
              )}
            </button>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p><strong>Credenciales de prueba:</strong></p>
              <p>Usuario: demo@theoneinmobiliaria.com</p>
              <p>Contraseña: demo123</p>
              <p className="mt-2 text-gray-400">Sistema CRM Demo - Solo datos de demostración</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
