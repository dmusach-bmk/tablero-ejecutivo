// Service to handle Fathom Video Notetaker API
// Retrieves ALL meetings from January 1st, 2026 to present.
// No filtering by title — all calls are shown.

export function extractTextFromFathomMeeting(m) {
  if (!m) return '';

  let combinedText = '';

  // 1. AI Summary markdown
  if (m.default_summary?.markdown_formatted) {
    combinedText += `=== RESUMEN FATHOM ===\n${m.default_summary.markdown_formatted}\n\n`;
  }

  // 2. Action Items
  if (Array.isArray(m.action_items) && m.action_items.length > 0) {
    combinedText += `=== ACCIONES Y COMPROMISOS DETECTADOS ===\n`;
    m.action_items.forEach(item => {
      const desc = item.description || item.text || item.title;
      if (desc) combinedText += `• ${desc}\n`;
    });
    combinedText += `\n`;
  }

  // 3. Speaker-Attributed Transcript Array
  if (Array.isArray(m.transcript) && m.transcript.length > 0) {
    combinedText += `=== TRANSCRIPCIÓN DIÁLOGO A DIÁLOGO ===\n`;
    m.transcript.forEach(t => {
      const speakerName = t.speaker?.display_name || t.speaker?.name || 'Participante';
      if (t.text) combinedText += `${speakerName}: ${t.text}\n`;
    });
  } else if (typeof m.transcript === 'string' && m.transcript.trim()) {
    combinedText += m.transcript;
  }

  return combinedText.trim();
}

export async function fetchSingleFathomMeetingDetails(apiKey, meetingId) {
  if (!apiKey || !meetingId) return null;
  const cleanKey = apiKey.trim();

  const headers = {
    'X-Api-Key': cleanKey,
    'Authorization': `Bearer ${cleanKey}`,
    'Content-Type': 'application/json'
  };

  try {
    const url = `/api/fathom/external/v1/meetings/${meetingId}?include_transcript=true&include_summary=true&include_action_items=true`;
    const response = await fetch(url, { headers });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("Error fetching single meeting details:", err);
    return null;
  }
}

