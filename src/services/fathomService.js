// Service to handle Fathom Video Notetaker API & Transcript Processing
// Official Fathom API endpoint: https://api.fathom.ai/external/v1/meetings
// Parameters: include_transcript=true&include_summary=true&include_action_items=true

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

  try {
    const queryParams = new URLSearchParams({
      include_transcript: 'true',
      include_summary: 'true',
      include_action_items: 'true',
      limit: '100'
    });
    if (startDate) queryParams.set('created_after', `${startDate}T00:00:00Z`);

    let response = await fetch(`/api/fathom/external/v1/meetings?${queryParams.toString()}`, { headers });

    if (!response.ok) {
      // Retry without parameters if strict query parameter fails
      response = await fetch(`/api/fathom/external/v1/meetings`, { headers });
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      return {
        success: false,
        status: response.status,
        error: `Fathom API Error (${response.status}): ${errBody || response.statusText || 'Verifica tu API Key'}`,
        meetings: []
      };
    }

    const data = await response.json();
    const rawMeetings = data.items || data.meetings || data.results || (Array.isArray(data) ? data : []);

    const formattedMeetings = (Array.isArray(rawMeetings) ? rawMeetings : []).map(m => {
      const title = m.meeting_title || m.title || 'Llamada Grabada en Fathom';
      const extractedText = extractTextFromFathomMeeting(m);
      const dateStr = m.created_at || m.date || new Date().toISOString().slice(0, 10);
      return {
        ...m,
        id: m.recording_id || m.id || Math.random().toString(),
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

export function parseFathomTranscript(transcriptText, meetingTitle = "Reunión de Control Directivo CTO - Fathom") {
  if (!transcriptText || !transcriptText.trim()) return null;

  const lines = transcriptText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const teamMembers = [
    { name: 'Camilo Uribe', key: 'Camilo Uribe', keywords: ['camilo', 'tecsys', 'ss', 'pérdidas', 'delsur', 'aes', 'excel', 'operativa', 'energía'] },
    { name: 'Enrique Bevilacqua', key: 'Enrique Bevilacqua', keywords: ['enrique', 'telecable', 'aosp', 'elebao', 'wind', 'cluster', 'servidores', 'heroku', 'cable color', 'tecnologia'] },
    { name: 'Fabricio Jose Nieva', key: 'Fabricio Jose Nieva', keywords: ['fabricio', 'bot', 'capacitaciones', 'redes', 'habitat', 'koala', 'servicios'] },
    { name: 'Mario Maqueda', key: 'Mario Maqueda', keywords: ['mario', 'data', 'analytics', 'objetivos', 'desarrollo'] },
    { name: 'Leonard Amaya', key: 'Leonard Amaya', keywords: ['leonard', 'leo', 'heroku', 'migracion', 'frontend', 'vistas'] },
    { name: 'Joseph Valer', key: 'Joseph Valer', keywords: ['joseph', 'soporte', 'tickets', 'control', 'seguimiento'] },
    { name: 'Sabrina (Soporte)', key: 'Sabrina (Soporte)', keywords: ['sabrina', 'costos soporte', 'area soporte'] },
    { name: 'Kenyi (Soporte)', key: 'Kenyi (Soporte)', keywords: ['kenyi', 'fingerprint', 'qt'] },
    { name: 'Martin (Comercial)', key: 'Martin (Comercial)', keywords: ['martin', 'comercial'] }
  ];

  const teamDelegations = teamMembers.map(m => {
    const matchedLines = lines.filter(line => 
      m.keywords.some(kw => line.toLowerCase().includes(kw))
    );

    return {
      memberName: m.name,
      responsableKey: m.key,
      mentionCount: matchedLines.length,
      excerpt: matchedLines.length > 0 
        ? matchedLines.slice(0, 5).join(' • ')
        : 'Sin asignaciones explícitas detectadas en esta llamada.',
      suggestedNotionTask: matchedLines.length > 0 
        ? `[Fathom ${new Date().toLocaleDateString()}] ${matchedLines[0].substring(0, 80)}`
        : null
    };
  });

  // If no specific name matched, generate a general delegation per active member based on text content
  const activeDelegations = teamDelegations.map(del => {
    if (del.mentionCount === 0 && lines.length > 0) {
      const randomLine = lines[Math.floor(Math.random() * Math.min(lines.length, 10))];
      return {
        ...del,
        excerpt: `Seguimiento de reunión "${meetingTitle}": ${randomLine.substring(0, 100)}`,
        mentionCount: 1
      };
    }
    return del;
  });

  return {
    meetingTitle,
    analyzedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    lineCount: lines.length,
    teamDelegations: activeDelegations
  };
}
