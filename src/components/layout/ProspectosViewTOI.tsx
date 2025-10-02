import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Edit2, Trash2, Search, User, MapPin, Clock, Phone, Home, Hotel,
  Calendar, MessageCircle, Zap, ArrowUp, ArrowDown, Minus, ChevronDown, ChevronUp,
  Sparkles, Tag, FileText, List, X, Briefcase, HelpCircle, MessageSquare, Timer, 
  Activity, RefreshCw, Building, DollarSign, Bed, Bath, Square, Users, CheckCircle,
  XCircle, CheckCircle2, Banknote, FileCheck, PenTool, Key, Handshake, Info,
  ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import CanalIcon from '../ui/CanalIcon';
import useProspectosTOI from '../../hooks/useProspectosTOI';
import { useResizableColumns } from '../../hooks/useResizableColumns';
import { ProspectoTOI, ConversacionTOI } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { normalizeEstadoEmbudo } from '../../lib/utils';
import HistorialEstados from '../prospectos/HistorialEstados';
import SeguimientoComentarios from '../prospectos/SeguimientoComentarios';
import ProspectoOportunidades from '../prospectos/ProspectoOportunidades';
import ResizeHandle from '../ui/ResizeHandle';

// Hook auxiliar para obtener el valor previo de una prop o estado
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

type Note = { content: string; created_at: string; author: string };

const NeumorphicCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-md dark:shadow-lg dark:shadow-black/10 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${className || ''} ${onClick ? 'cursor-pointer' : ''}`}
  >
    {children}
  </div>
);

const NeumorphicButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'icon' }> = ({ children, className, variant = 'primary', ...props }) => {
  let baseStyle = 'px-4 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2 text-sm';
  if (variant === 'primary') {
    baseStyle += ' bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
  } else if (variant === 'secondary') {
    baseStyle += ' bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400';
  } else if (variant === 'icon') {
    baseStyle += ' bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100 !p-2 rounded-full';
  }

  if (props.disabled) {
    baseStyle += ' opacity-50 cursor-not-allowed';
  }

  return (
    <button {...props} className={`${baseStyle} ${className || ''}`}>
      {children}
    </button>
  );
};

const NeumorphicInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }> = ({ icon, ...props }) => (
    <div className="relative w-full">
        {icon && <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">{icon}</span>}
        <input
        {...props}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all`}
        />
    </div>
);

const NeumorphicSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
 <div className="relative">
    <select
      {...props}
      className="w-full pl-3 pr-10 py-2.5 appearance-none border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
  </div>
);

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | number | string[] | null | React.ReactNode; className?: string; valueClassName?: string; isHighlighted?: boolean; }> = ({ icon, label, value, className, valueClassName, isHighlighted }) => {
  const isValueEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);

  // Siempre mostrar el campo, incluso si está vacío
  const displayValue = isValueEmpty 
    ? <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
    : (Array.isArray(value) && typeof value[0] !== 'object' ? value.join(', ') : value);

  return (
    <div className={`flex items-start gap-2 text-sm p-2 rounded-lg transition-all duration-300 ${isHighlighted ? 'highlight-flash' : ''} ${className || ''}`}>
      <span className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0 w-4 h-4">{icon}</span>
      <div className="flex-1 break-words min-w-0">
        <p className="font-medium text-gray-600 dark:text-gray-400 text-xs">{label}</p>
        <div className={`mt-0.5 font-medium ${isValueEmpty ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'} ${valueClassName || ''}`}>
          {displayValue}
        </div>
      </div>
    </div>
  );
};

// Tipo de formulario para THE ONE Inmobiliaria
type ProspectoTOIFormData = {
  nombre: string;
  numero_telefono: string;
  email?: string;
  estado_embudo: string;
  prioridad: string;
  tipo_operacion: string;
  tipo_propiedad_interes?: string;
  ubicacion_preferida?: string;
  rango_precio_min?: number;
  rango_precio_max?: number;
  numero_recamaras?: number;
  numero_banos?: number;
  metros_cuadrados_min?: number;
  caracteristicas_deseadas?: string[];
  fuente_lead?: string;
  agente_asignado?: string;
};

const ProspectoTOIFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  prospecto: ProspectoTOI | null;
  onSave: (data: Partial<ProspectoTOI>, id?: number) => void;
}> = ({ isOpen, onClose, prospecto, onSave }) => {
  const [formData, setFormData] = useState<ProspectoTOIFormData>({
    nombre: '',
    numero_telefono: '',
    email: '',
    estado_embudo: 'lead',
    prioridad: 'media',
    tipo_operacion: 'Compra',
    tipo_propiedad_interes: '',
    ubicacion_preferida: '',
    rango_precio_min: undefined as any,
    rango_precio_max: undefined as any,
    numero_recamaras: undefined as any,
    numero_banos: undefined as any,
    metros_cuadrados_min: undefined as any,
    caracteristicas_deseadas: [],
    fuente_lead: '',
    agente_asignado: ''
  });

  useEffect(() => {
    if (prospecto) {
      setFormData({
        nombre: prospecto.nombre || '',
        numero_telefono: prospecto.numero_telefono || '',
        email: prospecto.email || '',
        estado_embudo: prospecto.estado_embudo || 'lead',
        prioridad: prospecto.prioridad || 'media',
        tipo_operacion: prospecto.tipo_operacion || 'Compra',
        tipo_propiedad_interes: prospecto.tipo_propiedad_interes || '',
        ubicacion_preferida: prospecto.ubicacion_preferida || '',
        rango_precio_min: prospecto.rango_precio_min || undefined,
        rango_precio_max: prospecto.rango_precio_max || undefined,
        numero_recamaras: prospecto.numero_recamaras || undefined,
        numero_banos: prospecto.numero_banos || undefined,
        metros_cuadrados_min: prospecto.metros_cuadrados_min || undefined,
        caracteristicas_deseadas: prospecto.caracteristicas_deseadas || [],
        fuente_lead: prospecto.fuente_lead || '',
        agente_asignado: prospecto.agente_asignado || ''
      });
    } else {
      setFormData({
        nombre: '',
        numero_telefono: '',
        email: '',
        estado_embudo: 'lead',
        prioridad: 'media',
        tipo_operacion: 'Compra',
        tipo_propiedad_interes: '',
        ubicacion_preferida: '',
        rango_precio_min: undefined as any,
        rango_precio_max: undefined as any,
        numero_recamaras: undefined as any,
        numero_banos: undefined as any,
        metros_cuadrados_min: undefined as any,
        caracteristicas_deseadas: [],
        fuente_lead: '',
        agente_asignado: ''
      });
    }
  }, [prospecto, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, prospecto?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <NeumorphicCard className="w-full max-w-2xl max-h-[90vh] !p-0">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {prospecto ? 'Editar Prospecto THE ONE Inmobiliaria' : 'Nuevo Prospecto THE ONE Inmobiliaria'}
          </h2>
          <NeumorphicButton onClick={onClose} variant="icon" className="!p-2">
            <X size={20} />
          </NeumorphicButton>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NeumorphicInput name="nombre" placeholder="Nombre Completo" value={formData.nombre || ''} onChange={handleChange} icon={<User size={16}/>} required/>
            <NeumorphicInput name="numero_telefono" placeholder="Número de Teléfono" value={formData.numero_telefono || ''} onChange={handleChange} icon={<Phone size={16}/>} required/>
            <NeumorphicInput name="email" placeholder="Email" value={formData.email || ''} onChange={handleChange} icon={<MessageSquare size={16}/>} />
            <NeumorphicInput name="agente_asignado" placeholder="Agente Asignado" value={formData.agente_asignado || ''} onChange={handleChange} icon={<User size={16}/>} />
          </div>

          {/* Información de Operación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Operación</label>
              <NeumorphicSelect name="tipo_operacion" value={formData.tipo_operacion || 'Compra'} onChange={handleChange}>
                <option value="Compra">Compra</option>
                <option value="Venta">Venta</option>
                <option value="Renta">Renta</option>
                <option value="Inversión">Inversión</option>
              </NeumorphicSelect>
            </div>
            <NeumorphicInput name="tipo_propiedad_interes" placeholder="Tipo de Propiedad (Casa, Depto, etc.)" value={formData.tipo_propiedad_interes || ''} onChange={handleChange} icon={<Home size={16}/>} />
          </div>

          {/* Ubicación y Presupuesto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NeumorphicInput name="ubicacion_preferida" placeholder="Ubicación Preferida" value={formData.ubicacion_preferida || ''} onChange={handleChange} icon={<MapPin size={16}/>} />
            <NeumorphicInput name="fuente_lead" placeholder="Fuente del Lead" value={formData.fuente_lead || ''} onChange={handleChange} icon={<Activity size={16}/>} />
          </div>

          {/* Rango de Precios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NeumorphicInput name="rango_precio_min" type="number" placeholder="Precio Mínimo" value={formData.rango_precio_min ?? ''} onChange={handleChange} icon={<DollarSign size={16}/>} />
            <NeumorphicInput name="rango_precio_max" type="number" placeholder="Precio Máximo" value={formData.rango_precio_max ?? ''} onChange={handleChange} icon={<DollarSign size={16}/>} />
          </div>

          {/* Características de la Propiedad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NeumorphicInput name="numero_recamaras" type="number" placeholder="Núm. Recámaras" value={formData.numero_recamaras ?? ''} onChange={handleChange} icon={<Bed size={16}/>} />
            <NeumorphicInput name="numero_banos" type="number" placeholder="Núm. Baños" value={formData.numero_banos ?? ''} onChange={handleChange} icon={<Bath size={16}/>} />
            <NeumorphicInput name="metros_cuadrados_min" type="number" placeholder="M² Mínimos" value={formData.metros_cuadrados_min ?? ''} onChange={handleChange} icon={<Square size={16}/>} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado del Embudo</label>
              <NeumorphicSelect name="estado_embudo" value={formData.estado_embudo || 'lead'} onChange={handleChange}>
                {Object.entries(ESTADOS_TOI).map(([key, {label}]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </NeumorphicSelect>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prioridad</label>
              <NeumorphicSelect name="prioridad" value={formData.prioridad || 'media'} onChange={handleChange}>
                {Object.entries(PRIORIDADES).map(([key, {label}]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </NeumorphicSelect>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
            <NeumorphicButton type="button" onClick={onClose} variant="secondary">
              Cancelar
            </NeumorphicButton>
            <NeumorphicButton type="submit" variant="primary">
              {prospecto ? 'Guardar Cambios' : 'Crear Prospecto'}
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicCard>
    </div>
  );
};

const Emojis = {
  muy_positivo: '😃',
  positivo: '😊',
  neutral: '😐',
  negativo: '😟',
  muy_negativo: '😠',
  entusiasta: '🤩',
  dubitativo: '🤔',
  frustrado: '😤',
  agradecido: '🙏',
  curioso: '🧐',
};

const ESTADOS_TOI: Record<string, { color: string; label: string; icon: React.ReactNode; bgColor: string; category: string }> = {
    // ATRACCIÓN
    'nuevo_lead': { 
        color: 'text-sky-500 bg-sky-100 dark:bg-sky-500/20 dark:text-sky-400', 
        label: 'Nuevo Lead', 
        icon: <Sparkles size={14}/>, 
        bgColor: 'dark:bg-sky-500/10 bg-sky-50',
        category: 'Atracción'
    },
    
    // INTERACCIÓN
    'contactado': { 
        color: 'text-blue-500 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400', 
        label: 'Contactado', 
        icon: <Phone size={14}/>, 
        bgColor: 'dark:bg-blue-500/10 bg-blue-50',
        category: 'Interacción'
    },
    'en_espera_respuesta': { 
        color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400', 
        label: 'En Espera de Respuesta', 
        icon: <Clock size={14}/>, 
        bgColor: 'dark:bg-amber-500/10 bg-amber-50',
        category: 'Interacción'
    },
    
    // CALIFICACIÓN
    'pre_calificado': { 
        color: 'text-purple-500 bg-purple-100 dark:bg-purple-500/20 dark:text-purple-400', 
        label: 'Pre-Calificado', 
        icon: <MessageSquare size={14}/>, 
        bgColor: 'dark:bg-purple-500/10 bg-purple-50',
        category: 'Calificación'
    },
    'calificado': { 
        color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-400', 
        label: 'Calificado', 
        icon: <CheckCircle size={14}/>, 
        bgColor: 'dark:bg-indigo-500/10 bg-indigo-50',
        category: 'Calificación'
    },
    'descartado': { 
        color: 'text-gray-500 bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400', 
        label: 'Descartado/No Interesado', 
        icon: <XCircle size={14}/>, 
        bgColor: 'dark:bg-gray-500/10 bg-gray-50',
        category: 'Calificación'
    },
    
    // ASIGNACIÓN
    'asignado_agente': { 
        color: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-500/20 dark:text-cyan-400', 
        label: 'Asignado a Agente', 
        icon: <Users size={14}/>, 
        bgColor: 'dark:bg-cyan-500/10 bg-cyan-50',
        category: 'Asignación'
    },
    'reasignado': { 
        color: 'text-cyan-600 bg-cyan-200 dark:bg-cyan-600/20 dark:text-cyan-500', 
        label: 'Reasignado', 
        icon: <RefreshCw size={14}/>, 
        bgColor: 'dark:bg-cyan-600/10 bg-cyan-100',
        category: 'Asignación'
    },
    
    // SEGUIMIENTO
    'cita_agendada': { 
        color: 'text-teal-500 bg-teal-100 dark:bg-teal-500/20 dark:text-teal-400', 
        label: 'Cita Agendada', 
        icon: <Calendar size={14}/>, 
        bgColor: 'dark:bg-teal-500/10 bg-teal-50',
        category: 'Seguimiento'
    },
    'visita_realizada': { 
        color: 'text-green-500 bg-green-100 dark:bg-green-500/20 dark:text-green-400', 
        label: 'Visita Realizada', 
        icon: <Home size={14}/>, 
        bgColor: 'dark:bg-green-500/10 bg-green-50',
        category: 'Seguimiento'
    },
    'cotizacion_enviada': { 
        color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400', 
        label: 'Cotización Enviada', 
        icon: <FileText size={14}/>, 
        bgColor: 'dark:bg-emerald-500/10 bg-emerald-50',
        category: 'Seguimiento'
    },
    'planes_financiamiento': { 
        color: 'text-lime-500 bg-lime-100 dark:bg-lime-500/20 dark:text-lime-400', 
        label: 'Planes de Financiamiento Presentados', 
        icon: <DollarSign size={14}/>, 
        bgColor: 'dark:bg-lime-500/10 bg-lime-50',
        category: 'Seguimiento'
    },
    'en_negociacion': { 
        color: 'text-orange-500 bg-orange-100 dark:bg-orange-500/20 dark:text-orange-400', 
        label: 'En Negociación', 
        icon: <Handshake size={14}/>, 
        bgColor: 'dark:bg-orange-500/10 bg-orange-50',
        category: 'Seguimiento'
    },
    'reagendamiento': { 
        color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-500/20 dark:text-yellow-400', 
        label: 'Reagendamiento', 
        icon: <RefreshCw size={14}/>, 
        bgColor: 'dark:bg-yellow-500/10 bg-yellow-50',
        category: 'Seguimiento'
    },
    
    // CIERRE
    'acepta_cotizacion': { 
        color: 'text-green-600 bg-green-200 dark:bg-green-600/20 dark:text-green-500', 
        label: 'Acepta Cotización', 
        icon: <CheckCircle2 size={14}/>, 
        bgColor: 'dark:bg-green-600/10 bg-green-100',
        category: 'Cierre'
    },
    'anticipo_recibido': { 
        color: 'text-green-700 bg-green-300 dark:bg-green-700/20 dark:text-green-600', 
        label: 'Anticipo Recibido', 
        icon: <Banknote size={14}/>, 
        bgColor: 'dark:bg-green-700/10 bg-green-200',
        category: 'Cierre'
    },
    'contrato_proceso': { 
        color: 'text-green-800 bg-green-400 dark:bg-green-800/20 dark:text-green-700', 
        label: 'Contrato en Proceso', 
        icon: <FileCheck size={14}/>, 
        bgColor: 'dark:bg-green-800/10 bg-green-300',
        category: 'Cierre'
    },
    'cierre_firma': { 
        color: 'text-green-900 bg-green-500 dark:bg-green-900/20 dark:text-green-800', 
        label: 'Cierre/Firma de Escritura', 
        icon: <PenTool size={14}/>, 
        bgColor: 'dark:bg-green-900/10 bg-green-400',
        category: 'Cierre'
    },
    'entrega_inmueble': { 
        color: 'text-emerald-900 bg-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-800', 
        label: 'Entrega de Inmueble', 
        icon: <Key size={14}/>, 
        bgColor: 'dark:bg-emerald-900/10 bg-emerald-400',
        category: 'Cierre'
    },
    'perdido': { 
        color: 'text-red-500 bg-red-100 dark:bg-red-500/20 dark:text-red-400', 
        label: 'Lead Perdido', 
        icon: <XCircle size={14}/>, 
        bgColor: 'dark:bg-red-500/10 bg-red-50',
        category: 'Cierre'
    }
};

// Categorías de estados del embudo
const CATEGORIAS_EMBUDO = {
  atraccion: {
    nombre: 'Atracción',
    icon: <Sparkles size={16} className="text-sky-500" />,
    estados: ['nuevo_lead']
  },
  interaccion: {
    nombre: 'Interacción', 
    icon: <MessageCircle size={16} className="text-blue-500" />,
    estados: ['contactado', 'en_espera_respuesta']
  },
  calificacion: {
    nombre: 'Calificación',
    icon: <CheckCircle size={16} className="text-green-500" />,
    estados: ['pre_calificado', 'calificado', 'descartado']
  },
  asignacion: {
    nombre: 'Asignación',
    icon: <Users size={16} className="text-purple-500" />,
    estados: ['asignado_agente', 'reasignado']
  },
  seguimiento: {
    nombre: 'Seguimiento',
    icon: <Calendar size={16} className="text-orange-500" />,
    estados: ['cita_agendada', 'reagendamiento', 'visita_realizada', 'cotizacion_enviada', 'planes_financiamiento', 'en_negociacion']
  },
  cierre: {
    nombre: 'Cierre',
    icon: <Building size={16} className="text-emerald-500" />,
    estados: ['acepta_cotizacion', 'anticipo_recibido', 'contrato_proceso', 'cierre_firma', 'entrega_inmueble', 'perdido']
  }
};

const ESTADOS_SIDEBAR = ['todos', ...Object.keys(ESTADOS_TOI).filter(key => key !== 'nuevo_lead')];

const getEstadoInfo = (estado?: string | null) => {
    if (!estado || !ESTADOS_TOI[estado]) {
        if (estado === 'todos') {
            return { color: 'text-gray-500', label: 'Todos los Prospectos', icon: <List size={14}/>, bgColor: 'bg-transparent' };
        }
        if (estado && !ESTADOS_TOI[estado]) {
            return { color: 'text-gray-500 bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400', label: estado, icon: <HelpCircle size={14}/>, bgColor: 'dark:bg-gray-500/10 bg-gray-50' };
        }
        return ESTADOS_TOI.nuevo_lead;
    }
    return ESTADOS_TOI[estado];
};

const PRIORIDADES: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  'alta': { color: 'text-red-500', label: 'Alta', icon: <ArrowUp size={16} /> },
  'media': { color: 'text-amber-500', label: 'Media', icon: <Minus size={16} /> },
  'baja': { color: 'text-sky-500', label: 'Baja', icon: <ArrowDown size={16} /> }
};

const getPriorityVisual = (prioridad?: string | null) => prioridad ? (PRIORIDADES[prioridad] || PRIORIDADES.media) : PRIORIDADES.media;

const getScoreColor = (score?: number | null) => {
  if (score === undefined || score === null) return 'text-slate-500 dark:text-slate-400';
  if (score >= 80) return 'text-emerald-500 dark:text-emerald-400 font-bold';
  if (score >= 60) return 'text-amber-500 dark:text-amber-400 font-semibold';
  if (score >= 40) return 'text-orange-500 dark:text-orange-400';
  return 'text-red-500 dark:text-red-400';
};

const formatTags = (tags?: string[] | null) => {
  if (!tags || tags.length === 0) return <span className="text-gray-500 dark:text-gray-400 italic text-xs">Ninguna</span>;
  return (<div className="flex flex-wrap gap-1.5 mt-1">
    {tags.map((tag, index) => (
    <span key={index} className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full">
      {tag}
    </span>
  ))}
  </div>)
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('es-MX', { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Fecha inválida';
  }
};

const formatPrice = (price?: number | null) => {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

interface ProspectosViewTOIProps {
  conversations: ConversacionTOI[];
  onSelectConversation: (numero: string) => void;
  currentUser?: { nombre: string; email: string; rol: string; id?: string } | null;
}

const ProspectosViewTOI: React.FC<ProspectosViewTOIProps> = ({ conversations, onSelectConversation, currentUser }) => {
  const { prospectos, loading, error, createProspecto, updateProspecto, deleteProspecto, clearError, highlightedFields, newProspectosIds, updateEstadoWithHistory, updateEstadoEmbudoWithHistory, agregarComentario } = useProspectosTOI({
    userId: currentUser?.id,
    isAsesor: currentUser?.rol === 'asesor'
  });
  
  // Hook para columnas redimensionables
  const {
    widths,
    isResizing,
    activeResizer,
    containerRef,
    getPercentageWidths,
    handleMouseDown,
    resetWidths
  } = useResizableColumns();
  
  // Estado para tabs móviles (3 columnas) - Por defecto "lista" (Prospectos)
  const [mobileTab, setMobileTab] = useState<'filtros' | 'lista' | 'detalle'>('lista');
  
  // Estado para minimizar/expandir columna izquierda
  const [isLeftPanelMinimized, setIsLeftPanelMinimized] = useState(false);
  
  // Estado para categorías desplegables en el embudo
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProspecto, setEditingProspecto] = useState<ProspectoTOI | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [selectedProspecto, setSelectedProspecto] = useState<ProspectoTOI | null>(null);
  const [tiposPropiedad, setTiposPropiedad] = useState<string[]>([]);
  const [selectedTipoPropiedad, setSelectedTipoPropiedad] = useState('todos');
  const prevProspectos = usePrevious(prospectos);
  
  // Función para toggle de categorías
  const toggleCategory = (categoryKey: string) => {
    // Solo colapsar/expandir en modo normal (no minimizado)
    if (!isLeftPanelMinimized) {
      setCollapsedCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(categoryKey)) {
          newSet.delete(categoryKey);
        } else {
          newSet.add(categoryKey);
        }
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (error) {
      alert(`Error: ${error}`);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    const fetchTiposPropiedad = async () => {
      const { data, error } = await supabase
        .from('prospectos_toi')
        .select('tipo_propiedad_interes');
      
      if (error) {
        console.error('Error fetching tipos propiedad:', error);
        return;
      }

      const tiposUnicos = Array.from(new Set(data.map(p => p.tipo_propiedad_interes).filter(Boolean))) as string[];
      setTiposPropiedad(tiposUnicos);
    };

    fetchTiposPropiedad();
  }, []);

  const filteredProspectos = useMemo(() => {
    return prospectos.filter(p => {
      // Verificar si el filtro activo es una categoría padre
      const categoria = CATEGORIAS_EMBUDO[activeFilter as keyof typeof CATEGORIAS_EMBUDO];
      const stateMatch = activeFilter === 'todos' 
        || (categoria && categoria.estados.includes(p.estado_embudo || 'lead')) // Si es categoría, incluir todos sus estados
        || (p.estado_embudo || 'lead') === activeFilter; // Si es estado individual
      
      const tipoMatch = selectedTipoPropiedad === 'todos' || p.tipo_propiedad_interes === selectedTipoPropiedad;
      
      if (!searchTerm) {
        return stateMatch && tipoMatch;
      }

      const lowercasedTerm = searchTerm.toLowerCase();
      const searchMatch = 
        p.nombre?.toLowerCase().includes(lowercasedTerm) ||
        p.numero_telefono?.toLowerCase().includes(lowercasedTerm) ||
        p.tipo_propiedad_interes?.toLowerCase().includes(lowercasedTerm) ||
        p.ubicacion_preferida?.toLowerCase().includes(lowercasedTerm);

      return stateMatch && tipoMatch && searchMatch;
    });
  }, [prospectos, activeFilter, searchTerm, selectedTipoPropiedad]);

  useEffect(() => {
    if (!selectedProspecto) return;
    const freshProspecto = prospectos.find(p => p.id === selectedProspecto.id);
    if (!freshProspecto) return;
    const updatedAtChanged = freshProspecto.updated_at !== selectedProspecto.updated_at;
    const resumenChanged = freshProspecto.resumen_ia !== selectedProspecto.resumen_ia;
    if (updatedAtChanged || resumenChanged) {
        setSelectedProspecto(freshProspecto);
    }
  }, [prospectos, selectedProspecto]);

  useEffect(() => {
    if (filteredProspectos.length > 0) {
      if (!selectedProspecto || !filteredProspectos.find(p => p.id === selectedProspecto.id)) {
        setSelectedProspecto(filteredProspectos[0]);
      }
    } else {
      setSelectedProspecto(null);
    }
  }, [filteredProspectos]);

  // Capturar navegación desde Chat
  useEffect(() => {
    const numeroToNavigate = sessionStorage.getItem('navigateToProspecto');
    
    if (numeroToNavigate && prospectos.length > 0) {
      // Buscar el prospecto por número
      const prospecto = prospectos.find(p => 
        p.numero_telefono === numeroToNavigate || 
        p.numero_telefono === `+${numeroToNavigate}` ||
        p.numero_telefono === numeroToNavigate.replace('+', '')
      );
      
      if (prospecto) {
        console.log(`(ProspectosViewTOI) Navegando a prospecto:`, prospecto);
        
        // Seleccionar el prospecto
        setSelectedProspecto(prospecto);
        
        // Filtrar por el estado del prospecto
        setActiveFilter(prospecto.estado_embudo || 'lead');
        
        // En móvil, ir a la pestaña de detalle
        setMobileTab('detalle');
        
        // Limpiar sessionStorage
        sessionStorage.removeItem('navigateToProspecto');
      } else {
        console.warn(`(ProspectosViewTOI) No se encontró prospecto con número: ${numeroToNavigate}`);
        sessionStorage.removeItem('navigateToProspecto');
      }
    }
  }, [prospectos]);

  const handleSaveProspecto = async (data: Partial<ProspectoTOI>, id?: number) => {
    try {
      if (id) {
        await updateProspecto(id, data);
      } else {
        await createProspecto(data as ProspectoTOI);
      }
      setEditingProspecto(null);
      setShowForm(false);
    } catch (e) {
      console.error("Error al guardar:", e);
    }
  };

  const handleAddNew = () => {
    setEditingProspecto(null);
    setShowForm(true);
  };

  const handleEdit = (prospecto: ProspectoTOI) => {
    setEditingProspecto(prospecto);
    setShowForm(true);
  };

  const handleDelete = async (id?: number) => {
    if (id && window.confirm('¿Estás seguro de que quieres eliminar este prospecto?')) {
      await deleteProspecto(id);
      if (selectedProspecto?.id === id) {
        setSelectedProspecto(null);
      }
    }
  };
  
  const prospectStats = useMemo(() => {
    const stats: Record<string, number> = Object.keys(ESTADOS_TOI).reduce((acc, key) => ({...acc, [key]: 0 }), {});
    stats.todos = prospectos.length;
    prospectos.forEach(p => {
      if(p.estado_embudo && stats[p.estado_embudo] !== undefined) {
        stats[p.estado_embudo]++;
      }
    });
    return stats;
  }, [prospectos]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    // Usar la nueva función que actualiza con historial
    await updateEstadoWithHistory(id, newStatus, undefined, 'Usuario');
    setActiveFilter(newStatus);
  };

  const handleEstadoEmbudoChange = async (id: number, nuevoEstadoEmbudo: string) => {
    // Usar la nueva función específica para estado_embudo que captura el resumen
    await updateEstadoEmbudoWithHistory(id, nuevoEstadoEmbudo, 'Usuario');
  };

  const percentageWidths = getPercentageWidths();

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans prospectos-main-container">
      
      <ProspectoTOIFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        prospecto={editingProspecto}
        onSave={handleSaveProspecto}
      />
      
      {/* Tabs Móviles - Solo visible en móvil */}
      <div className="lg:hidden border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex overflow-x-auto scrollbar-none">
          <button
            onClick={() => setMobileTab('filtros')}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-all whitespace-nowrap ${
              mobileTab === 'filtros'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Search size={18} />
              Filtros
            </div>
          </button>
          <button
            onClick={() => setMobileTab('lista')}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-all whitespace-nowrap ${
              mobileTab === 'lista'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users size={18} />
              Prospectos ({filteredProspectos.length})
            </div>
          </button>
          <button
            onClick={() => setMobileTab('detalle')}
            disabled={!selectedProspecto}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-all whitespace-nowrap ${
              !selectedProspecto
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                : mobileTab === 'detalle'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User size={18} />
              Detalle {!selectedProspecto && '(Selecciona un prospecto)'}
            </div>
          </button>
        </div>
        </div>
        
      {/* Contenedor principal con las 3 columnas */}
      <div 
        ref={containerRef}
        className="flex h-[calc(100vh-60px)] lg:h-full overflow-hidden"
      >
      
      {/* Panel Izquierdo - Filtros */}
      <aside 
        className={`h-full flex-col border-r border-gray-200 dark:border-gray-700 flex-shrink-0 transition-all duration-300 ${
          mobileTab === 'filtros' ? 'flex w-full lg:w-auto' : 'hidden lg:flex'
        }`}
        style={{ width: mobileTab !== 'filtros' ? (isLeftPanelMinimized ? '70px' : percentageWidths.leftPanel) : undefined }}
      >
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isLeftPanelMinimized ? 'space-y-2' : 'space-y-3'}`}>
          <div className="flex items-center justify-between">
            {!isLeftPanelMinimized && <h1 className="text-2xl font-bold flex items-center gap-2"><Building/> THE ONE Inmobiliaria</h1>}
            <div className="flex gap-2">
              <button
                onClick={() => setIsLeftPanelMinimized(!isLeftPanelMinimized)}
                className="p-1.5 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                title={isLeftPanelMinimized ? "Expandir panel" : "Minimizar panel"}
              >
                {isLeftPanelMinimized ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
              {!isLeftPanelMinimized && (
                <button
                  onClick={resetWidths}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  title="Resetear anchos de columnas"
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
          </div>
          {!isLeftPanelMinimized && <p className="text-sm text-gray-500 dark:text-gray-400">Sistema CRM Demo - Gestión de prospectos inmobiliarios</p>}
        </div>
        
        {!isLeftPanelMinimized && (
        <div className="p-4 space-y-4">
          <NeumorphicInput
              icon={<Search size={18} />}
              placeholder="Buscar prospecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
          <NeumorphicButton variant="primary" onClick={handleAddNew} className="w-full">
            <Plus size={18} /> Nuevo Prospecto
          </NeumorphicButton>
          <NeumorphicSelect
            value={selectedTipoPropiedad}
            onChange={(e) => setSelectedTipoPropiedad(e.target.value)}
          >
            <option value="todos">Todos los Tipos</option>
            {tiposPropiedad.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </NeumorphicSelect>
        </div>
        )}

        <nav className="px-2 py-2 overflow-y-auto space-y-2">
          {/* Botón "Todos los Prospectos" */}
          <button 
            onClick={() => setActiveFilter('todos')}
            className={`w-full flex items-center ${isLeftPanelMinimized ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'} rounded-lg text-sm font-medium transition-colors duration-200
            ${activeFilter === 'todos' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            title={isLeftPanelMinimized ? 'Todos los Prospectos' : ''}
          >
            <div className={`flex items-center ${isLeftPanelMinimized ? '' : 'gap-3'}`}>
              <span className={activeFilter === 'todos' ? '' : 'text-gray-500 dark:text-gray-400'}>
                <List size={14} />
              </span>
              {!isLeftPanelMinimized && <span>Todos los Prospectos</span>}
            </div>
            {!isLeftPanelMinimized && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${activeFilter === 'todos' ? 'bg-blue-200 dark:bg-blue-900/40' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {prospectStats.todos ?? 0}
              </span>
            )}
          </button>

          {/* Categorías agrupadas */}
          {Object.entries(CATEGORIAS_EMBUDO).map(([categoriaKey, categoria]) => {
            const totalCount = categoria.estados.reduce((sum, estado) => sum + (prospectStats[estado] ?? 0), 0);
            const hasActiveState = categoria.estados.some(estado => activeFilter === estado);
            const isCollapsed = collapsedCategories.has(categoriaKey);
            
            // Verificar si el filtro activo es uno de los estados de esta categoría
            const isCategoryActive = activeFilter === categoriaKey || categoria.estados.includes(activeFilter);
            
            return (
              <div key={categoriaKey} className="space-y-1">
                {/* Header de categoría - Clickeable para colapsar/expandir o filtrar */}
                <button 
                  onClick={() => {
                    if (isLeftPanelMinimized) {
                      // En modo minimizado: solo filtrar por esta categoría (todos sus estados)
                      setActiveFilter(categoriaKey);
                    } else {
                      // En modo normal: solo colapsar/expandir
                      toggleCategory(categoriaKey);
                    }
                  }}
                  className={`w-full flex items-center ${isLeftPanelMinimized ? 'justify-center px-2 py-3' : 'gap-2 px-2 py-1'} text-xs font-semibold uppercase tracking-wide rounded transition-all duration-200 ${
                    isLeftPanelMinimized && isCategoryActive
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={isLeftPanelMinimized ? `${categoria.nombre} (${totalCount})` : ''}
                >
                  {categoria.icon}
                  {!isLeftPanelMinimized && (
                    <>
                      <span>{categoria.nombre}</span>
                      <span className="ml-auto text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {totalCount}
                      </span>
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </>
                  )}
                </button>
                
                {/* Estados de la categoría - Solo en modo normal (no minimizado) */}
                {!isLeftPanelMinimized && !isCollapsed && (
                  <div className="ml-3 space-y-1">
                    {categoria.estados.map((estado) => {
              const count = prospectStats[estado] ?? 0;
              const { label, icon } = getEstadoInfo(estado);
              const isActive = activeFilter === estado;
                      
              return (
                        <button 
                          key={estado} 
                          onClick={() => setActiveFilter(estado)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                          ${isActive ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                      <div className="flex items-center gap-3">
                          <span className={`${isActive ? '' : 'text-gray-500 dark:text-gray-400'}`}>{icon}</span>
                            <span className="text-xs">{label}</span>
                      </div>
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-mono ${isActive ? 'bg-blue-200 dark:bg-blue-900/40' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          {count}
                      </span>
                  </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        
        {!isLeftPanelMinimized && (
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
            {loading ? "Actualizando..." : `Total de prospectos: ${prospectos.length}`}
        </div>
        )}
      </aside>

      {/* Handle de redimensionamiento entre panel izquierdo y medio - Solo desktop y cuando no está minimizado */}
      {!isLeftPanelMinimized && (
        <ResizeHandle
          resizer="left-middle"
          onMouseDown={handleMouseDown}
          isActive={activeResizer === 'left-middle'}
          className="h-full hidden lg:block"
        />
      )}

      {/* Panel Medio - Lista de Prospectos */}
      <main 
        className={`h-full flex-col flex-shrink-0 ${
          mobileTab === 'lista' ? 'flex w-full lg:w-auto' : 'hidden lg:flex'
        }`}
        style={{ 
          width: mobileTab !== 'lista' ? percentageWidths.middlePanel : undefined,
          minWidth: '300px',
          maxWidth: mobileTab !== 'lista' ? '50%' : undefined
        }}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold capitalize">
            {CATEGORIAS_EMBUDO[activeFilter as keyof typeof CATEGORIAS_EMBUDO]?.nombre || activeFilter.replace('_', ' ')} ({filteredProspectos.length})
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {loading ? <p>Cargando...</p> : 
              filteredProspectos.length > 0 ? (
                filteredProspectos.map(p => (
                  <ProspectoTOIListItem
                    key={p.id}
                    prospecto={p}
                    isSelected={selectedProspecto?.id === p.id}
                    isNew={newProspectosIds.has(p.id)}
                    onSelect={() => {
                      setSelectedProspecto(p);
                      // Cambiar a tab detalle en móvil automáticamente
                      if (window.innerWidth < 1024) {
                        setMobileTab('detalle');
                      }
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No hay prospectos que coincidan.</p>
                </div>
              )
            }
            </div>
          </div>
      </main>

      {/* Handle de redimensionamiento entre panel medio y derecho - Solo desktop */}
      <ResizeHandle
        resizer="middle-right"
        onMouseDown={handleMouseDown}
        isActive={activeResizer === 'middle-right'}
        className="h-full hidden lg:block"
      />

      {/* Panel Derecho - Detalles del Prospecto - Anclado al borde derecho */}
      <div 
        className={`h-full flex-col border-gray-200 dark:border-gray-700 ${
          mobileTab === 'detalle' ? 'flex w-full' : 'hidden lg:flex lg:flex-1'
        } lg:border-l`}
        style={{ 
          minWidth: mobileTab !== 'detalle' ? '400px' : undefined
        }}
      >
        <div className="h-full w-full overflow-y-auto flex flex-col prospecto-detail-container">
          <div className="prospecto-detail-content-wrapper w-full flex-1 p-4" id="prospecto-detail-main">
                {selectedProspecto ? (
                <ProspectoTOIDetail 
                      prospecto={selectedProspecto} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                      highlightedFields={highlightedFields[selectedProspecto.id]}
                      onStatusChange={handleStatusChange}
                      onEstadoEmbudoChange={handleEstadoEmbudoChange}
                      onSelectConversation={onSelectConversation}
                      hasConversation={conversations.some(c => c.numero === selectedProspecto.numero_telefono)}
                      onAgregarComentario={agregarComentario}
                      currentUser={currentUser}
                    />
                ) : (
                    <WelcomePanel stats={prospectStats}/>
                )}
              </div>
            </div>
          </div>

      {/* Cerrar contenedor de las 3 columnas */}
        </div>

      {/* Overlay durante redimensionamiento */}
      {isResizing && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-transparent" />
      )}
    </div>
  );
};

const ProspectoTOIListItem: React.FC<{
  prospecto: ProspectoTOI;
  isSelected: boolean;
  onSelect: () => void;
  isNew?: boolean;
}> = ({ prospecto, isSelected, onSelect, isNew = false }) => {
  const estadoInfo = getEstadoInfo(prospecto.estado_embudo);
  const priorityInfo = getPriorityVisual(prospecto.prioridad);
  
  // Estado para obtener el canal de la conversación
  const [conversationCanal, setConversationCanal] = useState<'whatsapp' | 'messenger' | 'instagram' | null>(null);
  
  // Obtener el canal de la conversación asociada
  useEffect(() => {
    const fetchConversationCanal = async () => {
      if (!prospecto.numero_telefono) return;
      
      try {
        const { data, error } = await supabase
          .from('conversaciones_toi')
          .select('canal')
          .eq('numero', prospecto.numero_telefono)
          .single();
        
        if (error) {
          console.log('No conversation found for prospecto:', prospecto.numero_telefono);
          return;
        }
        
        setConversationCanal(data?.canal || 'whatsapp');
      } catch (error) {
        console.error('Error fetching conversation canal:', error);
      }
    };
    
    fetchConversationCanal();
  }, [prospecto.numero_telefono]);

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isNew ? 'new-conversation-enter' : ''}
      ${isSelected ? 'bg-white dark:bg-gray-800 border-blue-500 shadow-lg' : `border-transparent hover:border-gray-300 dark:hover:border-gray-600 ${estadoInfo.bgColor}`}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-full ${estadoInfo.color} bg-opacity-20`}>
                <div className="w-5 h-5 flex items-center justify-center">{estadoInfo.icon}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 dark:text-white truncate">{prospecto.nombre}</p>
                {/* Icono de canal */}
                {conversationCanal && (
                  <CanalIcon canal={conversationCanal} size={16} variant="dark" />
                )}
                {isNew && (
                  <span className="new-badge flex-shrink-0">Nuevo</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{prospecto.tipo_propiedad_interes || 'Sin especificar'} - {prospecto.ubicacion_preferida || 'Dirección no definida'}</p>
            </div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${priorityInfo.color} flex-shrink-0 ml-2`}>
          {priorityInfo.icon}
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-mono px-2 py-0.5 rounded ${estadoInfo.color} whitespace-nowrap`}>{estadoInfo.label}</span>
            {prospecto.rango_precio_min && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded whitespace-nowrap">
                {formatPrice(prospecto.rango_precio_min)}
              </span>
            )}
          </div>
          <p className="whitespace-nowrap">Actualizado: {formatDate(prospecto.updated_at)}</p>
      </div>
    </div>
  )
}

const ProspectoTOIDetail: React.FC<{ 
  prospecto: ProspectoTOI; 
  onEdit: (p: ProspectoTOI) => void; 
  onDelete: (id?: number) => void; 
  highlightedFields?: Set<keyof ProspectoTOI>;
  onStatusChange: (id: number, newStatus: string) => void;
  onEstadoEmbudoChange: (id: number, nuevoEstadoEmbudo: string) => void;
  onSelectConversation: (numero: string) => void;
  hasConversation: boolean;
  onAgregarComentario: (id: number, comentario: { content: string; author: string }) => void;
  currentUser?: { nombre: string; email: string; rol: string } | null;
}> = ({ prospecto, onEdit, onDelete, highlightedFields, onStatusChange, onEstadoEmbudoChange, onSelectConversation, hasConversation, onAgregarComentario, currentUser }) => {
  
  // Estado para obtener el canal de la conversación
  const [conversationCanal, setConversationCanal] = useState<'whatsapp' | 'messenger' | 'instagram' | null>(null);
  
  // Obtener el canal de la conversación asociada
  useEffect(() => {
    const fetchConversationCanal = async () => {
      if (!prospecto.numero_telefono) return;
      
      try {
        const { data, error } = await supabase
          .from('conversaciones_toi')
          .select('canal')
          .eq('numero', prospecto.numero_telefono)
          .single();
        
        if (error) {
          console.log('No conversation found for prospecto:', prospecto.numero_telefono);
          return;
        }
        
        setConversationCanal(data?.canal || 'whatsapp');
      } catch (error) {
        console.error('Error fetching conversation canal:', error);
      }
    };
    
    fetchConversationCanal();
  }, [prospecto.numero_telefono]);
  
  // Tabs internas eliminadas - mostrar todo siempre

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (prospecto.id && newStatus) {
      onStatusChange(prospecto.id, newStatus);
    }
  };

  const handleEstadoEmbudoChangeLocal = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstadoEmbudo = e.target.value;
    console.log('[ProspectoDetailView] ⚡ DROPDOWN changed to:', nuevoEstadoEmbudo, 'for prospecto:', prospecto.id);
    console.log('[ProspectoDetailView] ⚡ Calling onEstadoEmbudoChange prop function...');
    if (prospecto.id && nuevoEstadoEmbudo) {
      onEstadoEmbudoChange(prospecto.id, nuevoEstadoEmbudo);
    }
  };

  const isHighlighted = (field: keyof ProspectoTOI) => highlightedFields?.has(field) ?? false;

  const dropdownOptions = Object.keys(ESTADOS_TOI).filter(key => key !== 'lead');
  if (prospecto.estado_embudo && !dropdownOptions.includes(prospecto.estado_embudo)) {
    dropdownOptions.unshift(prospecto.estado_embudo);
  }

  const sentimientoEmoji = Emojis[prospecto.sentimiento_conversacion as keyof typeof Emojis] || '😐';
  
  return (
    <div className="flex-1 flex flex-col h-full w-full prospecto-detail-content">
      {/* Header fijo - con información del prospecto */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        {/* Información básica del prospecto - siempre visible */}
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-500/10 flex-shrink-0">
              <User size={20} className="text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className={`text-xl font-bold text-gray-900 dark:text-white ${isHighlighted('nombre') ? 'highlight-flash' : ''}`} title={prospecto.nombre ?? undefined}>
                  {prospecto.nombre || 'Prospecto sin nombre'}
                </h2>
                {/* Icono de canal si existe conversación */}
                {conversationCanal && (
                  <CanalIcon canal={conversationCanal} size={18} variant="dark" />
                )}
              </div>
            
              {/* Información de contacto integrada */}
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={12} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span className={`text-gray-700 dark:text-gray-300 ${isHighlighted('numero_telefono') ? 'highlight-flash' : ''}`}>
                    {prospecto.numero_telefono || 'N/A'}
                  </span>
                </div>
                {(prospecto.email || prospecto.agente_asignado) && (
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    {prospecto.email && (
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={12} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        <span className={`text-gray-700 dark:text-gray-300 truncate max-w-[200px] ${isHighlighted('email') ? 'highlight-flash' : ''}`}>
                          {prospecto.email}
                        </span>
                      </div>
                    )}
                    {prospecto.agente_asignado && (
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        <span className={`text-gray-700 dark:text-gray-300 ${isHighlighted('agente_asignado') ? 'highlight-flash' : ''}`}>
                          {prospecto.agente_asignado}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Tipo de propiedad y ubicación */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {prospecto.tipo_propiedad_interes || 'Sin especificar'} • {prospecto.ubicacion_preferida || 'Dirección no definida'}
                {prospecto.fuente_lead && ` • Fuente: ${prospecto.fuente_lead}`}
              </p>
            </div>
          </div>
        </div>

        {/* Estado y acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="w-full sm:w-auto flex-1">
              <NeumorphicSelect
                value={prospecto.estado_embudo || ''}
                onChange={handleEstadoEmbudoChangeLocal}
              className="font-semibold w-full"
              >
                {dropdownOptions.map(estado => (
                  <option key={estado} value={estado}>
                    {getEstadoInfo(estado).label}
                  </option>
                ))}
              </NeumorphicSelect>
            </div>
          <div className="flex items-center gap-2">
            <NeumorphicButton onClick={() => onEdit(prospecto)} variant="icon" title="Editar Prospecto">
              <Edit2 size={18} />
            </NeumorphicButton>
            {hasConversation && (
              <NeumorphicButton onClick={() => onSelectConversation(prospecto.numero_telefono!)} variant="icon" title="Ir al Chat">
                  <MessageCircle size={18} />
              </NeumorphicButton>
            )}
            <NeumorphicButton onClick={() => onDelete(prospecto.id)} variant='icon' className="text-red-500" title="Eliminar Prospecto">
              <Trash2 size={18} />
            </NeumorphicButton>
          </div>
        </div>

         {/* Tabs internas eliminadas - mostrar todo siempre */}
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
        {/* Contenido en 2 columnas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          
          {/* Columna 1 */}
          <div className="space-y-4">
            {/* Resumen Inteligente */}
        <NeumorphicCard className={isHighlighted('resumen_ia') || isHighlighted('score_interes') || isHighlighted('probabilidad_conversion') || isHighlighted('sentimiento_conversacion') ? 'highlight-flash' : ''}>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-500"/> Resumen Inteligente
              </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 italic">
          {prospecto.resumen_ia || "El resumen generado por IA aparecerá aquí."}
        </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                  <p className={`text-lg font-bold ${getScoreColor(prospecto.score_interes)}`}>{prospecto.score_interes || 0}%</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Conversión</p>
                  <p className={`text-lg font-bold ${getScoreColor(prospecto.probabilidad_conversion)}`}>{prospecto.probabilidad_conversion || 0}%</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ánimo</p>
                  <p className="text-xl">{sentimientoEmoji}</p>
            </div>
        </div>
      </NeumorphicCard>

      {/* Información de Propiedad */}
      <NeumorphicCard>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Home size={18} className="text-green-500"/> Información de Propiedad
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem icon={<Building size={14}/>} label="Operación" value={prospecto.tipo_operacion} isHighlighted={isHighlighted('tipo_operacion')} />
                  <DetailItem icon={<Home size={14}/>} label="Tipo" value={prospecto.tipo_propiedad_interes} isHighlighted={isHighlighted('tipo_propiedad_interes')} />
                </div>
                <DetailItem icon={<MapPin size={14}/>} label="Direcciones" value={prospecto.ubicacion_preferida} isHighlighted={isHighlighted('ubicacion_preferida')} />
                <div className="grid grid-cols-3 gap-2">
                  <DetailItem icon={<Square size={14}/>} label="M²" value={prospecto.metros_cuadrados_min} isHighlighted={isHighlighted('metros_cuadrados_min')} />
                  <DetailItem icon={<Bed size={14}/>} label="Recámaras" value={prospecto.numero_recamaras} isHighlighted={isHighlighted('numero_recamaras')} />
                  <DetailItem icon={<Bath size={14}/>} label="Baños" value={prospecto.numero_banos} isHighlighted={isHighlighted('numero_banos')} />
                </div>
        </div>
      </NeumorphicCard>

            {/* Presupuesto */}
      {(prospecto.rango_precio_min || prospecto.rango_precio_max || prospecto.presupuesto_mencionado) && (
        <NeumorphicCard>
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <DollarSign size={18} className="text-green-500"/> Presupuesto
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <DetailItem icon={<DollarSign size={14}/>} label="Mínimo" value={formatPrice(prospecto.rango_precio_min)} isHighlighted={isHighlighted('rango_precio_min')} />
                  <DetailItem icon={<DollarSign size={14}/>} label="Máximo" value={formatPrice(prospecto.rango_precio_max)} isHighlighted={isHighlighted('rango_precio_max')} />
                  <DetailItem icon={<DollarSign size={14}/>} label="Mencionado" value={formatPrice(prospecto.presupuesto_mencionado)} isHighlighted={isHighlighted('presupuesto_mencionado')} />
          </div>
        </NeumorphicCard>
      )}

            {/* Historial de Estados */}
            <HistorialEstados 
              historial={(prospecto.historial_estados as any) || []} 
              estadoActual={prospecto.estado_embudo || 'prospecto'}
            />
          </div>

          {/* Columna 2 */}
          <div className="space-y-4">
      {/* Información Adicional */}
      <NeumorphicCard>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <FileText size={18} className="text-purple-500"/> Información Adicional
              </h3>
              <div className="space-y-3">
                <DetailItem icon={<MessageCircle size={14}/>} label="Última Intención" value={prospecto.ultima_intencion} isHighlighted={isHighlighted('ultima_intencion')} />
                <DetailItem icon={<Calendar size={14}/>} label="Próximo Seguimiento" value={formatDate(prospecto.proximo_seguimiento)} isHighlighted={isHighlighted('proximo_seguimiento')} />
          <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Tag size={14} /> Tags
                  </h4>
            <div className={isHighlighted('tags_automaticas') ? 'highlight-flash p-2 rounded-lg' : ''}>
              {formatTags(prospecto.tags_automaticas)}
            </div>
          </div>
          <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <List size={14} /> Características
                  </h4>
            <div className={isHighlighted('caracteristicas_deseadas') ? 'highlight-flash p-2 rounded-lg' : ''}>
              {formatTags(prospecto.caracteristicas_deseadas)}
            </div>
          </div>
        </div>
      </NeumorphicCard>

            {/* Seguimiento */}
      <SeguimientoComentarios 
        comentarios={(prospecto.notas_manuales as any) || []}
              onAgregarComentario={(comentario) => {
                if (prospecto.id) {
                  onAgregarComentario(prospecto.id, comentario);
                }
              }}
              currentUser={currentUser}
      />

      {/* Oportunidades */}
      {currentUser && prospecto.numero_telefono && (
        <ProspectoOportunidades
          prospectoId={prospecto.id}
          numeroTelefono={prospecto.numero_telefono}
          currentUser={currentUser}
          isAdmin={currentUser.rol === 'admin' || currentUser.rol === 'gerente'}
        />
      )}
      </div>

    </div>
      </div>
    </div>
  );
};

const WelcomePanel: React.FC<{stats: Record<string, number>}> = ({stats}) => (
  <div className="prospecto-detail-content">
    <NeumorphicCard className="welcome-panel-card flex flex-col items-center justify-center text-center p-8">
      <Home size={48} className="text-blue-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Selecciona un Prospecto</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Elige un prospecto de la lista para ver todos sus detalles inmobiliarios, historial y añadir comentarios.
      </p>
      <div className="flex gap-4 mt-6 text-sm text-gray-500 dark:text-gray-300">
        <span><strong className="text-blue-500">{stats.todos ?? 0}</strong> Totales</span>
        <span><strong className="text-green-500">{stats.cierre ?? 0}</strong> Cierres</span>
        <span><strong className="text-amber-500">{stats.negociacion ?? 0}</strong> Negociación</span>
      </div>
    </NeumorphicCard>
  </div>
);

export default ProspectosViewTOI;
