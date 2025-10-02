import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ConversacionTOI, MensajeTOI } from '../types/database';
import useDebounce from './useDebounce';

// Constantes para paginación
const CONVERSATIONS_INITIAL_LOAD = 30;
const CONVERSATIONS_PER_PAGE = 30;

interface UseConversacionesTOIOptions {
  onNewMessageReceived?: (message: MensajeTOI) => void;
  userId?: string;
  isAsesor?: boolean;
}

export default function useConversacionesTOI(options: UseConversacionesTOIOptions = {}) {
  const { onNewMessageReceived, userId, isAsesor } = options;
  
  // Estados principales
  const [conversations, setConversations] = useState<ConversacionTOI[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversacionTOI | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalConversations, setTotalConversations] = useState<number>(0);
  const [justUpdatedConvId, setJustUpdatedConvId] = useState<number | null>(null);
  
  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ conversaciones: ConversacionTOI[]; mensajes: MensajeTOI[] }>({ conversaciones: [], mensajes: [] });
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Refs para control
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const previousSearchTerm = useRef('');
  
  // Función para cargar conversaciones iniciales
  const fetchConversations = useCallback(async () => {
    if (!isInitialLoad && loadingConversations) return;
    
    console.log('[useConversacionesTOI] 🚀 Fetching initial conversations...', { userId, isAsesor });
    setLoadingConversations(true);
    const startTime = performance.now();
    
    try {
      // Si es asesor, obtener números de teléfono asignados desde prospectos_toi
      let assignedNumbers: string[] = [];
      if (isAsesor && userId) {
        console.log('[useConversacionesTOI] 🔍 Filtering for asesor:', { userId, isAsesor });
        const { data: prospectos, error: prospectosError } = await supabase
          .from('prospectos_toi')
          .select('numero_telefono')
          .eq('assigned_to', userId);
        
        if (prospectosError) {
          console.error('[useConversacionesTOI] ❌ Error fetching assigned prospectos:', prospectosError);
        } else {
          assignedNumbers = prospectos?.map(p => p.numero_telefono) || [];
          console.log('[useConversacionesTOI] 🎯 Asesor filter - User ID:', userId);
          console.log('[useConversacionesTOI] 🎯 Asesor filter - Assigned numbers:', assignedNumbers);
        }
      } else {
        console.log('[useConversacionesTOI] 👤 Admin or no filter - showing all conversations');
      }

      // Obtener conversaciones con su último mensaje usando una consulta más simple
      let query = supabase
        .from('conversaciones_toi')
        .select(`
          id,
          numero,
          nombre_contacto,
          ultimo_mensaje_resumen,
          updated_at,
          tiene_no_leidos,
          no_leidos_count,
          canal,
          resumen,
          status,
          reactivacion_intentos,
          ultimo_intento_reactivacion,
          proximo_seguimiento,
          resumen_ia
        `)
        .order('updated_at', { ascending: false })
        .limit(CONVERSATIONS_INITIAL_LOAD);
      
      // Aplicar filtro de asesor si corresponde
      if (isAsesor && assignedNumbers.length > 0) {
        query = query.in('numero', assignedNumbers);
      }
      
      const { data: conversationsData, error: conversationsError } = await query;

      // Obtener el count por separado con el mismo filtro
      let countQuery = supabase
        .from('conversaciones_toi')
        .select('*', { count: 'exact', head: true });
      
      if (isAsesor && assignedNumbers.length > 0) {
        countQuery = countQuery.in('numero', assignedNumbers);
      }
      
      const { count } = await countQuery;

      console.log('[useConversacionesTOI] Total conversations available:', count);
      setTotalConversations(count || 0);

      if (conversationsError) {
        console.error('Error fetching TOI conversations:', conversationsError);
        setConversations([]);
        setHasMoreConversations(false);
      } else {
        // Obtener las fechas de los últimos mensajes para cada conversación
        const conversationIds = conversationsData?.map(c => c.id) || [];
        let lastMessageDates: { [key: number]: Date } = {};

        if (conversationIds.length > 0) {
          const { data: messageDates } = await supabase
            .from('mensajes_toi')
            .select('conversation_id, fecha')
            .in('conversation_id', conversationIds)
            .order('fecha', { ascending: false });

          if (messageDates) {
            // Crear un mapa de conversation_id -> fecha más reciente
            lastMessageDates = messageDates.reduce((acc, msg) => {
              if (!acc[msg.conversation_id] || new Date(msg.fecha) > acc[msg.conversation_id]) {
                acc[msg.conversation_id] = new Date(msg.fecha);
              }
              return acc;
            }, {} as { [key: number]: Date });
          }
        }

        // Agregar la fecha del último mensaje a cada conversación usando el campo real_last_message_date
        const conversationsWithLastMessageDate = (conversationsData || []).map(conv => ({
          ...conv,
          real_last_message_date: lastMessageDates[conv.id]?.toISOString() || conv.updated_at
        }));

        // Ordenar por la fecha del último mensaje real
        const sortedConversations = conversationsWithLastMessageDate.sort((a, b) => {
          const dateA = new Date(a.real_last_message_date || a.updated_at || 0);
          const dateB = new Date(b.real_last_message_date || b.updated_at || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setConversations(sortedConversations);
      }

      setCurrentPage(1);
      
      // Verificar si hay más conversaciones
      const hasMore = (count || 0) > CONVERSATIONS_INITIAL_LOAD;
      setHasMoreConversations(hasMore);
      
      const endTime = performance.now();
      console.log(`[useConversacionesTOI] Initial fetch completed in ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`[useConversacionesTOI] Successfully fetched ${CONVERSATIONS_INITIAL_LOAD} initial conversations. Has more: ${hasMore}`);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      setConversations([]);
      setHasMoreConversations(false);
    }

    console.log('[useConversacionesTOI] Finished initial fetch, loading set to false.');
    setLoadingConversations(false);
    setIsInitialLoad(false);
  }, [userId, isAsesor, isInitialLoad, loadingConversations]);

  // Función para cargar más conversaciones
  const fetchMoreConversations = useCallback(async () => {
    if (loadingConversations || loadingMore || !hasMoreConversations || isSearching) {
      return;
    }

    console.log(`[useConversacionesTOI] Fetching page ${currentPage} conversations...`);
    setLoadingMore(true);
    
    try {
      // Si es asesor, obtener números asignados desde prospectos_toi
      let assignedNumbers: string[] = [];
      if (isAsesor && userId) {
        const { data: prospectos } = await supabase
          .from('prospectos_toi')
          .select('numero_telefono')
          .eq('assigned_to', userId);
        assignedNumbers = prospectos?.map(p => p.numero_telefono) || [];
      }

      const from = currentPage * CONVERSATIONS_PER_PAGE;
      const to = from + CONVERSATIONS_PER_PAGE - 1;

      let query = supabase
        .from('conversaciones_toi')
        .select(`
          id,
          numero,
          nombre_contacto,
          ultimo_mensaje_resumen,
          updated_at,
          tiene_no_leidos,
          no_leidos_count,
          canal,
          resumen,
          status,
          reactivacion_intentos,
          ultimo_intento_reactivacion,
          proximo_seguimiento,
          resumen_ia
        `)
        .order('updated_at', { ascending: false })
        .range(from, to);
      
      if (isAsesor && assignedNumbers.length > 0) {
        query = query.in('numero', assignedNumbers);
      }

      const { data: conversationsData, error: conversationsError } = await query;

      if (conversationsError) {
        console.error('Error fetching more TOI conversations:', conversationsError);
        return;
      }

      const newConversations = conversationsData || [];

      if (newConversations.length > 0) {
        // Obtener las fechas de los últimos mensajes para las nuevas conversaciones
        const newConversationIds = newConversations.map(c => c.id);
        let newLastMessageDates: { [key: number]: Date } = {};

        if (newConversationIds.length > 0) {
          const { data: messageDates } = await supabase
            .from('mensajes_toi')
            .select('conversation_id, fecha')
            .in('conversation_id', newConversationIds)
            .order('fecha', { ascending: false });

          if (messageDates) {
            newLastMessageDates = messageDates.reduce((acc, msg) => {
              if (!acc[msg.conversation_id] || new Date(msg.fecha) > acc[msg.conversation_id]) {
                acc[msg.conversation_id] = new Date(msg.fecha);
              }
              return acc;
            }, {} as { [key: number]: Date });
          }
        }

        setConversations(prev => {
          // Agregar la fecha del último mensaje a las nuevas conversaciones
          const newConversationsWithLastMessageDate = newConversations.map(conv => ({
            ...conv,
            real_last_message_date: newLastMessageDates[conv.id]?.toISOString() || conv.updated_at
          }));

          const updatedConversations = [...prev, ...newConversationsWithLastMessageDate];
          return updatedConversations.sort((a, b) => {
            const dateA = new Date(a.real_last_message_date || a.updated_at || 0);
            const dateB = new Date(b.real_last_message_date || b.updated_at || 0);
            return dateB.getTime() - dateA.getTime();
          });
        });
        setCurrentPage(prev => prev + 1);
      }
      
      setHasMoreConversations(newConversations.length === CONVERSATIONS_PER_PAGE);
      
    } catch (error) {
      console.error('Error in fetchMoreConversations:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMoreConversations, loadingConversations, loadingMore, isSearching, isAsesor, userId]);

  // Función para buscar conversaciones
  const searchConversations = useCallback(async (term: string) => {
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    searchAbortControllerRef.current = new AbortController();
    const { signal } = searchAbortControllerRef.current;

    if (!term.trim()) {
      setSearchResults({ conversaciones: [], mensajes: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase
        .from('conversaciones_toi')
        .select(`
          id,
          numero,
          nombre_contacto,
          ultimo_mensaje_resumen,
          updated_at,
          tiene_no_leidos,
          no_leidos_count,
          canal,
          resumen,
          status,
          reactivacion_intentos,
          ultimo_intento_reactivacion,
          proximo_seguimiento,
          resumen_ia
        `)
        .or(
          `numero.ilike.%${term}%,nombre_contacto.ilike.%${term}%,ultimo_mensaje_resumen.ilike.%${term}%`
        )
        .order('updated_at', { ascending: false })
        .limit(20)
        .abortSignal(signal);

      if (error) {
        if (error.name !== 'AbortError') {
          console.error('Error searching TOI conversations:', error);
        }
        return;
      }

      // Obtener las fechas de los últimos mensajes para los resultados de búsqueda
      const searchConversationIds = data?.map(c => c.id) || [];
      let searchLastMessageDates: { [key: number]: Date } = {};

      if (searchConversationIds.length > 0) {
        const { data: messageDates } = await supabase
          .from('mensajes_toi')
          .select('conversation_id, fecha')
          .in('conversation_id', searchConversationIds)
          .order('fecha', { ascending: false });

        if (messageDates) {
          searchLastMessageDates = messageDates.reduce((acc, msg) => {
            if (!acc[msg.conversation_id] || new Date(msg.fecha) > acc[msg.conversation_id]) {
              acc[msg.conversation_id] = new Date(msg.fecha);
            }
            return acc;
          }, {} as { [key: number]: Date });
        }
      }

      // Agregar la fecha del último mensaje a los resultados de búsqueda
      const searchResultsWithLastMessageDate = (data || []).map(conv => ({
        ...conv,
        lastMessageDate: searchLastMessageDates[conv.id] || new Date(conv.updated_at || 0)
      }));

      // Ordenar resultados de búsqueda por fecha del último mensaje
      const sortedResults = searchResultsWithLastMessageDate.sort((a, b) => {
        return b.lastMessageDate.getTime() - a.lastMessageDate.getTime();
      });

      setSearchResults({ conversaciones: sortedResults, mensajes: [] });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error in searchConversations:', error);
      }
    } finally {
      if (!signal.aborted) {
        setIsSearching(false);
      }
    }
  }, []);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults({ conversaciones: [], mensajes: [] });
    setIsSearching(false);
  }, []);

  // Función para reordenar conversaciones cuando llega un nuevo mensaje
  const sortConversationsByLatestMessage = useCallback((conversationId: number, messageDate: string) => {
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            updated_at: messageDate,
            real_last_message_date: messageDate
          };
        }
        return conv;
      });
      
      return updated.sort((a, b) => {
        const dateA = new Date(a.real_last_message_date || a.updated_at || 0);
        const dateB = new Date(b.real_last_message_date || b.updated_at || 0);
        return dateB.getTime() - dateA.getTime();
      });
    });
    setJustUpdatedConvId(conversationId);
  }, []);

  // Marcar conversación como leída
  const markConversationAsRead = useCallback((conversationId: number) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      tiene_no_leidos: false,
      no_leidos_count: 0,
      updated_at: c.updated_at
    } : c));
  }, []);

  // Manejar cambios en el término de búsqueda debounced
  useEffect(() => {
    if (debouncedSearchTerm !== previousSearchTerm.current) {
      searchConversations(debouncedSearchTerm);
      previousSearchTerm.current = debouncedSearchTerm;
    }
  }, [debouncedSearchTerm, searchConversations]);

  // Cargar conversaciones al montar el componente
  // Cargar conversaciones inicialmente y cuando cambien userId o isAsesor
  useEffect(() => {
    console.log('[useConversacionesTOI] 🔄 Loading conversations (user/role changed)...', { userId, isAsesor });
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAsesor]);

  // Limpiar controladores de búsqueda
  useEffect(() => {
    return () => {
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Suscripción en tiempo real OPTIMIZADA - Escuchar CONVERSACIONES en lugar de mensajes
  useEffect(() => {
    if (isSearching) {
      return;
    }

    console.log('[useConversacionesTOI] 🔄 Setting up optimized real-time subscription...');

    const channel = supabase
      .channel('conversaciones_toi_optimized_subscription')
      // ✅ OPTIMIZACIÓN: Escuchar cambios en conversaciones_toi (más eficiente)
      // Los triggers ya actualizan esta tabla cuando llegan mensajes
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversaciones_toi' },
        (payload) => {
          console.log('[useConversacionesTOI] 📩 Conversación actualizada:', payload.new.id);
          
          // Actualizar conversación en el estado
          setConversations(prev => {
            const conversationIndex = prev.findIndex(c => c.id === payload.new.id);
            
            if (conversationIndex >= 0) {
              // Actualizar conversación existente
              const updated = [...prev];
              updated[conversationIndex] = {
                ...updated[conversationIndex],
                ...payload.new,
                real_last_message_date: payload.new.ultimo_mensaje_fecha || payload.new.updated_at
              };
              
              // Reordenar por fecha de último mensaje
              return updated.sort((a, b) => {
                const dateA = new Date(a.real_last_message_date || a.updated_at || 0);
                const dateB = new Date(b.real_last_message_date || b.updated_at || 0);
                return dateB.getTime() - dateA.getTime();
              });
            } else {
              // Nueva conversación - agregarla al inicio
              console.log('[useConversacionesTOI] ✨ Nueva conversación detectada, agregando...');
              return [{
                ...payload.new,
                real_last_message_date: payload.new.ultimo_mensaje_fecha || payload.new.updated_at
              }, ...prev].sort((a, b) => {
                const dateA = new Date(a.real_last_message_date || a.updated_at || 0);
                const dateB = new Date(b.real_last_message_date || b.updated_at || 0);
                return dateB.getTime() - dateA.getTime();
              });
            }
          });
          
          // Llamar callback si existe
          if (onNewMessageReceived && payload.new.ultimo_mensaje_tipo === 'entrada') {
            // Crear objeto de mensaje simulado para el callback
            onNewMessageReceived({
              id: 0,
              tipo: 'entrada',
              numero: payload.new.numero,
              mensaje: payload.new.ultimo_mensaje_resumen || '',
              fecha: payload.new.ultimo_mensaje_fecha || payload.new.updated_at,
              nombre: payload.new.nombre_contacto,
              media_url: null,
              leido: false,
              conversation_id: payload.new.id
            } as any);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'prospectos_toi' },
        (payload) => {
          console.log('[useConversacionesTOI] 🔄 Prospecto UPDATE detectado:', payload);
          
          // Si cambió el assigned_to, actualizar conversaciones filtradas
          if (payload.old.assigned_to !== payload.new.assigned_to) {
            console.log('[useConversacionesTOI] 🎯 Reasignación detectada en prospecto');
            console.log('[useConversacionesTOI] Old asesor:', payload.old.assigned_to);
            console.log('[useConversacionesTOI] New asesor:', payload.new.assigned_to);
            console.log('[useConversacionesTOI] Current userId:', userId);
            console.log('[useConversacionesTOI] Is asesor:', isAsesor);
            
            const numero_telefono = payload.new.numero_telefono;
            
            // Si NO es asesor (es admin), no hacer nada (verá todas las conversaciones)
            if (!isAsesor) {
              console.log('[useConversacionesTOI] 👤 Es admin, no aplicar filtro');
              return;
            }
            
            // Es asesor: Aplicar filtro estricto
            console.log('[useConversacionesTOI] 🎯 Es asesor, aplicar filtro estricto');
            
            // CASO 1: Conversación ya NO le pertenece → ELIMINAR (si existe en su vista)
            if (payload.new.assigned_to !== userId) {
              console.log('[useConversacionesTOI] ❌ Conversación ya NO me pertenece');
              setConversations(prev => {
                const exists = prev.some(conv => conv.numero === numero_telefono);
                
                if (exists) {
                  console.log('[useConversacionesTOI] ❌ Conversación estaba en mi vista, REMOVIENDO');
                  return prev.filter(conv => conv.numero !== numero_telefono);
                } else {
                  console.log('[useConversacionesTOI] ℹ️ Conversación no estaba en mi vista, ignorando');
                  return prev;
                }
              });
            }
            
            // CASO 2: Conversación AHORA le pertenece → AGREGAR (si NO existe en su vista)
            if (payload.new.assigned_to === userId) {
              console.log('[useConversacionesTOI] ✅ Conversación AHORA me pertenece');
              setConversations(prev => {
                const exists = prev.some(conv => conv.numero === numero_telefono);
                
                if (!exists) {
                  console.log('[useConversacionesTOI] ✅ Conversación NO estaba en mi vista, recargando lista');
                  fetchConversations(); // Recargar para obtener la conversación completa
                  return prev;
                } else {
                  console.log('[useConversacionesTOI] ℹ️ Conversación YA estaba en mi vista, no hacer nada');
                  return prev;
                }
              });
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log('TOI message subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to TOI message changes.');
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ TOI realtime connection temporarily unavailable, using polling fallback');
        }
      });

    return () => {
      console.log('[useConversacionesTOI] 🧹 Cleaning up optimized subscription...');
      supabase.removeChannel(channel);
    };
  }, [onNewMessageReceived, userId, isAsesor, isSearching]); // ✅ Dependencias optimizadas

  return {
    conversations,
    selectedConversation,
    searchTerm,
    isSearching,
    searchResults,
    loadingConversations,
    loadingMore,
    hasMoreConversations,
    totalConversations,
    justUpdatedConvId,
    setSelectedConversation,
    setSearchTerm,
    fetchMoreConversations,
    fetchConversations,
    clearSearch,
    markConversationAsRead,
    refreshConversations: fetchConversations
  };
}