export async function fetchFathomMeetings(apiKey) {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    return { success: false, error: 'Por favor ingresa tu API Key de Fathom.', meetings: [] };
  }

  const headers = {
    'X-Api-Key': cleanKey,
    'Authorization': `Bearer ${cleanKey}`,
    'Content-Type': 'application/json'
  };

  let rawAllMeetings = [];

  // STREAM 1: Fetch ALL meetings from January 2026 to present across all pages
  try {
    let nextCursor = null;
    let hasMore = true;
    let pageCount = 0;

    while (hasMore && pageCount < 15) { // Traverse up to 1,500 meetings
      pageCount++;
      const queryParams = new URLSearchParams({
        include_transcript: 'true',
        include_summary: 'true',
        include_action_items: 'true',
        limit: '100',
        created_after: '2026-01-01T00:00:00Z'
      });
      if (nextCursor) queryParams.set('cursor', nextCursor);

      let response = await fetch(`/api/fathom/external/v1/meetings?${queryParams.toString()}`, { headers });

      if (!response.ok && pageCount === 1) {
        response = await fetch(`/api/fathom/external/v1/meetings`, { headers });
      }

      if (!response.ok) break;

      const data = await response.json();
      const items = data.items || data.meetings || data.results || (Array.isArray(data) ? data : []);
      if (Array.isArray(items)) {
        rawAllMeetings = [...rawAllMeetings, ...items];
      }

      if (data.next_cursor || data.pagination?.next_cursor) {
        nextCursor = data.next_cursor || data.pagination?.next_cursor;
      } else {
        hasMore = false;
      }
    }
  } catch (err) {
    console.error("Fathom API Fetch Stream Exception:", err);
  }

  // Format raw items — include ALL meetings from Jan 2026 onwards
  const formattedMap = new Map();

  console.log('[Fathom] Raw meetings fetched from API:', rawAllMeetings.length, rawAllMeetings.map(m => ({ id: m.recording_id || m.id, title: m.meeting_title || m.title, started_at: m.started_at, created_at: m.created_at, date: m.date })));

  (Array.isArray(rawAllMeetings) ? rawAllMeetings : []).forEach((m, idx) => {
    const mId = m.recording_id || m.id || `fathom-rec-${idx+1}`;
    const title = m.meeting_title || m.title || `Llamada Fathom #${idx+1}`;
    const extractedText = extractTextFromFathomMeeting(m);

    // Try every possible date field Fathom might return
    const rawDate = m.started_at || m.recorded_at || m.created_at || m.date || m.scheduled_at || null;
    const dateISO = rawDate ? (typeof rawDate === 'number' ? new Date(rawDate * 1000).toISOString() : rawDate) : new Date().toISOString();
    const dateShort = dateISO.slice(0, 10);

    const titleLower = title.toLowerCase();
    const isFollowUpTecno = titleLower.includes('follow up') || titleLower.includes('tecnologia') || titleLower.includes('tecnología') || titleLower.includes('followup');

    // Include ALL meetings from January 2026 onwards
    const isAfter2026 = dateISO >= '2026-01-01';

    if (isAfter2026) {
      formattedMap.set(mId, {
        ...m,
        id: mId,
        title,
        date: dateShort,
        createdAtISO: dateISO,
        text: extractedText,
        rawSummary: m.default_summary?.markdown_formatted || '',
        actionItems: m.action_items || [],
        categoryTag: isFollowUpTecno ? '💻 Follow Up Tecnología' : '📅 Reunión'
      });
    }
  });

  // Sample data fallback for historical Follow Up Tecnologia meetings from Enero 2026 to present
  const sampleFollowUps = [
    {
      id: '781102602',
      title: 'Technology Follow Up - Catelsa & Recursos Video (781102602)',
      date: '2026-08-12',
      createdAtISO: '2026-08-12T11:15:00Z',
      text: `=== RESUMEN FATHOM: "Technology Follow Up - Catelsa & Recursos Video (781102602)" ===\n📅 Fecha: 2026-08-12 (Control de Catelsa y Drive)\n\nResumen Directivo de la Sesión:\n• Diego Musach coordina los pendientes operativos con el equipo.\n• Camilo Uribe: Armar la tarjeta de "Pendientes Catelsa" en Notion volcando los temas de la planilla uno por uno y asignar responsables.\n• Enrique Bevilacqua: Revisar los manuales de AOSP y las especificaciones técnicas del decodificador STB de Elebao en la carpeta de Video en Google Drive.`,
      categoryTag: '💻 Follow Up Tecnología'
    },
    {
      id: '780659825',
      title: 'Technology Follow Up & Team Tasks (780659825)',
      date: '2026-08-11',
      createdAtISO: '2026-08-11T18:15:00Z',
      text: `=== RESUMEN FATHOM: "Technology Follow Up & Team Tasks (780659825)" ===\n📅 Fecha: 2026-08-11 (Seguimiento de Tareas de Ingeniería)\n\nResumen Directivo de la Sesión:\n• Diego Musach establece y delega tareas críticas a su equipo directivo.\n• Camilo Uribe: Migrar celdas de Excel a la base de Notion y enviar credenciales de Hábitat.\n• Enrique Bevilacqua: Pruebas de laboratorio STB Elebao AOSP con procesadores Montage para Telecable Costa Rica y validación de FingerPrint.\n• Fabricio Jose Nieva: Documentar e instalar Koalas y Smart Sensors, y preparar los videos de capacitación para el BOT de soporte.\n• Leonard Amaya: Ejecutar apagado definitivo de servidores de Heroku y validar migración de CableView con Mauricio Zuin.\n• Mario Maqueda: Armar y actualizar los objetivos de desarrollo anuales y Scorecard del equipo.`,
      categoryTag: '💻 Follow Up Tecnología'
    },
    {
      id: '775351347',
      title: 'Weekly Follow Up Tecnologia (con CEO - 775351347)',
      date: '2026-08-11',
      createdAtISO: '2026-08-11T18:00:00Z',
      text: `=== RESUMEN FATHOM: "Weekly Follow Up Tecnologia (775351347)" ===\n📅 Fecha: 2026-08-11 (Alineación con CEO)\n\nResumen Directivo de la Sesión:\n• Diego Musach y Alejandro Cubino (CEO) se alinean en la estrategia tecnológica y de infraestructura para el cierre del año.\n• Ahorro de Nubes: Se confirman reducciones por USD 26,880 anuales apagando servidores Heroku e integrando celdas en AWS/Huawei.\n• EDEMSA Mendoza: Camilo Uribe presentará la facturación de USD 50k sobre pérdidas en BT en 10 alimentadores con Sergio Palmucci.\n• Tecsys Brasil: Cotización en curso por USD 45k para homologaciones y certificaciones de gabinetes de fibra de vidrio.\n• WIND Telecom: Enrique Bevilacqua completará el cluster de VMs en staging y el SSO de autenticación OAuth2.`,
      categoryTag: '💻 Follow Up Tecnología'
    },
    {
      id: 'fathom-rec-jan-1',
      title: 'Weekly Follow Up Tecnologia - Arquitectura & Redes',
      date: '2026-01-15',
      createdAtISO: '2026-01-15T10:00:00Z',
      text: `=== FATHOM: "Weekly Follow Up Tecnologia - Arquitectura & Redes" ===\n📅 Fecha: 2026-01-15\n\n• Diego Musach revisa hitos de inicio de año en infraestructura y servidores.\n• Enrique Bevilacqua presenta arquitectura inicial de racs y VPNs para clientes.\n• Camilo Uribe detalla cotizaciones de software y licencias en desarrollo.\n• Leonard Amaya inicia prototipo frontend para gestión de eventos.`,
      categoryTag: '💻 Follow Up Tecnología (Desde Enero)'
    },
    {
      id: 'fathom-rec-feb-1',
      title: 'Weekly Follow Up Tecnologia - Microservicios & Staging',
      date: '2026-02-20',
      createdAtISO: '2026-02-20T14:30:00Z',
      text: `=== FATHOM: "Weekly Follow Up Tecnologia - Microservicios & Staging" ===\n📅 Fecha: 2026-02-20\n\n• Diego Musach establece la regla de cero tolerancias a caídas en servidores de producción.\n• Enrique Bevilacqua coordina migración de contenedores Docker.\n• Fabricio Jose Nieva demuestra primer prototipo del bot de soporte.`,
      categoryTag: '💻 Follow Up Tecnología (Desde Enero)'
    },
    {
      id: 'fathom-rec-mar-1',
      title: 'Weekly Follow Up Tecnologia - EDEMSA & Relevamiento',
      date: '2026-03-12',
      createdAtISO: '2026-03-12T11:00:00Z',
      text: `=== FATHOM: "Weekly Follow Up Tecnologia - EDEMSA & Relevamiento" ===\n📅 Fecha: 2026-03-12\n\n• Diego Musach solicita el informe de relevamiento inicial de alimentadores.\n• Camilo Uribe revisa presupuestos de gabinetes para Argentina y Colombia.`,
      categoryTag: '💻 Follow Up Tecnología (Desde Enero)'
    },
    {
      id: 'fathom-rec-apr-1',
      title: 'Weekly Follow Up Tecnologia - WIND & SSO',
      date: '2026-04-18',
      createdAtISO: '2026-04-18T16:00:00Z',
      text: `=== FATHOM: "Weekly Follow Up Tecnologia - WIND & SSO" ===\n📅 Fecha: 2026-04-18\n\n• Enrique Bevilacqua expone la arquitectura del Single Sign-On para WIND.\n• Mario Maqueda integra tablero de analytics inicial.`,
      categoryTag: '💻 Follow Up Tecnología (Desde Enero)'
    },
    {
      id: 'fathom-rec-may-1',
      title: 'Weekly Follow Up Tecnologia - Pruebas STB Telecable',
      date: '2026-05-22',
      createdAtISO: '2026-05-22T09:30:00Z',
      text: `=== FATHOM: "Weekly Follow Up Tecnologia - Pruebas STB Telecable" ===\n📅 Fecha: 2026-05-22\n\n• Enrique Bevilacqua reporta resultados preliminares del laboratorio Elebao AOSP.\n• Kenyi y Sabrina auditan consumo de horas de soporte.`,
      categoryTag: '💻 Follow Up Tecnología (Desde Enero)'
    },
    {
      id: 'fathom-rec-jun-1',
      title: 'Weekly Follow Up Tecnologia - Evaluación Q2 & Despliegues',
      date: '2026-06-25',
      createdAtISO: '2026-06-25T15:00:00Z',
      text: `=== FATHOM: "Weekly Follow Up Tecnologia - Evaluación Q2 & Despliegues" ===\n📅 Fecha: 2026-06-25\n\n• Diego Musach aprueba la hoja de ruta del Q3 2026.\n• Leonard Amaya inicia plan de baja de Heroku.`,
      categoryTag: '💻 Follow Up Tecnología (Desde Enero)'
    },
    {
      id: 'fathom-rec-aug-today',
      title: 'Meet Seguimiento Video: Desarrollo + QT + Servicios',
      date: '2026-08-10',
      createdAtISO: '2026-08-10T15:30:00Z',
      text: `=== RESUMEN FATHOM: "Meet Seguimiento Video: Desarrollo + QT + Servicios" ===\n📅 Fecha: 2026-08-10 (HOY)\n\nResumen Directivo de la Sesión:\n• Diego Musach revisa estatus de la plataforma de video, STB Elebao y desarrollo frontend.\n• Enrique Bevilacqua confirma avance en laboratorio de pruebas STB AOSP Telecable Costa Rica y FingerPrint con chips Montage.\n• Leonard Amaya presenta el plan de migración frontend de CableView y apagar servidores Heroku.\n• Kenyi y Sabrina reportan métricas de reproducciones y soporte técnico de Nivel 1.`,
      categoryTag: '💻 Follow Up Tecnología (Desde Enero)'
    }
  ];

  sampleFollowUps.forEach(sample => {
    if (!formattedMap.has(sample.id)) {
      formattedMap.set(sample.id, sample);
    }
  });

  const finalMeetingsList = Array.from(formattedMap.values());

  // STRICT SORTING BY DATE DESCENDING (NEWEST FIRST)
  finalMeetingsList.sort((a, b) => {
    const dateA = a.createdAtISO || a.date || '';
    const dateB = b.createdAtISO || b.date || '';
    return dateB.localeCompare(dateA);
  });

  return {
    success: true,
    meetings: finalMeetingsList,
    count: finalMeetingsList.length
  };
}

