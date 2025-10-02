import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { MensajeTOI } from '../types/database';
import { showToast } from '../components/ui/ToastContainer';

const MESSAGES_INITIAL_LOAD = 30;
const MESSAGES_PER_PAGE = 20;
const POLLING_INTERVAL = 5000; // 5 segundos - respaldo activo para garantizar actualización
const MAX_POLLING_ATTEMPTS = 5; // Menos intentos, confiamos en realtime

interface UseMensajesTOIEnhancedProps {
  conversationId: number | null;
}

export default function useMensajesTOIEnhanced(props?: UseMensajesTOIEnhancedProps) {
  // Obtener conversationId desde props O usar null si no se proporciona
  const externalConversationId = props?.conversationId ?? null;
  
  const [messages, setMessages] = useState<MensajeTOI[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  
  // Ref para scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estado interno para el ID de conversación actual (sincronizado con el externo)
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(externalConversationId);
  
  // Rastrear mensajes recién enviados para animaciones
  const [justSentMessageIds, setJustSentMessageIds] = useState<Set<string | number>>(new Set());
  
  // Estado de conexión real-time
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [pollingEnabled, setPollingEnabled] = useState(true); // SIEMPRE activado como respaldo
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  
  // Refs para control de polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);

  // Sincronizar currentConversationId con el ID externo cuando cambie
  useEffect(() => {
    if (externalConversationId !== currentConversationId) {
      console.log(`🔄 [useMensajesTOIEnhanced] External conversation ID changed from ${currentConversationId} to ${externalConversationId}`);
      setCurrentConversationId(externalConversationId);
      setMessages([]);
      setLastMessageId(null);
      pollingAttemptsRef.current = 0;
      setPollingEnabled(externalConversationId !== null);
    }
  }, [externalConversationId]); // Solo externalConversationId como dependencia

  // Cargar mensajes automáticamente cuando cambia currentConversationId
  useEffect(() => {
    if (currentConversationId) {
      console.log(`📥 [useMensajesTOIEnhanced] Auto-loading messages for conversation ${currentConversationId}`);
      fetchMessages(currentConversationId);
    }
  }, [currentConversationId]); // Removemos fetchMessages de las dependencias

  // Función para cargar mensajes de una conversación
  const fetchMessages = useCallback(async (conversationId: number | null) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    console.log(`[useMensajesTOIEnhanced] Fetching messages for conversation ${conversationId}...`);
    setLoadingInitial(true);

    try {
      const { data, error } = await supabase
        .from('mensajes_toi')
        .select('id, tipo, numero, mensaje, fecha, nombre, conversation_id, leido')
        .eq('conversation_id', conversationId)
        .order('fecha', { ascending: false })
        .limit(MESSAGES_INITIAL_LOAD);

      if (error) {
        console.error('Error fetching TOI messages:', error);
        setMessages([]);
        setHasMoreMessages(false);
      } else {
        const sortedMessages = (data || []).sort((a, b) => 
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
        setMessages(sortedMessages);
        setHasMoreMessages((data || []).length === MESSAGES_INITIAL_LOAD);
        
        // Establecer el último ID para polling
        if (sortedMessages.length > 0) {
          setLastMessageId(sortedMessages[sortedMessages.length - 1].id);
        }
        
        console.log(`[useMensajesTOIEnhanced] Loaded ${sortedMessages.length} messages`);
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      setMessages([]);
      setHasMoreMessages(false);
    } finally {
      setLoadingInitial(false);
    }
  }, []); // Sin dependencias para evitar loops

  // Función de polling para nuevos mensajes
  const pollForNewMessages = useCallback(async () => {
    if (!currentConversationId) {
      return;
    }

    try {
      // Logging reducido - solo cuando encuentre mensajes nuevos
      
      // Si no hay lastMessageId, obtener TODOS los mensajes nuevos
      let query = supabase
        .from('mensajes_toi')
        .select('id, tipo, numero, mensaje, fecha, nombre, conversation_id, leido')
        .eq('conversation_id', currentConversationId)
        .order('fecha', { ascending: true });

      // Solo filtrar por ID si tenemos uno
      if (lastMessageId) {
        query = query.gt('id', lastMessageId);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error polling for new messages:', error);
        pollingAttemptsRef.current++;
        
        if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
          console.warn('Max polling attempts reached, disabling polling');
          setPollingEnabled(false);
        }
        return;
      }

      if (data && data.length > 0) {
        setMessages(prev => {
          // Si no hay lastMessageId, significa que es la primera vez
          // Solo agregar mensajes que no existan ya
          const newMessages = data.filter(newMsg => 
            !prev.some(existingMsg => existingMsg.id === newMsg.id)
          );
          
          if (newMessages.length === 0) {
            // No hay mensajes nuevos, no logear nada
            return prev;
          }
          
          // SOLO loguear si hay mensajes REALMENTE nuevos
          console.log(`✅ [POLLING] Adding ${newMessages.length} new message(s)`);
          return [...prev, ...newMessages];
        });
        
        // Actualizar lastMessageId al ID más alto
        const maxId = Math.max(...data.map(m => m.id));
        setLastMessageId(maxId);
        pollingAttemptsRef.current = 0; // Reset attempts on success
        
        // Mostrar notificación para mensajes nuevos (solo entrada)
        const newInboundMessages = data.filter(msg => msg.tipo === 'entrada');
        if (newInboundMessages.length > 0) {
          showToast({
            type: 'info',
            title: '💬 Nuevo mensaje',
            message: `${newInboundMessages.length} mensaje(s) nuevo(s)`,
            duration: 3000,
          });
        }
        
        // Scroll al final
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Error in pollForNewMessages:', error);
      pollingAttemptsRef.current++;
    }
  }, [currentConversationId, lastMessageId]);

  // Iniciar/detener polling - SOLO si realtime NO está conectado
  useEffect(() => {
    // Si realtime está conectado, NO usar polling
    if (isRealtimeConnected) {
      if (pollingIntervalRef.current) {
        console.log('⏸️ [useMensajesTOIEnhanced] Pausing polling - Realtime connected');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setPollingEnabled(false);
      return;
    }

    // Usar polling SIEMPRE como respaldo (incluso si realtime está conectado)
    if (pollingEnabled && currentConversationId) {
      const statusMsg = isRealtimeConnected ? 'como respaldo de realtime' : 'como fallback principal';
      console.log(`🔄 [useMensajesTOIEnhanced] Starting polling ${statusMsg}...`);
      pollingIntervalRef.current = setInterval(pollForNewMessages, POLLING_INTERVAL);
      
      return () => {
        if (pollingIntervalRef.current) {
          console.log('⏸️ [useMensajesTOIEnhanced] Stopping polling...');
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [pollingEnabled, currentConversationId, pollForNewMessages, isRealtimeConnected]);

  // Función para enviar un mensaje (mejorada)
  const handleSendMessage = useCallback(async (conversationId: number | null) => {
    if (!conversationId || !messageInput.trim()) {
      return;
    }

    console.log(`[useMensajesTOIEnhanced] Sending message to conversation ${conversationId}...`);

    try {
      // Primero obtener el número de la conversación
      const { data: conversationData, error: convError } = await supabase
        .from('conversaciones_toi')
        .select('numero')
        .eq('id', conversationId)
        .single();

      if (convError || !conversationData) {
        console.error('Error getting conversation number:', convError);
        return;
      }

      const messageToSend = messageInput.trim();
      
      // Crear mensaje temporal para UI inmediata
      const tempMessage: MensajeTOI = {
        id: `temp-${Date.now()}`, // ID temporal
        tipo: 'salida',
        numero: conversationData.numero,
        mensaje: messageToSend,
        fecha: new Date().toISOString(),
        nombre: null,
        media_url: null,
        leido: true,
        conversation_id: conversationId
      };

      // Agregar mensaje temporal inmediatamente para mejor UX
      setMessages(prev => [...prev, tempMessage]);
      setMessageInput(''); // Limpiar input inmediatamente
      
      // Marcar como mensaje recién enviado para animación
      setJustSentMessageIds(prev => new Set([...prev, tempMessage.id]));
      
      // Scroll al final inmediatamente
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      const newMessage = {
        tipo: 'salida',
        numero: conversationData.numero,
        mensaje: messageToSend,
        fecha: new Date().toISOString(),
        nombre: null,
        media_url: null,
        leido: true,
        conversation_id: conversationId
      };

      const { data: insertedData, error } = await supabase
        .from('mensajes_toi')
        .insert([newMessage])
        .select()
        .single();

      if (error) {
        console.error('Error sending TOI message:', error);
        // Remover mensaje temporal si hay error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        setMessageInput(messageToSend); // Restaurar mensaje
        
        showToast({
          type: 'warning',
          title: '❌ Error al enviar',
          message: 'No se pudo enviar el mensaje',
          duration: 3000,
        });
      } else {
        console.log('TOI message sent successfully:', insertedData);
        // Reemplazar mensaje temporal con el real
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? insertedData : msg
        ));
        
        // Actualizar el tracking de mensajes recién enviados
        setJustSentMessageIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempMessage.id);
          newSet.add(insertedData.id);
          return newSet;
        });
        
        // Actualizar último ID para polling
        setLastMessageId(insertedData.id);
        
        // Remover de mensajes recién enviados después de 2 segundos
        setTimeout(() => {
          setJustSentMessageIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(insertedData.id);
            return newSet;
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      // En caso de error, remover mensaje temporal
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    }
  }, [messageInput]);

  // Suscripción en tiempo real (mejorada con fallback)
  useEffect(() => {
    if (!currentConversationId) {
      return;
    }

    console.log(`[useMensajesTOIEnhanced] Setting up real-time subscription for conversation ${currentConversationId}...`);

    const channel = supabase
      .channel(`mensajes_toi_conversation_${currentConversationId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'mensajes_toi',
          filter: `conversation_id=eq.${currentConversationId}`
        },
        (payload) => {
          console.log('[useMensajesTOIEnhanced] New TOI message received via realtime:', payload.new);
          setMessages(prev => {
            const newMessage = payload.new as MensajeTOI;
            // Evitar duplicados
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          
          // Actualizar último ID
          setLastMessageId(payload.new.id);
          
          // Scroll automático al final
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          
          setIsRealtimeConnected(true);
          // Mantener polling activo como respaldo
        }
      )
      .subscribe((status) => {
        console.log(`[useMensajesTOIEnhanced] TOI messages subscription status for conversation ${currentConversationId}:`, status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to TOI message changes.');
          setIsRealtimeConnected(true);
          // Mantener polling activo como respaldo
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ TOI message realtime connection error, polling is active as fallback.');
          setIsRealtimeConnected(false);
          // Polling ya está activo
        }
      });

    return () => {
      console.log(`[useMensajesTOIEnhanced] Cleaning up TOI messages subscription for conversation ${currentConversationId}...`);
      supabase.removeChannel(channel);
    };
  }, [currentConversationId]);

  // Scroll automático cuando se cargan mensajes iniciales
  useEffect(() => {
    if (messages.length > 0 && !loadingInitial) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [messages.length, loadingInitial]);

  // Función para cargar más mensajes (scroll infinito hacia arriba)
  const fetchMoreMessages = useCallback(async () => {
    if (!currentConversationId || loadingMore || !hasMoreMessages) {
      return;
    }

    console.log(`[useMensajesTOIEnhanced] Fetching more messages for conversation ${currentConversationId}...`);
    setLoadingMore(true);

    try {
      const oldestMessage = messages[0];
      if (!oldestMessage) {
        setLoadingMore(false);
        return;
      }

      const { data, error } = await supabase
        .from('mensajes_toi')
        .select('id, tipo, numero, mensaje, fecha, nombre, conversation_id, leido')
        .eq('conversation_id', currentConversationId)
        .lt('fecha', oldestMessage.fecha)
        .order('fecha', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (error) {
        console.error('Error fetching more TOI messages:', error);
      } else {
        const sortedNewMessages = (data || []).sort((a, b) => 
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
        
        if (sortedNewMessages.length > 0) {
          setMessages(prev => [...sortedNewMessages, ...prev]);
        }
        
        setHasMoreMessages((data || []).length === MESSAGES_PER_PAGE);
      }
    } catch (error) {
      console.error('Error in fetchMoreMessages:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentConversationId, messages, loadingMore, hasMoreMessages]);

  // Función para marcar mensajes como leídos
  const markMessagesAsRead = useCallback(async (conversationId: number) => {
    if (!conversationId) return;

    try {
      const { error } = await supabase
        .from('mensajes_toi')
        .update({ leido: true })
        .eq('conversation_id', conversationId)
        .eq('leido', false);

      if (error) {
        console.error('Error marking TOI messages as read:', error);
      } else {
        // Actualizar el estado local
        setMessages(prev => prev.map(msg => 
          msg.conversation_id === conversationId ? { ...msg, leido: true } : msg
        ));
      }
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
    }
  }, []);

  return {
    messages,
    loadingInitial,
    loadingMore,
    hasMoreMessages,
    messagesEndRef,
    messageInput,
    setMessageInput,
    markMessagesAsRead,
    handleSendMessage,
    fetchMessages,
    fetchMoreMessages,
    justSentMessageIds,
    isRealtimeConnected,
    pollingEnabled
  };
}
