import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ConversacionTOI, MensajeTOI } from '../../types/database';
import ConversationItem from '../ui/ConversationItem';
import SearchBar from '../ui/SearchBar';
import SearchResultItem from '../ui/SearchResultItem';
import AdvisorFilter from '../ui/AdvisorFilter';
import useConversationsStats from '../../hooks/useConversationsStats';
import useCurrentUserTOI from '../../hooks/useCurrentUserTOI';
import { supabase } from '../../lib/supabase';

interface ConversationsSidebarTOIProps {
  conversations: ConversacionTOI[];
  selectedConversation: ConversacionTOI | null;
  onSelectConversation: (conv: ConversacionTOI) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  isSearching: boolean;
  searchResults: {
    mensajes: MensajeTOI[];
    conversaciones: ConversacionTOI[];
  };
  onSelectMessageFromSearch: (msg: MensajeTOI) => void;
  getConversationFromMessage: (msg: MensajeTOI) => ConversacionTOI | null;
  showMobileChat: boolean;
  loading: boolean;
  loadingMore: boolean;
  hasMoreConversations: boolean;
  fetchMoreConversations: () => void;
  totalConversations: number;
  isHidden?: boolean;
  justUpdatedConvId: number | null;
  filteredConversations?: ConversacionTOI[];
}

const ConversationsSidebarTOI: React.FC<ConversationsSidebarTOIProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchTerm,
  onSearchTermChange,
  isSearching,
  searchResults,
  onSelectMessageFromSearch,
  getConversationFromMessage,
  showMobileChat,
  loading,
  loadingMore,
  hasMoreConversations,
  fetchMoreConversations,
  totalConversations,
  isHidden = false,
  justUpdatedConvId,
  filteredConversations
}) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // Hook para obtener estadísticas de conversaciones
  const { totalThisMonth, totalAll, loading: statsLoading } = useConversationsStats();
  
  // Hook para obtener usuario actual
  const { currentUser, isAdmin } = useCurrentUserTOI();
  
  // Estado para filtro por asesor
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  
  // Lista de asesores (SOLO José y David - ÚNICOS asesores reales)
  const advisors = [
    { id: '365cbbef-1242-40f5-b589-865d742e2247', name: 'José Manuel', email: 'jose.manuel@toi.com.mx' },
    { id: '58fe7c0b-0153-4fd8-adcb-8e40e02fce10', name: 'David Sandoval', email: 'david.sandoval@toi.com.mx' }
  ];

  // Estado para conversaciones filtradas por asesor
  const [advisorFilteredConversations, setAdvisorFilteredConversations] = useState<ConversacionTOI[]>([]);
  
  // Función para filtrar conversaciones por asesor
  const getConversationsByAdvisor = async (advisorId: string) => {
    try {
      const { data, error } = await supabase
        .from('leads_toi')
        .select('numero_telefono')
        .eq('assigned_to', advisorId);

      if (error) {
        console.error('Error fetching leads by advisor:', error);
        return [];
      }

      const leadNumbers = data?.map(lead => lead.numero_telefono) || [];
      const filtered = conversations.filter(conv => leadNumbers.includes(conv.numero));
      console.log(`[Filter] Filtered conversations for advisor ${advisorId}:`, filtered.length);
      return filtered;
    } catch (error) {
      console.error('Error in getConversationsByAdvisor:', error);
      return [];
    }
  };
  
  // Efecto para aplicar filtro cuando cambie el asesor seleccionado
  useEffect(() => {
    if (selectedAdvisor) {
      getConversationsByAdvisor(selectedAdvisor).then(filtered => {
        setAdvisorFilteredConversations(filtered);
      });
    } else {
      setAdvisorFilteredConversations([]);
    }
  }, [selectedAdvisor, conversations]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (loadingMore || isSearching) return;
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreConversations && !loading) {
        fetchMoreConversations();
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
  }, [loadingMore, hasMoreConversations, fetchMoreConversations, loading, isSearching]);

  // Usar conversaciones filtradas por asesor si hay un asesor seleccionado
  // Si no hay asesor seleccionado pero hay filteredConversations (del prop), usar esas
  // Si no, usar las originales
  const safeConversations = selectedAdvisor && advisorFilteredConversations.length >= 0 
                            ? advisorFilteredConversations 
                            : Array.isArray(filteredConversations) ? filteredConversations 
                            : Array.isArray(conversations) ? conversations : [];
  const searchConv = Array.isArray(searchResults?.conversaciones) ? searchResults!.conversaciones : [];
  const searchMsgs = Array.isArray(searchResults?.mensajes) ? searchResults!.mensajes : [];
  const isVisible = isMobile ? !isHidden : true;

  if (!isVisible) {
    return null;
  }

  const totalResults = searchConv.length + searchMsgs.length;

  return (
    <div className={`conversations-sidebar ${showMobileChat && isMobile ? 'mobile-hidden' : ''}`}>
      <div className="conversations-header">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          THE ONE Inmobiliaria Chat
        </h2>
        
        <SearchBar
          searchTerm={searchTerm}
          onSearchTermChange={onSearchTermChange}
          placeholder="Buscar conversaciones..."
        />

        {/* Filtro por asesor para Admin */}
        {isAdmin && !isSearching && (
          <AdvisorFilter
            selectedAdvisor={selectedAdvisor}
            onAdvisorChange={setSelectedAdvisor}
            advisors={advisors}
            isAdmin={isAdmin}
          />
        )}

        {!isSearching && (
          <div className="conversations-count">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {statsLoading ? (
                'Cargando...'
              ) : (
                `${totalThisMonth} conversaciones este mes • ${safeConversations.length} de ${totalAll} total`
              )}
            </span>
          </div>
        )}

        {isSearching && (
          <div className="search-results-count">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {totalResults} resultados encontrados
            </span>
          </div>
        )}
      </div>

      <div className="conversations-list">
        {loading && safeConversations.length === 0 ? (
          <div className="loading-state">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-sm text-gray-500">Cargando conversaciones...</span>
          </div>
        ) : isSearching ? (
          <div className="search-results">
            {searchConv.length > 0 && (
              <div className="search-section">
                <h3 className="search-section-title">Conversaciones</h3>
                {searchConv.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={selectedConversation?.id === conv.id}
                    onSelect={() => onSelectConversation(conv)}
                    justUpdated={justUpdatedConvId === conv.id}
                  />
                ))}
              </div>
            )}

            {searchMsgs.length > 0 && (
              <div className="search-section">
                <h3 className="search-section-title">Mensajes</h3>
                {searchMsgs.map((msg) => (
                  <SearchResultItem
                    key={msg.id}
                    message={msg}
                    conversation={getConversationFromMessage(msg) || undefined}
                    searchTerm={searchTerm}
                    onSelect={() => onSelectMessageFromSearch(msg)}
                  />
                ))}
              </div>
            )}

            {totalResults === 0 && (
              <div className="no-results">
                <Search className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No se encontraron resultados</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {safeConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onSelect={() => onSelectConversation(conversation)}
                justUpdated={justUpdatedConvId === conversation.id}
              />
            ))}

            {/* Elemento para scroll infinito */}
            {hasMoreConversations && (
              <div ref={loadMoreRef} className="load-more-trigger">
                {loadingMore && (
                  <div className="loading-more">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-xs text-gray-500">Cargando más...</span>
                  </div>
                )}
              </div>
            )}

            {safeConversations.length === 0 && !loading && (
              <div className="empty-state">
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    No hay conversaciones disponibles
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationsSidebarTOI;
