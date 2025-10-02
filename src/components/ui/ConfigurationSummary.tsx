import React from 'react';
import { CheckCircle, AlertCircle, Settings } from 'lucide-react';

interface ConfigurationSummaryProps {
  googleAdsConfigured: boolean;
  facebookPixelConfigured: boolean;
  onOpenConfig: (type: 'google_ads' | 'facebook_pixel') => void;
}

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({
  googleAdsConfigured,
  facebookPixelConfigured,
  onOpenConfig
}) => {
  const totalConfigured = (googleAdsConfigured ? 1 : 0) + (facebookPixelConfigured ? 1 : 0);
  const totalServices = 2;

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estado de Configuración
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {totalConfigured} de {totalServices} servicios configurados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Google Ads Status */}
          <div className="flex items-center gap-2">
            {googleAdsConfigured ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Google Ads</span>
              </div>
            ) : (
              <button
                onClick={() => onOpenConfig('google_ads')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Conecta Google Ads</span>
              </button>
            )}
          </div>

          {/* Facebook Pixel Status */}
          <div className="flex items-center gap-2">
            {facebookPixelConfigured ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Facebook Pixel</span>
              </div>
            ) : (
              <button
                onClick={() => onOpenConfig('facebook_pixel')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Conecta Facebook Pixel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Progreso de configuración
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.round((totalConfigured / totalServices) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(totalConfigured / totalServices) * 100}%` }}
          />
        </div>
      </div>

      {totalConfigured === totalServices && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-800 dark:text-green-200 font-medium">
              ¡Todas las APIs están configuradas! Ahora verás métricas reales en lugar de simuladas.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationSummary;
