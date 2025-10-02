import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { supabase } from './lib/supabase';
import { ConversacionTOI, MensajeTOI } from './types/database';
import { 
  Search, 
  ArrowLeft,
  CheckCheck,
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock4,
  BarChart,
  Phone,
  X,
  Moon,
  Sun,
  Activity,
  LineChart,
  Star,
  ChevronLeft,
  Settings,
  Zap,
  Grid3X3
} from 'lucide-react';
import { Session } from '@supabase/supabase-js';

// Importar hooks para THE ONE Inmobiliaria
import useConversacionesTOI from './hooks/useConversacionesTOI';
import useMensajesTOIEnhanced from './hooks/useMensajesTOIEnhanced';
import useConversationsStats from './hooks/useConversationsStats';
import useDashboardData from './hooks/useDashboardData';
import useImageViewer from './hooks/useImageViewer';
import useSettings from './hooks/useSettings';
import { useConversationsFilter } from './hooks/useConversationsFilter';

// Importar componentes
import NavBar from './components/layout/NavSidebar';
import ConversationsSidebarTOI from './components/layout/ConversationsSidebarTOI';
import ChatView from './components/layout/ChatView';
import ImageViewer from './components/chat/ImageViewer';
import SettingsPage from './pages/SettingsPage';
import Login from './components/auth/Login';
import ProspectosViewTOI from './components/layout/ProspectosViewTOI';
import DemoView from './components/demo/DemoView';
import InsightsView from './components/layout/InsightsView';
import LogsView from './components/layout/LogsView';
import StatsViewOptimized from './components/layout/StatsViewOptimized';

// Nuevos componentes del sistema de asignación
import AdminLeadsView from './components/admin/AdminLeadsView';
import OportunidadesView from './components/oportunidades/OportunidadesView';
import useCurrentUserTOI from './hooks/useCurrentUserTOI';

import InfoModal from './components/ui/InfoModal';
import ToastContainer from './components/ui/ToastContainer';

// Tipos de vistas disponibles
type AppView = 'chat' | 'settings' | 'prospectos' | 'demo' | 'insights' | 'logs' | 'stats' | 'admin_leads' | 'mis_leads' | 'oportunidades';

// Hook para debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook personalizado para manejar rutas simples
function useRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return { currentPath, navigate };
}

function App() {
  const { currentPath, navigate } = useRouter();
  
  // --- Obtener usuario actual y su rol ---
  const { currentUser, loading: loadingUser, isAdmin, isAsesor } = useCurrentUserTOI();
  
  // 🔍 DEBUG: Log del estado del usuario
  useEffect(() => {
    console.log('[App] 👤 User state:', { 
      currentUser: currentUser?.email, 
      isAdmin, 
      isAsesor, 
      loadingUser,
      rol: currentUser?.rol 
    });
  }, [currentUser, isAdmin, isAsesor, loadingUser]);
  
  // 🚨 CRÍTICO: Mostrar loading hasta que sepamos quién es el usuario
  // Esto previene que los hooks se ejecuten con userId undefined
  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando usuario...</p>
        </div>
      </div>
    );
  }
  
  // 🚨 Si no hay usuario autenticado, mostrar Login (NO AppContent)
  if (!currentUser) {
    return <Login />;
  }
  
  return <AppContent currentUser={currentUser} isAdmin={isAdmin} isAsesor={isAsesor} currentPath={currentPath} navigate={navigate} />;
}

