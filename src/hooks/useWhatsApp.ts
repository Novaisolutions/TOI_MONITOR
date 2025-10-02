import { useState, useCallback } from 'react';

interface SendMessageParams {
  to: string;
  message: string;
  phoneNumberId?: string;
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Hook para manejar el envío de mensajes de WhatsApp Business
 * Utiliza la función serverless de Netlify para proteger el token
 */
export const useWhatsApp = () => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Envía un mensaje de WhatsApp
   */
  const sendMessage = useCallback(async ({ 
    to, 
    message, 
    phoneNumberId 
  }: SendMessageParams): Promise<SendMessageResult> => {
    setSending(true);
    setError(null);

    try {
      // Llamar a la función serverless de Netlify
      const response = await fetch('/.netlify/functions/whatsapp-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message,
          phoneNumberId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.details?.error?.message || data.error || 'Error al enviar mensaje';
        setError(errorMessage);
        console.error('[useWhatsApp] Error:', data);
        return {
          success: false,
          error: errorMessage,
        };
      }

      console.log('[useWhatsApp] Mensaje enviado exitosamente:', data.messageId);
      return {
        success: true,
        messageId: data.messageId,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('[useWhatsApp] Error al enviar:', err);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setSending(false);
    }
  }, []);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    sending,
    error,
    clearError,
  };
};

export default useWhatsApp;

