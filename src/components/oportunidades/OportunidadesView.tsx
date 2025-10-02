import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ViewOportunidadCompleta } from '../../types/database';
import { Briefcase, Search, RefreshCw, Plus, DollarSign, TrendingUp, Calendar, User, MessageSquare, Users } from 'lucide-react';

interface OportunidadesViewProps {
  currentUser: { id: string; email: string; nombre: string; rol: string; activo: boolean };
  isAdmin: boolean;
  onNavigateToMessages?: (numeroTelefono: string) => void;
  onNavigateToProspectos?: (numeroTelefono: string) => void;
}

const OportunidadesView: React.FC<OportunidadesViewProps> = ({ 
  currentUser, 
  isAdmin, 
  onNavigateToMessages, 
  onNavigateToProspectos 
}) => {
  const [oportunidades, setOportunidades] = useState<ViewOportunidadCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('abierta');
  const [filterEtapa, setFilterEtapa] = useState<string>('all');

  const fetchOportunidades = async () => {
    try {
      setLoading(true);
      console.log('[OportunidadesView] 🔍 Fetching oportunidades for user:', currentUser.email, 'Admin:', isAdmin);
      
      let query = supabase
        .from('view_oportunidades_completo')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterEstado !== 'all') {
        query = query.eq('estado', filterEstado);
      }

      if (filterEtapa !== 'all') {
        query = query.eq('etapa', filterEtapa);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[OportunidadesView] ❌ Error fetching oportunidades:', error);
        throw error;
      }
      
      console.log('[OportunidadesView] ✅ Oportunidades fetched:', data?.length || 0);
      console.log('[OportunidadesView] Sample data:', data?.slice(0, 2));
      setOportunidades(data || []);
    } catch (error) {
      console.error('[OportunidadesView] ❌ Exception:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOportunidades();
  }, [filterEstado, filterEtapa]);

  const filteredOportunidades = oportunidades.filter(opp => {
    const searchLower = searchTerm.toLowerCase();
    return (
      opp.folio?.toLowerCase().includes(searchLower) ||
      opp.lead_nombre?.toLowerCase().includes(searchLower) ||
      opp.numero_telefono?.includes(searchLower) ||
      opp.descripcion?.toLowerCase().includes(searchLower)
    );
  });

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      abierta: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      ganada: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      perdida: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      pausada: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      cancelada: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return colors[estado] || colors.abierta;
  };

  const getEtapaColor = (etapa: string) => {
    const colors: Record<string, string> = {
      contacto_inicial: 'bg-purple-100 text-purple-800',
      calificacion: 'bg-blue-100 text-blue-800',
      presentacion: 'bg-indigo-100 text-indigo-800',
      propuesta: 'bg-yellow-100 text-yellow-800',
      negociacion: 'bg-orange-100 text-orange-800',
      cierre: 'bg-green-100 text-green-800',
      postventa: 'bg-teal-100 text-teal-800',
    };
    return colors[etapa] || colors.contacto_inicial;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalPipeline = filteredOportunidades
    .filter(o => o.estado === 'abierta')
    .reduce((sum, o) => sum + (o.valor_estimado || 0), 0);

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900 mr-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase size={28} />
              {isAdmin ? 'Todas las Oportunidades' : 'Mis Oportunidades'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gestiona el pipeline de ventas con folios únicos
            </p>
          </div>
          <button
            onClick={fetchOportunidades}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por folio, cliente, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="abierta">Abiertas</option>
            <option value="ganada">Ganadas</option>
            <option value="perdida">Perdidas</option>
            <option value="pausada">Pausadas</option>
          </select>

          <select
            value={filterEtapa}
            onChange={(e) => setFilterEtapa(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todas las etapas</option>
            <option value="contacto_inicial">Contacto Inicial</option>
            <option value="calificacion">Calificación</option>
            <option value="presentacion">Presentación</option>
            <option value="propuesta">Propuesta</option>
            <option value="negociacion">Negociación</option>
            <option value="cierre">Cierre</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{oportunidades.length}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {oportunidades.filter(o => o.estado === 'abierta').length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Abiertas</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {oportunidades.filter(o => o.estado === 'ganada').length}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Ganadas</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(totalPipeline)}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Pipeline</div>
          </div>
        </div>
      </div>

      {/* Oportunidades Table */}
      <div className="flex-1 overflow-auto p-6 w-full">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
            <p className="text-gray-500">Cargando oportunidades...</p>
          </div>
        ) : filteredOportunidades.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-500">No se encontraron oportunidades</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Folio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Etapa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Asesor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOportunidades.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                        {opp.folio}
                      </div>
                      <div className="text-xs text-gray-500">Prob: {opp.probabilidad}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {opp.lead_nombre || 'Sin nombre'}
                      </div>
                      <div className="text-xs text-gray-500">{opp.numero_telefono}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {opp.tipo?.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                        <DollarSign size={14} />
                        {formatCurrency(opp.valor_estimado)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEtapaColor(opp.etapa)}`}>
                        {opp.etapa?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(opp.estado)}`}>
                        {opp.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {opp.asesor_nombre || 'Sin asignar'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(opp.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onNavigateToMessages && opp.numero_telefono && (
                          <button
                            onClick={() => onNavigateToMessages(opp.numero_telefono)}
                            className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                            title="Ver conversación"
                          >
                            <MessageSquare size={14} />
                          </button>
                        )}
                        {onNavigateToProspectos && opp.numero_telefono && (
                          <button
                            onClick={() => onNavigateToProspectos(opp.numero_telefono)}
                            className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 transition-colors"
                            title="Ver prospecto"
                          >
                            <Users size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OportunidadesView;

