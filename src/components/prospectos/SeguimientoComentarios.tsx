import React, { useState } from 'react';
import { MessageCircle, User, Clock, Plus, Send, Sparkles, Maximize2 } from 'lucide-react';
import Modal from '../ui/Modal';

// Componente NeumorphicCard local
const NeumorphicCard: React.FC<{ children: React.ReactNode; className?: string; }> = ({ children, className }) => (
  <div className={`bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${className || ''}`}>
    {children}
  </div>
);

interface Comentario {
  content: string;
  timestamp: string;
  author: string;
  type?: 'manual' | 'ia_auto'; // Tipo de comentario: manual (usuario) o ia_auto (IA)
  metadata?: {
    score_interes?: number;
    sentimiento?: string;
    estado_embudo?: string;
  };
}

interface SeguimientoComentariosProps {
  comentarios: Comentario[];
  onAgregarComentario: (comentario: { content: string; author: string }) => void;
  loading?: boolean;
  currentUser?: { nombre: string; email: string; rol: string } | null;
}

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

// Componente para renderizar un comentario individual
const ComentarioItem: React.FC<{ comentario: Comentario; showFullContent?: boolean }> = ({ comentario, showFullContent = false }) => {
  const isIA = comentario.type === 'ia_auto';
  const bgColor = isIA ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800/50';
  const borderColor = isIA ? 'border-blue-200 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700';
  const iconBg = isIA ? 'bg-blue-500' : 'bg-green-500';
  const icon = isIA ? <Sparkles size={14} className="text-white" /> : <User size={14} className="text-white" />;
  
  return (
    <div className={`p-3 ${bgColor} rounded-lg border ${borderColor}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {comentario.author}
            </span>
            
            {/* Etiqueta IA/Manual */}
            {isIA ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500 text-white flex items-center gap-1">
                <Sparkles size={10} />
                IA
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white flex items-center gap-1">
                <User size={10} />
                Manual
              </span>
            )}
            
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={12} />
              <span>{formatFecha(comentario.timestamp)}</span>
            </div>
          </div>
          
          <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${showFullContent ? '' : 'line-clamp-2'}`}>
            {comentario.content}
          </p>
          
          {/* Metadata de IA (si existe) */}
          {isIA && comentario.metadata && (
            <div className="mt-2 flex gap-2 text-xs flex-wrap">
              {comentario.metadata.score_interes !== undefined && (
                <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300">
                  Score: {comentario.metadata.score_interes}%
                </span>
              )}
              {comentario.metadata.sentimiento && (
                <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300">
                  {comentario.metadata.sentimiento}
                </span>
              )}
              {comentario.metadata.estado_embudo && (
                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300">
                  {comentario.metadata.estado_embudo}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SeguimientoComentarios: React.FC<SeguimientoComentariosProps> = ({ 
  comentarios = [], 
  onAgregarComentario, 
  loading = false,
  currentUser
}) => {
  const [showForm, setShowForm] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevoComentario.trim()) {
      alert('Por favor, escribe un comentario');
      return;
    }

    // Usar el nombre del usuario logueado automáticamente
    const nombreAutor = currentUser?.nombre || 'Usuario';

    onAgregarComentario({
      content: nuevoComentario.trim(),
      author: nombreAutor
    });

    // Limpiar formulario
    setNuevoComentario('');
    setShowForm(false);
  };

  const handleCancel = () => {
    setNuevoComentario('');
    setShowForm(false);
  };

  return (
    <>
      {/* Vista compacta en la columna */}
      <NeumorphicCard className="p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-green-500" />
            <h3 className="font-semibold text-lg">Seguimiento</h3>
          </div>
          <div className="flex items-center gap-2">
            {comentarios.length > 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                title="Expandir vista completa"
              >
                <Maximize2 size={14} />
                Expandir
              </button>
            )}
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
            >
              <Plus size={14} />
              Agregar
            </button>
          </div>
        </div>

        {/* Formulario para nuevo comentario */}
        {showForm && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Mostrar nombre del usuario actual */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Comentario de:</span> {currentUser?.nombre || 'Usuario'}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comentario
                </label>
                <textarea
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  placeholder="Escribe aquí tu comentario o nota de seguimiento..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-green-500 transition-all text-sm resize-none"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !nuevoComentario.trim()}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
                >
                  <Send size={14} />
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-2 text-sm bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista resumida - solo últimas 3 entradas */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {comentarios.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center gap-2">
                <MessageCircle size={16} className="opacity-50" />
                No hay comentarios de seguimiento
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Agrega notas, observaciones o próximos pasos
              </p>
            </div>
          ) : (
            [...comentarios].reverse().slice(0, 3).map((comentario, index) => (
              <ComentarioItem key={index} comentario={comentario} showFullContent={false} />
            ))
          )}
        </div>

        {comentarios.length > 3 && (
          <div className="mt-3 text-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Ver todos los {comentarios.length} comentarios →
            </button>
          </div>
        )}
        
        {comentarios.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{comentarios.length} total</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {comentarios.filter(c => c.type === 'ia_auto').length} IA
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {comentarios.filter(c => c.type !== 'ia_auto').length} Manual
              </span>
            </div>
          </div>
        )}
      </NeumorphicCard>

      {/* Modal expandido con historial completo */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="📝 Historial Completo de Seguimiento"
        size="lg"
      >
        <div className="space-y-4">
          {/* Estadísticas */}
          <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{comentarios.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{comentarios.filter(c => c.type === 'ia_auto').length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">IA Automático</p>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{comentarios.filter(c => c.type !== 'ia_auto').length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manual</p>
            </div>
          </div>

          {/* Formulario en modal (si está activo) */}
          {showForm && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Mostrar nombre del usuario actual */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Comentario de:</span> {currentUser?.nombre || 'Usuario'}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comentario
                  </label>
                  <textarea
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe aquí tu comentario o nota de seguimiento..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-green-500 transition-all text-sm resize-none"
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || !nuevoComentario.trim()}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
                  >
                    <Send size={14} />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Botón agregar en modal (si no está el form) */}
          {!showForm && (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 mx-auto px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
              >
                <Plus size={16} />
                Agregar Comentario Manual
              </button>
            </div>
          )}

          {/* Lista completa de comentarios en el modal */}
          <div className="space-y-3">
            {comentarios.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No hay comentarios de seguimiento</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Agrega notas, observaciones o próximos pasos
                </p>
              </div>
            ) : (
              [...comentarios].reverse().map((comentario, index) => (
                <ComentarioItem key={index} comentario={comentario} showFullContent={true} />
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SeguimientoComentarios;