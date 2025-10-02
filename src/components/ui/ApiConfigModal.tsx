import React, { useState } from 'react';
import { X, Settings, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiType: 'google_ads' | 'facebook_pixel';
  onSave: (credentials: any) => void;
  existingConfig?: any;
}

const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  apiType,
  onSave,
  existingConfig
}) => {
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [formData, setFormData] = useState(() => {
    if (apiType === 'google_ads') {
      return {
        client_id: existingConfig?.client_id || '',
        client_secret: existingConfig?.client_secret || '',
        developer_token: existingConfig?.developer_token || '',
        refresh_token: existingConfig?.refresh_token || '',
        customer_id: existingConfig?.customer_id || ''
      };
    } else {
      return {
        app_id: existingConfig?.app_id || '',
        app_secret: existingConfig?.app_secret || '',
        access_token: existingConfig?.access_token || '',
        pixel_id: existingConfig?.pixel_id || '',
        ad_account_id: existingConfig?.ad_account_id || ''
      };
    }
  });

  const [isValid, setIsValid] = useState(false);

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Validar si todos los campos están llenos
    const allFieldsFilled = Object.values(newFormData).every(val => val.trim() !== '');
    setIsValid(allFieldsFilled);
  };

  const handleSave = () => {
    if (isValid) {
      onSave(formData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
      onSave(null); // null significa eliminar
      onClose();
    }
  };

  if (!isOpen) return null;

  const isGoogleAds = apiType === 'google_ads';
  const title = isGoogleAds ? 'Configurar Google Ads' : 'Configurar Facebook Pixel';
  const hasExistingConfig = existingConfig && Object.keys(existingConfig).length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isGoogleAds ? 'bg-blue-100 dark:bg-blue-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
              <Settings className={`w-5 h-5 ${isGoogleAds ? 'text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasExistingConfig ? 'Editar configuración existente' : 'Conecta tu cuenta para obtener métricas reales'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status indicator */}
          {hasExistingConfig && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Configuración activa - Métricas reales conectadas
                </span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-2">
                  {isGoogleAds ? 'Para obtener estas credenciales:' : 'Para obtener estas credenciales:'}
                </p>
                {isGoogleAds ? (
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Ve a <a href="https://console.developers.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                    <li>Crea un proyecto y habilita Google Ads API</li>
                    <li>Genera credenciales OAuth 2.0</li>
                    <li>Solicita un Developer Token en Google Ads</li>
                    <li>Obtén el Customer ID de tu cuenta</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Ve a <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developers</a></li>
                    <li>Crea una app y obtén App ID y App Secret</li>
                    <li>Genera un Access Token con permisos de marketing</li>
                    <li>Encuentra tu Pixel ID en Business Manager</li>
                    <li>Obtén tu Ad Account ID (formato: act_xxxxxxxxx)</li>
                  </ol>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {isGoogleAds ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={formData.client_id}
                    onChange={(e) => handleInputChange('client_id', e.target.value)}
                    placeholder="123456789.apps.googleusercontent.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.client_secret ? "text" : "password"}
                      value={formData.client_secret}
                      onChange={(e) => handleInputChange('client_secret', e.target.value)}
                      placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('client_secret')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.client_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Developer Token
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.developer_token ? "text" : "password"}
                      value={formData.developer_token}
                      onChange={(e) => handleInputChange('developer_token', e.target.value)}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('developer_token')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.developer_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refresh Token
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.refresh_token ? "text" : "password"}
                      value={formData.refresh_token}
                      onChange={(e) => handleInputChange('refresh_token', e.target.value)}
                      placeholder="1//xxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('refresh_token')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.refresh_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    value={formData.customer_id}
                    onChange={(e) => handleInputChange('customer_id', e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    App ID
                  </label>
                  <input
                    type="text"
                    value={formData.app_id}
                    onChange={(e) => handleInputChange('app_id', e.target.value)}
                    placeholder="123456789012345"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    App Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.app_secret ? "text" : "password"}
                      value={formData.app_secret}
                      onChange={(e) => handleInputChange('app_secret', e.target.value)}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('app_secret')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.app_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.access_token ? "text" : "password"}
                      value={formData.access_token}
                      onChange={(e) => handleInputChange('access_token', e.target.value)}
                      placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('access_token')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.access_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pixel ID
                  </label>
                  <input
                    type="text"
                    value={formData.pixel_id}
                    onChange={(e) => handleInputChange('pixel_id', e.target.value)}
                    placeholder="123456789012345"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ad Account ID
                  </label>
                  <input
                    type="text"
                    value={formData.ad_account_id}
                    onChange={(e) => handleInputChange('ad_account_id', e.target.value)}
                    placeholder="act_123456789012345"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {hasExistingConfig && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Eliminar configuración
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {hasExistingConfig ? 'Actualizar' : 'Guardar configuración'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigModal;
