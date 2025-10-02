import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { UsuarioTOI, ViewLeadCompleto, OportunidadTOI } from '../../types/database';
import { Users, Phone, Mail, TrendingUp, ExternalLink, RefreshCw, Briefcase, ChevronDown, ChevronUp, GripVertical, LayoutGrid } from 'lucide-react';
import { useNavigate } from '../../hooks/useRouter';

interface KanbanLeadsViewProps {
  currentUser: UsuarioTOI;
  onViewModeChange?: (mode: 'table' | 'kanban') => void;
}

interface LeadWithOportunidades extends ViewLeadCompleto {
  oportunidades?: OportunidadTOI[];
}

interface AsesorWithLeads {
  asesor: UsuarioTOI;
  leads: LeadWithOportunidades[];
}

const KanbanLeadsView: React.FC<KanbanLeadsViewProps> = ({ currentUser, onViewModeChange }) => {
  const [asesoresData, setAsesoresData] = useState<AsesorWithLeads[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOportunidades, setExpandedOportunidades] = useState<Set<number>>(new Set());
  const [draggedLead, setDraggedLead] = useState<ViewLeadCompleto | null>(null);
  const [dragOverAsesor, setDragOverAsesor] = useState<string | null>(null);

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      console.log('[KanbanLeadsView] 📊 Fetching Kanban data...');

      // 1. Obtener todos los asesores activos
      const { data: asesores, error: asesoresError } = await supabase
        .from('usuarios_toi')
        .select('*')
        .eq('rol', 'asesor')
        .eq('activo', true)
        .order('nombre');

      if (asesoresError) throw asesoresError;

      // 2. Obtener todos los leads con info completa
      const { data: allLeads, error: leadsError } = await supabase
        .from('view_leads_completo')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // 3. Obtener oportunidades para cada lead
      const { data: oportunidades, error: oppsError } = await supabase
        .from('oportunidades_toi')
        .select('*')
        .eq('estado', 'abierta')
        .order('created_at', { ascending: false });

      if (oppsError) throw oppsError;

      // Mapear oportunidades a sus leads
      const leadsWithOpps: LeadWithOportunidades[] = (allLeads || []).map(lead => ({
        ...lead,
        oportunidades: (oportunidades || []).filter(opp => opp.lead_id === lead.lead_id)
      }));

      // 4. Agrupar leads por asesor
      const grouped: AsesorWithLeads[] = (asesores || []).map(asesor => ({
        asesor,
        leads: leadsWithOpps.filter(lead => lead.asesor_id === asesor.id)
      }));

      // 5. Agregar columna para leads sin asignar
      const unassignedLeads = leadsWithOpps.filter(lead => !lead.asesor_id);
      if (unassignedLeads.length > 0) {
        grouped.unshift({
          asesor: {
            id: 'unassigned',
            email: 'sin-asignar',
            nombre: 'Sin Asignar',
            rol: 'asesor',
            activo: true,
          } as any,
          leads: unassignedLeads
        });
      }

      console.log('[KanbanLeadsView] ✅ Grouped data:', grouped.length, 'columns');
      setAsesoresData(grouped);
      
      // Las oportunidades estarán plegadas por defecto (no expandir automáticamente)
    } catch (error) {
      console.error('[KanbanLeadsView] ❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanbanData();
  }, []);

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      nuevo: 'bg-blue-500',
      contactado: 'bg-yellow-500',
      calificado: 'bg-purple-500',
      en_atencion: 'bg-orange-500',
      cliente: 'bg-green-500',
      perdido: 'bg-red-500',
      pausado: 'bg-gray-500',
    };
    return colors[estado] || 'bg-gray-400';
  };

  const handleLeadClick = (lead: ViewLeadCompleto) => {
    // Navegar a la vista de prospectos y abrir el lead
    console.log('[KanbanLeadsView] 🔗 Navigating to lead:', lead.lead_id);
    window.location.href = `/prospectos?lead=${lead.lead_id}`;
  };

  const toggleOportunidades = (leadId: number) => {
    const newExpanded = new Set(expandedOportunidades);
    if (newExpanded.has(leadId)) {
      newExpanded.delete(leadId);
    } else {
      newExpanded.add(leadId);
    }
    setExpandedOportunidades(newExpanded);
  };

  const handleDragStart = (e: React.DragEvent, lead: ViewLeadCompleto) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.lead_id.toString());
  };

  const handleDragOver = (e: React.DragEvent, asesorId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverAsesor(asesorId);
  };

  const handleDragLeave = () => {
    setDragOverAsesor(null);
  };

  const handleDrop = async (e: React.DragEvent, targetAsesorId: string) => {
    e.preventDefault();
    
    if (!draggedLead || draggedLead.asesor_id === targetAsesorId) {
      setDraggedLead(null);
      setDragOverAsesor(null);
      return;
    }

    try {
      // Actualizar el lead en la base de datos
      const { error } = await supabase
        .from('leads_toi')
        .update({ 
          assigned_to: targetAsesorId,
          assigned_at: new Date().toISOString()
        })
        .eq('id', draggedLead.lead_id);

      if (error) throw error;

      // Actualizar el estado local
      setAsesoresData(prev => 
        prev.map(column => {
          if (column.asesor.id === draggedLead.asesor_id) {
            // Remover el lead de la columna origen
            return {
              ...column,
              leads: column.leads.filter(l => l.lead_id !== draggedLead.lead_id)
            };
          } else if (column.asesor.id === targetAsesorId) {
            // Agregar el lead a la columna destino
            const updatedLead = { ...draggedLead, asesor_id: targetAsesorId };
            return {
              ...column,
              leads: [...column.leads, updatedLead]
            };
          }
          return column;
        })
      );

      console.log(`[KanbanLeadsView] ✅ Lead ${draggedLead.lead_id} reassigned to asesor ${targetAsesorId}`);
    } catch (error) {
      console.error('[KanbanLeadsView] ❌ Error reassigning lead:', error);
    } finally {
      setDraggedLead(null);
      setDragOverAsesor(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600 dark:text-gray-400">Cargando Kanban...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={28} className="text-purple-600" />
              Panel de Administración - Leads
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Vista Kanban organizada por columnas de asesores
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange?.('table')}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                title="Vista de Tabla"
              >
                <Users size={16} className="inline mr-1" />
                Tabla
              </button>
              <button
                onClick={() => onViewModeChange?.('kanban')}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                title="Vista Kanban"
              >
                <LayoutGrid size={16} className="inline mr-1" />
                Kanban
              </button>
            </div>
            
            <button
              onClick={fetchKanbanData}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Actualizar"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Stats Resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {asesoresData.reduce((sum, col) => sum + col.leads.length, 0)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total Leads</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {asesoresData.length - 1}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Asesores</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {asesoresData.reduce((sum, col) => 
                sum + col.leads.filter(l => l.estado_general === 'en_atencion').length, 0
              )}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">En Atención</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {asesoresData.reduce((sum, col) => sum + col.leads.reduce((s, l) => s + l.oportunidades_abiertas, 0), 0)}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Oportunidades</div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 w-full">
        <div className="flex gap-3 h-full min-w-max pb-4">
          {asesoresData.map((column) => (
            <div
              key={column.asesor.id}
              className={`flex flex-col w-72 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-all ${
                dragOverAsesor === column.asesor.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.asesor.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.asesor.id)}
            >
              {/* Columna Header */}
              <div className="p-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 text-sm font-medium">
                      {column.asesor.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {column.asesor.nombre}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {column.leads.length} leads
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leads Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {column.leads.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users size={24} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs">Sin leads</p>
                  </div>
                ) : (
                  column.leads.map((lead) => (
                    <div
                      key={lead.lead_id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead)}
                      className={`group bg-white dark:bg-gray-700/30 p-2.5 rounded border border-gray-100 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all cursor-pointer ${
                        draggedLead?.lead_id === lead.lead_id ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Lead Header */}
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <GripVertical 
                            size={12} 
                            className="text-gray-400 hover:text-gray-600 cursor-move flex-shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="text-sm font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600"
                              onClick={() => handleLeadClick(lead)}
                            >
                              {lead.nombre || 'Sin nombre'}
                            </h4>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <Phone size={11} />
                              <span className="font-mono text-xs">{lead.numero_telefono}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-700/50">
                        {/* Estado */}
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getEstadoColor(lead.estado_general)}`}></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {lead.estado_general?.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Oportunidades Toggle */}
                        {(lead.oportunidades?.length || 0) > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOportunidades(lead.lead_id);
                            }}
                            className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded px-1.5 py-1 transition-colors"
                          >
                            <Briefcase size={11} className="text-purple-500" />
                            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                              {lead.oportunidades?.length}
                            </span>
                            {expandedOportunidades.has(lead.lead_id) ? (
                              <ChevronUp size={10} className="text-gray-500" />
                            ) : (
                              <ChevronDown size={10} className="text-gray-500" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Oportunidades - Folios (Expandible) */}
                      {lead.oportunidades && lead.oportunidades.length > 0 && expandedOportunidades.has(lead.lead_id) && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50 space-y-1">
                          {lead.oportunidades.map((opp) => (
                            <div
                              key={opp.id}
                              className="flex items-center justify-between px-2 py-1.5 bg-purple-50 dark:bg-purple-900/10 rounded text-xs hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                            >
                              <span className="font-mono text-purple-700 dark:text-purple-300 font-medium">
                                {opp.folio}
                              </span>
                              {opp.valor_estimado && (
                                <span className="text-purple-600 dark:text-purple-400">
                                  ${(opp.valor_estimado / 1000000).toFixed(1)}M
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanLeadsView;

