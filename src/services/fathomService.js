// Service to handle Fathom Video Notetaker API & AI Transcript Analysis
// Supports: Executive Title Formulation, Existing Card Comment Matching, and Complete July 2026 Ingestion

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

export async function fetchFathomMeetings(apiKey, startDate = '2026-07-01') {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    return { success: false, error: 'Por favor ingresa tu API Key de Fathom.', meetings: [] };
  }

  const headers = {
    'X-Api-Key': cleanKey,
    'Authorization': `Bearer ${cleanKey}`,
    'Content-Type': 'application/json'
  };

  let allMeetings = [];
  let nextCursor = null;
  let hasMore = true;
  let pageCount = 0;

  try {
    while (hasMore && pageCount < 10) { // Up to 1000 meetings across pages
      pageCount++;
      const queryParams = new URLSearchParams({
        include_transcript: 'true',
        include_summary: 'true',
        include_action_items: 'true',
        limit: '100'
      });
      if (startDate) queryParams.set('created_after', `${startDate}T00:00:00Z`);
      if (nextCursor) queryParams.set('cursor', nextCursor);

      let response = await fetch(`/api/fathom/external/v1/meetings?${queryParams.toString()}`, { headers });

      if (!response.ok && pageCount === 1) {
        response = await fetch(`/api/fathom/external/v1/meetings`, { headers });
      }

      if (!response.ok) {
        if (pageCount === 1) {
          const errBody = await response.text().catch(() => '');
          return {
            success: false,
            status: response.status,
            error: `Fathom API Error (${response.status}): ${errBody || response.statusText || 'Verifica tu API Key'}`,
            meetings: []
          };
        }
        break;
      }

      const data = await response.json();
      const rawMeetings = data.items || data.meetings || data.results || (Array.isArray(data) ? data : []);
      
      if (Array.isArray(rawMeetings)) {
        allMeetings = [...allMeetings, ...rawMeetings];
      }

      if (data.next_cursor || data.pagination?.next_cursor) {
        nextCursor = data.next_cursor || data.pagination?.next_cursor;
      } else {
        hasMore = false;
      }
    }

    const formattedMeetings = allMeetings.map((m, idx) => {
      const title = m.meeting_title || m.title || `Llamada Fathom #${idx+1}`;
      const extractedText = extractTextFromFathomMeeting(m);
      const dateStr = m.created_at || m.date || new Date().toISOString().slice(0, 10);
      return {
        ...m,
        id: m.recording_id || m.id || `fathom-rec-${idx+1}`,
        title,
        date: typeof dateStr === 'string' ? dateStr.slice(0, 10) : '2026-08-10',
        text: extractedText,
        rawSummary: m.default_summary?.markdown_formatted || '',
        actionItems: m.action_items || []
      };
    });

    return {
      success: true,
      meetings: formattedMeetings,
      count: formattedMeetings.length
    };
  } catch (err) {
    console.error("Fathom API Exception:", err);
    return {
      success: false,
      error: `Error de conexión: ${err.message}`,
      meetings: []
    };
  }
}

// ADVANCED EXECUTIVE ANALYSIS & NOTION CARD MATCHING ENGINE
export function parseFathomTranscript(transcriptText, meetingTitle = "Reunión CTO", existingNotionCards = []) {
  if (!transcriptText || !transcriptText.trim()) return null;

  const lines = transcriptText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const textLower = transcriptText.toLowerCase();

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
      keywords: ['enrique', 'telecable', 'aosp', 'elebao', 'wind', 'cluster', 'servidores', 'heroku', 'cable color', 'tecnologia', 'fingerprint'],
      defaultTopic: 'Proyecto WIND: Estabilidad del Cluster y SSO'
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
      keywords: ['sabrina', 'costos soporte', 'area soporte'],
      defaultTopic: 'Estructuración y Costos del Área de Soporte'
    },
    { 
      name: 'Kenyi (Soporte)', 
      key: 'Kenyi (Soporte)', 
      keywords: ['kenyi', 'fingerprint', 'qt', 'montage'],
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
    
    // 1. Formulate Actionable Executive Title with Criteria
    let executiveTitle = '';
    let executiveExcerpt = '';

    if (hasDirectMention) {
      const topDetail = matchedLines[0];
      if (topDetail.toLowerCase().includes('tecsys') || topDetail.toLowerCase().includes('excel')) {
        executiveTitle = `[Fathom] ${m.name}: Eliminar planillas Excel sueltas y volcar cotizaciones FCC/CE y Hábitat a tarjetas de Notion`;
      } else if (topDetail.toLowerCase().includes('wind') || topDetail.toLowerCase().includes('sso') || topDetail.toLowerCase().includes('cluster')) {
        executiveTitle = `[Fathom] ${m.name}: Estabilizar Cluster de VMs en WIND y definir estándar OAuth2 para el Single Sign-On`;
      } else if (topDetail.toLowerCase().includes('telecable') || topDetail.toLowerCase().includes('aosp') || topDetail.toLowerCase().includes('fingerprint')) {
        executiveTitle = `[Fathom] ${m.name}: Cerrar validación de STB AOSP Elebao con FingerPrint y informe de pruebas Montage`;
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

    // 2. Search for existing OPEN card in Notion to APPEND COMMENT instead of duplicating
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
