// Función serverless para enviar mensajes de WhatsApp Business
// Protege el token de acceso del lado del servidor

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
// IMPORTANTE: Agregar WHATSAPP_ACCESS_TOKEN en las variables de entorno de Netlify
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '794042540450605'; // Phone Number ID correcto

exports.handler = async (event, context) => {
  // Configurar CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parsear el body de la petición
    const { to, message, phoneNumberId } = JSON.parse(event.body);

    // Validar datos requeridos
    if (!to || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields', 
          details: 'Se requiere "to" (número) y "message" (mensaje)' 
        })
      };
    }

    // Validar token
    if (!WHATSAPP_ACCESS_TOKEN) {
      console.error('[WhatsApp Send] Token no configurado en variables de entorno');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Configuration error', 
          details: 'Token de WhatsApp no configurado' 
        })
      };
    }

    // Limpiar el número (quitar +, espacios, guiones)
    const cleanNumber = to.replace(/[+\s-]/g, '');

    // Construir URL de la API de WhatsApp
    const whatsappUrl = `${WHATSAPP_API_URL}/${phoneNumberId || PHONE_NUMBER_ID}/messages`;

    console.log(`[WhatsApp Send] Enviando mensaje a: ${cleanNumber}`);

    // Preparar el payload para WhatsApp Business API
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanNumber,
      type: 'text',
      text: {
        preview_url: true, // Permite preview de URLs
        body: message
      }
    };

    // Enviar mensaje a WhatsApp
    const response = await fetch(whatsappUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    console.log(`[WhatsApp Send] Response status: ${response.status}`);
    
    if (!response.ok) {
      console.error('[WhatsApp Send] Error:', responseData);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'WhatsApp API error',
          details: responseData
        })
      };
    }

    // Mensaje enviado exitosamente
    const messageId = responseData.messages?.[0]?.id;
    
    // Enviar webhook a n8n para guardar el mensaje en las tablas
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://novaisolutions.app.n8n.cloud/webhook/whatsapp-message-send';
      
      const webhookPayload = {
        numero: cleanNumber,
        mensaje: message,
        tipo: 'salida',
        fecha: new Date().toISOString(),
        messageId: messageId,
        conversation_id: null, // Se completará en n8n
        nombre: null, // Se completará en n8n
        // Datos para n8n_chat_histories (formato completo compatible con IA)
        session_id: `${cleanNumber}brokers_julio2025_V2.1.7`,
        chat_message: {
          type: 'ai', // Mensajes enviados por el sistema son tipo 'ai'
          content: JSON.stringify({
            respuesta_para_cliente: message,
            estado_interno: {
              nombre: null,
              telefono: cleanNumber,
              vertical: 'bienes_raices', // o 'hospedaje' según el caso
              interes: 'informacion',
              dolor_o_motivo: 'mensaje enviado desde sistema',
              nivel_interes: 5,
              listo_para_equipo: false,
              estado_de_embudo: 'contactado',
              resumen_ia: `Mensaje enviado: ${message.substring(0, 100)}`,
              fecha_preferida: null,
              numero_personas: null,
              tipo_unidad: null,
              presupuesto_aproximado: null
            },
            herramientas_usar: [],
            meta: {
              siguiente_objetivo: 'esperar_respuesta',
              nueva_info_capturada: false,
              origen: 'whatsapp_manual',
              timestamp: new Date().toISOString()
            }
          }),
          tool_calls: [],
          additional_kwargs: {},
          response_metadata: {
            message_id: messageId,
            sent_via: 'whatsapp_business_api',
            phone_number_id: PHONE_NUMBER_ID
          },
          invalid_tool_calls: []
        }
      };
      
      console.log(`[WhatsApp Send] Enviando webhook a n8n para guardar mensaje`);
      console.log(`[WhatsApp Send] Webhook URL:`, webhookUrl);
      console.log(`[WhatsApp Send] Payload:`, JSON.stringify(webhookPayload, null, 2));
      
      // Enviar webhook y esperar respuesta
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookPayload)
      });
      
      const webhookResult = await webhookResponse.text();
      console.log(`[WhatsApp Send] Webhook response status:`, webhookResponse.status);
      console.log(`[WhatsApp Send] Webhook response:`, webhookResult);
      
      if (!webhookResponse.ok) {
        console.error('[WhatsApp Send] Webhook failed:', webhookResult);
      } else {
        console.log('[WhatsApp Send] Webhook enviado exitosamente a n8n');
      }
      
    } catch (webhookError) {
      console.error('[WhatsApp Send] Error preparando webhook:', webhookError.message);
      // No fallar si el webhook falla
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: messageId,
        data: responseData
      })
    };

  } catch (error) {
    console.error('[WhatsApp Send] Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

