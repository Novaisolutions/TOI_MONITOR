import React, { useState, useCallback, useEffect } from 'react';
import Toast, { ToastProps } from './Toast';

export interface ToastData {
  type: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

let toastIdCounter = 0;
const toastListeners: Array<(toast: ToastData) => void> = [];

export const showToast = (toast: ToastData) => {
  toastListeners.forEach(listener => listener(toast));
};

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const addToast = useCallback((toastData: ToastData) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast = {
      ...toastData,
      id,
      onClose: (toastId: string) => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      },
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  useEffect(() => {
    toastListeners.push(addToast);
    return () => {
      const index = toastListeners.indexOf(addToast);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, [addToast]);

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

