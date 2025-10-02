import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, DollarSign, Briefcase, Calendar, AlertCircle } from 'lucide-react';
import { UsuarioTOI } from '../../types/database';

interface CreateOportunidadModalProps {
  prospectoId: number;
  leadId: number | null;
  numeroTelefono: string;
  nombreProspecto: string;
  currentUser: UsuarioTOI;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOportunidadModal: React.FC<CreateOportunidadModalProps> = ({
  prospectoId,
  leadId,
  numeroTelefono,
  nombreProspecto,
  currentUser,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    tipo: 'venta_departamento' as const,
    descripcion: '',
    valor_estimado: '',
    probabilidad: 50,
    prioridad: 'media' as const,
    fecha_cierre_estimada: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('[CreateOportunidadModal] 🎫 Creando oportunidad...');
      
      const { data, error: insertError } = await supabase
        .from('oportunidades_toi')
        .insert({
          lead_id: leadId,
          prospecto_id: prospectoId,
          tipo: formData.tipo,
          descripcion: formData.descripcion || null,
          valor_estimado: formData.valor_estimado ? parseFloat(formData.valor_estimado) : null,
          probabilidad: formData.probabilidad,
          prioridad: formData.prioridad,
          fecha_cierre_estimada: formData.fecha_cierre_estimada || null,
          assigned_to: currentUser.id,
          assigned_by: currentUser.id,
          assigned_at: new Date().toISOString(),
          etapa: 'contacto_inicial',
          estado: 'abierta',
          moneda: 'MXN',
          dias_en_etapa: 0,
          total_interacciones: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('[CreateOportunidadModal] ✅ Oportunidad creada:', data.folio);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[CreateOportunidadModal] ❌ Error:', err);
      setError(err.message || 'Error al crear la oportunidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase size={24} className="text-purple-600" />
              Nueva Oportunidad
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Para: {nombreProspecto} ({numeroTelefono})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Tipo de Oportunidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Oportunidad *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="venta_departamento">Venta - Departamento</option>
              <option value="venta_casa">Venta - Casa</option>
              <option value="venta_terreno">Venta - Terreno</option>
              <option value="venta_comercial">Venta - Comercial</option>
              <option value="renta_departamento">Renta - Departamento</option>
              <option value="renta_casa">Renta - Casa</option>
              <option value="renta_oficina">Renta - Oficina</option>
              <option value="renta_local">Renta - Local</option>
              <option value="visita_showroom">Visita Showroom</option>
              <option value="cotizacion">Cotización</option>
              <option value="asesoria">Asesoría</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              placeholder="Detalles de la oportunidad..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valor Estimado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign size={16} className="inline mr-1" />
                Valor Estimado (MXN)
              </label>
              <input
                type="number"
                value={formData.valor_estimado}
                onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
                placeholder="5000000"
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Fecha Cierre Estimada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Fecha Cierre Estimada
              </label>
              <input
                type="date"
                value={formData.fecha_cierre_estimada}
                onChange={(e) => setFormData({ ...formData, fecha_cierre_estimada: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Probabilidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Probabilidad de Cierre: {formData.probabilidad}%
              </label>
              <input
                type="range"
                value={formData.probabilidad}
                onChange={(e) => setFormData({ ...formData, probabilidad: parseInt(e.target.value) })}
                min="0"
                max="100"
                step="5"
                className="w-full"
              />
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridad
              </label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </span>
              ) : (
                '🎫 Crear Oportunidad'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOportunidadModal;

