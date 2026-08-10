import React, { useState } from 'react';
import { Calendar, MessageSquare, ShieldAlert, CheckCircle2, Send, RefreshCw, Search, Layers, ExternalLink } from 'lucide-react';
import { postCommentToNotion } from '../services/notionService';

export default function DailyFollowUp({ teamTracking, credentials, onOpenEmailWithAgenda, onNavigate }) {
  const [activeMemberId, setActiveMemberId] = useState('all');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [syncStatus, setSyncStatus] = useState({});
  const [commentedTopicIds, setCommentedTopicIds] = useState([]);

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getNotionUrl = (notionPageId) => {
    if (!notionPageId) return 'https://notion.so';
    const cleanId = notionPageId.replace(/-/g, '');
    return `https://notion.so/${cleanId}`;
  };

  // Flatten all 165 cards across all team members for cross-search
  const allCardsCross = [];
  teamTracking.forEach(mem => {
    (mem.topics || []).forEach(t => {
      allCardsCross.push({
        ...t,
        memberName: mem.name,
        memberRole: mem.role,
        memberAvatar: mem.avatar,
        memberId: mem.id
      });
    });
  });

  // Helper to generate dynamic speech & reaction scenarios for ANY specific topic
  const getTopicScenarios = (topicTitle, memberName) => {
    const tLower = topicTitle.toLowerCase();
    
    if (tLower.includes('excel') || tLower.includes('seguimiento') || tLower.includes('camilo')) {
      return {
        speech: `«${memberName.split(' ')[0]}, en "${topicTitle}": erradicamos planillas Excel sueltas. Toda la ingeniería debe estar en tarjetas de Notion con logs diarios.»`,
        responseIf: "El Excel me resulta más cómodo para resúmenes.",
        diegoAnswer: "«El Excel aísla la información. Notion le da visibilidad a todo el equipo en tiempo real. Asumimos Notion como única fuente de verdad.»"
      };
    } else if (tLower.includes('telecable') || tLower.includes('tms') || tLower.includes('roku') || tLower.includes('cableview') || tLower.includes('enrique')) {
      return {
        speech: `«${memberName.split(' ')[0]}, sobre "${topicTitle}": este entregable impacta la operación del cliente. ¿Cuáles son los hitos de hoy y qué servidores podemos apagar para reducir costos?»`,
        responseIf: "Tengo muchas tareas asignadas en paralelo.",
        diegoAnswer: "«Congelamos lo secundario. Nos enfocamos al 100% en este entregable crítico hasta que quede probado.»"
      };
    } else if (tLower.includes('soporte') || tLower.includes('bot') || tLower.includes('joseph') || tLower.includes('agente')) {
      return {
        speech: `«${memberName.split(' ')[0]}, en "${topicTitle}": necesitamos medir la reducción de tickets y auditar que no queden tareas 'Sin Asignar' en Notion.»`,
        responseIf: "Algunos desarrolladores no actualizan su estado.",
        diegoAnswer: "«Repórtamelo en la mañana e intervengo directamente en su Scorecard para exigir el cumplimiento.»"
      };
    } else {
      return {
        speech: `«${memberName.split(' ')[0]}, en "${topicTitle}": revisemos el estado de avance, los blockers técnicos y la fecha tope pactada.»`,
        responseIf: "Falta definición o respuesta de terceros.",
        diegoAnswer: "«Escalo la gestión de terceros en 1-click ahora mismo; tú continúa con la implementación interna sin frenarte.»"
      };
    }
  };

  const handlePostCommentForTopic = async (topicId, notionPageId, memberName) => {
    const text = commentInputs[topicId];
    if (!text || !text.trim()) return;

    setSyncStatus(prev => ({ ...prev, [topicId]: 'syncing' }));

    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Send directly to Notion API
    const result = await postCommentToNotion(
      credentials?.notionToken,
      notionPageId,
      `[Follow Up Diario Diego Musach - ${new Date().toLocaleDateString()}]: ${text.trim()}`
    );

    if (result.success) {
      setSyncStatus(prev => ({ ...prev, [topicId]: 'success' }));
      
      // Update local comment list for this topic so last comment displays immediately
      const targetCard = allCardsCross.find(c => c.id === topicId);
      if (targetCard) {
        targetCard.comments = [
          ...(targetCard.comments || []),
          { author: 'Diego Musach (CTO)', date: nowFormatted, text: text.trim() }
        ];
      }

      setCommentInputs(prev => ({ ...prev, [topicId]: '' }));
      
      // Move this topic to bottom
      if (!commentedTopicIds.includes(topicId)) {
        setCommentedTopicIds(prev => [...prev, topicId]);
      }

      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, [topicId]: null }));
      }, 3000);
    } else {
      setSyncStatus(prev => ({ ...prev, [topicId]: 'error' }));
    }
  };

  // Filter cards by member and cross-search query
  let displayedCards = activeMemberId === 'all'
    ? allCardsCross
    : allCardsCross.filter(c => c.memberId === activeMemberId);

  if (globalSearchQuery.trim()) {
    const q = globalSearchQuery.toLowerCase();
    displayedCards = allCardsCross.filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.memberName.toLowerCase().includes(q) ||
      (c.log && c.log.toLowerCase().includes(q))
    );
  }

  // Re-order: Uncommented cards first, Commented cards pushed to the BOTTOM
  const sortedCards = [...displayedCards].sort((a, b) => {
    const aCommented = commentedTopicIds.includes(a.id);
    const bCommented = commentedTopicIds.includes(b.id);
    if (aCommented && !bCommented) return 1;
    if (!aCommented && bCommented) return -1;
    return 0;
  });

  return (
    <div className="daily-followup-container">
      
      {/* Compact Header Banner */}
      <div className="card-glass" style={{ marginBottom: '0.85rem', padding: '0.75rem 1rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🚨 Follow Up Diario ({allCardsCross.length} Tarjetas Reales de Notion)
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 400 }}>• {currentDate}</span>
            </h2>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>
              Muestra el último comentario con fecha e incluye link directo para abrir cada tarjeta en Notion.
            </p>
          </div>

          <button className="btn-secondary" onClick={() => onNavigate('micromanagement')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
            👥 Ver Equipo Completo
          </button>
        </div>
      </div>

      {/* COMPACT MULTI-ROW MEMBER CHIPS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.85rem' }}>
        <button
          onClick={() => {
            setActiveMemberId('all');
            setGlobalSearchQuery('');
          }}
          style={{
            background: activeMemberId === 'all' && !globalSearchQuery ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'var(--bg-card)',
            color: '#fff',
            border: activeMemberId === 'all' && !globalSearchQuery ? 'none' : '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '0.35rem 0.7rem',
            cursor: 'pointer',
            fontSize: '0.76rem',
            fontWeight: activeMemberId === 'all' ? 700 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Layers size={13} />
          <span>TODOS ({allCardsCross.length})</span>
        </button>

        {teamTracking.map((mem) => {
          const isActive = mem.id === activeMemberId && !globalSearchQuery;
          const count = (mem.topics || []).length;
          
          let shortName = mem.name.split(' ')[0];
          if (mem.name.includes('Musach')) shortName = 'Diego (CTO)';
          else if (mem.name.includes('Sin Asignar')) shortName = 'Sin Asignar';
          else if (mem.name.includes('Sabrina')) shortName = 'Sabrina';
          else if (mem.name.includes('Kenyi')) shortName = 'Kenyi';
          else if (mem.name.includes('Martin')) shortName = 'Martin';

          return (
            <button
              key={mem.id}
              onClick={() => {
                setActiveMemberId(mem.id);
                setGlobalSearchQuery('');
              }}
              style={{
                background: isActive ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'var(--bg-card)',
                color: '#fff',
                border: isActive ? 'none' : '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.76rem',
                fontWeight: isActive ? 700 : 400,
                boxShadow: isActive ? '0 2px 10px rgba(6, 182, 212, 0.3)' : 'none'
              }}
            >
              <img src={mem.avatar} alt={mem.name} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
              <span>{shortName} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* CROSS-TEAM GLOBAL SEARCH BAR */}
      <div className="card-glass" style={{ padding: '0.65rem 0.9rem', marginBottom: '1rem', border: '1.5px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Search size={18} className="text-cyan" />
          <input
            type="text"
            placeholder="🔍 BUSCADOR CROSS DE TEMAS: Escribe cualquier palabra clave (ej: Telecable, POC, Webhooks, Excel, WIND)..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.88rem', width: '100%', fontWeight: 500 }}
          />
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.72rem' }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* RESULT COUNT INDICATOR */}
      <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.75rem' }}>
        Mostrando {sortedCards.length} tarjetas {globalSearchQuery ? `para la búsqueda "${globalSearchQuery}"` : activeMemberId === 'all' ? 'de todos los integrantes' : `de ${teamTracking.find(m=>m.id===activeMemberId)?.name}`}:
      </div>

      {/* LIST OF COMPACT CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sortedCards.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No se encontraron tarjetas con el filtro ingresado.
          </div>
        ) : (
          sortedCards.map((topic, idx) => {
            const topicInfo = getTopicScenarios(topic.title, topic.memberName);
            const inputVal = commentInputs[topic.id] || '';
            const status = syncStatus[topic.id];
            const isCommented = commentedTopicIds.includes(topic.id);
            const notionUrl = getNotionUrl(topic.notionPageId);
            const lastComment = (topic.comments || []).length > 0 ? topic.comments[topic.comments.length - 1] : null;

            return (
              <div 
                key={topic.id || idx} 
                className="card-glass"
                style={{
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                  borderLeft: isCommented ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-cyan)',
                  opacity: isCommented ? 0.78 : 1,
                  background: isCommented ? 'rgba(11, 16, 28, 0.6)' : 'rgba(15, 23, 42, 0.85)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Compact Card Header with Direct Notion Link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.15rem' }}>
                      <img src={topic.memberAvatar} alt={topic.memberName} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        {topic.memberName}
                      </span>
                      <span className={`tag ${topic.priority?.includes('P1') ? 'critical' : 'high'}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                        {topic.priority}
                      </span>
                      <span className="tag info" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>{topic.status}</span>
                      
                      {isCommented && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(16, 185, 129, 0.12)', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>
                          <CheckCircle2 size={11} /> Atendida • Al final
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '0.92rem', color: '#fff', margin: 0, fontWeight: 600, lineHeight: '1.3' }}>
                      {topic.title}
                    </h4>
                  </div>

                  {/* DIRECT NOTION PAGE LINK BUTTON */}
                  <a
                    href={notionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                    title="Abrir esta tarjeta directamente en Notion"
                  >
                    <ExternalLink size={13} /> Abrir en Notion
                  </a>
                </div>

                {/* Compact Speech & Reaction Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  
                  {/* Speech */}
                  <div style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '0.45rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                    <span style={{ fontSize: '0.66rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'block', marginBottom: '0.1rem' }}>
                      🗣️ Speech Directivo:
                    </span>
                    <div style={{ color: '#fff', fontStyle: 'italic', lineHeight: '1.3' }}>
                      {topicInfo.speech}
                    </div>
                  </div>

                  {/* Response Handling */}
                  <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.45rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                    <span style={{ fontSize: '0.66rem', color: 'var(--accent-amber)', fontWeight: 700, display: 'block', marginBottom: '0.1rem' }}>
                      🛡️ Si responde: "{topicInfo.responseIf}"
                    </span>
                    <div style={{ color: '#fff', fontWeight: 600, lineHeight: '1.3' }}>
                      👉 {topicInfo.diegoAnswer}
                    </div>
                  </div>

                </div>

                {/* LATEST NOTION COMMENT DISPLAY WITH DATE */}
                {lastComment ? (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.45rem 0.75rem', borderRadius: '6px', fontSize: '0.76rem', borderLeft: '3px solid var(--accent-cyan)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.15rem' }}>
                      <strong>💬 Último comentario por {lastComment.author}</strong>
                      <span>📅 {lastComment.date}</span>
                    </div>
                    <div style={{ color: '#fff', fontSize: '0.8rem' }}>"{lastComment.text}"</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    Sin comentarios previos registrados en Notion.
                  </div>
                )}

                {/* Automatic Live Notion API Comment Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Comentar directamente a Notion para ${topic.memberName}...`}
                      value={inputVal}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [topic.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePostCommentForTopic(topic.id, topic.notionPageId, topic.memberName);
                      }}
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                    />
                    <button
                      className="btn-primary"
                      onClick={() => handlePostCommentForTopic(topic.id, topic.notionPageId, topic.memberName)}
                      style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
                    >
                      <Send size={12} /> Publicar a Notion
                    </button>
                  </div>

                  {status === 'syncing' && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <RefreshCw className="spin" size={11} /> Publicando comentario directamente en Notion API...
                    </div>
                  )}
                  {status === 'success' && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={12} /> ¡Comentario publicado automáticamente en Notion y tarjeta enviada al final!
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
