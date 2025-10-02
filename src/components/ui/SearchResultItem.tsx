import React from 'react';
import { MessageCircle, Hash } from 'lucide-react';
import { Conversacion, Mensaje, ConversacionTOI, MensajeTOI } from '../../types/database';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface SearchResultItemProps {
  conversation?: Conversacion | ConversacionTOI | null;
  message?: Mensaje | MensajeTOI;
  searchTerm: string;
  onClick?: () => void;
  onSelect?: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  conversation,
  message,
  searchTerm,
  onClick,
  onSelect
}) => {
  const highlightText = (text: string, searchTerm: string) => {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (conversation) {
    const timeAgo = conversation.updated_at 
      ? formatDistanceToNow(parseISO(conversation.updated_at), { addSuffix: true, locale: es })
      : '';

    return (
      <div className="conversation-item" onClick={onClick || onSelect}>
        <div className="avatar">
          <MessageCircle size={20} />
        </div>
        <div className="conversation-details">
          <div className="conversation-name-container">
            <div className="conversation-name">
              {highlightText(conversation.nombre_contacto || 'Sin nombre', searchTerm)}
            </div>
            <div className="conversation-time">{timeAgo}</div>
          </div>
          <div className="conversation-preview-container">
            <div className="conversation-number">
              {highlightText(conversation.numero, searchTerm)}
            </div>
          </div>
          {conversation.ultimo_mensaje_resumen && (
            <div className="conversation-preview">
              {highlightText(conversation.ultimo_mensaje_resumen, searchTerm)}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (message) {
    const timeAgo = message.fecha 
      ? formatDistanceToNow(parseISO(message.fecha), { addSuffix: true, locale: es })
      : '';

    return (
      <div className="conversation-item" onClick={onClick || onSelect}>
        <div className="avatar">
          <Hash size={20} />
        </div>
        <div className="conversation-details">
          <div className="conversation-name-container">
            <div className="conversation-name">
              {highlightText(message.nombre || 'Mensaje', searchTerm)}
            </div>
            <div className="conversation-time">{timeAgo}</div>
          </div>
          <div className="conversation-preview-container">
            <div className="conversation-number">
              {highlightText(message.numero, searchTerm)}
            </div>
          </div>
          <div className="conversation-preview">
            {highlightText(message.mensaje, searchTerm)}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SearchResultItem; 