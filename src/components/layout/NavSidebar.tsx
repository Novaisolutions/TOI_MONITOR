import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Users,
  BarChart,
  LogOut,
  Calendar,
  UserPlus,
  Lightbulb,
  Activity
} from 'lucide-react';
import InfoModal from '../ui/InfoModal';

// Tipos de vistas posibles (debería centralizarse o importarse)
type AppView = 'chat' | 'settings' | 'prospectos' | 'demo' | 'insights' | 'logs' | 'stats' | 'admin_leads' | 'mis_leads' | 'oportunidades';

// Actualizamos las props para incluir la nueva vista
interface NavBarProps {
  showMobileChat: boolean;
  currentView?: AppView; // Usar el tipo actualizado
  onViewChange?: (view: AppView) => void; // Usar el tipo actualizado
  handleLogout: () => void;
  onNavigateBack?: () => void; // Nueva prop para retroceder
  isAdmin?: boolean; // Nueva prop para saber si es admin
  isAsesor?: boolean; // Nueva prop para saber si es asesor
}

const NavBar: React.FC<NavBarProps> = ({ 
  showMobileChat, 
  currentView = 'chat',
  onViewChange,
  handleLogout,
  onNavigateBack,
  isAdmin = false,
  isAsesor = false
}) => {

  // 🔍 DEBUG: Log de props recibidas
  useEffect(() => {
    console.log('[NavBar] 🎯 Props received:', { isAdmin, isAsesor, currentView });
  }, [isAdmin, isAsesor, currentView]);

  // Estado para el modal de estadísticas
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Determinar si estamos en móvil o escritorio
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  
  // Efecto para detectar cambios de tamaño de pantalla
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // En móvil, siempre visible
  // En escritorio, sólo visible cuando no estamos en chat si estamos en lateral
  const isVisible = isMobile ? true : !showMobileChat;
  
  // Clase CSS según el modo (móvil o escritorio)
  const navClass = isMobile ? 'nav-footer' : 'nav-sidebar';
  
  // Helper para el click en los iconos
  const handleNavClick = (targetView: AppView) => {
    // Bloquear acceso a estadísticas con popup informativo (solo stats, no insights)
    if (targetView === 'stats') {
      setShowStatsModal(true);
      return;
    }

    // Si estamos en móvil, viendo un chat, y se pulsa el icono de chat
    if (isMobile && currentView === 'chat' && targetView === 'chat' && showMobileChat && onNavigateBack) {
      onNavigateBack(); // Llama a la función para retroceder
    } else if (onViewChange) {
      onViewChange(targetView); // Comportamiento normal de cambio de vista
    }
  };

  // Comentado para desactivar temporalmente
  // const googleSheetUrl = "https://docs.google.com/spreadsheets/d/1igWo0TPXhU30nAOHGu8jrb1EKcjZkkS3dpND4KSIgXw/edit?usp=sharing";

  return (
    <div className={`${navClass} ${!isVisible ? 'hidden' : ''}`}>
      {!isMobile && (
        <div className="nav-sidebar-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
          {/* Icono inmobiliario profesional */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Edificio principal */}
            <rect x="12" y="16" width="40" height="42" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none"/>
            {/* Techo/Ático */}
            <path d="M8 18 L32 6 L56 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            {/* Ventanas fila 1 */}
            <rect x="20" y="22" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
            <rect x="29" y="22" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
            <rect x="38" y="22" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
            {/* Ventanas fila 2 */}
            <rect x="20" y="32" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
            <rect x="29" y="32" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
            <rect x="38" y="32" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
            {/* Puerta */}
            <rect x="26" y="46" width="12" height="12" rx="1" fill="currentColor" opacity="0.8"/>
            {/* Detalle llave */}
            <circle cx="35" cy="52" r="1.5" fill="white" opacity="0.9"/>
          </svg>
        </div>
      )}
      <div className={isMobile ? 'nav-footer-menu' : 'nav-sidebar-menu'}>
        {/* Chats */}
        <div 
          className={`nav-item ${currentView === 'chat' ? 'active' : ''}`}
          onClick={() => handleNavClick('chat')}
          role="button" aria-label="Chats"
        > 
          <MessageSquare size={20} />
        </div>

        {/* Insights Inteligentes - SOLO ADMIN */}
        {isAdmin && (
          <div
            className={`nav-item ${currentView === 'insights' ? 'active' : ''}`}
            onClick={() => handleNavClick('insights')}
            role="button" aria-label="Insights Inteligentes"
            title="Centro de Analytics (Admin)"
          >
            <Lightbulb size={20} />
          </div>
        )}
        {/* Prospectos */}
        <div 
          className={`nav-item ${currentView === 'prospectos' ? 'active' : ''}`}
          onClick={() => handleNavClick('prospectos')}
          role="button" aria-label="Prospectos de Marketing"
        > 
          <UserPlus size={20} />
        </div>

        {/* 👑 ADMIN: Gestión de Leads */}
        {isAdmin && (
          <div 
            className={`nav-item ${currentView === 'admin_leads' ? 'active' : ''}`}
            onClick={() => handleNavClick('admin_leads')}
            role="button" aria-label="Gestión de Leads (Admin)"
            title="Gestión de Leads"
          > 
            <Users size={20} />
          </div>
        )}

        {/* 👤 ASESOR: Mis Leads - OCULTO POR AHORA */}
        {/* {isAsesor && !isAdmin && (
          <div 
            className={`nav-item ${currentView === 'mis_leads' ? 'active' : ''}`}
            onClick={() => handleNavClick('mis_leads')}
            role="button" aria-label="Mis Leads Asignados"
            title="Mis Leads"
          > 
            <Users size={20} />
          </div>
        )} */}

        {/* 💼 Oportunidades - SOLO ADMIN */}
        {isAdmin && (
          <div 
            className={`nav-item ${currentView === 'oportunidades' ? 'active' : ''}`}
            onClick={() => handleNavClick('oportunidades')}
            role="button" aria-label="Oportunidades"
            title="Oportunidades"
          > 
            <Activity size={20} />
          </div>
        )}

        {/* Estadísticas MKT (activo pero con pop up informativo) */}
        <div 
          className={`nav-item ${currentView === 'stats' ? 'active' : ''}`}
          onClick={() => handleNavClick('stats')}
          role="button" aria-label="Panel de Estadísticas MKT"
        > 
          <BarChart size={20} />
        </div>
        {/* Demo - configurado para THE ONE Inmobiliaria */}
        {/* Logs del Sistema - Solo accesible por URL /logs */}
        {/* Settings - configurado para THE ONE Inmobiliaria */}
        {/* Google Calendar */}
        <div 
          className="nav-item"
          onClick={() => window.open('https://calendar.google.com/calendar/u/0/r/month', '_blank')}
          role="button" 
          aria-label="Abrir Google Calendar - Vista Mensual"
        >
          <Calendar size={20} />
        </div>
        {/* Theme Toggle - REMOVIDO */}
        {/* Logout */}
        <div className="nav-item" onClick={handleLogout} role="button" aria-label="Cerrar sesión">
          <LogOut size={20} />
        </div>
      </div>


      <InfoModal 
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title="Panel de Estadísticas"
      >
        <p>Esta demo se activará al tener aproximadamente el equivalente a un mes de conversaciones.</p>
      </InfoModal>
    </div>
  );
};

export default NavBar;
