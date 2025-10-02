// Función temporal para listar números de WhatsApp disponibles
const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1689375181774438';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log(`[WhatsApp List] Obteniendo números para Business Account: ${BUSINESS_ACCOUNT_ID}`);

    // Obtener números de teléfono del Business Account
    const response = await fetch(`${WHATSAPP_API_URL}/${BUSINESS_ACCOUNT_ID}/phone_numbers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log(`[WhatsApp List] Response status: ${response.status}`);

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify({
        businessAccountId: BUSINESS_ACCOUNT_ID,
        phoneNumbers: data,
        message: 'Lista de números de WhatsApp disponibles'
      })
    };

  } catch (error) {
    console.error('[WhatsApp List] Error:', error);
    
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
