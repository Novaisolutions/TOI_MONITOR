import React from 'react';
import { Conversacion, Mensaje, ConversacionTOI, MensajeTOI } from '../../types/database'; // Ajustar ruta
import { truncateText } from '../../utils/textUtils'; // Ajustar ruta
import { formatInTimeZone } from 'date-fns-tz'; // Importar función
import useSettings from '../../hooks/useSettings';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import CanalIcon from './CanalIcon';

interface ConversationItemProps {
  conversation?: Conversacion | ConversacionTOI | null;
  messagePreview?: Mensaje | MensajeTOI;
  isSelected: boolean;
  onClick?: () => void;
  onSelect?: () => void;
  getConversationFromMessage?: (msg: Mensaje | MensajeTOI) => Conversacion | ConversacionTOI | null;
  isNewlyUpdated?: boolean;
  justUpdated?: boolean;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  messagePreview,
  isSelected,
  onClick,
  onSelect,
  getConversationFromMessage,
  isNewlyUpdated = false,
  justUpdated = false
}) => {
  // Obtener la zona horaria desde settings
  const { timeZone } = useSettings();
  
  const displayConversation = conversation ?? (messagePreview ? getConversationFromMessage(messagePreview) : null);

  const name = displayConversation?.nombre_contacto || 'Sin nombre';
  const number = displayConversation?.numero || messagePreview?.numero || '';
  const previewText = messagePreview
    ? truncateText(messagePreview.mensaje, 40)
    : displayConversation?.ultimo_mensaje_resumen || 'Sin mensajes';
  
  // Determinar la fecha relevante para formatear la hora
  // Prioridad: 1) fecha del messagePreview, 2) lastMessageDate, 3) updated_at
  const relevantDate = messagePreview?.fecha ||
                      (displayConversation as any)?.lastMessageDate?.toISOString() ||
                      displayConversation?.updated_at;

  // Formatear la hora usando la zona horaria desde settings
  const time = relevantDate
    ? formatInTimeZone(new Date(relevantDate), timeZone, 'HH:mm')
    : '--:--';

  const unreadCount = displayConversation?.tiene_no_leidos ? displayConversation.no_leidos_count : 0;
  const avatarInitial = name?.[0]?.toUpperCase() || '#';
  
  // Obtener canal de la conversación
  const canal = (displayConversation as ConversacionTOI)?.canal || 'whatsapp';
  
  // Debug: mostrar canal para verificar
  if (name === 'María González' || name === 'Ana Martínez') {
    console.log(`[ConversationItem] ${name} - Canal recibido:`, canal, 'Conversación completa:', displayConversation);
  }
  

  let timeAgo = '';
  // Usar la misma fecha relevante para el tiempo relativo
  const dateToFormat = messagePreview?.fecha ||
                      (displayConversation as any)?.lastMessageDate?.toISOString() ||
                      displayConversation?.updated_at;
  if (dateToFormat) {
    try {
      timeAgo = formatDistanceToNow(parseISO(dateToFormat), { addSuffix: true, locale: es });
      timeAgo = timeAgo.replace('hace alrededor de', 'hace');
      timeAgo = timeAgo.replace('hace menos de un minuto', 'ahora');
      timeAgo = timeAgo.replace('hace aproximadamente', 'hace');
      timeAgo = timeAgo.replace('hace casi', 'hace');
    } catch (e) {
      console.error("Error formatting date:", dateToFormat, e);
      timeAgo = 'Fecha inválida';
    }
  }

  const itemClasses = [
    'conversation-item',
    isSelected ? 'active' : '',
    isNewlyUpdated ? 'animate-highlight' : ''
  ].filter(Boolean).join(' ');

  const handleClick = onClick || onSelect;

  return (
    <div
      className={itemClasses}
      onClick={handleClick}
    >
      <div 
        className="avatar" 
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px', // Menos redondo, más moderno
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid rgba(255,255,255,0.1)',
          padding: '8px'
        }}
      >
        {/* Icono de canal en lugar de la inicial */}
        <CanalIcon canal={canal} size={20} />
      </div>
      <div className="conversation-details">
        <div className="conversation-name-container">
          <div className="conversation-name">
            {name}
          </div>
          <div className="conversation-time">
            {timeAgo && <span>{timeAgo}</span>}
          </div>
        </div>
        <div className="conversation-preview-container">
          <div className="conversation-number">
            {number}
          </div>
          <div className="conversation-preview">
            {previewText}
          </div>
          {unreadCount > 0 && (
            <div className="unread-badge">{unreadCount}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem; 