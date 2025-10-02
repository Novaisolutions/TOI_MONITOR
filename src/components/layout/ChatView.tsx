import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, MessageSquare, Loader2, User, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Conversacion, Mensaje } from '../../types/database';
import MessageBubble from '../chat/MessageBubble';
import MessageInput from '../chat/MessageInput';
// import { format } from 'date-fns'; // Comentado porque no se usa actualmente
import { es } from 'date-fns/locale';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import useSettings from '../../hooks/useSettings';
import ProfilePicture from '../ui/ProfilePicture';
import { getProfileProps } from '../../utils/avatarUtils';
import ImageViewer from '../chat/ImageViewer';
import useWhatsApp from '../../hooks/useWhatsApp';

// --- Función de Formateo de Mensajes ---
const formatWhatsappMessage = (text: string): React.ReactNode => {
  if (!text) return '';
  const formattingRegex = /(```[\s\S]+?```|~.+?~|\*.+?\*|_.+?_|https?:\/\/[^\s]+)/g;
  const parts = text.split(formattingRegex).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      return <code key={index} className="text-sm bg-gray-200 dark:bg-gray-700 p-1 rounded font-mono mx-0.5">{part.slice(3, -3)}</code>;
    }
    if (part.startsWith('~') && part.endsWith('~')) {
      return <s key={index}>{part.slice(1, -1)}</s>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={index}>{part.slice(1, -1)}</strong>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.match(/^https?:\/\/[^\s]+$/)) {
      return <a href={part} key={index} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{part}</a>;
    }
    return part.split(/(\n)/g).map((line, i) =>
      line === '\n' ? <br key={`${index}-${i}`} /> : line
    );
  });
};

interface ChatViewProps {
  selectedConversation: Conversacion | null;
  messages: Mensaje[];
  onBackToList: () => void;
  showMobileChat: boolean;
  onSendMessage: () => void;
  messageInput: string;
  setMessageInput: (value: string) => void;
  fetchMoreMessages: () => void;
  hasMoreMessages: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  onNavigateToProspecto?: (numero: string) => void; // Nueva prop para navegación
  prospectoEstadoEmbudo?: string | null; // Estado del embudo del prospecto
  prospectoResumenIA?: string | null; // Resumen IA del prospecto
  justSentMessageIds?: Set<string | number>; // IDs de mensajes recién enviados
}

