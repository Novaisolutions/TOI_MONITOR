import React from 'react';
import { Clock, ArrowRight, CheckCircle, AlertCircle, XCircle, Zap } from 'lucide-react';

// Componente NeumorphicCard local
const NeumorphicCard: React.FC<{ children: React.ReactNode; className?: string; }> = ({ children, className }) => (
  <div className={`bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${className || ''}`}>
    {children}
  </div>
);

interface HistorialEstado {
  estado_anterior: string;
  estado_nuevo: string;
  fecha: string;
  motivo?: string;
  usuario?: string;
  resumen_momento?: string;
}

interface HistorialEstadosProps {
  historial: HistorialEstado[];
  estadoActual: string;
}

const getEstadoColor = (estado: string): string => {
  const colores: Record<string, string> = {
    'lead': 'text-gray-500 bg-gray-100 dark:bg-gray-800',
    'contactado': 'text-blue-500 bg-blue-100 dark:bg-blue-900',
    'interesado': 'text-green-500 bg-green-100 dark:bg-green-900',
    'evaluando': 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900',
    'negociando': 'text-orange-500 bg-orange-100 dark:bg-orange-900',
    'listo_compra': 'text-purple-500 bg-purple-100 dark:bg-purple-900',
    'comprado': 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900',
    'perdido': 'text-red-500 bg-red-100 dark:bg-red-900',
    'pausado': 'text-slate-500 bg-slate-100 dark:bg-slate-900',
    'bienes_raices': 'text-teal-500 bg-teal-100 dark:bg-teal-900',
    'hospedaje': 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900',
  };
  return colores[estado.toLowerCase()] || colores['lead'];
};

const getEstadoIcon = (estado: string) => {
  const iconos: Record<string, React.ReactNode> = {
    'lead': <AlertCircle size={14} />,
    'contactado': <Clock size={14} />,
    'interesado': <Zap size={14} />,
    'evaluando': <Clock size={14} />,
    'negociando': <ArrowRight size={14} />,
    'listo_compra': <CheckCircle size={14} />,
    'comprado': <CheckCircle size={14} />,
    'perdido': <XCircle size={14} />,
    'pausado': <Clock size={14} />,
  };
  return iconos[estado.toLowerCase()] || iconos['lead'];
};

const getEstadoLabel = (estado: string): string => {
  const labels: Record<string, string> = {
    'lead': 'Lead',
    'contactado': 'Contactado',
    'interesado': 'Interesado',
    'evaluando': 'Evaluando',
    'negociando': 'Negociando',
    'listo_compra': 'Listo para Compra',
    'comprado': 'Comprado',
    'perdido': 'Perdido',
    'pausado': 'Pausado',
    'bienes_raices': 'Bienes Raíces',
    'hospedaje': 'Hospedaje',
  };
  return labels[estado.toLowerCase()] || estado;
};

const formatFecha = (fecha: string): string => {
  try {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return fecha;
  }
};

const HistorialEstados: React.FC<HistorialEstadosProps> = ({ historial = [], estadoActual }) => {
  console.log('[HistorialEstados] ===== RENDER =====');
  console.log('[HistorialEstados] Historial received:', historial);
  console.log('[HistorialEstados] Estado actual:', estadoActual);
  console.log('[HistorialEstados] Historial length:', historial?.length);
  console.log('[HistorialEstados] Historial type:', typeof historial);
  
  if (!historial || historial.length === 0) {
    console.log('[HistorialEstados] No historial data - showing empty state');
    return (
      <NeumorphicCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-blue-500" />
          <h3 className="font-semibold text-lg">Historial de Estados</h3>
        </div>
        <div className="text-center py-6">
          <div className="text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center gap-2">
            <Clock size={16} className="opacity-50" />
            No hay cambios de estado registrados
          </div>
        </div>
      </NeumorphicCard>
    );
  }

  console.log('[HistorialEstados] Rendering historial with', historial.length, 'entries');

  return (
    <NeumorphicCard className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={20} className="text-blue-500" />
        <h3 className="font-semibold text-lg">Historial de Estados</h3>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {/* Estado actual */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex-shrink-0">
            <div className={`p-2 rounded-full ${getEstadoColor(estadoActual)}`}>
              {getEstadoIcon(estadoActual)}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-700 dark:text-blue-300">
                {getEstadoLabel(estadoActual)}
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 rounded-full">
                Actual
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">Estado vigente</p>
          </div>
        </div>

        {/* Historial de cambios */}
        {historial.map((cambio, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${getEstadoColor(cambio.estado_anterior)}`}>
                {getEstadoIcon(cambio.estado_anterior)}
              </div>
              <ArrowRight size={14} className="text-gray-400" />
              <div className={`p-1.5 rounded-full ${getEstadoColor(cambio.estado_nuevo)}`}>
                {getEstadoIcon(cambio.estado_nuevo)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {getEstadoLabel(cambio.estado_anterior)} → {getEstadoLabel(cambio.estado_nuevo)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={12} />
                <span>{formatFecha(cambio.fecha)}</span>
                {cambio.usuario && (
                  <>
                    <span>•</span>
                    <span className="font-medium">{cambio.usuario}</span>
                  </>
                )}
              </div>
              
              {cambio.motivo && (
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                  "{cambio.motivo}"
                </p>
              )}
              
              {cambio.resumen_momento && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-300 dark:border-blue-600">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                    📋 Resumen del momento:
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {cambio.resumen_momento}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </NeumorphicCard>
  );
};

export default HistorialEstados;
