import React, { useState } from 'react';
import {
  BarChart, TrendingUp, Users, DollarSign, Activity, MessageSquare,
  Target, Zap, Eye, MousePointer, ShoppingCart, CreditCard,
  Clock, Heart, ArrowUp, ArrowDown, Globe, Settings, CheckCircle, AlertCircle
} from 'lucide-react';
import useAnalyticsData from '../../hooks/useAnalyticsData';
import useApiConfigurations from '../../hooks/useApiConfigurations';
import ApiConfigModal from '../ui/ApiConfigModal';
import ConfigurationSummary from '../ui/ConfigurationSummary';

const InsightsView: React.FC = () => {
  const { metrics, loading } = useAnalyticsData();
  const { 
    isServiceConfigured, 
    getServiceCredentials, 
    saveConfiguration,
    loading: configLoading 
  } = useApiConfigurations();
  
  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    apiType: 'google_ads' | 'facebook_pixel' | null;
  }>({
    isOpen: false,
    apiType: null
  });

  const openConfigModal = (apiType: 'google_ads' | 'facebook_pixel') => {
    setConfigModal({ isOpen: true, apiType });
  };

  const closeConfigModal = () => {
    setConfigModal({ isOpen: false, apiType: null });
  };

  const handleSaveConfiguration = async (credentials: any) => {
    if (configModal.apiType) {
      await saveConfiguration(configModal.apiType, credentials);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-MX').format(num);
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="text-green-500" size={16} />;
    if (growth < 0) return <ArrowDown className="text-red-500" size={16} />;
    return <ArrowDown className="text-gray-500" size={16} />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Versión simplificada para debug
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  // Debug: mostrar métricas básicas primero
  console.log('Métricas cargadas:', metrics);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BarChart className="text-blue-600" size={32} />
          Centro de Analytics - THE ONE Inmobiliaria
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Análisis inteligente de conversaciones, marketing digital y KPIs de conversión
        </p>
      </div>

      {/* CONFIGURATION SUMMARY */}
      <ConfigurationSummary
        googleAdsConfigured={isServiceConfigured('google_ads')}
        facebookPixelConfigured={isServiceConfigured('facebook_pixel')}
        onOpenConfig={openConfigModal}
      />


      {/* SECCIÓN 1: ANÁLISIS REAL DE CRM/PROSPECTOS */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Users className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📊 Análisis CRM - Datos Reales
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Métricas calculadas desde tu base de datos de prospectos
            </p>
          </div>
        </div>

        {/* Métricas Principales CRM */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-blue-600" size={28} />
            </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {formatNumber(metrics.prospectosAnalysis.totalProspectos)}
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">Total Prospectos</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl shadow-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <Target className="text-green-600" size={28} />
            </div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
              {metrics.prospectosAnalysis.promedioScoreInteres.toFixed(0)}%
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">Score Promedio</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <Heart className="text-purple-600" size={28} />
            </div>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
              {metrics.sentimentScore.toFixed(0)}%
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">Sentimiento General</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-orange-600" size={28} />
            </div>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-1">
              {metrics.prospectosAnalysis.promedioProbabilidadConversion.toFixed(0)}%
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">Prob. Conversión</p>
          </div>
        </div>

        {/* Pipeline de Ventas REAL */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="text-blue-600" size={20} />
            Pipeline de Ventas (Datos Reales)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.prospectosAnalysis.leads}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{metrics.prospectosAnalysis.contactados}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Contactados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.prospectosAnalysis.calificados}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Calificados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.prospectosAnalysis.oportunidades}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Oportunidades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.prospectosAnalysis.cierres}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Cierres</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.prospectosAnalysis.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Tasa Conv.</div>
            </div>
          </div>
        </div>

        {/* Análisis de Sentimiento Detallado */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="text-purple-600" size={20} />
            Análisis de Sentimiento (Datos Reales)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{metrics.prospectosAnalysis.sentimientoPositivo}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Positivos</div>
              <div className="text-xs text-green-600 mt-1">
                {metrics.prospectosAnalysis.totalProspectos > 0 
                  ? ((metrics.prospectosAnalysis.sentimientoPositivo / metrics.prospectosAnalysis.totalProspectos) * 100).toFixed(1)
                  : 0}% del total
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-gray-600">{metrics.prospectosAnalysis.sentimientoNeutral}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">Neutrales</div>
              <div className="text-xs text-gray-600 mt-1">
                {metrics.prospectosAnalysis.totalProspectos > 0 
                  ? ((metrics.prospectosAnalysis.sentimientoNeutral / metrics.prospectosAnalysis.totalProspectos) * 100).toFixed(1)
                  : 0}% del total
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{metrics.prospectosAnalysis.sentimientoNegativo}</div>
              <div className="text-sm text-red-700 dark:text-red-300">Negativos</div>
              <div className="text-xs text-red-600 mt-1">
                {metrics.prospectosAnalysis.totalProspectos > 0 
                  ? ((metrics.prospectosAnalysis.sentimientoNegativo / metrics.prospectosAnalysis.totalProspectos) * 100).toFixed(1)
                  : 0}% del total
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: GOOGLE ADS - SIMULADO */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Target className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎯 Google Ads Performance
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Métricas simuladas escaladas desde tus datos CRM
              </p>
            </div>
          </div>
          
          {/* Botón de configuración Google Ads */}
          <div className="flex items-center gap-2">
            {isServiceConfigured('google_ads') ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm">
                <CheckCircle className="w-4 h-4" />
                Conectado
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                <AlertCircle className="w-4 h-4" />
                Conecta aquí tus estadísticas
              </div>
            )}
            <button
              onClick={() => openConfigModal('google_ads')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Configurar Google Ads"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Eye className="text-blue-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.googleAds.impressions)}</p>
            <p className="text-sm text-gray-500 mt-1">Impresiones</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <MousePointer className="text-green-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.googleAds.clicks)}</p>
            <p className="text-sm text-gray-500 mt-1">CTR: {metrics.googleAds.ctr}%</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Target className="text-purple-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.googleAds.conversions)}</p>
            <p className="text-sm text-gray-500 mt-1">Conversiones</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-orange-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.googleAds.roas}x</p>
            <p className="text-sm text-gray-500 mt-1">ROAS</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: FACEBOOK PIXEL - SIMULADO */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📱 Facebook Pixel Analytics
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Métricas simuladas de tracking de conversiones
              </p>
            </div>
          </div>
          
          {/* Botón de configuración Facebook Pixel */}
          <div className="flex items-center gap-2">
            {isServiceConfigured('facebook_pixel') ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm">
                <CheckCircle className="w-4 h-4" />
                Conectado
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                <AlertCircle className="w-4 h-4" />
                Conecta aquí tus estadísticas
              </div>
            )}
            <button
              onClick={() => openConfigModal('facebook_pixel')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Configurar Facebook Pixel"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Eye className="text-blue-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.facebookPixel.pageViews)}</p>
            <p className="text-sm text-gray-500 mt-1">Page Views</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="text-yellow-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.facebookPixel.addToCart)}</p>
            <p className="text-sm text-gray-500 mt-1">Add to Cart</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="text-green-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.facebookPixel.purchases)}</p>
            <p className="text-sm text-gray-500 mt-1">Purchases</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-purple-500" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(metrics.facebookPixel.revenue)}</p>
            <p className="text-sm text-gray-500 mt-1">ROAS: {metrics.facebookPixel.roas}x</p>
          </div>
        </div>
      </div>

      {/* Espacio para contenido adicional oculto */}
      <div style={{display: 'none'}}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl shadow-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Conversaciones Activas</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{formatNumber(metrics.totalConversations)}</p>
              <p className="text-sm text-green-600 mt-2">Tasa de engagement: {metrics.engagementRate.toFixed(1)}%</p>
            </div>
            <Users className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Sentimiento General</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{metrics.sentimentScore.toFixed(0)}%</p>
              <div className="flex items-center mt-2">
                <Heart className={`mr-1 ${metrics.sentimentScore > 70 ? 'text-green-500' : metrics.sentimentScore > 40 ? 'text-yellow-500' : 'text-red-500'}`} size={14} />
                <span className="text-sm text-purple-600">
                  {metrics.sentimentScore > 70 ? 'Positivo' : metrics.sentimentScore > 40 ? 'Neutral' : 'Negativo'}
                </span>
              </div>
            </div>
            <Heart className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Tiempo Respuesta</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{metrics.avgResponseTime.toFixed(1)}h</p>
              <p className="text-sm text-orange-600 mt-2">Promedio de respuesta</p>
            </div>
            <Clock className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Google Ads Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Target className="text-red-500" size={28} />
          Google Ads Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Eye className="text-blue-500" size={24} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Impresiones</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.googleAds.impressions)}</p>
            <p className="text-sm text-gray-500 mt-1">Total de vistas del anuncio</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <MousePointer className="text-green-500" size={24} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Clicks</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.googleAds.clicks)}</p>
            <p className="text-sm text-gray-500 mt-1">CTR: {metrics.googleAds.ctr}%</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Target className="text-purple-500" size={24} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Conversiones</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.googleAds.conversions)}</p>
            <p className="text-sm text-gray-500 mt-1">Objetivo alcanzado</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-orange-500" size={24} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">ROAS</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.googleAds.roas}x</p>
            <p className="text-sm text-gray-500 mt-1">Retorno de inversión</p>
          </div>
        </div>
      </div>

      {/* Facebook Pixel Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Activity className="text-blue-600" size={28} />
          Facebook Pixel Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Eye className="text-blue-500" size={24} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Page Views</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.facebookPixel.pageViews)}</p>
            <p className="text-sm text-gray-500 mt-1">Páginas vistas</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="text-yellow-500" size={24} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Add to Cart</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.facebookPixel.addToCart)}</p>
            <p className="text-sm text-gray-500 mt-1">Productos en carrito</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="text-green-500" size={24} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Compras</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.facebookPixel.purchases)}</p>
            <p className="text-sm text-gray-500 mt-1">Conversiones completadas</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-purple-500" size={24} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(metrics.facebookPixel.revenue)}</p>
            <p className="text-sm text-gray-500 mt-1">ROAS: {metrics.facebookPixel.roas}x</p>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Target className="text-red-500" size={28} />
          Embudo de Conversión
        </h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-900 dark:text-white">Awareness</span>
              </div>
              <span className="font-bold text-blue-600">{formatNumber(metrics.conversionFunnel.awareness)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-gray-900 dark:text-white">Interest</span>
              </div>
              <span className="font-bold text-yellow-600">{formatNumber(metrics.conversionFunnel.interest)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="font-medium text-gray-900 dark:text-white">Consideration</span>
              </div>
              <span className="font-bold text-orange-600">{formatNumber(metrics.conversionFunnel.consideration)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900 dark:text-white">Purchase</span>
              </div>
              <span className="font-bold text-green-600">{formatNumber(metrics.conversionFunnel.purchase)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Peak Hours Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="text-blue-600" size={20} />
            Horas Pico de Actividad
          </h3>
          <div className="space-y-3">
            {metrics.peakHours.map((peak, index) => (
              <div key={peak.hour} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {peak.hour}:00 - {peak.hour + 1}:00
                  </span>
                </div>
                <span className="font-bold text-gray-600 dark:text-gray-300">
                  {peak.messages} mensajes
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Tendencias de Crecimiento
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Crecimiento Semanal</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Mensajes procesados</p>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUp className="text-green-500" size={20} />
                <span className="text-xl font-bold text-green-600">+{metrics.weeklyGrowth}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Crecimiento Mensual</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Conversaciones activas</p>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUp className="text-blue-500" size={20} />
                <span className="text-xl font-bold text-blue-600">+{metrics.monthlyGrowth}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Integration Guide */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Zap className="text-purple-600 mt-1" size={24} />
          <div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🔌 Guía de Integración de APIs
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Google Ads API</h5>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p><strong>Endpoint:</strong> https://googleads.googleapis.com/v14</p>
                  <p><strong>Autenticación:</strong> OAuth 2.0 + Service Account</p>
                  <p><strong>Métricas clave:</strong> impressions, clicks, conversions, cost</p>
                  <p><strong>Frecuencia:</strong> Actualización cada 1-4 horas</p>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Facebook Pixel API</h5>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p><strong>Endpoint:</strong> https://graph.facebook.com/v18.0</p>
                  <p><strong>Autenticación:</strong> App Access Token</p>
                  <p><strong>Eventos:</strong> PageView, AddToCart, Purchase</p>
                  <p><strong>Frecuencia:</strong> Actualización en tiempo real</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> {/* Cierre del div oculto */}

      {/* Footer Profesional - Datos de Ejemplo */}
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            📊 Datos de ejemplo para demostración • Métricas calculadas desde base de datos de prospectos
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Google Ads y Facebook Pixel: métricas simuladas escaladas • CRM: datos reales de prospectos_toi
          </p>
        </div>
      </div>

      {/* Modal de configuración */}
      {configModal.isOpen && configModal.apiType && (
        <ApiConfigModal
          isOpen={configModal.isOpen}
          onClose={closeConfigModal}
          apiType={configModal.apiType}
          onSave={handleSaveConfiguration}
          existingConfig={getServiceCredentials(configModal.apiType)}
        />
      )}
    </div>
  );
};

export default InsightsView;



