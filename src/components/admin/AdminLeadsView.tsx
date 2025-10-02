import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ViewLeadCompleto, UsuarioTOI } from '../../types/database';
import { Users, Search, RefreshCw, UserPlus, MoreVertical, Phone, Mail, Calendar, LayoutGrid } from 'lucide-react';
import ReassignLeadModal from './ReassignLeadModal';
import KanbanLeadsView from './KanbanLeadsView';

interface AdminLeadsViewProps {
  currentUser: UsuarioTOI;
}

const AdminLeadsView: React.FC<AdminLeadsViewProps> = ({ currentUser }) => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [leads, setLeads] = useState<ViewLeadCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsesor, setFilterAsesor] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [asesores, setAsesores] = useState<UsuarioTOI[]>([]);
  const [selectedLead, setSelectedLead] = useState<ViewLeadCompleto | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      console.log('[AdminLeadsView] 🔍 Fetching leads...');
      
      let query = supabase
        .from('view_leads_completo')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterAsesor !== 'all') {
        query = query.eq('asesor_id', filterAsesor);
      }

      if (filterEstado !== 'all') {
        query = query.eq('estado_general', filterEstado);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[AdminLeadsView] ❌ Error fetching leads:', error);
        throw error;
      }
      
      console.log('[AdminLeadsView] ✅ Leads fetched:', data?.length || 0);
      console.log('[AdminLeadsView] Sample data:', data?.slice(0, 2));
      setLeads(data || []);
    } catch (error) {
      console.error('[AdminLeadsView] ❌ Exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAsesores = async () => {
    const { data } = await supabase
      .from('usuarios_toi')
      .select('*')
      .eq('rol', 'asesor')
      .eq('activo', true)
      .order('nombre');
    
    setAsesores(data || []);
  };

  useEffect(() => {
    fetchLeads();
    fetchAsesores();
  }, [filterAsesor, filterEstado]);

  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.nombre?.toLowerCase().includes(searchLower) ||
      lead.numero_telefono?.includes(searchLower) ||
      lead.asesor_nombre?.toLowerCase().includes(searchLower)
    );
  });

  const handleReassign = (lead: ViewLeadCompleto) => {
    setSelectedLead(lead);
    setShowReassignModal(true);
  };

  const handleReassignSuccess = () => {
    setShowReassignModal(false);
    fetchLeads();
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      nuevo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      contactado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      calificado: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      en_atencion: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      cliente: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      perdido: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      pausado: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colors[estado] || colors.nuevo;
  };

  // Renderizar vista según el modo seleccionado
  if (viewMode === 'kanban') {
    return <KanbanLeadsView currentUser={currentUser} onViewModeChange={setViewMode} />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={28} />
              Panel de Administración - Leads
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gestiona todos los leads y asignaciones
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Vista de Tabla"
              >
                <Users size={16} className="inline mr-1" />
                Tabla
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Vista Kanban"
              >
                <LayoutGrid size={16} className="inline mr-1" />
                Kanban
              </button>
            </div>
            
            <button
              onClick={fetchLeads}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Actualizar"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filterAsesor}
            onChange={(e) => setFilterAsesor(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los asesores</option>
            {asesores.map(asesor => (
              <option key={asesor.id} value={asesor.id}>{asesor.nombre}</option>
            ))}
          </select>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="calificado">Calificado</option>
            <option value="en_atencion">En Atención</option>
            <option value="cliente">Cliente</option>
            <option value="perdido">Perdido</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{leads.length}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total Leads</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {leads.filter(l => l.estado_general === 'en_atencion').length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">En Atención</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {leads.filter(l => l.estado_general === 'nuevo').length}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Nuevos</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {leads.reduce((sum, l) => sum + l.oportunidades_abiertas, 0)}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Oportunidades</div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
            <p className="text-gray-500">Cargando leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-500">No se encontraron leads</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden w-full max-w-full">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Asesor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Oportunidades</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{lead.nombre || 'Sin nombre'}</div>
                      <div className="text-xs text-gray-500">ID: {lead.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Phone size={12} />
                          {lead.numero_telefono}
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail size={12} />
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(lead.estado_general)}`}>
                        {lead.estado_general}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {lead.asesor_nombre?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {lead.asesor_nombre || 'Sin asignar'}
                          </div>
                          {lead.assigned_at && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(lead.assigned_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {lead.oportunidades_abiertas} abiertas
                        </span>
                        {lead.oportunidades_ganadas > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {lead.oportunidades_ganadas} ganadas
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleReassign(lead)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <UserPlus size={14} />
                        Reasignar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reassign Modal */}
      {showReassignModal && selectedLead && (
        <ReassignLeadModal
          lead={selectedLead}
          asesores={asesores}
          currentUser={currentUser}
          onClose={() => setShowReassignModal(false)}
          onSuccess={handleReassignSuccess}
        />
      )}
    </div>
  );
};

export default AdminLeadsView;