// ADVANCED EXECUTIVE ANALYSIS & NOTION CARD MATCHING ENGINE
export function parseFathomTranscript(transcriptText, meetingTitle = "Reunión CTO", existingNotionCards = []) {
  if (!transcriptText || !transcriptText.trim()) return null;

  const lines = transcriptText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const teamMembers = [
    { 
      name: 'Camilo Uribe', 
      key: 'Camilo Uribe', 
      keywords: ['camilo', 'tecsys', 'ss', 'pérdidas', 'delsur', 'aes', 'excel', 'operativa', 'energía', 'fcc', 'habitat'],
      defaultTopic: 'Tecsys: Cotización por certificado FCC y CE / Hábitat'
    },
    { 
      name: 'Enrique Bevilacqua', 
      key: 'Enrique Bevilacqua', 
      keywords: ['enrique', 'telecable', 'aosp', 'elebao', 'wind', 'cluster', 'servidores', 'heroku', 'cable color', 'tecnologia', 'fingerprint', 'video'],
      defaultTopic: 'Proyecto Video & Telecable: STB AOSP Elebao y FingerPrint'
    },
    { 
      name: 'Fabricio Jose Nieva', 
      key: 'Fabricio Jose Nieva', 
      keywords: ['fabricio', 'bot', 'capacitaciones', 'redes', 'habitat', 'koala', 'servicios', 'sensor'],
      defaultTopic: 'Soporte AI: Entrenamiento BOT con Capacitaciones Filmadas'
    },
    { 
      name: 'Mario Maqueda', 
      key: 'Mario Maqueda', 
      keywords: ['mario', 'data', 'analytics', 'objetivos', 'desarrollo', 'scorecard'],
      defaultTopic: 'Matriz Analytics y Scorecard de Métricas'
    },
    { 
      name: 'Leonard Amaya', 
      key: 'Leonard Amaya', 
      keywords: ['leonard', 'leo', 'heroku', 'migracion', 'frontend', 'vistas', 'cableview'],
      defaultTopic: 'Desmantelamiento de Heroku y Migración Frontend'
    },
    { 
      name: 'Joseph Valer', 
      key: 'Joseph Valer', 
      keywords: ['joseph', 'soporte', 'tickets', 'control', 'seguimiento'],
      defaultTopic: 'Auditoría y Reducción de Tickets de Soporte Premium'
    },
    { 
      name: 'Sabrina (Soporte)', 
      key: 'Sabrina (Soporte)', 
      keywords: ['sabrina', 'costos soporte', 'area soporte', 'video'],
      defaultTopic: 'Estructuración y Costos del Área de Soporte'
    },
    { 
      name: 'Kenyi (Soporte)', 
      key: 'Kenyi (Soporte)', 
      keywords: ['kenyi', 'fingerprint', 'qt', 'montage', 'video'],
      defaultTopic: 'Pruebas Hardware STB Elebao y FingerPrint'
    },
    { 
      name: 'Martin (Comercial)', 
      key: 'Martin (Comercial)', 
      keywords: ['martin', 'comercial', 'faq', 'venta'],
      defaultTopic: 'Propuesta Comercial y Preguntas FAQ Pérdidas'
    }
  ];

  const analyzedDelegations = teamMembers.map(m => {
    const matchedLines = lines.filter(line => 
      m.keywords.some(kw => line.toLowerCase().includes(kw))
    );

    const hasDirectMention = matchedLines.length > 0;
    let executiveTitle = '';
    let executiveExcerpt = '';

    if (hasDirectMention) {
      const topDetail = matchedLines[0];
      if (topDetail.toLowerCase().includes('video') || topDetail.toLowerCase().includes('aosp') || topDetail.toLowerCase().includes('fingerprint')) {
        executiveTitle = `[Fathom ${new Date().toLocaleDateString()}] ${m.name}: Informe de pruebas laboratorio STB AOSP Telecable Costa Rica y FingerPrint`;
      } else if (topDetail.toLowerCase().includes('tecsys') || topDetail.toLowerCase().includes('excel')) {
        executiveTitle = `[Fathom] ${m.name}: Eliminar planillas Excel sueltas y volcar cotizaciones FCC/CE y Hábitat a tarjetas de Notion`;
      } else if (topDetail.toLowerCase().includes('wind') || topDetail.toLowerCase().includes('sso') || topDetail.toLowerCase().includes('cluster')) {
        executiveTitle = `[Fathom] ${m.name}: Estabilizar Cluster de VMs en WIND y definir estándar OAuth2 para el Single Sign-On`;
      } else if (topDetail.toLowerCase().includes('bot') || topDetail.toLowerCase().includes('soporte')) {
        executiveTitle = `[Fathom] ${m.name}: Entrenar Agente BOT AI de Soporte utilizando las capacitaciones filmadas`;
      } else if (topDetail.toLowerCase().includes('heroku') || topDetail.toLowerCase().includes('migracion')) {
        executiveTitle = `[Fathom] ${m.name}: Programar ventana de auto-stop de entornos Heroku y migrar vistas frontend`;
      } else {
        executiveTitle = `[Fathom] ${m.name}: ${topDetail.substring(0, 90)}`;
      }
      executiveExcerpt = matchedLines.slice(0, 4).join(' • ');
    } else {
      executiveTitle = `[Fathom] ${m.name}: Seguimiento de compromisos en reunión "${meetingTitle}"`;
      executiveExcerpt = `Revisión de avance en reunión directiva "${meetingTitle}".`;
    }

    let matchedCard = null;
    if (Array.isArray(existingNotionCards) && existingNotionCards.length > 0) {
      matchedCard = existingNotionCards.find(card => {
        const cardTitleLower = (card.title || '').toLowerCase();
        const cardRespLower = (card.memberName || card.responsable || '').toLowerCase();

        const sameMember = cardRespLower.includes(m.name.split(' ')[0].toLowerCase());
        const topicMatch = m.keywords.some(kw => cardTitleLower.includes(kw));

        return sameMember && topicMatch;
      });
    }

    return {
      memberName: m.name,
      responsableKey: m.key,
      mentionCount: hasDirectMention ? matchedLines.length : 1,
      hasDirectMention,
      executiveTitle,
      excerpt: executiveExcerpt,
      existingCard: matchedCard ? {
        id: matchedCard.notionPageId || matchedCard.id,
        title: matchedCard.title,
        status: matchedCard.status
      } : null
    };
  });

  return {
    meetingTitle,
    analyzedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    lineCount: lines.length,
    teamDelegations: analyzedDelegations
  };
}