// Componente separado que solo se renderiza DESPUÉS de que el usuario esté cargado
function AppContent({ currentUser, isAdmin, isAsesor, currentPath, navigate }: {
  currentUser: { id: string; email: string; nombre: string; rol: string; activo: boolean };
  isAdmin: boolean;
  isAsesor: boolean;
  currentPath: string;
  navigate: (path: string) => void;
}) {
  // --- Estado para la conversación seleccionada (necesario para el hook de mensajes) ---
  const [selectedConversationForMessages, setSelectedConversationForMessages] = useState<number | null>(null);

  // --- Hooks para THE ONE Inmobiliaria --- 
  const {
    messages,
    loadingInitial,
    loadingMore,
    hasMoreMessages,
    messagesEndRef,
    messageInput,
    setMessageInput,
    markMessagesAsRead,
    handleSendMessage: handleSendMessageFromHook,
    fetchMessages,
    fetchMoreMessages,
    justSentMessageIds,
    isRealtimeConnected,
    pollingEnabled,
  } = useMensajesTOIEnhanced({ conversationId: selectedConversationForMessages });

  // --- Ref para almacenar el ID y NÚMERO de la conversación seleccionada --- 
  const selectedConversationRef = useRef<{id: number | null, numero: string | null}>({ id: null, numero: null });

  // --- Callback para manejar la llegada de un nuevo mensaje en tiempo real ---
  const handleNewMessageRealtime = useCallback((newMessage: MensajeTOI) => {
    // Si el nuevo mensaje pertenece a la conversación actualmente seleccionada,
    // simplemente lo añadimos al estado de mensajes.
    // La suscripción dentro de `useMensajesTOI` se encargará de esto de todos modos,
    // pero esta es una capa adicional de reactividad.
    if (selectedConversationRef.current.id === newMessage.conversation_id) {
       console.log("(App.tsx) New message received for the active conversation. The hook should handle it.");
    }
  }, []); 

  const { 
    conversations,
    selectedConversation, 
    searchTerm,
    setSearchTerm,
    isSearching,
    searchResults,
    loadingConversations,
    loadingMore: loadingMoreConversations,
    hasMoreConversations,
    fetchMoreConversations,
    totalConversations,
    justUpdatedConvId,
    markConversationAsRead: markConversationAsReadInList,
    setSelectedConversation,
    fetchConversations: refetchConversations,
    clearSearch
  } = useConversacionesTOI({ 
    onNewMessageReceived: handleNewMessageRealtime,
    userId: currentUser?.id,
    isAsesor: isAsesor,
  });

  // Hook para estadísticas de conversaciones
  const { totalThisMonth, totalAll } = useConversationsStats();

  // Hook para filtro por asesor (solo para admin)
  const {
    selectedAdvisor,
    advisors,
    filteredConversations,
    advisorStats,
    handleAdvisorChange
  } = useConversationsFilter({ conversations });

  const { 
    modalImage,
    currentImageGroup,
    currentImageIndex,
    openImageViewer,
    closeImageViewer,
    hoverTimerRef, 
    setCurrentImageIndex,
    setModalImage 
  } = useImageViewer();

  // --- Determinar vista actual basada en la ruta ---
  const getCurrentView = (): AppView => {
    switch (currentPath) {
      case '/logs': return 'logs';
      case '/settings': return 'settings';
      case '/prospectos': return 'prospectos';
      case '/demo': return 'demo';
      case '/insights': return 'insights';
      case '/stats': return 'stats';
      case '/admin/leads': return 'admin_leads';
      case '/mis-leads': return 'mis_leads';
      case '/oportunidades': return 'oportunidades';
      default: return 'chat';
    }
  };

  const currentView = getCurrentView();

  // Estado para controlar la visibilidad del chat en móviles
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  // Estado para detectar si estamos en móvil
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  
  // Estado de Autenticación con Supabase Auth
  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  // Estado para el modal de información de Análisis
  
  // Estado del embudo y resumen IA del prospecto actualmente seleccionado
  const [prospectoEstadoEmbudo, setProspectoEstadoEmbudo] = useState<string | null>(null);
  const [prospectoResumenIA, setProspectoResumenIA] = useState<string | null>(null);


  // Efecto para manejar autenticación con Supabase
  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoadingAuth(false);
      }
    };

    getInitialSession();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setLoadingAuth(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Efecto para detectar cambios de tamaño de pantalla
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Efecto para ajustar altura en móviles ---
  useEffect(() => {
    const setAppHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
      console.log(`App height set to: ${window.innerHeight}px`);
    };

    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', setAppHeight);
    setAppHeight();

    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('orientationchange', setAppHeight);
    };
  }, []);

  // --- Efecto para actualizar la Referencia (ID y NÚMERO) --- 
  useEffect(() => {
      selectedConversationRef.current = { 
          id: selectedConversation?.id ?? null, 
          numero: selectedConversation?.numero ?? null 
      };
      console.log("(App.tsx) selectedConversationRef updated to:", selectedConversationRef.current);
  }, [selectedConversation]);

  // --- Efectos Secundarios Optimizados --- 

  // Sincronizar la conversación seleccionada con el estado para el hook de mensajes
  useEffect(() => {
    const conversationId = selectedConversation?.id ?? null;
    console.log(`(App.tsx) Conversation changed. ID: ${conversationId}`);
    setSelectedConversationForMessages(conversationId);
  }, [selectedConversation?.id]);
  
  // Marcar como leído cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation?.id && selectedConversation.tiene_no_leidos) {
      console.log('(App.tsx effect) Marking conversation as read:', selectedConversation.id);
      // Pequeño delay para dar tiempo a que la UI reaccione si es necesario
      const timer = setTimeout(() => {
        // Marcamos como leídos los mensajes y actualizamos el estado de la conversación en la lista.
        markMessagesAsRead(selectedConversation.id);
        markConversationAsReadInList(selectedConversation.id);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedConversation, markMessagesAsRead, markConversationAsReadInList]);

  // Obtener estado del embudo y resumen IA del prospecto cuando se selecciona una conversación
  useEffect(() => {
    const fetchProspectoData = async () => {
      if (!selectedConversation?.numero) {
        setProspectoEstadoEmbudo(null);
        setProspectoResumenIA(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('prospectos_toi')
          .select('estado_embudo, resumen_ia')
          .eq('numero_telefono', selectedConversation.numero)
          .single();

        if (error) {
          console.error('Error fetching prospecto data:', error);
          setProspectoEstadoEmbudo(null);
          setProspectoResumenIA(null);
        } else if (data) {
          setProspectoEstadoEmbudo(data.estado_embudo);
          setProspectoResumenIA(data.resumen_ia);
        }
      } catch (err) {
        console.error('Exception fetching prospecto data:', err);
        setProspectoEstadoEmbudo(null);
        setProspectoResumenIA(null);
      }
    };

    fetchProspectoData();
  }, [selectedConversation?.numero]);

  // --- Funciones de Manejo ---

  // Función optimizada para seleccionar conversación
  const handleSelectConversation = useCallback((conv: ConversacionTOI | null) => {
    console.log('(App.tsx) Selecting conversation:', conv?.id);
    setSelectedConversation(conv);
    if (isMobile) {
      setShowMobileChat(true);
    }
  }, [setSelectedConversation, isMobile]);

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  };
  
  const handleSendMessage = () => {
    handleSendMessageFromHook(selectedConversation?.id ?? null);
  };

  const handlePrevImage = () => {
    if (currentImageGroup && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setModalImage(currentImageGroup[currentImageIndex - 1]);
    }
  };

  const handleNextImage = () => {
    if (currentImageGroup && currentImageIndex < currentImageGroup.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setModalImage(currentImageGroup[currentImageIndex + 1]);
    }
  };

  const handleViewChange = (view: AppView) => {
    console.log('[App] 🔀 View change requested:', view);
    
    // Navegar a la ruta correspondiente
    const routeMap: Record<AppView, string> = {
      'chat': '/',
      'settings': '/settings',
      'prospectos': '/prospectos',
      'demo': '/demo',
      'insights': '/insights',
      'logs': '/logs',
      'stats': '/stats',
      'admin_leads': '/admin/leads',
      'mis_leads': '/mis-leads',
      'oportunidades': '/oportunidades'
    };
    
    const route = routeMap[view];
    console.log('[App] 🔀 Navigating to:', route);
    navigate(route);
  };

  const handleSelectConversationFromProspect = (numero: string) => {
    const conversationToSelect = conversations.find(c => c.numero === numero);
    if (conversationToSelect) {
      console.log(`(App.tsx) Found conversation for prospect ${numero}. Switching to chat view.`);
      setSelectedConversation(conversationToSelect);
      navigate('/'); // Navegar a la vista de chat
       if (isMobile) {
        setShowMobileChat(true);
      }
    } else {
      console.warn(`(App.tsx) No conversation found for prospect with number: ${numero}`);
      // Opcionalmente, podrías mostrar una notificación al usuario aquí.
    }
  };

  // Función para navegar desde Chat a Prospectos
  const handleNavigateToProspecto = useCallback((numero: string) => {
    console.log(`(App.tsx) Navigating to prospect with number: ${numero}`);
    
    // Guardar el número en sessionStorage para que ProspectosViewTOI lo capture
    sessionStorage.setItem('navigateToProspecto', numero);
    
    // Navegar a la vista de prospectos
    navigate('/prospectos');
  }, [navigate]);

  // --- Autenticación Simplificada ---
  useEffect(() => {
    // Verificar sesión demo en localStorage
    const checkDemoSession = () => {
      try {
        const sessionData = localStorage.getItem('demo_user_session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          // Verificar que la sesión no haya expirado (24 horas)
          const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000;
          if (!isExpired && session.authenticated) {
            // Ya no usamos demo session
            localStorage.removeItem('demo_user_session');
          } else {
            localStorage.removeItem('demo_user_session');
          }
        }
      } catch (error) {
        console.error('Error checking demo session:', error);
        localStorage.removeItem('demo_user_session');
      }
      setLoadingAuth(false);
    };

    checkDemoSession();
  }, []);

  // --- Datos del Dashboard (ahora usa los mensajes cargados actualmente) ---
  // const { stats, keywords, criticalCount } = useDashboardData(messages, conversations);

  // --- Manejo de Imágenes ---
  const uniqueImages = useMemo(() => {
    const imageMessages = messages.filter(msg => msg.media_url);
    return Array.from(new Set(imageMessages.map(msg => msg.media_url))).filter(Boolean) as string[];
  }, [messages]);

  // --- Función para renderizar contenido de mensajes ---
  const renderMessageContent = useCallback((mensaje: MensajeTOI) => {
    const imageRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/gi;
    const matches = mensaje.mensaje.match(imageRegex) || [];
    let mediaUrls: string[] = [];
    if (mensaje.media_url) {
      try {
        const parsed = JSON.parse(mensaje.media_url);
        mediaUrls = Array.isArray(parsed) ? parsed : [mensaje.media_url];
      } catch (e) {
        mediaUrls = [mensaje.media_url];
      }
    }
    const allImages = [...matches, ...mediaUrls.filter(url => url && url.trim() !== '')];
    const uniqueImages = [...new Set(allImages)];
    let textContent = mensaje.mensaje;
    uniqueImages.forEach(url => { textContent = textContent.replace(url, ''); });
    textContent = textContent.trim();

    const handleImageClickInternal = (url: string, index: number) => openImageViewer(url, uniqueImages, index);
    const handleMouseEnterInternal = (url: string, index: number) => {
      hoverTimerRef.current = setTimeout(() => openImageViewer(url, uniqueImages, index), 500);
    };
    const handleMouseLeaveInternal = () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current); };

    return (
      <>
        {textContent && <div className="message-text">{textContent}</div>}
        {uniqueImages.length > 0 && (
          <div className="message-images">
            {uniqueImages.slice(0, 4).map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Imagen ${index + 1}`} 
                className="message-image" 
                onClick={() => handleImageClickInternal(url, index)} 
                onMouseEnter={() => handleMouseEnterInternal(url, index)} 
                onMouseLeave={handleMouseLeaveInternal} 
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
              />
            ))}
          </div>
        )}
      </>
    );
  }, [openImageViewer, hoverTimerRef]);

  // Función para obtener la conversación asociada a un mensaje (para la búsqueda)
  const getConversationFromMessage = (msg: MensajeTOI): ConversacionTOI | null => {
    return conversations.find(c => c.numero === msg.numero) || null;
  };

  // --- Logout ---
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        setSession(null);
        console.log('Successfully signed out');
      }
    } catch (error) {
      console.error('Error in handleLogout:', error);
    }
  };

  // --- Renderizado Condicional ---
  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <Activity className="animate-spin text-blue-500 h-12 w-12" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'settings':
        return <SettingsPage />;
      case 'insights':
        return <InsightsView />;
      case 'logs':
        return <LogsView />;
      case 'stats':
        return <StatsViewOptimized />;
      case 'prospectos':
        return (
          <ProspectosViewTOI 
            conversations={conversations}
            onSelectConversation={handleSelectConversationFromProspect}
            currentUser={currentUser}
          />
        );
      case 'admin_leads':
        if (!isAdmin || !currentUser) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 font-medium">⚠️ Acceso denegado</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Solo administradores pueden acceder a esta sección</p>
              </div>
            </div>
          );
        }
        return <AdminLeadsView currentUser={currentUser} />;
      
      case 'mis_leads':
        if (!currentUser) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-600 dark:text-yellow-400 font-medium">⚠️ Error de autenticación</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">No se pudo cargar tu información de usuario</p>
              </div>
            </div>
          );
        }
        return <AdminLeadsView currentUser={currentUser} />;
      
      case 'oportunidades':
        if (!currentUser) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-600 dark:text-yellow-400 font-medium">⚠️ Error de autenticación</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">No se pudo cargar tu información de usuario</p>
              </div>
            </div>
          );
        }
        return (
          <OportunidadesView 
            currentUser={currentUser} 
            isAdmin={isAdmin}
            onNavigateToMessages={(numeroTelefono) => {
              // Navegar a mensajes y seleccionar la conversación
              navigate('/');
              // Buscar la conversación por número de teléfono
              const conversation = conversations.find(conv => conv.numero === numeroTelefono);
              if (conversation) {
                handleSelectConversation(conversation);
              }
            }}
            onNavigateToProspectos={(numeroTelefono) => {
              // Navegar a prospectos
              navigate('/prospectos');
              // TODO: En el futuro se puede implementar selección automática del prospecto
            }}
          />
        );
      case 'demo':
        return <DemoView />;
      default:
        return (
          <main className="main-content">
            <ConversationsSidebarTOI
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              selectedConversation={selectedConversation}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              loading={loadingConversations}
              justUpdatedConvId={justUpdatedConvId}
              isSearching={isSearching}
              searchResults={searchResults}
              onSelectMessageFromSearch={(msg) => {
                const conv = getConversationFromMessage(msg);
                if (conv) handleSelectConversation(conv);
              }}
              getConversationFromMessage={getConversationFromMessage}
              showMobileChat={showMobileChat}
              loadingMore={loadingMoreConversations}
              hasMoreConversations={hasMoreConversations}
              fetchMoreConversations={fetchMoreConversations}
              totalConversations={totalConversations}
              filteredConversations={isAdmin ? filteredConversations : undefined}
            />
            <ChatView
              selectedConversation={selectedConversation}
              messages={messages}
              onBackToList={handleBackToList}
              showMobileChat={showMobileChat}
              onSendMessage={handleSendMessage}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              // Props para paginación
              fetchMoreMessages={fetchMoreMessages}
              hasMoreMessages={hasMoreMessages}
              loadingInitial={loadingInitial}
              loadingMore={loadingMore}
              // Props para navegación a prospectos
              onNavigateToProspecto={handleNavigateToProspecto}
              prospectoEstadoEmbudo={prospectoEstadoEmbudo}
              prospectoResumenIA={prospectoResumenIA}
              justSentMessageIds={justSentMessageIds}
              isRealtimeConnected={isRealtimeConnected}
              pollingEnabled={pollingEnabled}
              totalConversations={totalAll}
              totalThisMonth={totalThisMonth}
            />
          </main>
        );
    }
  };

  return (
    <div className={`app-container theme-${localStorage.getItem('theme') || 'dark'} flex flex-col h-screen`}>
      <div className="main-content aligned-layout">
        {!isMobile && (
          <NavBar 
            showMobileChat={showMobileChat} 
            currentView={currentView}
            onViewChange={handleViewChange}
            handleLogout={handleLogout}
            onNavigateBack={handleBackToList}
            isAdmin={isAdmin}
            isAsesor={isAsesor}
          />
        )}
        
        {renderActiveView()}
      </div>

      {/* Barra de navegación inferior siempre visible en móvil */}
      {isMobile && (
        <NavBar 
          showMobileChat={showMobileChat}
          currentView={currentView}
          onViewChange={handleViewChange}
          handleLogout={handleLogout}
          onNavigateBack={handleBackToList}
          isAdmin={isAdmin}
          isAsesor={isAsesor}
        />
      )}
      
      {/* Visor de imágenes */}
      {modalImage && (
        <ImageViewer
          modalImage={modalImage}
          currentImageGroup={currentImageGroup}
          currentImageIndex={currentImageIndex}
          onClose={closeImageViewer}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}
      
      {/* Contenedor de notificaciones toast */}
      <ToastContainer />
    </div>
  );
}

export default App;