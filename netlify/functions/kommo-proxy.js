const KOMMO_BASE_URL = 'https://bizmakermx.kommo.com/api/v4';
const KOMMO_ACCESS_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6Ijc3OGYwZWYzOTA1Mjc3ZTliMDY4NzdkMDVmNTZiOTVlN2QzMDEwNDQ1OWY1ODdhZmViN2JmZDUxNGMyNmRhYjNmZTc3ZmI1NjIwYTAzYTE5In0.eyJhdWQiOiJhNzY5ZTgyNy1kOTgzLTQzZmUtOGI5Yi04YzFlN2E0ZDg0OWYiLCJqdGkiOiI3NzhmMGVmMzkwNTI3N2U5YjA2ODc3ZDA1ZjU2Yjk1ZTdkMzAxMDQ0NTlmNTg3YWZlYjdiZmQ1MTRjMjZkYWIzZmU3N2ZiNTYyMGEwM2ExOSIsImlhdCI6MTc1NTg4Njg5NSwibmJmIjoxNzU1ODg2ODk1LCJleHAiOjE3NTU5NzMyOTUsInN1YiI6IjExMjI3MTQzIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM0MjMzNTA3LCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJwdXNoX25vdGlmaWNhdGlvbnMiLCJmaWxlcyIsImNybSIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiXSwidXNlcl9mbGFncyI6MCwiaGFzaF91dWlkIjoiNzY5YWQ3YjUtMGZjNy00Nzg2LTg1YWUtZTcxOTQ0NzE2ZmY3IiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.E5VMWm7VcDFaASIzSnUAGDyqBseGcTzMpHWXyYG0VL9UmyLiDJELs323IEJLoh8L8hDPg25Nzxbxfbx1bafxGqw-NTNqop15-PPlEVTi8-vBrDGa_FSAhjVpXAb0wfaBVy4Y6R-Vf8CghMoyEVNa9owwokZ8hw9sIsryv0yiEoH_UfMAMfteCkuWq3P8Sizr0dkqupr3zZ5no38OAautbv2-c65cYJ_TcFlhqvgMtXXF7E3KX2OT3fTybpxZqrl41csR23gpvmtlCAe4F62v0FXIoYqtQ-ioSbjh4i-8uvM-UA0nZRcoy_2akqWS3aBUc8j85y7GzDGvUJaxDlbpFw';

exports.handler = async (event, context) => {
  // Configurar CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
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

  try {
    // Extraer la ruta de Kommo del path
    const kommoPath = event.path.replace('/.netlify/functions/kommo-proxy', '');
    const kommoUrl = `${KOMMO_BASE_URL}${kommoPath}${event.rawQuery ? `?${event.rawQuery}` : ''}`;

    console.log(`[Kommo Proxy] ${event.httpMethod} ${kommoUrl}`);

    // Configurar la petición
    const fetchOptions = {
      method: event.httpMethod,
      headers: {
        'Authorization': `Bearer ${KOMMO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mayo-Dental-Monitor/1.0'
      }
    };

    // Agregar body si es necesario
    if (event.body && ['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
      fetchOptions.body = event.body;
      console.log(`[Kommo Proxy] Body:`, event.body);
    }

    // Realizar la petición a Kommo
    const response = await fetch(kommoUrl, fetchOptions);
    const data = await response.text();

    console.log(`[Kommo Proxy] Response status: ${response.status}`);

    // Intentar parsear como JSON, sino devolver texto
    let responseData;
    try {
      responseData = JSON.parse(data);
    } catch {
      responseData = data;
    }

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('[Kommo Proxy] Error:', error);
    
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
