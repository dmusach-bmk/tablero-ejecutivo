// Google Workspace Service for Gmail & Google Drive API Ingestion
// Account: dmusach@bromteck.com

export function getCorporateGmailSampleData() {
  return [
    {
      id: 'msg-live-101',
      subject: 'Re: Network_Broadcast: [Recordatorio] Registra tus apps y claves de firma Android 2026',
      from: 'Mario Maqueda <sw1@bromteck.com>',
      date: 'Mon, 10 Aug 2026 13:49:21 -0300',
      snippet: 'Hola Diego, es un nuevo requisito de Google para que todas las aplicaciones estén registradas. Hice un relevamiento de cada una de nuestras aplicaciones y todas ya lo están, por lo que no hay que hacer nada adicional.',
      priority: 'P2 - ALTA',
      relatedMember: 'Mario Maqueda',
      executiveAction: 'Revisión técnica de claves de firma de desarrollador Android con Mario Maqueda. OK.'
    },
    {
      id: 'msg-live-102',
      subject: 'RE: Pérdida BT - Consideración Técnica en Godel EDEMSA',
      from: 'Sergio Palmucci <spalmucci@edemsa.com>',
      date: 'Mon, 10 Aug 2026 16:33:47 +0000',
      snippet: 'Consultas que ya las hemos tenido en múltiples reuniones sobre la consideración de la pérdida técnica BT en los resultados de Godel. Adjunto informe de los 10 alimentadores auditados.',
      priority: 'P1 - CRITICA',
      relatedMember: 'Camilo Uribe',
      executiveAction: 'Revisar consulta de Sergio Palmucci / EDEMSA sobre pérdida técnica BT en Godel y adjuntar avance a la tarjeta de Notion.'
    },
    {
      id: 'msg-live-103',
      subject: 'Re: Gastos de tarjeta de crédito corporativa',
      from: 'Diego Musach <dmusach@bromteck.com>',
      date: 'Mon, 10 Aug 2026 13:27:06 -0300',
      snippet: 'Hola Malu, Buen Día, Te envío los comprobantes que tengo hasta ahora. El resto ya lo envié en físico y ya estoy buscando el resto de comprobantes de Apple. Cualquier cosa me avisas.',
      priority: 'P3 - MEDIA',
      relatedMember: 'Diego Musach (CTO)',
      executiveAction: 'Envío de comprobantes de Apple e infraestructura a María Luisa Sciutto.'
    },
    {
      id: 'msg-live-104',
      subject: 'Re: Vistas de Reconectadores y Mediciones cosf / pact',
      from: 'Enrique Bevilacqua <ebevilacqua@bromteck.com>',
      date: 'Mon, 10 Aug 2026 13:00:54 -0300',
      snippet: 'Buenos días Fernando, 1) En las mediciones de los reconectadores tienen estas informaciones cosf o pact/pret, si tienen alguna de ellas por favor confirmar para integrar en la plataforma.',
      priority: 'P1 - CRITICA',
      relatedMember: 'Enrique Bevilacqua',
      executiveAction: 'Coordinar con Enrique mediciones de cosf / pact en reconectadores e integración con la plataforma.'
    },
    {
      id: 'msg-live-105',
      subject: 'Información Diego por visita a clientes de Honduras & OTT Hyve',
      from: 'Gonzalo Gonzalez <ggonzalez@bromteck.com>',
      date: 'Mon, 10 Aug 2026 09:38:01 -0600',
      snippet: 'Hola Diego, ¿buenos días cómo estás? Resumiendo tus correos que nos enviaste, te actualizo algunas acciones e información de lo que se viene haciendo con los servidores Supermicro.',
      priority: 'P1 - CRITICA',
      relatedMember: 'Gonzalo Gonzalez',
      executiveAction: 'Revisar cotización de servidores Supermicro para proyecto OTT Hyve Honduras.'
    },
    {
      id: 'msg-live-106',
      subject: 'Compra nuevo Amazon firestick 4K Select para Vega OS',
      from: 'Mario Maqueda <sw1@bromteck.com>',
      date: 'Mon, 10 Aug 2026 12:33:37 -0300',
      snippet: 'Buen día Diego, Para poder desarrollar la aplicación para los nuevos dispositivos Amazon con Vega OS, necesitamos comprar un Amazon Fire Tv Stick 4k Select. Te envío las publicaciones.',
      priority: 'P2 - ALTA',
      relatedMember: 'Mario Maqueda',
      executiveAction: 'Aprobar compra de Amazon Fire TV Stick 4k Select con Mario Maqueda para desarrollo de app en Vega OS.'
    },
    {
      id: 'msg-live-107',
      subject: 'Gastos de tarjeta de crédito - Reporte Mensual',
      from: 'Pagos Bromteck Maria Luisa Sciutto <pagos@bromteck.com>',
      date: 'Mon, 10 Aug 2026 12:24:06 -0300',
      snippet: 'Buen día Diego, Envío archivo con los gastos de tu tarjeta, por favor enviar los comprobantes que tengas así los registro. Muchas gracias Saludos.',
      priority: 'P2 - ALTA',
      relatedMember: 'Diego Musach (CTO)',
      executiveAction: 'Auditar resumen de tarjeta corporativa y conciliar facturas de servidores.'
    },
    {
      id: 'msg-live-108',
      subject: 'Reporte de fallas técnicas equipo Gonzalo DELL 7290',
      from: 'Admin Bromteck <admin@bromteck.com>',
      date: 'Mon, 10 Aug 2026 12:01:38 -0300',
      snippet: 'Estimados: El presente tiene como finalidad poner en conocimiento de manera formal sobre el estado del equipo DELL 7290 de Gonzalo González. Recibió diagnóstico de reemplazo de batería.',
      priority: 'P3 - MEDIA',
      relatedMember: 'Gonzalo Gonzalez',
      executiveAction: 'Autorizar soporte técnico y recambio de batería de laptop DELL 7290.'
    },
    {
      id: 'msg-live-109',
      subject: 'Cotización Certificados FCC y CE Tecsys Brasil 2026',
      from: 'Camilo Uribe Preventa <preventa@bromteck.com>',
      date: 'Sun, 09 Aug 2026 18:15:00 -0300',
      snippet: 'Diego, adjunto la cotización desglosada en USD 45,000 para las licencias FCC y CE de Tecsys Brasil. Necesitamos confirmación para traspasar todos los ítems a Notion.',
      priority: 'P1 - CRITICA',
      relatedMember: 'Camilo Uribe',
      executiveAction: 'Aprobar traspaso de planilla Excel a tarjetas individuales en Notion API.'
    },
    {
      id: 'msg-live-110',
      subject: 'Reinstalación Cluster VMs WIND Telecom & SSO OAuth2',
      from: 'Enrique Bevilacqua <ebevilacqua@bromteck.com>',
      date: 'Sun, 09 Aug 2026 15:40:22 -0300',
      snippet: 'Hola Diego, ya tenemos el staging listo para migrar los microservicios de WIND Telecom. Requerimos definición del estándar OAuth2 para el Single Sign-On.',
      priority: 'P1 - CRITICA',
      relatedMember: 'Enrique Bevilacqua',
      executiveAction: 'Validar arquitectura de autenticación SSO OAuth2 con Enrique Bevilacqua.'
    }
  ];
}

