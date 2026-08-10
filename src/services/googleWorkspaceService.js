// Service to handle Google Workspace (Gmail & Google Drive) Corporate Integration
// Scope: Gmail emails from May 2026 to present + Incoming proactive polling + Google Drive files

export async function fetchCorporateGmailMessages(accessToken, startDate = '2026-05-01') {
  if (!accessToken) {
    return { success: false, error: 'Se requiere token de acceso OAuth2 para Gmail.', messages: [] };
  }

  try {
    const query = `after:${startDate.replace(/-/g, '/')}`;
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=100`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return { success: false, error: `Error Gmail API (${response.status}): ${errText || 'Token expirado o inválido'}`, messages: [] };
    }

    const data = await response.json();
    const messageList = data.messages || [];

    // Fetch details for top messages
    const detailedMessages = await Promise.all(
      messageList.slice(0, 30).map(async (msg) => {
        try {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            const headers = detailData.payload?.headers || [];
            const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'Sin Asunto';
            const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Desconocido';
            const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
            const snippet = detailData.snippet || '';

            return {
              id: msg.id,
              subject: subjectHeader,
              from: fromHeader,
              date: dateHeader ? new Date(dateHeader).toLocaleDateString() : 'Mayo 2026',
              snippet: snippet,
              internalDate: detailData.internalDate
            };
          }
        } catch (e) {}
        return null;
      })
    );

    const validMessages = detailedMessages.filter(Boolean);

    return {
      success: true,
      messages: validMessages,
      totalCount: messageList.length
    };
  } catch (err) {
    console.error("Error fetching Gmail:", err);
    return { success: false, error: err.message, messages: [] };
  }
}

export async function fetchCorporateDriveFiles(accessToken) {
  if (!accessToken) {
    return { success: false, error: 'Se requiere token de acceso OAuth2 para Google Drive.', files: [] };
  }

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,modifiedTime,webViewLink,iconLink)&orderBy=modifiedTime desc`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return { success: false, error: `Error Google Drive API (${response.status}): ${errText}`, files: [] };
    }

    const data = await response.json();
    return {
      success: true,
      files: data.files || []
    };
  } catch (err) {
    console.error("Error fetching Drive:", err);
    return { success: false, error: err.message, files: [] };
  }
}

// MOCK CORPORATE DATA FALLBACK FOR DEMO / PROTOTYPE PURPOSES
export function getCorporateGmailSampleData() {
  return [
    {
      id: 'g-mail-1',
      subject: '[URGENTE EDEMSA] Aprobación de Puntos de Fibra & Facturación Mayo-Agosto',
      from: 'Gerencia EDEMSA <facturacion@edemsa.com.ar>',
      date: '2026-08-09',
      snippet: 'Diego, adjuntamos la grilla de validación de los 10 alimentadores. Necesitamos el visto bueno final para liberar el pago de las cotizaciones.',
      category: 'Facturación / Cliente',
      priority: 'P1 - CRITICA',
      relatedMember: 'Camilo Uribe',
      executiveAction: 'Revisar grilla de 10 alimentadores con Camilo Uribe y autorizar facturación en Notion.'
    },
    {
      id: 'g-mail-2',
      subject: '[Tecsys Brasil] Cotización Homologación Certificados FCC y CE',
      from: 'Soporte Tecsys <licencias@tecsys.com.br>',
      date: '2026-08-06',
      snippet: 'Enviamos el desglose de tarifas por el mantenimiento de la plataforma y el traspaso de datos de SS a la nube.',
      category: 'Proveedores / Licencias',
      priority: 'P1 - CRITICA',
      relatedMember: 'Camilo Uribe',
      executiveAction: 'Cargar presupuesto de Tecsys en tarjeta de Notion y eliminar planillas sueltas.'
    },
    {
      id: 'g-mail-3',
      subject: '[WIND Cluster] Reinstalación de Servidores en VMs & Pruebas SSO',
      from: 'Infraestructura WIND <sysadmin@wind.com>',
      date: '2026-08-04',
      snippet: 'Hemos habilitado la ventana de mantenimiento para el cluster. Quedamos a la espera de la configuración OAuth2 por parte de Enrique Bevilacqua.',
      category: 'Infraestructura / VMs',
      priority: 'P1 - CRITICA',
      relatedMember: 'Enrique Bevilacqua',
      executiveAction: 'Coordinar con Enrique el despliegue del SSO en las VMs de WIND.'
    },
    {
      id: 'g-mail-4',
      subject: '[Telecable Costa Rica] Confirmación Pruebas STB Elebao AOSP & FingerPrint',
      from: 'Operaciones Telecable <laboratorio@telecablecr.com>',
      date: '2026-07-28',
      snippet: 'Recibimos los decodificadores Montage para el laboratorio. Solicitamos presencia del ingeniero Enrique para la auditoría final.',
      category: 'Hardware / Staging',
      priority: 'P2 - ALTA',
      relatedMember: 'Enrique Bevilacqua',
      executiveAction: 'Verificar itinerario de viaje a Costa Rica con Enrique para la homologación STB.'
    },
    {
      id: 'g-mail-5',
      subject: '[Soporte AI] Reporte Semanal Reducción de Tickets con BOT Gemini',
      from: 'Joseph Valer <joseph.valer@bromteck.com>',
      date: '2026-07-15',
      snippet: 'Diego, logramos un 35% de resolución automática en tickets de Nivel 1 entrenando el BOT con las capacitaciones filmadas.',
      category: 'Soporte / AI',
      priority: 'P2 - ALTA',
      relatedMember: 'Joseph Valer',
      executiveAction: 'Aprobar la fase 2 del BOT AI para abarcar consultas de Koalas y Smart Sensors.'
    }
  ];
}

export function getCorporateDriveSampleData() {
  return [
    {
      id: 'drive-file-1',
      name: '📄 Presupuesto_Tecsys_FCC_CE_2026.xlsx',
      mimeType: 'spreadsheet',
      modifiedTime: '2026-08-08',
      webViewLink: 'https://drive.google.com',
      summary: 'Cotización oficial de homologación de certicados FCC/CE para pérididas y gabinetes.',
      owner: 'Camilo Uribe'
    },
    {
      id: 'drive-file-2',
      name: '📄 Informe_Tecnico_WIND_Cluster_VMs.pdf',
      mimeType: 'pdf',
      modifiedTime: '2026-08-05',
      webViewLink: 'https://drive.google.com',
      summary: 'Arquitectura de servidores en la nube y configuración del Single Sign-On (SSO).',
      owner: 'Enrique Bevilacqua'
    },
    {
      id: 'drive-file-3',
      name: '📄 Capacitaciones_Filmadas_Soporte_AI_BOT.mp4',
      mimeType: 'video',
      modifiedTime: '2026-07-30',
      webViewLink: 'https://drive.google.com',
      summary: 'Base de conocimiento en video para entrenamiento del Agente IA de soporte.',
      owner: 'Fabricio Jose Nieva'
    },
    {
      id: 'drive-file-4',
      name: '📊 Scorecard_Metrics_Engineering_Q3_2026.xlsx',
      mimeType: 'spreadsheet',
      modifiedTime: '2026-07-20',
      webViewLink: 'https://drive.google.com',
      summary: 'Matriz de KPIs, velocidad de entrega y resolución de tickets por desarrollador.',
      owner: 'Mario Maqueda'
    }
  ];
}
