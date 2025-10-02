import React from 'react';
import { CheckCircle, AlertCircle, Clock, Users, MessageSquare } from 'lucide-react';

interface RealtimeStatusProps {
  isConnected: boolean;
  pollingEnabled: boolean;
  totalConversations?: number;
  totalThisMonth?: number;
  className?: string;
}

const RealtimeStatus: React.FC<RealtimeStatusProps> = ({ 
  isConnected, 
  pollingEnabled, 
  totalConversations = 0,
  totalThisMonth = 0,
  className = '' 
}) => {
  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: <CheckCircle size={16} className="text-green-500" />,
        text: "Conectado",
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800"
      };
    } else if (pollingEnabled) {
      return {
        icon: <Clock size={16} className="text-blue-500" />,
        text: "Sincronizando",
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800"
      };
    } else {
      return {
        icon: <AlertCircle size={16} className="text-red-500" />,
        text: "Sin conexión",
        color: "text-red-600",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800"
      };
    }
  };

  const status = getStatusInfo();

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium border ${status.bgColor} ${status.borderColor} ${status.color} ${className}`}>
      {status.icon}
      <div className="flex items-center gap-4">
        <span>{status.text}</span>
        <div className="flex items-center gap-3 text-xs opacity-80">
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{totalConversations} total</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={12} />
            <span>{totalThisMonth} este mes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeStatus;