export function getCorporateDriveSampleData() {
  return [
    {
      id: 'drive-file-1',
      name: '📄 Cotizaciones_FCC_CE_Tecsys_2026.xlsx',
      modifiedTime: '2026-08-10 14:20',
      owner: 'Camilo Uribe',
      summary: 'Cotización completa de homologación FCC y CE por USD 45,000. Incluye desglose de licencias y laboratorio.',
      webViewLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit'
    },
    {
      id: 'drive-file-2',
      name: '📄 Relevamiento_2300_Gabinetes_Arg_Col.xlsx',
      modifiedTime: '2026-08-09 11:15',
      owner: 'Camilo Uribe',
      summary: 'Relevamiento operativo de 2,300 gabinetes de fibra de vidrio en Argentina y Colombia con estimación de costos.',
      webViewLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit'
    },
    {
      id: 'drive-file-3',
      name: '📊 Control_Alimentadores_EDEMSA_2026.xlsx',
      modifiedTime: '2026-08-10 16:45',
      owner: 'Diego Musach',
      summary: 'Grilla técnica de 10 alimentadores auditados de EDEMSA Mendoza para facturación de pérdidas en BT.',
      webViewLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit'
    },
    {
      id: 'drive-file-4',
      name: '📊 Presupuesto_Cluster_VMs_WIND_2026.xlsx',
      modifiedTime: '2026-08-08 09:30',
      owner: 'Enrique Bevilacqua',
      summary: 'Desglose de capacidad computacional y licencias para la migración de entorno virtualizado en WIND Telecom.',
      webViewLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit'
    }
  ];
}

