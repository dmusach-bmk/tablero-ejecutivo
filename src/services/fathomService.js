// Service to handle Fathom Video Notetaker API & Transcript Processing
// Supports Fathom API Key via Vite Proxy /api/fathom -> https://api.fathom.video

export async function fetchFathomMeetings(apiKey, startDate = '2026-07-01') {
  if (!apiKey) return [];
  try {
    const query = startDate ? `?created_after=${startDate}T00:00:00Z` : '';
    const response = await fetch(`/api/fathom/v1/meetings${query}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn("Fathom API proxy response status:", response.status);
      return [];
    }

    const data = await response.json();
    const meetings = data.meetings || data.results || data || [];
    return Array.isArray(meetings) ? meetings : [];
  } catch (err) {
    console.error("Fathom API Proxy Error:", err);
    return [];
  }
}

export function parseFathomTranscript(transcriptText, meetingTitle = "Reunión de Control Directivo CTO - Fathom") {
  if (!transcriptText || !transcriptText.trim()) return null;

  const lines = transcriptText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const teamMembers = [
    { name: 'Camilo Uribe', key: 'Camilo Uribe', keywords: ['camilo', 'tecsys', 'ss', 'pérdidas', 'delsur', 'aes', 'excel'] },
    { name: 'Enrique Bevilacqua', key: 'Enrique Bevilacqua', keywords: ['enrique', 'telecable', 'aosp', 'elebao', 'wind', 'cluster', 'servidores', 'heroku'] },
    { name: 'Fabricio Jose Nieva', key: 'Fabricio Jose Nieva', keywords: ['fabricio', 'bot', 'capacitaciones', 'redes', 'habitat', 'koala'] },
    { name: 'Mario Maqueda', key: 'Mario Maqueda', keywords: ['mario', 'data', 'analytics', 'objetivos'] },
    { name: 'Leonard Amaya', key: 'Leonard Amaya', keywords: ['leonard', 'leo', 'heroku', 'migracion', 'frontend', 'vistas'] },
    { name: 'Joseph Valer', key: 'Joseph Valer', keywords: ['joseph', 'soporte', 'tickets', 'control', 'seguimiento'] },
    { name: 'Sabrina (Soporte)', key: 'Sabrina (Soporte)', keywords: ['sabrina', 'costos soporte', 'area soporte'] },
    { name: 'Kenyi (Soporte)', key: 'Kenyi (Soporte)', keywords: ['kenyi', 'fingerprint'] },
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

  return {
    meetingTitle,
    analyzedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    lineCount: lines.length,
    teamDelegations: teamDelegations.filter(td => td.mentionCount > 0)
  };
}
