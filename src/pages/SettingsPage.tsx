import React, { useEffect } from 'react';
import TimezoneSelector from '../components/settings/TimezoneSelector';
import useSettings from '../hooks/useSettings';

interface SettingsPageProps {
  onBackToMain?: () => void; // Opcional: Para implementar un botón de regreso
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBackToMain }) => {
  const { timeZone, setTimeZone, theme, toggleTheme } = useSettings();

  // Auto-scroll al inicio al montar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2 className="settings-header-title">Configuración</h2>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3 className="settings-section-title">Zona Horaria</h3>
          <TimezoneSelector 
            selectedTimeZone={timeZone} 
            onChange={setTimeZone} 
          />
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Interfaz</h3>
          <div className="settings-control">
            <label className="settings-label">Tema</label>
            <div className="settings-theme-toggle">
              <button 
                className={`theme-button ${theme === 'light' ? 'active' : ''}`}
                onClick={() => theme !== 'light' && toggleTheme()}
              >
                Claro
              </button>
              <button 
                className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => theme !== 'dark' && toggleTheme()}
              >
                Oscuro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 