const ChatView: React.FC<ChatViewProps> = ({
  selectedConversation,
  messages,
  onBackToList,
  showMobileChat,
  onSendMessage: _onSendMessage,
  messageInput: _messageInput,
  setMessageInput: _setMessageInput,
  fetchMoreMessages,
  hasMoreMessages,
  loadingInitial,
  loadingMore,
  onNavigateToProspecto,
  prospectoEstadoEmbudo,
  prospectoResumenIA,
  justSentMessageIds = new Set(),
}) => {
  const { timeZone } = useSettings();
  const { sendMessage, sending, clearError } = useWhatsApp();
  
  // Estado local para el input de mensaje
  const [messageInput, setMessageInput] = useState('');
  
  // Estado para mostrar/ocultar el panel de información del prospecto
  const [showProspectoInfo, setShowProspectoInfo] = useState(false);
  
  // Estado para notificaciones
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  // --- Suavizado avanzado de scroll con easing y momentum ---
  const easeInOutCubic = useCallback((t: number) => (
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  ), []);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Medición de "fuerza" de scroll reciente del usuario (momentum)
  const lastWheelMomentumRef = useRef<number>(0);
  const lastWheelTsRef = useRef<number>(0);

  const getRecentMomentum = useCallback(() => {
    const now = performance.now();
    const dt = now - (lastWheelTsRef.current || 0);
    if (dt > 600) return 0; // momentum expira en ~0.6s
    const decay = Math.max(0, 1 - dt / 600);
    return (lastWheelMomentumRef.current || 0) * decay;
  }, []);

  // Listener para capturar la fuerza del scroll del usuario
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      lastWheelMomentumRef.current = Math.min(1200, Math.abs(ev.deltaY));
      lastWheelTsRef.current = performance.now();
    };
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const animateScrollToY = useCallback((toY: number, baseDuration = 550) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const startY = container.scrollTop;
    const maxY = container.scrollHeight;
    const clampedTo = Math.min(Math.max(0, toY), maxY);
    const distance = Math.abs(clampedTo - startY);
    
    // Duración dinámica: más distancia => algo más de duración; más momentum => menos duración
    const momentum = getRecentMomentum();
    const duration = Math.min(
      1000,
      Math.max(280, baseDuration + distance * 0.12 - momentum * 0.35)
    );

    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeInOutCubic(t);
      container.scrollTop = startY + (clampedTo - startY) * eased;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [easeInOutCubic, getRecentMomentum]);
  
  // Estado para el visor de imágenes
  const [viewerState, setViewerState] = useState<{
    image: string | null;
    group: string[];
    index: number;
  }>({ image: null, group: [], index: 0 });

  // Función para abrir una imagen en el visor
  const openImageViewer = (clickedImage: string) => {
    // Filtrar todos los mensajes que tienen media_url para crear el grupo de galería
    const imageGroup = messages.map(m => m.media_url).filter((url): url is string => !!url);
    const clickedIndex = imageGroup.findIndex(url => url === clickedImage);
    
    setViewerState({
      image: clickedImage,
      group: imageGroup,
      index: clickedIndex >= 0 ? clickedIndex : 0,
    });
  };

  // --- Renderizador de Contenido del Mensaje ---
  const renderMessageContent = useCallback((mensaje: Mensaje) => {
    const hasText = mensaje.mensaje && mensaje.mensaje.trim().length > 0;
    const hasMedia = !!mensaje.media_url; // Asegurarse de que es un booleano

    return (
      <div className="whitespace-pre-wrap break-words">
        {hasMedia && (
          <img
            src={mensaje.media_url!} // Usar '!' porque hasMedia lo valida
            alt="Contenido multimedia"
            className="message-image"
            onClick={() => openImageViewer(mensaje.media_url!)}
          />
        )}
        {hasText && (
          <div className={`message-text-content ${hasMedia ? 'with-media' : ''}`}>
            {formatWhatsappMessage(mensaje.mensaje)}
          </div>
        )}
      </div>
    );
  }, [messages]);

  // Referencias para elementos DOM (declaradas arriba para usar en scroll avanzado)
  const scrollPositionRef = useRef<{ scrollHeight: number, scrollTop: number } | null>(null);
  const initialRevealLockRef = useRef<boolean>(false);
  const initialRevealTimerRef = useRef<number | null>(null);

  // --- INTERSECTION OBSERVER PARA CARGA INFINITA ---
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();
  const [enableLoadMore, setEnableLoadMore] = useState<boolean>(false);

  useEffect(() => {
    if (loadingMore) return;
    if (!enableLoadMore) return; // no activar auto-carga hasta que el usuario suba manualmente

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreMessages) {
        console.log("(ChatView) Load more trigger is visible. Fetching more messages.");
        // Guardar la posición del scroll ANTES de que se añadan nuevos elementos
        if (messagesContainerRef.current) {
          scrollPositionRef.current = {
            scrollHeight: messagesContainerRef.current.scrollHeight,
            scrollTop: messagesContainerRef.current.scrollTop,
          };
        }
        fetchMoreMessages();
      }
    });

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loadingMore, hasMoreMessages, fetchMoreMessages, enableLoadMore]);

  // Habilitar el auto load-more cuando el usuario llegue cerca del tope O cuando hay mensajes cargados y puede hacer scroll
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    
    const checkEnableLoadMore = () => {
      // Si el usuario está cerca del tope, activar load-more
      if (el.scrollTop <= 50) {
        setEnableLoadMore(true);
      }
      // Si hay mensajes y puede hacer scroll (altura del contenido > altura del contenedor), permitir load-more
      // Esto cubre el caso de refresh donde ya hay mensajes pero enableLoadMore está false
      else if (messages.length > 0 && el.scrollHeight > el.clientHeight) {
        setEnableLoadMore(true);
      }
    };
    
    const onScroll = () => {
      checkEnableLoadMore();
    };
    
    // Verificar inmediatamente al montar/cambiar mensajes
    checkEnableLoadMore();
    
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [messages.length]); // Añadir messages.length como dependencia

  // --- EFECTO PARA RESTAURAR EL SCROLL ---
  useEffect(() => {
    if (loadingMore) return; // No hacer nada mientras carga

    if (scrollPositionRef.current && messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const oldScrollHeight = scrollPositionRef.current.scrollHeight;
        
      // Si la altura ha cambiado, ajustamos el scroll
      if (newScrollHeight > oldScrollHeight) {
        messagesContainerRef.current.scrollTop = newScrollHeight - oldScrollHeight;
      }
      
      // Limpiamos la referencia para que no se re-aplique
      scrollPositionRef.current = null;
    }
  }, [messages, loadingMore]);

  // --- EFECTO DE SCROLL INTELIGENTE ---
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || loadingMore) return;

    // Mantener anclado al fondo mientras dura la revelación inicial (evita saltos al aparecer mensajes con delay o imágenes)
    if (initialRevealLockRef.current) {
      container.scrollTop = container.scrollHeight;
      return;
    }

    // "Threshold" es qué tan cerca del fondo debe estar el usuario para que el scroll automático se active.
    const scrollThreshold = 300; // en píxeles
    
    // El cálculo determina si el usuario está cerca del fondo.
    // scrollHeight: altura total del contenido.
    // clientHeight: altura visible del contenedor.
    // scrollTop: cuánto se ha desplazado el usuario desde arriba.
    const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + scrollThreshold;

    // Si el usuario está cerca del fondo, o si es la carga inicial de mensajes (cuando scrollTop es 0), hacemos scroll.
    if (isScrolledToBottom) {
    scrollToBottom(true);
    }
    // Si el usuario ha subido para ver mensajes antiguos, no hacemos nada.
    // El scroll se mantendrá en su posición gracias al efecto de restauración de scroll que ya existe.

  }, [messages, loadingMore]);

  // --- Efecto para resetear en cambio de conversación ---
  useEffect(() => {
    // Al cambiar de conversación, los mensajes se vaciarán y luego
    // se llenarán con los nuevos, disparando el scroll.
    // Hacemos un scroll inicial sin animación por si acaso.
    scrollToBottom(false); 
    setEnableLoadMore(false); // resetear estado inicialmente

    // Activar bloqueo de revelación inicial para anclar al fondo y evitar subidas
    initialRevealLockRef.current = true;
    if (initialRevealTimerRef.current) {
      clearTimeout(initialRevealTimerRef.current);
      initialRevealTimerRef.current = null;
    }
    // Desbloquear después de 1.5s (tiempo suficiente para la animación más rápida)
    initialRevealTimerRef.current = window.setTimeout(() => {
      initialRevealLockRef.current = false;
      initialRevealTimerRef.current = null;
      // Después de la animación inicial, verificar si se debe activar enableLoadMore
      // Esto es importante para casos de refresh o cambio de conversación
      const el = messagesContainerRef.current;
      if (el && messages.length > 0 && el.scrollHeight > el.clientHeight) {
        setEnableLoadMore(true);
      }
    }, 1500);
  }, [selectedConversation]);

  const scrollToBottom = (smooth: boolean = true) => {
     const container = messagesContainerRef.current;
     if (!container) return;
     const target = container.scrollHeight;
     if (!smooth) {
       container.scrollTop = target;
       return;
     }
     // pequeño retardo para permitir layout tras nuevos mensajes
     setTimeout(() => {
       animateScrollToY(target, 560);
     }, 40);
  };

  // Función para encabezado de fecha (zona horaria)
  const getDateHeader = (utcDate: Date): string => {
    const zonedDate = toZonedTime(utcDate, timeZone);
    const nowZoned = toZonedTime(new Date(), timeZone);
    const isTodayZoned = zonedDate.getFullYear() === nowZoned.getFullYear() && zonedDate.getMonth() === nowZoned.getMonth() && zonedDate.getDate() === nowZoned.getDate();
    const yesterdayZoned = new Date(nowZoned);
    yesterdayZoned.setDate(nowZoned.getDate() - 1);
    const isYesterdayZoned = zonedDate.getFullYear() === yesterdayZoned.getFullYear() && zonedDate.getMonth() === yesterdayZoned.getMonth() && zonedDate.getDate() === yesterdayZoned.getDate();
    if (isTodayZoned) return 'Hoy';
    if (isYesterdayZoned) return 'Ayer';
    return formatInTimeZone(utcDate, timeZone, "EEEE, d 'de' MMMM", { locale: es });
  };

  // Agrupar mensajes por fecha
  const groupMessagesByDate = (msgs: Mensaje[]) => {
    // 1. Ordenar por fecha asc y, a igualdad de timestamp, priorizar 'entrada' sobre 'salida'
    const sortedMsgs = [...msgs].sort((a, b) => {
      const ta = new Date(a.fecha).getTime();
      const tb = new Date(b.fecha).getTime();
      if (ta !== tb) return ta - tb;
      // prioridad: entrada (0) antes que salida (1)
      const pa = a.tipo === 'entrada' ? 0 : 1;
      const pb = b.tipo === 'entrada' ? 0 : 1;
      if (pa !== pb) return pa - pb;
      // desempate estable por id
      return (a.id || 0) - (b.id || 0);
    });

    // 2. Agrupar por fecha
    const groups: { [key: string]: Mensaje[] } = {};
    sortedMsgs.forEach(msg => {
      const dateStr = formatInTimeZone(new Date(msg.fecha), timeZone, 'yyyy-MM-dd');
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(msg);
    });

    // 3. Convertir a array y ORDENAR los grupos por fecha
    return Object.entries(groups)
      .map(([dateKey, messagesInGroup]) => {
        // La clave de fecha necesita que se le añada la zona horaria para evitar que se interprete como UTC
        const adjustedDate = new Date(`${dateKey}T00:00:00`);
        return {
          date: adjustedDate,
          messages: messagesInGroup,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const messageGroups = groupMessagesByDate(messages);

  // Calcular props para el avatar del header AQUÍ
  const headerAvatarProps = selectedConversation 
    ? getProfileProps(selectedConversation.nombre_contacto || selectedConversation.numero)
    : { initials: '??', bgColor: '#60A5FA' }; // Fallback si no hay conversación

  // Función para manejar el envío de mensajes
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedConversation || sending) {
      return;
    }

    const messageToSend = messageInput.trim();
    const recipientNumber = selectedConversation.numero;

    console.log('[ChatView] Enviando mensaje:', {
      to: recipientNumber,
      message: messageToSend,
    });

    // Limpiar el input inmediatamente para mejor UX
    setMessageInput('');

    try {
      const result = await sendMessage({
        to: recipientNumber,
        message: messageToSend,
      });

      if (result.success) {
        console.log('[ChatView] Mensaje enviado exitosamente:', result.messageId);
        
        // Mostrar notificación de éxito
        setNotification({
          type: 'success',
          message: '✓ Mensaje enviado',
        });
        
        // Ocultar notificación después de 3 segundos
        setTimeout(() => setNotification(null), 3000);
        
        // Si existe el callback original, llamarlo también
        if (_onSendMessage) {
          _onSendMessage();
        }
      } else {
        // Restaurar el mensaje si hubo error
        setMessageInput(messageToSend);
        
        // Mostrar notificación de error
        setNotification({
          type: 'error',
          message: result.error || 'Error al enviar mensaje',
        });
        
        // Ocultar notificación después de 5 segundos
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      console.error('[ChatView] Error al enviar mensaje:', err);
      // Restaurar el mensaje si hubo error
      setMessageInput(messageToSend);
      
      setNotification({
        type: 'error',
        message: 'Error de conexión al enviar mensaje',
      });
      
      setTimeout(() => setNotification(null), 5000);
    }
  }, [messageInput, selectedConversation, sending, sendMessage, _onSendMessage]);

  // Limpiar notificaciones cuando se cambia de conversación
  useEffect(() => {
    setNotification(null);
    setMessageInput('');
    clearError();
  }, [selectedConversation, clearError]);

  return (
    <div className={`chat-view ${showMobileChat ? 'visible' : ''}`}>
      {selectedConversation ? (
        <>
          <div className="relative">
            {/* Header principal */}
            <div className="chat-header">
              <button className="back-button" onClick={onBackToList} aria-label="Volver a la lista">
                <ArrowLeft size={20} />
              </button>
              
              <div className="chat-contact-info">
                <ProfilePicture 
                  initials={headerAvatarProps.initials} 
                  bgColor={headerAvatarProps.bgColor}
                  size="md"
                  className="mr-3"
                />
                <div className="chat-contact-details">
                  <div className="chat-contact-name">
                    {selectedConversation.nombre_contacto || "Sin nombre"}
                  </div>
                  <div className="chat-contact-status">
                    {selectedConversation.numero}
                  </div>
                </div>
              </div>
              
              {/* Resumen IA integrado en el header */}
              {(prospectoEstadoEmbudo || prospectoResumenIA) && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <button
                    onClick={() => setShowProspectoInfo(!showProspectoInfo)}
                    className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    <Sparkles size={12} />
                    <span className="font-medium">
                      {prospectoEstadoEmbudo ? prospectoEstadoEmbudo.replace(/_/g, ' ') : 'Ver info'}
                    </span>
                    {showProspectoInfo ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
              )}

              <div className="chat-header-actions ml-auto">
                {/* Botón para ir al prospecto - Solo icono circular */}
                {onNavigateToProspecto && selectedConversation && (
                  <button
                    onClick={() => onNavigateToProspecto(selectedConversation.numero)}
                    className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-full hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 hover:shadow-lg transition-all duration-200 hover:scale-105"
                    title={`Ver prospecto en CRM${prospectoEstadoEmbudo ? ` (${prospectoEstadoEmbudo.replace(/_/g, ' ')})` : ''}`}
                  >
                    <User size={18} className="flex-shrink-0" />
                  </button>
                )}
              </div>
            </div>


            {/* Ventana flotante compacta con resumen IA */}
            {showProspectoInfo && prospectoResumenIA && (
              <div className="absolute top-full left-0 right-0 z-50 mx-4 mt-2 animate-slideDown">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-purple-200 dark:border-purple-700 p-3 max-w-md">
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-purple-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {prospectoResumenIA}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="messages-container" ref={messagesContainerRef}>
            {loadingInitial ? (
              <div className="loading-overlay">
                <Loader2 className="animate-spin text-blue-500" size={48} />
              </div>
            ) : (
              <>
                <div ref={loadMoreRef} className="load-more-trigger">
                  {loadingMore && (
                    <div className="loading-spinner-top">
                      <Loader2 className="animate-spin text-gray-400" size={24} />
                    </div>
                  )}
                </div>

            {messageGroups.map((group, idx) => (
              <div key={`${selectedConversation.id}-group-${idx}`} className="message-date-group">
                <div className="message-date-header"><span>{getDateHeader(group.date)}</span></div>
                {group.messages.map((msg, i, arr) => {
                  // Animación escalonada más rápida: ~0.15s por mensaje, con tope
                  const fromEndIndex = arr.length - 1 - i;
                  const delay = Math.min(fromEndIndex * 150, 600); // cap 600ms
                  const isJustSent = justSentMessageIds.has(msg.id);
                  return (
                    <MessageBubble
                      key={`${selectedConversation.id}-msg-${msg.id}`}
                      message={msg}
                      renderMessageContent={renderMessageContent}
                      animationDelayMs={delay}
                      isJustSent={isJustSent}
                    />
                  );
                })}
              </div>
            ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Notificación flotante */}
          {notification && (
            <div 
              className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
                notification.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* Barra de entrada de mensajes */}
          <MessageInput
            messageInput={messageInput}
            onMessageInputChange={setMessageInput}
            onSendMessage={handleSendMessage}
          />
        </>
      ) : (
        <div className="empty-chat-state">
          <div className="empty-chat-icon">
            <MessageSquare size={48} />
          </div>
          <h3>Selecciona una conversación</h3>
          <p>Escoge un chat de la lista para ver los mensajes</p>
        </div>
      )}
      
      {/* El ImageViewer ahora se renderiza aquí con las props correctas */}
      {viewerState.image && (
        <ImageViewer
          modalImage={viewerState.image}
          currentImageGroup={viewerState.group}
          currentImageIndex={viewerState.index}
          onClose={() => setViewerState(prev => ({ ...prev, image: null }))}
          onPrev={() => setViewerState(prev => ({ ...prev, index: (prev.index - 1 + prev.group.length) % prev.group.length, image: prev.group[(prev.index - 1 + prev.group.length) % prev.group.length] }))}
          onNext={() => setViewerState(prev => ({ ...prev, index: (prev.index + 1) % prev.group.length, image: prev.group[(prev.index + 1) % prev.group.length] }))}
        />
      )}
    </div>
  );
};

export default ChatView; 