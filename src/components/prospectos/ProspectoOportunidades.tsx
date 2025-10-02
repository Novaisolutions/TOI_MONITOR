import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { OportunidadTOI, UsuarioTOI } from '../../types/database';
import { Briefcase, Plus, DollarSign, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import CreateOportunidadModal from '../oportunidades/CreateOportunidadModal';

interface ProspectoOportunidadesProps {
  prospectoId: number;
  numeroTelefono: string;
  currentUser: { nombre: string; email: string; rol: string } | null;
  isAdmin: boolean;
}

const ProspectoOportunidades: React.FC<ProspectoOportunidadesProps> = ({
  prospectoId,
  numeroTelefono,
  currentUser,
  isAdmin
}) => {
  const [oportunidades, setOportunidades] = useState<OportunidadTOI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchOportunidades = async () => {
    try {
      setLoading(true);
      console.log('[ProspectoOportunidades] 🔍 Fetching oportunidades for prospecto:', prospectoId);

      // Buscar oportunidades por lead_id o prospecto_id
      const { data, error } = await supabase
        .from('oportunidades_toi')
        .select('*')
        .or(`lead_id.eq.${prospectoId},prospecto_id.eq.${prospectoId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('[ProspectoOportunidades] ✅ Oportunidades found:', data?.length || 0);
      setOportunidades(data || []);
    } catch (error) {
      console.error('[ProspectoOportunidades] ❌ Error fetching oportunidades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prospectoId) {
      fetchOportunidades();
    }
  }, [prospectoId]);

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      abierta: 'bg-blue-100 text-blue-800 border-blue-200',
      ganada: 'bg-green-100 text-green-800 border-green-200',
      perdida: 'bg-red-100 text-red-800 border-red-200',
      pausada: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelada: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEtapaColor = (etapa: string) => {
    const colors: Record<string, string> = {
      contacto_inicial: 'bg-purple-50 border-purple-200',
      calificacion: 'bg-blue-50 border-blue-200',
      presentacion: 'bg-indigo-50 border-indigo-200',
      propuesta: 'bg-orange-50 border-orange-200',
      negociacion: 'bg-yellow-50 border-yellow-200',
      cierre: 'bg-green-50 border-green-200',
      postventa: 'bg-emerald-50 border-emerald-200'
    };
    return colors[etapa] || 'bg-gray-50 border-gray-200';
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase size={18} className="text-purple-600" />
          <h3 className="font-medium text-gray-900 dark:text-white">Oportunidades</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-purple-600" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Oportunidades ({oportunidades.length})
            </h3>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus size={14} />
              Crear
            </button>
          )}
        </div>
      </div>

      {/* Lista de Oportunidades */}
      <div className="p-4">
        {oportunidades.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay oportunidades</p>
            {isAdmin && (
              <p className="text-xs mt-1">Crea una oportunidad para este prospecto</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {oportunidades.map((oportunidad) => (
              <div
                key={oportunidad.id}
                className={`p-3 rounded-lg border ${getEtapaColor(oportunidad.etapa)} hover:shadow-sm transition-shadow cursor-pointer group`}
              >
                {/* Folio y Estado */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-purple-700 dark:text-purple-300">
                      {oportunidad.folio}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getEstadoColor(oportunidad.estado)}`}>
                      {oportunidad.estado}
                    </span>
                  </div>
                  <ExternalLink size={12} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>

                {/* Tipo y Descripción */}
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {oportunidad.tipo.replace(/_/g, ' ')}
                  </h4>
                  {oportunidad.descripcion && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {oportunidad.descripcion}
                    </p>
                  )}
                </div>

                {/* Valor y Etapa */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign size={12} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {oportunidad.valor_estimado ? `$${(oportunidad.valor_estimado / 1000000).toFixed(1)}M` : 'No definido'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} className="text-blue-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {oportunidad.etapa.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Fechas */}
                {oportunidad.fecha_cierre_estimada && (
                  <div className="mt-2 flex items-center gap-1">
                    <Calendar size={10} className="text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Cierre: {new Date(oportunidad.fecha_cierre_estimada).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear oportunidad */}
      {showCreateModal && (
        <CreateOportunidadModal
          prospectoId={prospectoId}
          numeroTelefono={numeroTelefono}
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchOportunidades();
          }}
        />
      )}
    </div>
  );
};

export default ProspectoOportunidades;
