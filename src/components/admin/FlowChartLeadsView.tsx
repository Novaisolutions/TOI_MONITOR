import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UsuarioTOI, ViewLeadCompleto } from '../../types/database';
import { Users, TrendingUp, RefreshCw, Phone, ExternalLink } from 'lucide-react';

interface FlowChartLeadsViewProps {
  currentUser: UsuarioTOI;
}

interface AsesorNode {
  asesor: UsuarioTOI;
  leads: ViewLeadCompleto[];
  x: number;
  y: number;
}

const FlowChartLeadsView: React.FC<FlowChartLeadsViewProps> = ({ currentUser }) => {
  const [nodes, setNodes] = useState<AsesorNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlowData = async () => {
    try {
      setLoading(true);
      console.log('[FlowChartLeadsView] 🌐 Fetching flow data...');

      // 1. Obtener asesores
      const { data: asesores, error: asesoresError } = await supabase
        .from('usuarios_toi')
        .select('*')
        .eq('rol', 'asesor')
        .eq('activo', true)
        .order('nombre');

      if (asesoresError) throw asesoresError;

      // 2. Obtener leads
      const { data: allLeads, error: leadsError } = await supabase
        .from('view_leads_completo')
        .select('*');

      if (leadsError) throw leadsError;

      // 3. Crear nodos en círculo
      const centerX = 400;
      const centerY = 300;
      const radius = 200;
      const angleStep = (2 * Math.PI) / (asesores?.length || 1);

      const flowNodes: AsesorNode[] = (asesores || []).map((asesor, index) => {
        const angle = index * angleStep - Math.PI / 2; // Empezar desde arriba
        return {
          asesor,
          leads: (allLeads || []).filter(l => l.assigned_to === asesor.id),
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });

      console.log('[FlowChartLeadsView] ✅ Flow nodes created:', flowNodes.length);
      setNodes(flowNodes);
    } catch (error) {
      console.error('[FlowChartLeadsView] ❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlowData();
  }, []);

  const handleLeadClick = (leadId: number) => {
    window.location.href = `/prospectos?lead=${leadId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600 dark:text-gray-400">Cargando diagrama...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={28} className="text-purple-600" />
              Flow Chart - Red de Asignaciones
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visualización de la distribución de leads
            </p>
          </div>
          <button
            onClick={fetchFlowData}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* SVG Flow Chart */}
      <div className="flex-1 overflow-auto p-4">
        <div className="relative w-full h-full min-h-[700px]">
          <svg className="w-full h-full" viewBox="0 0 800 600">
            {/* Conexiones sutiles desde el centro a cada asesor */}
            {nodes.map((node, nodeIndex) => (
              <line
                key={`center-line-${nodeIndex}`}
                x1="400"
                y1="300"
                x2={node.x}
                y2={node.y}
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="1"
                strokeDasharray="2,4"
                opacity="0.4"
              />
            ))}

            {/* Conexiones finas de asesores a sus leads */}
            {nodes.map((node, nodeIndex) =>
              node.leads.slice(0, 5).map((lead, leadIndex) => {
                const leadX = node.x + (leadIndex - 2) * 11;
                const leadY = node.y + 70;
                return (
                  <line
                    key={`line-${nodeIndex}-${leadIndex}`}
                    x1={node.x}
                    y1={node.y + 8}
                    x2={leadX}
                    y2={leadY}
                    stroke="currentColor"
                    className="text-gray-300 dark:text-gray-600"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                );
              })
            )}
          </svg>

          {/* Nodos de Asesores */}
          {nodes.map((node, index) => (
            <div
              key={node.asesor.id}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="flex flex-col items-center"
            >
              {/* Avatar del Asesor - Minimalista */}
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 text-lg font-medium shadow-sm">
                  {node.asesor.nombre.charAt(0)}
                </div>
                {/* Badge de leads count - Minimalista */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center text-white dark:text-gray-900 text-[10px] font-medium">
                  {node.leads.length}
                </div>
              </div>

              {/* Nombre del Asesor */}
              <div className="mt-2 bg-white dark:bg-gray-800 px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-900 dark:text-white text-center">
                  {node.asesor.nombre}
                </p>
              </div>

              {/* Mini cards de leads - Más finas */}
              <div className="mt-3 flex gap-1">
                {node.leads.slice(0, 5).map((lead, leadIndex) => (
                  <div
                    key={lead.id}
                    onClick={() => handleLeadClick(lead.id)}
                    className="group/card w-10 h-10 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105 transition-all cursor-pointer flex items-center justify-center relative"
                    title={`${lead.nombre || 'Sin nombre'} - ${lead.numero_telefono}`}
                  >
                    <span className="text-[9px] text-gray-600 dark:text-gray-400 font-mono">
                      {lead.numero_telefono.slice(-4)}
                    </span>
                    {lead.oportunidades_abiertas > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                ))}
                {node.leads.length > 5 && (
                  <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <span className="text-[9px] text-gray-500 font-medium">
                      +{node.leads.length - 5}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Centro - Logo TOI Minimalista */}
          <div
            style={{
              position: 'absolute',
              left: '400px',
              top: '300px',
              transform: 'translate(-50%, -50%)',
            }}
            className="w-20 h-20 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 border-2 border-gray-200 dark:border-gray-800"
          >
            <div className="text-center">
              <div className="text-lg font-bold">TOI</div>
              <div className="text-[8px] opacity-70">CRM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowChartLeadsView;

