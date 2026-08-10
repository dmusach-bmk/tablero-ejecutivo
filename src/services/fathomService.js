// Service to handle Fathom Video Notetaker API & Transcript Processing
// Supports Fathom API Key via Vite Proxy /api/fathom -> https://api.fathom.video

export async function fetchFathomMeetings(apiKey, startDate = '2026-07-01') {
  if (!apiKey) return [];
  
  let allMeetings = [];
  let nextCursor = null;
  let hasMore = true;
  let pageCount = 0;

  try {
    while (hasMore && pageCount < 5) { // Up to 500 meetings across pages
      pageCount++;
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.set('created_after', `${startDate}T00:00:00Z`);
      queryParams.set('limit', '100');
      queryParams.set('include_transcripts', 'true');
      if (nextCursor) queryParams.set('cursor', nextCursor);

      const response = await fetch(`/api/fathom/v1/meetings?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Fallback simple fetch if query params restricted
        if (pageCount === 1) {
          const simpleResp = await fetch('/api/fathom/v1/meetings', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          if (simpleResp.ok) {
            const simpleData = await simpleResp.json();
            const resList = simpleData.meetings || simpleData.results || (Array.isArray(simpleData) ? simpleData : []);
            return resList;
          }
        }
        break;
      }

      const data = await response.json();
      const pageMeetings = data.meetings || data.results || (Array.isArray(data) ? data : []);
      allMeetings = [...allMeetings, ...pageMeetings];

      if (data.next_cursor || data.pagination?.next_cursor) {
        nextCursor = data.next_cursor || data.pagination?.next_cursor;
      } else {
        hasMore = false;
      }
    }

    return allMeetings;
  } catch (err) {
    console.error("Fathom API Proxy Error:", err);
    return allMeetings;
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