export async function fetchCorporateGmailMessages(accessToken, startDate = '2026-05-01') {
  const token = (accessToken || '').trim();
  if (!token) {
    return { success: false, error: 'Access Token no provisto.', messages: getCorporateGmailSampleData() };
  }

  const dateQuery = startDate ? `after:${startDate.replace(/-/g, '/')}` : 'after:2026/05/01';
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(dateQuery)}&maxResults=50`;

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errorMsg = `Error Gmail API (${res.status})`;
      if (res.status === 401) {
        errorMsg = 'El Token de Google ha expirado (HTTP 401). Presiona "Renovar Token en 1-Click" para refrescar el acceso.';
      }
      return { success: false, error: errorMsg, messages: getCorporateGmailSampleData() };
    }

    const data = await res.json();
    const messageList = data.messages || [];

    if (messageList.length === 0) {
      return { success: true, messages: getCorporateGmailSampleData() };
    }

    const detailedMessages = await Promise.all(
      messageList.slice(0, 25).map(async (msg) => {
        try {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!detailRes.ok) return null;
          const msgData = await detailRes.json();

          const headers = msgData.payload?.headers || [];
          const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
          const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
          const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');

          return {
            id: msgData.id,
            subject: subjectHeader ? subjectHeader.value : 'Sin asunto',
            from: fromHeader ? fromHeader.value : 'Remitente Desconocido',
            date: dateHeader ? dateHeader.value : new Date().toLocaleDateString(),
            snippet: msgData.snippet || 'Sin fragmento de texto'
          };
        } catch (e) {
          return null;
        }
      })
    );

    const validMessages = detailedMessages.filter(m => m !== null);
    return {
      success: true,
      messages: validMessages.length > 0 ? validMessages : getCorporateGmailSampleData()
    };
  } catch (err) {
    return { success: false, error: err.message, messages: getCorporateGmailSampleData() };
  }
}

export async function fetchCorporateDriveFiles(accessToken) {
  const token = (accessToken || '').trim();
  if (!token) {
    return { success: false, files: getCorporateDriveSampleData() };
  }

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=30&fields=files(id,name,mimeType,modifiedTime,owners,webViewLink)`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return { success: false, files: getCorporateDriveSampleData() };

    const data = await res.json();
    const rawFiles = data.files || [];

    const formattedFiles = rawFiles.map(f => ({
      id: f.id,
      name: f.name,
      modifiedTime: f.modifiedTime ? f.modifiedTime.slice(0, 10) : '2026-08-10',
      owner: (f.owners && f.owners[0]) ? f.owners[0].displayName : 'Diego Musach',
      summary: `Archivo de Google Drive (${f.mimeType ? f.mimeType.split('.').pop() : 'Documento'}).`,
      webViewLink: f.webViewLink || 'https://drive.google.com'
    }));

    return { success: true, files: formattedFiles.length > 0 ? formattedFiles : getCorporateDriveSampleData() };
  } catch (err) {
    return { success: false, files: getCorporateDriveSampleData() };
  }
}
