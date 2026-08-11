import React, { useState } from 'react';
import { Calendar, FileText, CheckCircle2, Copy, Send, Sparkles, Clock, Layers, ExternalLink, Download, Video, Award, Target, ChevronRight, MessageSquare, Mic, Plus, Check, Zap, RefreshCw, User, ShieldCheck } from 'lucide-react';
import { postCommentToNotion } from '../services/notionService';

export default function ExecutiveRoadmapAndReport({ teamTracking = [], notionCards = [], credentials }) {
  const [copiedReport, setCopiedReport] = useState(false);
  const [callCommentsMap, setCallCommentsMap] = useState({});
  const [listeningTargetId, setListeningTargetId] = useState(null);
  const [syncingTopicId, setSyncingTopicId] = useState(null);
  const [syncedStatusMap, setSyncedStatusMap] = useState({});

  const handleStartVoiceDictation = (targetId, onSpeechText) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("🎙️ Dictado por voz: Te recomendamos abrir el tablero en Google Chrome.");
      return;
    }
    setListeningTargetId(targetId);
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onSpeechText(transcript);
      }
      setListeningTargetId(null);
    };

    recognition.onerror = () => setListeningTargetId(null);
    recognition.onend = () => setListeningTargetId(null);

    recognition.start();
  };

  // 10 Key Executive Topics for the Weekly Call, Linked to Notion Cards & Fathom Takeaways
  const weeklyCallTopics = [
    {
      id: 'top-1',
      title: '1. STB Elebao AOSP & Marca FingerPrint (Telecable Costa Rica)',
      lead: 'Enrique Bevilacqua',
      keyword: 'telecable',
      fathomSummary: 'Pruebas de laboratorio completadas con procesadores Montage. Marca de agua digital FingerPrint verificada sobre señal de streaming.',
      defaultStatus: 'Listo para Homologación'
    },
    {
      id: 'top-2',
      title: '2. EDEMSA Mendoza: Facturación USD 50,000 por 10 Alimentadores',
      lead: 'Camilo Uribe / Diego Musach',
      keyword: 'edemsa',
      fathomSummary: 'Auditoría técnica de 10 alimentadores corregida con Sergio Palmucci, Nicolás y Zuin. Grilla de pérdidas BT autorizada para cobro.',
      defaultStatus: 'Autorizado p/ Cobro'
    },
    {
      id: 'top-3',
      title: '3. Tecsys Brasil: Homologación Certificados FCC/CE (USD 45,000)',
      lead: 'Camilo Uribe',
      keyword: 'tecsys',
      fathomSummary: 'Cotización desglosada de USD 45,000 en certificados FCC y CE. En proceso de traspasar ítems de Excel a tarjetas de Notion.',
      defaultStatus: 'En Traspaso Notion'
    },
    {
      id: 'top-4',
      title: '4. WIND Telecom: Cluster de VMs en Staging & SSO OAuth2',
      lead: 'Enrique Bevilacqua',
      keyword: 'wind',
      fathomSummary: 'Reinstalación y pruebas de resiliencia en Cluster de máquinas virtuales. Estándar OAuth2 unificado para Single Sign-On.',
      defaultStatus: 'Staging Listo'
    },
    {
      id: 'top-5',
      title: '5. Desmantelamiento Heroku & Migración CableView (USD 14,400/año)',
      lead: 'Leonard Amaya',
      keyword: 'heroku',
      fathomSummary: 'Programada ventana de mantenimiento para auto-stop de servidores Heroku y congelamiento de vistas frontend de CableView.',
      defaultStatus: 'Ahorro Programado'
    },
    {
      id: 'top-6',
      title: '6. Soporte AI Gemini: Entrenamiento con Capacitaciones Filmadas',
      lead: 'Fabricio Jose Nieva / Joseph Valer',
      keyword: 'bot',
      fathomSummary: 'Entrenamiento del Bot AI Gemini con repositorio de capacitaciones filmadas en Fathom. Reducción proyectada del 35% de tickets.',
      defaultStatus: 'En Pruebas Prácticas'
    },
    {
      id: 'top-7',
      title: '7. Vega OS & Hardware Amazon Fire TV Stick 4K Select',
      lead: 'Mario Maqueda',
      keyword: 'vega',
      fathomSummary: 'Aprobada adquisición del Firestick 4K Select para pruebas de la app en Vega OS. Claves Android 2026 registradas al 100%.',
      defaultStatus: 'Adquisición Aprobada'
    },
    {
      id: 'top-8',
      title: '8. Relevamiento Operativo de 2,300 Gabinetes de Fibra de Vidrio',
      lead: 'Camilo Uribe',
      keyword: 'gabinetes',
      fathomSummary: 'Planilla técnica de relevamiento consolidada en Argentina y Colombia con desglose de costos por gabinete.',
      defaultStatus: 'Completado'
    },
    {
      id: 'top-9',
      title: '9. Servidores Supermicro para Clientes OTT Hyve en Honduras',
      lead: 'Gonzalo González',
      keyword: 'supermicro',
      fathomSummary: 'Relevamiento de equipos e instalación física de servidores Supermicro para clientes de streaming en Honduras.',
      defaultStatus: 'En Instalación'
    },
    {
      id: 'top-10',
      title: '10. Telemetría de Red: Mediciones cosf / pact en Reconectadores',
      lead: 'Enrique Bevilacqua',
      keyword: 'reconectadores',
      fathomSummary: 'Coordinación con Fernando para integración de mediciones de cosf, pact y pret en la plataforma de control directivo.',
      defaultStatus: 'En Integración'
    }
  ];

  // Helper to match each topic with a real Notion card from Diego's workspace
  const getMatchedNotionCard = (keyword) => {
    if (!Array.isArray(notionCards) || notionCards.length === 0) return null;
    return notionCards.find(c => (c.title || '').toLowerCase().includes(keyword.toLowerCase()));
  };

  // Sync a single topic call comment to Notion API
  const handleSyncTopicCommentToNotion = async (topic) => {
    const comment = callCommentsMap[topic.id] || '';
    if (!comment.trim()) {
      alert(`Por favor escribe un comentario o dicta una nota para el tema "${topic.title}".`);
      return;
    }

    const matchedCard = getMatchedNotionCard(topic.keyword);
    const targetPageId = matchedCard ? (matchedCard.notionPageId || matchedCard.id) : (notionCards[0]?.notionPageId || notionCards[0]?.id);

    if (!targetPageId) {
      alert('No se encontró una tarjeta de Notion válida para vincular el comentario.');
      return;
    }

    setSyncingTopicId(topic.id);
    const formattedComment = `[Call Semanal CEO ${new Date().toLocaleDateString()}]: "${topic.title}" • Estado: ${topic.defaultStatus}\n💬 Comentario en vivo Diego: "${comment.trim()}"`;

    const res = await postCommentToNotion(credentials?.notionToken, targetPageId, formattedComment);
    if (res.success) {
      setSyncedStatusMap(prev => ({ ...prev, [topic.id]: true }));
    } else {
      alert(`Error al sincronizar comentario con Notion: ${res.error || 'Verifica credenciales'}`);
    }
    setSyncingTopicId(null);
  };

  // Batch sync all call comments to Notion API
  const handleSyncAllCommentsToNotion = async () => {
    const commentedTopics = weeklyCallTopics.filter(t => callCommentsMap[t.id] && callCommentsMap[t.id].trim());
    if (commentedTopics.length === 0) {
      alert('No has ingresado comentarios en los temas de la call semanal.');
      return;
    }

    for (const t of commentedTopics) {
      await handleSyncTopicCommentToNotion(t);
    }
    alert(`¡Se sincronizaron ${commentedTopics.length} comentarios de la call con Notion API!`);
  };

  const generateFullCallSummaryText = () => {
    const nowStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let summary = `======================================================================\n`;
    summary += `📊 RESUMEN DE SEGUIMIENTO EN VIVO - CALL SEMANAL CON CEO (ALEJANDRO CUBINO)\n`;
    summary += `Fecha: ${nowStr}\n`;
    summary += `Director: Diego Paolo Musach (CTO)\n`;
    summary += `======================================================================\n\n`;

    weeklyCallTopics.forEach((t, idx) => {
      const note = callCommentsMap[t.id] || 'Sin observaciones adicionales en la call.';
      const card = getMatchedNotionCard(t.keyword);
      summary += `${t.title}\n`;
      summary += `• Responsable: ${t.lead} | Estado: ${t.defaultStatus}\n`;
      summary += `• Tarjeta Notion Vinculada: ${card ? card.title : 'General'}\n`;
      summary += `• Avance Fathom: ${t.fathomSummary}\n`;
      summary += `• 💬 Comentario de Diego en Call: "${note}"\n\n`;
    });

    return summary;
  };

  const handleCopyCallSummary = () => {
    const text = generateFullCallSummaryText();
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="executive-roadmap-container">
      
      {/* Header Banner for Live Weekly Call */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video className="text-purple" size={22} /> 🎥 Tablero de Seguimiento para la Call Semanal con CEO (Alejandro Cubino)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Revisión interactiva en vivo de los 10 temas directivos. Permite agregar comentarios por punto y sincronizarlos con Notion API.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={handleSyncAllCommentsToNotion}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}
            >
              <Zap size={14} /> ⚡ Sincronizar Todos los Comentarios con Notion
            </button>

            <button
              className="btn-secondary"
              onClick={handleCopyCallSummary}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {copiedReport ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copiedReport ? '¡Copiado!' : '📋 Copiar Resumen Consolidado'}
            </button>
          </div>
        </div>
      </div>

      {/* THE 10 INTERACTIVE WEEKLY CALL TOPICS WITH NOTION CARD LINKING & LIVE COMMENTING */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.5rem' }}>
        {weeklyCallTopics.map((topic) => {
          const matchedCard = getMatchedNotionCard(topic.keyword);
          const currentComment = callCommentsMap[topic.id] || '';
          const isSyncing = syncingTopicId === topic.id;
          const isSynced = syncedStatusMap[topic.id];

          return (
            <div 
              key={topic.id} 
              className="card-glass"
              style={{ 
                padding: '1.25rem',
                borderLeft: '4px solid var(--accent-cyan)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              {/* Header Topic Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#ffffff', margin: '0 0 0.25rem 0', fontWeight: 700 }}>
                    {topic.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      👤 Responsable: {topic.lead}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                      {topic.defaultStatus}
                    </span>
                  </div>
                </div>

                {/* Linked Notion Card Badge */}
                {matchedCard ? (
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', background: 'rgba(192, 132, 252, 0.15)', border: '1px solid rgba(192, 132, 252, 0.3)', padding: '0.3rem 0.65rem', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Target size={13} /> Tarjeta Notion: "{matchedCard.title ? matchedCard.title.substring(0, 40) : 'General'}" ({matchedCard.status || 'Abierto'})
                  </div>
                ) : (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                    📍 Vinculado a Matriz General Notion
                  </div>
                )}
              </div>

              {/* Fathom Key Takeaways */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: '1.45', background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                💡 <strong>Avance en Fathom:</strong> {topic.fathomSummary}
              </div>

              {/* Live Call Comment Box with Microphone 🎙️ */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={listeningTargetId === topic.id ? "🎙️ Escuchando tu dictado para la call..." : "💬 Escribe aquí tu comentario o nota para Alejandro durante la call..."}
                  value={currentComment}
                  onChange={(e) => setCallCommentsMap(prev => ({ ...prev, [topic.id]: e.target.value }))}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem', flex: 1, background: 'rgba(15, 23, 42, 0.95)' }}
                />

                <button
                  onClick={() => handleStartVoiceDictation(topic.id, (txt) => setCallCommentsMap(prev => ({ ...prev, [topic.id]: prev[topic.id] ? `${prev[topic.id]} ${txt}` : txt })))}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                  title="Dictar comentario en vivo por micrófono 🎙️"
                >
                  <Mic size={14} className={listeningTargetId === topic.id ? 'pulse' : ''} />
                </button>

                <button
                  className="btn-primary"
                  onClick={() => handleSyncTopicCommentToNotion(topic)}
                  disabled={isSyncing || isSynced || !currentComment.trim()}
                  style={{
                    fontSize: '0.76rem',
                    padding: '0.5rem 0.85rem',
                    background: isSynced ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isSyncing ? (
                    'Sincronizando...'
                  ) : isSynced ? (
                    <>
                      <CheckCircle2 size={13} /> ¡Comentario en Notion!
                    </>
                  ) : (
                    <>
                      <MessageSquare size={13} /> Sincronizar Comentario con Notion
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
