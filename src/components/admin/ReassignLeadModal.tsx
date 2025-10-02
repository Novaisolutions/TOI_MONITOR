import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ViewLeadCompleto, UsuarioTOI } from '../../types/database';
import { X, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

interface ReassignLeadModalProps {
  lead: ViewLeadCompleto;
  asesores: UsuarioTOI[];
  currentUser: UsuarioTOI;
  onClose: () => void;
  onSuccess: () => void;
}

const ReassignLeadModal: React.FC<ReassignLeadModalProps> = ({
  lead,
  asesores,
  currentUser,
  onClose,
  onSuccess
}) => {
  const [selectedAsesor, setSelectedAsesor] = useState<string>('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReassign = async () => {
    if (!selectedAsesor) {
      setError('Selecciona un asesor');
      return;
    }

    if (!motivo.trim()) {
      setError('Ingresa un motivo para la reasignación');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const selectedAsesorData = asesores.find(a => a.id === selectedAsesor);
      
      const { data, error: rpcError } = await supabase.rpc('reassign_lead_manual', {
        p_lead_id: lead.id,
        p_new_asesor_email: selectedAsesorData?.email,
        p_admin_email: currentUser.email,
        p_motivo: motivo
      });

      if (rpcError) throw rpcError;

      if (data && data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        throw new Error(data?.message || 'Error al reasignar');
      }
    } catch (err: any) {
      console.error('Error reasignando lead:', err);
      setError(err.message || 'Error al reasignar el lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus size={24} />
            Reasignar Lead
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ¡Lead Reasignado!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                El lead ha sido reasignado exitosamente
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Lead Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Lead a reasignar:</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {lead.nombre || 'Sin nombre'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{lead.numero_telefono}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Actualmente asignado a: <span className="font-medium">{lead.asesor_nombre || 'Sin asignar'}</span>
                </div>
              </div>

              {/* Nuevo Asesor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nuevo Asesor *
                </label>
                <select
                  value={selectedAsesor}
                  onChange={(e) => setSelectedAsesor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={loading}
                >
                  <option value="">Selecciona un asesor...</option>
                  {asesores
                    .filter(a => a.id !== lead.assigned_to)
                    .map(asesor => (
                      <option key={asesor.id} value={asesor.id}>
                        {asesor.nombre} ({asesor.total_leads_asignados} leads)
                      </option>
                    ))}
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo de la reasignación *
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: Cliente prefiere horario de mañana..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  disabled={loading}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleReassign}
                disabled={loading || !selectedAsesor || !motivo.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Reasignando...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Reasignar Lead
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReassignLeadModal;

