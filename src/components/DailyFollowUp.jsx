import React, { useState } from 'react';
import { Calendar, MessageSquare, ShieldAlert, CheckCircle2, Send, RefreshCw, AlertCircle, Search, Filter } from 'lucide-react';
import { postCommentToNotion } from '../services/notionService';

export default function DailyFollowUp({ teamTracking, credentials, onOpenEmailWithAgenda, onNavigate }) {
  const [activeMemberId, setActiveMemberId] = useState('dev-camilo');
  const [searchTopicQuery, setSearchTopicQuery] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [syncStatus, setSyncStatus] = useState({});

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
        speech: `«${memberName.split(' ')[0]}, en el tema "${topicTitle}": no podemos usar planillas Excel sueltas. La información debe vivir en tarjetas de Notion con fechas límite y logs diarios de avance.»`,
        scenarios: [
          {
            devSays: "El Excel es más cómodo para enviar resúmenes rápidos.",
            diegoResponse: "«El Excel aísla la información. Notion le da visibilidad a todo el equipo en tiempo real. Asumimos Notion como única fuente de verdad.»"
          }
        ]
      };
    } else if (tLower.includes('telecable') || tLower.includes('tms') || tLower.includes('roku') || tLower.includes('cableview') || tLower.includes('enrique')) {
      return {
        speech: `«${memberName.split(' ')[0]}, sobre "${topicTitle}": este entregable impacta la operación del cliente. ¿Cuáles son los 3 hitos que cerramos hoy y qué servidores podemos apagar para reducir costos?»`,
        scenarios: [
          {
            devSays: "Tengo muchas tareas asignadas en paralelo y me cuesta avanzar.",
            diegoResponse: "«Congelamos lo secundario. Nos enfocamos al 100% en este entregable crítico hasta que quede probado.»"
          }
        ]
      };
    } else if (tLower.includes('soporte') || tLower.includes('bot') || tLower.includes('joseph') || tLower.includes('agente')) {
      return {
        speech: `«${memberName.split(' ')[0]}, en "${topicTitle}": necesitamos medir el impacto en la reducción de tickets y auditar que no queden tareas 'Sin Asignar' en Notion.»`,
        scenarios: [
          {
            devSays: "Algunos desarrolladores no actualizan el estado de sus tarjetas.",
            diegoResponse: "«Repórtamelo en la mañana e intervengo directamente en su Scorecard para exigir el cumplimiento.»"
          }
        ]
      };
    } else {
      return {
        speech: `«${memberName.split(' ')[0]}, sobre "${topicTitle}": revisemos el estado de avance, los blockers técnicos y la fecha tope de entrega pactada.»`,
        scenarios: [
          {
            devSays: "Falta definición o respuestas de terceros/clientes.",
            diegoResponse: "«Escalo la gestión de terceros en 1-click ahora mismo; tú continúa con la implementación interna sin frenarte.»"
          }
        ]
      };
    }
  };

  const handlePostCommentForTopic = async (topicId, notionPageId, memberName) => {
    const text = commentInputs[topicId];
    if (!text || !text.trim()) return;

    setSyncStatus(prev => ({ ...prev, [topicId]: 'syncing' }));

    const result = await postCommentToNotion(
      credentials?.notionToken,
      notionPageId,
      `[Follow Up Diario Diego Musach - ${new Date().toLocaleDateString()}]: ${text.trim()}`
    );

    if (result.success) {
      setSyncStatus(prev => ({ ...prev, [topicId]: 'success' }));
      setCommentInputs(prev => ({ ...prev, [topicId]: '' }));
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, [topicId]: null }));
      }, 3000);
    } else {
      setSyncStatus(prev => ({ ...prev, [topicId]: 'error' }));
    }
  };

  const memberTopics = (selectedMember?.topics || []).filter(t => 
    t.title.toLowerCase().includes(searchTopicQuery.toLowerCase())
  );

  return (
    <div className="daily-followup-container">
      
      {/* Header Banner */}
      <div className="card-glass" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Calendar size={16} /> Gestión Tarjeta por Tarjeta • {currentDate}
            </div>
            <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: '0.2rem 0' }}>
              🚨 Follow Up Diario: Tarjetas Individuales por Integrante
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
              CADA TEMA de tu equipo listado como tarjeta individual con su Speech, Reacción Directiva y caja para publicar comentarios en Notion.
            </p>
          </div>
        </div>
      </div>

      {/* Member Selector Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
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
                borderRadius: '12px',
                padding: '0.65rem 1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                whiteSpace: 'nowrap',
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? '0 4px 15px rgba(6, 182, 212, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <img src={mem.avatar} alt={mem.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              <span>{mem.name} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Selected Member Header & Search within Member's Cards */}
      {selectedMember && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="card-glass" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
              <img src={selectedMember.avatar} alt={selectedMember.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-cyan)' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>
                  Gestión de Tarjetas de <strong>{selectedMember.name}</strong> ({memberTopics.length} Tarjetas en Notion)
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{selectedMember.role}</p>
              </div>
            </div>

            {/* Search topic within this member */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', minWidth: '240px' }}>
              <Search size={15} className="text-muted" />
              <input
                type="text"
                placeholder={`Buscar tarjeta de ${selectedMember.name}...`}
                value={searchTopicQuery}
                onChange={(e) => setSearchTopicQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.82rem', width: '100%' }}
              />
            </div>
          </div>

          {/* LIST OF INDIVIDUAL CARDS FOR THIS MEMBER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {memberTopics.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No se encontraron tarjetas con el filtro ingresado.
              </div>
            ) : (
              memberTopics.map((topic, idx) => {
                const topicInfo = getTopicScenarios(topic.title, selectedMember.name);
                const inputVal = commentInputs[topic.id] || '';
                const status = syncStatus[topic.id];

                return (
                  <div 
                    key={topic.id || idx} 
                    className="card-glass"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.1rem',
                      borderLeft: '4px solid var(--accent-cyan)'
                    }}
                  >
                    {/* Card Header & Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                            Tarjeta #{idx+1} de {selectedMember.name}
                          </span>
                          <span className={`tag ${topic.priority?.includes('P1') ? 'critical' : 'high'}`} style={{ fontSize: '0.68rem' }}>
                            {topic.priority}
                          </span>
                          <span className="tag info" style={{ fontSize: '0.68rem' }}>{topic.status}</span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', color: '#fff', lineHeight: '1.4', margin: 0 }}>
                          {topic.title}
                        </h4>
                      </div>
                    </div>

                    {/* Speech Sugerido para ESTA tarjeta específica */}
                    <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '0.9rem 1.1rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.2rem' }}>
                        🗣️ Speech Directivo para esta tarjeta:
                      </span>
                      <p style={{ fontSize: '0.88rem', color: '#fff', fontStyle: 'italic', margin: 0, lineHeight: '1.45' }}>
                        {topicInfo.speech}
                      </p>
                    </div>

                    {/* Reacción & Manejo ante Respuestas para ESTA tarjeta */}
                    <div style={{ background: 'rgba(11, 16, 28, 0.85)', border: '1px solid var(--border-subtle)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--accent-amber)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.3rem' }}>
                        🛡️ Contra-argumento técnico para esta tarjeta:
                      </span>
                      {topicInfo.scenarios.map((sc, sIdx) => (
                        <div key={sIdx} style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                          <strong style={{ color: 'var(--accent-amber)' }}>Si responde: </strong> "{sc.devSays}"<br/>
                          <strong style={{ color: 'var(--accent-emerald)' }}>Tu respuesta: </strong> {sc.diegoResponse}
                        </div>
                      ))}
                    </div>

                    {/* Existing Comments on this Card */}
                    {(topic.comments || []).length > 0 && (
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                          💬 Comentarios de Notion:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {topic.comments.map((c, cIdx) => (
                            <div key={cIdx} style={{ fontSize: '0.78rem', color: '#fff' }}>
                              <strong style={{ color: 'var(--accent-cyan)' }}>{c.author} ({c.date}): </strong>{c.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Notion Comment Box */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={`Registrar acuerdo de "${topic.title.substring(0, 30)}..." para Notion...`}
                          value={inputVal}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [topic.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePostCommentForTopic(topic.id, topic.notionPageId, selectedMember.name);
                          }}
                          style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
                        />
                        <button
                          className="btn-primary"
                          onClick={() => handlePostCommentForTopic(topic.id, topic.notionPageId, selectedMember.name)}
                          style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                        >
                          <Send size={14} /> Publicar a Notion
                        </button>
                      </div>

                      {status === 'syncing' && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <RefreshCw className="spin" size={12} /> Enviando acuerdo a la API de Notion...
                        </div>
                      )}
                      {status === 'success' && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={13} /> ¡Acuerdo publicado en vivo en Notion!
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
