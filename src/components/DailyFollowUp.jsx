import React, { useState } from 'react';
import { Calendar, MessageSquare, ShieldAlert, CheckCircle2, Send, RefreshCw, Search, ArrowDown } from 'lucide-react';
import { postCommentToNotion } from '../services/notionService';

export default function DailyFollowUp({ teamTracking, credentials, onOpenEmailWithAgenda, onNavigate }) {
  const [activeMemberId, setActiveMemberId] = useState('dev-camilo');
  const [searchTopicQuery, setSearchTopicQuery] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [syncStatus, setSyncStatus] = useState({});
  const [commentedTopicIds, setCommentedTopicIds] = useState([]);

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const selectedMember = teamTracking.find(m => m.id === activeMemberId) || teamTracking[0];

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

    // 1. Send directly to Notion API
    const result = await postCommentToNotion(
      credentials?.notionToken,
      notionPageId,
      `[Follow Up Diario Diego Musach - ${new Date().toLocaleDateString()}]: ${text.trim()}`
    );

    if (result.success) {
      setSyncStatus(prev => ({ ...prev, [topicId]: 'success' }));
      setCommentInputs(prev => ({ ...prev, [topicId]: '' }));
      
      // 2. Move this topic to the bottom of the list
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

  // Filter topics by search query
  const rawTopics = (selectedMember?.topics || []).filter(t => 
    t.title.toLowerCase().includes(searchTopicQuery.toLowerCase())
  );

  // Re-order: Uncommented topics first, Commented topics pushed to the BOTTOM
  const sortedTopics = [...rawTopics].sort((a, b) => {
    const aCommented = commentedTopicIds.includes(a.id);
    const bCommented = commentedTopicIds.includes(b.id);
    if (aCommented && !bCommented) return 1;  // Move 'a' to bottom
    if (!aCommented && bCommented) return -1; // Keep 'b' at bottom
    return 0;
  });

  return (
    <div className="daily-followup-container">
      
      {/* Compact Header Banner */}
      <div className="card-glass" style={{ marginBottom: '1rem', padding: '0.85rem 1.1rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🚨 Follow Up Diario (Tarjetas Compactas)
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 400 }}>• {currentDate}</span>
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Buscador por título. Al comentar una tarjeta, se publica en vivo a Notion API y se desplaza automáticamente al final de la lista.
            </p>
          </div>

          <button className="btn-secondary" onClick={() => onNavigate('micromanagement')} style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}>
            👥 Ver Equipo Completo
          </button>
        </div>
      </div>

      {/* Member Selector Bar */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
        {teamTracking.map((mem) => {
          const isActive = mem.id === activeMemberId;
          const count = (mem.topics || []).length;
          return (
            <button
              key={mem.id}
              onClick={() => {
                setActiveMemberId(mem.id);
                setSearchTopicQuery('');
              }}
              style={{
                background: isActive ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'var(--bg-card)',
                color: '#fff',
                border: isActive ? 'none' : '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '0.5rem 0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? '0 4px 15px rgba(6, 182, 212, 0.3)' : 'none'
              }}
            >
              <img src={mem.avatar} alt={mem.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
              <span>{mem.name} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Member Header & Instant Search Bar */}
      {selectedMember && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="card-glass" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <img src={selectedMember.avatar} alt={selectedMember.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-cyan)' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: 0 }}>
                  {selectedMember.name} ({sortedTopics.length} Tarjetas en Notion)
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{selectedMember.role}</p>
              </div>
            </div>

            {/* INSTANT CARD SEARCH BAR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1.5px solid var(--accent-cyan)', minWidth: '280px', flex: 1, maxWidth: '420px' }}>
              <Search size={16} className="text-cyan" />
              <input
                type="text"
                placeholder={`🔍 Buscar tarjeta de ${selectedMember.name} por título...`}
                value={searchTopicQuery}
                onChange={(e) => setSearchTopicQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem', width: '100%' }}
              />
            </div>
          </div>

          {/* LIST OF COMPACT INDIVIDUAL CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sortedTopics.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No se encontraron tarjetas con el título buscado.
              </div>
            ) : (
              sortedTopics.map((topic, idx) => {
                const topicInfo = getTopicScenarios(topic.title, selectedMember.name);
                const inputVal = commentInputs[topic.id] || '';
                const status = syncStatus[topic.id];
                const isCommented = commentedTopicIds.includes(topic.id);

                return (
                  <div 
                    key={topic.id || idx} 
                    className="card-glass"
                    style={{
                      padding: '0.85rem 1.1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      borderLeft: isCommented ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-cyan)',
                      opacity: isCommented ? 0.78 : 1,
                      background: isCommented ? 'rgba(11, 16, 28, 0.6)' : 'rgba(15, 23, 42, 0.85)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Compact Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <span className={`tag ${topic.priority?.includes('P1') ? 'critical' : 'high'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                            {topic.priority}
                          </span>
                          <span className="tag info" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{topic.status}</span>
                          
                          {isCommented && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(16, 185, 129, 0.12)', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>
                              <CheckCircle2 size={12} /> Atendida • Enviada al final
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '0.95rem', color: '#fff', margin: 0, fontWeight: 600 }}>
                          {topic.title}
                        </h4>
                      </div>
                    </div>

                    {/* Compact Speech & Reaction Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      
                      {/* Speech */}
                      <div style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>
                          🗣️ Speech Directivo:
                        </span>
                        <div style={{ color: '#fff', fontStyle: 'italic', lineHeight: '1.35' }}>
                          {topicInfo.speech}
                        </div>
                      </div>

                      {/* Response Handling */}
                      <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-amber)', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>
                          🛡️ Si responde: "{topicInfo.responseIf}"
                        </span>
                        <div style={{ color: '#fff', fontWeight: 600, lineHeight: '1.35' }}>
                          👉 {topicInfo.diegoAnswer}
                        </div>
                      </div>

                    </div>

                    {/* Existing Comments */}
                    {(topic.comments || []).length > 0 && (
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.45rem 0.75rem', borderRadius: '6px', fontSize: '0.76rem' }}>
                        <strong style={{ color: 'var(--accent-cyan)' }}>💬 Último comentario: </strong>
                        <span style={{ color: '#fff' }}>{topic.comments[topic.comments.length - 1].text}</span>
                      </div>
                    )}

                    {/* Automatic Live Notion API Comment Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={`Escribir acuerdo o comentario directo a Notion...`}
                          value={inputVal}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [topic.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePostCommentForTopic(topic.id, topic.notionPageId, selectedMember.name);
                          }}
                          style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                        />
                        <button
                          className="btn-primary"
                          onClick={() => handlePostCommentForTopic(topic.id, topic.notionPageId, selectedMember.name)}
                          style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
                        >
                          <Send size={13} /> Publicar a Notion
                        </button>
                      </div>

                      {status === 'syncing' && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <RefreshCw className="spin" size={12} /> Publicando comentario directamente en Notion API...
                        </div>
                      )}
                      {status === 'success' && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={13} /> ¡Comentario publicado automáticamente en Notion y tarjeta enviada al final!
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
}
