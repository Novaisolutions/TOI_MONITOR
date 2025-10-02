import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Esperar a que termine la animación
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    info: <Info size={20} className="text-blue-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />,
  };

  return (
    <div 
      className={`toast-notification ${type} ${!isVisible ? 'opacity-0 translate-x-full' : ''}`}
      style={{ transition: 'all 0.3s ease-in-out' }}
    >
      <div className="toast-notification-icon">
        {icons[type]}
      </div>
      <div className="toast-notification-content">
        <div className="toast-notification-title">{title}</div>
        {message && <div className="toast-notification-message">{message}</div>}
      </div>
      <button 
        className="toast-notification-close"
        onClick={handleClose}
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;

