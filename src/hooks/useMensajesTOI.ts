import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { MensajeTOI } from '../types/database';

const MESSAGES_INITIAL_LOAD = 30;
const MESSAGES_PER_PAGE = 20;

export default function useMensajesTOI() {
  const [messages, setMessages] = useState<MensajeTOI[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  
  // Ref para scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estado interno para el ID de conversación actual
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  
  // Rastrear mensajes recién enviados para animaciones
  const [justSentMessageIds, setJustSentMessageIds] = useState<Set<string | number>>(new Set());

  // Función para cargar mensajes de una conversación
  const fetchMessages = useCallback(async (conversationId: number | null) => {
    if (!conversationId) {
      setMessages([]);
      setCurrentConversationId(null);
      return;
    }

    if (conversationId === currentConversationId) {
      return; // Ya tenemos los mensajes de esta conversación
    }

    console.log(`[useMensajesTOI] Fetching messages for conversation ${conversationId}...`);
    setLoadingInitial(true);
    setCurrentConversationId(conversationId);

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
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      setMessages([]);
      setHasMoreMessages(false);
    } finally {
      setLoadingInitial(false);
    }
  }, [currentConversationId]);

  // Función para cargar más mensajes (scroll infinito hacia arriba)
  const fetchMoreMessages = useCallback(async () => {
    if (!currentConversationId || loadingMore || !hasMoreMessages) {
      return;
    }

    console.log(`[useMensajesTOI] Fetching more messages for conversation ${currentConversationId}...`);
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

  // Función para enviar un mensaje
  const handleSendMessage = useCallback(async (conversationId: number | null) => {
    if (!conversationId || !messageInput.trim()) {
      return;
    }

    console.log(`[useMensajesTOI] Sending message to conversation ${conversationId}...`);

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

  // Suscripción en tiempo real para mensajes nuevos de la conversación actual
  useEffect(() => {
    if (!currentConversationId) {
      return;
    }

    console.log(`[useMensajesTOI] Setting up real-time subscription for conversation ${currentConversationId}...`);

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
          console.log('New TOI message received:', payload.new);
          setMessages(prev => [...prev, payload.new as MensajeTOI]);
          
          // Scroll automático al final
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'mensajes_toi',
          filter: `conversation_id=eq.${currentConversationId}`
        },
        (payload) => {
          console.log('TOI message updated:', payload.new);
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id ? payload.new as MensajeTOI : msg
          ));
        }
      )
      .subscribe((status) => {
        console.log(`TOI messages subscription status for conversation ${currentConversationId}:`, status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to TOI message changes.');
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ TOI message realtime connection error.');
        }
      });

    return () => {
      console.log(`Cleaning up TOI messages subscription for conversation ${currentConversationId}...`);
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
    justSentMessageIds
  };
}
