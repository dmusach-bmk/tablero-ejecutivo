import React, { useState } from 'react';
import { Calendar, MessageSquare, ShieldAlert, CheckCircle2, Send, RefreshCw, Search, Layers, ExternalLink, Archive, CheckSquare } from 'lucide-react';
import { postCommentToNotion, updateNotionPageStatus } from '../services/notionService';

export default function DailyFollowUp({ teamTracking, credentials, onOpenEmailWithAgenda, onNavigate }) {
  const [activeMemberId, setActiveMemberId] = useState('all');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [syncStatus, setSyncStatus] = useState({});
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [commentedTopicIds, setCommentedTopicIds] = useState([]);
  const [showClosedSection, setShowClosedSection] = useState(false);
  const [cardStatusMap, setCardStatusMap] = useState({});
  const [localCommentsMap, setLocalCommentsMap] = useState({});

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

  // INTELLIGENT DYNAMIC SPEECH & REACTION GENERATOR PER SPECIFIC TOPIC TITLE
  const generateExecutiveSpeech = (topicTitle, memberName, log) => {
    const t = (topicTitle + ' ' + (log || '')).toLowerCase();
    const name = memberName.split(' ')[0];

    if (t.includes('edemsa')) {
      return {
        speech: `«${name}, con respecto a EDEMSA ("${topicTitle}"): es vital cerrar el informe de los alimentadores y corregir las vistas con Nicolás/Mauricio Zuin para habilitar la facturación. ¿Cuál es el bloqueo de hoy?»`,
        responseIf: "Falta que el cliente valide el reporte de los puntos nuevos.",
        diegoAnswer: "«Enviamos el informe de los 10 alimentadores hoy mismo y fijamos el compromiso de cobro para esta semana.»"
      };
    } else if (t.includes('tecsys') || t.includes('fcc') || t.includes('habitat')) {
      return {
        speech: `«${name}, en el tema Tecsys ("${topicTitle}"): debemos eliminar planillas Excel sueltas. Exijo volcar las cotizaciones (certificados FCC/CE) y las credenciales de Hábitat en tarjetas de Notion.»`,
        responseIf: "Tecsys no ha enviado el presupuesto desde Brasil.",
        diegoAnswer: "«Diego Musach formaliza el reclamo del presupuesto hoy con la gerencia de Tecsys; tú mantén actualizado el log en Notion.»"
      };
    } else if (t.includes('wind') || t.includes('sso') || t.includes('cluster') || t.includes('single sign on')) {
      return {
        speech: `«${name}, sobre el proyecto WIND ("${topicTitle}"): la prioridad es la estabilidad del Cluster (VMs) y la definición de Single Sign-On / Registro Web. ¿Cuándo entregamos la demo probada?»`,
        responseIf: "Hay dudas sobre la integración del SSO con la plataforma actual.",
        diegoAnswer: "«Definimos el estándar de OAuth2 hoy y congelamos requerimientos secundarios hasta validar la autenticación.»"
      };
    } else if (t.includes('telecable') || t.includes('aosp') || t.includes('elebao') || t.includes('fingerprint') || t.includes('stb')) {
      return {
        speech: `«${name}, en Telecable Costa Rica ("${topicTitle}"): debemos cerrar el armado del STB AOSP Elebao con FingerPrint y el test report de Montage. ¿Tienes confirmada la fecha de viaje o despliegue?»`,
        responseIf: "Dependemos de la entrega de equipos hardware o licencias DRM.",
        diegoAnswer: "«Validamos la logística con el proveedor hoy y avanzamos en staging con los equipos disponibles.»"
      };
    } else if (t.includes('bromteck') || t.includes('udid') || t.includes('pulse')) {
      return {
        speech: `«${name}, en Bromteck 4.0 / UDID ("${topicTitle}"): Marketing necesita la nueva presentación destacando UDID como feature diferenciador. ¿Cómo vienen los tiempos de render y carga en la nube?»`,
        responseIf: "Marketing solicitó cambios en la presentación a última hora.",
        diegoAnswer: "«Congelamos la versión actual para la demostración de esta semana y agendamos los ajustes para la v2.»"
      };
    } else if (t.includes('gabinete') || t.includes('ferrocarril') || t.includes('fibra')) {
      return {
        speech: `«${name}, en el relevamiento de gabinetes y fibra ("${topicTitle}"): tenemos un potencial de 2,300 gabinetes entre Argentina y Colombia. ¿Cuál es la cotización por poste de fibra de vidrio?»`,
        responseIf: "Los proveedores locales aún no enviaron presupuestos.",
        diegoAnswer: "«Exigimos 3 cotizaciones antes del jueves o avanzamos con el modelo estándar homologado.»"
      };
    } else if (t.includes('servidor') || t.includes('heroku') || t.includes('infra') || t.includes('costo')) {
      return {
        speech: `«${name}, en la infraestructura de Servidores / Heroku ("${topicTitle}"): debemos apagar entornos en desuso para reducir el gasto mensual. ¿Cuál es el plan de auto-stop?»`,
        responseIf: "Apagar servidores de test puede interferir con algunas pruebas.",
        diegoAnswer: "«Programamos ventana de auto-stop nocturna (19:00 a 08:00) y ahorramos consumo sin afectar el trabajo diario.»"
      };
    } else if (t.includes('soporte') || t.includes('bot') || t.includes('ticket') || t.includes('horas') || t.includes('gemini')) {
      return {
        speech: `«${name}, en Soporte & BOT AI ("${topicTitle}"): el objetivo es reducir tickets con el BOT de respuestas automáticas y auditar el consumo de horas de Soporte Premium por cliente.»`,
        responseIf: "Faltan datos o capacitaciones filmadas para entrenar al BOT.",
        diegoAnswer: "«Utilizamos la base de conocimiento actual y las capacitaciones grabadas para entrenar el BOT hoy mismo.»"
      };
    } else if (t.includes('poc') || t.includes('delsur') || t.includes('aes') || t.includes('edelap') || t.includes('naturgy') || t.includes('avangrid')) {
      return {
        speech: `«${name}, sobre la POC ("${topicTitle}"): necesito el reporte de validación con el cliente. Si hubo problemas de configuración en equipos remotamente, ¿cuál fue la causa raíz?»`,
        responseIf: "Falta respuesta o validación de los ingenieros del cliente.",
        diegoAnswer: "«Diego Musach escala con el sponsor del cliente en 1-click hoy; tú mantén la simulación en staging lista.»"
      };
    } else if (t.includes('comercial') || t.includes('perdidas') || t.includes('ss') || t.includes('godel')) {
      return {
        speech: `«${name}, en la Solución Smart para Pérdidas ("${topicTitle}"): debemos tener la propuesta comercial y el documento de preguntas FAQ listo para el equipo de ventas.»`,
        responseIf: "Falta información del área comercial para cerrar la presentación.",
        diegoAnswer: "«Solicito esa data comercial de inmediato; tú avanza con la estructura técnica del producto sin frenarte.»"
      };
    } else {
      return {
        speech: `«${name}, sobre la tarjeta "${topicTitle}": necesitamos definir los hitos de entrega de esta semana, desbloquear impedimentos de ingeniería y fijar el avance en Notion.»`,
        responseIf: "El tema requiere más tiempo del estimado por complejidad técnica.",
        diegoAnswer: "«Desglosamos la tarea en 2 entregables parciales; entregamos el MVP esta semana y la optimización la siguiente.»"
      };
    }
  };

  // Flatten all 165 cards across all team members
  const allCardsCross = [];
  teamTracking.forEach(mem => {
    (mem.topics || []).forEach(t => {
      const currentStatus = cardStatusMap[t.id] || t.status || 'Abierto';
      const comments = localCommentsMap[t.id] || t.comments || [];
      allCardsCross.push({
        ...t,
        status: currentStatus,
        comments: comments,
        memberName: mem.name,
        memberRole: mem.role,
        memberAvatar: mem.avatar,
        memberId: mem.id,
        notionPageId: t.notionPageId || t.notionId
      });
    });
  });

  const handleStatusChange = async (topicId, notionPageId, newStatus) => {
    setStatusUpdatingId(topicId);
    setCardStatusMap(prev => ({ ...prev, [topicId]: newStatus }));

    // Sync live to Notion API
    await updateNotionPageStatus(credentials?.notionToken, notionPageId, newStatus);
    setStatusUpdatingId(null);
  };

  const handlePostCommentForTopic = async (topicId, notionPageId, memberName) => {
    const text = commentInputs[topicId];
    if (!text || !text.trim()) return;

    setSyncStatus(prev => ({ ...prev, [topicId]: 'syncing' }));
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newCommentObj = { author: 'Diego Musach (CTO)', date: nowFormatted, text: text.trim() };

    // 1. Immediately update React state so the UI displays the comment instantly in 0ms!
    const existingTopic = allCardsCross.find(c => c.id === topicId);
    const prevComments = existingTopic?.comments || [];
    setLocalCommentsMap(prev => ({
      ...prev,
      [topicId]: [...prevComments, newCommentObj]
    }));

    setCommentInputs(prev => ({ ...prev, [topicId]: '' }));

    if (!commentedTopicIds.includes(topicId)) {
      setCommentedTopicIds(prev => [...prev, topicId]);
    }

    // 2. Send live to Notion API EXACTLY AS TYPED (no prefixes!)
    const targetNotionId = notionPageId || existingTopic?.notionPageId || existingTopic?.notionId;
    const result = await postCommentToNotion(
      credentials?.notionToken,
      targetNotionId,
      text.trim()
    );

    if (result.success) {
      setSyncStatus(prev => ({ ...prev, [topicId]: 'success' }));
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, [topicId]: null }));
      }, 3500);
    } else {
      setSyncStatus(prev => ({ ...prev, [topicId]: 'error' }));
    }
  };

  // Filter cards by member and search query
  let memberFilteredCards = activeMemberId === 'all'
    ? allCardsCross
    : allCardsCross.filter(c => c.memberId === activeMemberId);

  if (globalSearchQuery.trim()) {
    const q = globalSearchQuery.toLowerCase();
    memberFilteredCards = allCardsCross.filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.memberName.toLowerCase().includes(q) ||
      (c.log && c.log.toLowerCase().includes(q))
    );
  }

  // Split into OPEN vs CLOSED cards
  const openCards = memberFilteredCards.filter(c => 
    !['cerrado', 'completado', 'finalizado', 'closed'].includes((c.status || '').toLowerCase())
  );

  const closedCards = memberFilteredCards.filter(c => 
    ['cerrado', 'completado', 'finalizado', 'closed'].includes((c.status || '').toLowerCase())
  );

  // Re-order OPEN cards: Uncommented first, Commented pushed to bottom
  const sortedOpenCards = [...openCards].sort((a, b) => {
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
              🚨 Follow Up Diario ({openCards.length} Tarjetas Abiertas)
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 400 }}>• {currentDate}</span>
            </h2>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>
              Comentarios publicados a Notion API 100% literales tal cual los escribes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn-secondary ${showClosedSection ? 'active' : ''}`}
              onClick={() => setShowClosedSection(!showClosedSection)}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)' }}
            >
              <Archive size={13} /> {showClosedSection ? 'Ocultar' : '📁 Consultar'} Cerradas ({closedCards.length})
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('micromanagement')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
              👥 Ver Equipo Completo
            </button>
          </div>
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
          <span>TODOS ({openCards.length} Abiertas)</span>
        </button>

        {teamTracking.map((mem) => {
          const isActive = mem.id === activeMemberId && !globalSearchQuery;
          const openMemCards = (mem.topics || []).filter(t => !['cerrado', 'completado', 'finalizado', 'closed'].includes(((cardStatusMap[t.id] || t.status) || '').toLowerCase()));
          
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
              <span>{shortName} ({openMemCards.length})</span>
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
            placeholder="🔍 BUSCADOR CROSS DE TEMAS: Escribe cualquier palabra clave (ej: EDEMSA, Tecsys, WIND, Telecable, Bromteck, Ferrocarril, POC)..."
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

      {/* RESULT COUNT INDICATOR FOR OPEN CARDS */}
      <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          Mostrando {sortedOpenCards.length} tarjetas ABIERTAS {globalSearchQuery ? `para la búsqueda "${globalSearchQuery}"` : activeMemberId === 'all' ? 'de todos los integrantes' : `de ${teamTracking.find(m=>m.id===activeMemberId)?.name}`}:
        </span>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          (Las cerradas figuran en el panel de Histórico)
        </span>
      </div>

      {/* LIST OF OPEN COMPACT CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {sortedOpenCards.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No hay tarjetas abiertas con los filtros seleccionados.
          </div>
        ) : (
          sortedOpenCards.map((topic, idx) => {
            // Generate UNIQUE, TAILORED speech & reaction for THIS specific card
            const topicInfo = generateExecutiveSpeech(topic.title, topic.memberName, topic.log);
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
                {/* Compact Card Header with Status Dropdown & Direct Notion Link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.15rem', flexWrap: 'wrap' }}>
                      <img src={topic.memberAvatar} alt={topic.memberName} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        {topic.memberName}
                      </span>
                      <span className={`tag ${topic.priority?.includes('P1') ? 'critical' : 'high'}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                        {topic.priority}
                      </span>

                      {/* LIVE NOTION STATUS DROPDOWN */}
                      <select
                        className="form-select"
                        value={topic.status}
                        onChange={(e) => handleStatusChange(topic.id, topic.notionPageId, e.target.value)}
                        style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', height: 'auto', background: 'rgba(0,0,0,0.4)', color: topic.status === 'Cerrado' ? 'var(--accent-emerald)' : '#fff' }}
                      >
                        <option value="Abierto">Abierto</option>
                        <option value="En Progreso">En Progreso</option>
                        <option value="En Revisión Técnica">En Revisión Técnica</option>
                        <option value="Bloqueado">Bloqueado</option>
                        <option value="Cerrado">Cerrado / Completado</option>
                      </select>
                      
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

                  {/* DIRECT NOTION LINK */}
                  <a
                    href={notionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                  >
                    <ExternalLink size={13} /> Abrir en Notion
                  </a>
                </div>

                {/* TAILORED DYNAMIC SPEECH & REACTION GRID FOR THIS EXACT TOPIC */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '0.45rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                    <span style={{ fontSize: '0.66rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'block', marginBottom: '0.1rem' }}>
                      🗣️ Speech Directivo para este tema:
                    </span>
                    <div style={{ color: '#fff', fontStyle: 'italic', lineHeight: '1.3' }}>
                      {topicInfo.speech}
                    </div>
                  </div>

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

      {/* SEPARATE SECTION FOR CLOSED / COMPLETED CARDS */}
      {showClosedSection && (
        <div className="card-glass" style={{ borderTop: '3px solid var(--accent-emerald)', marginTop: '1.5rem', padding: '1.1rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-emerald)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Archive size={18} /> 📁 Histórico de Tarjetas Cerradas / Completadas ({closedCards.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {closedCards.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No hay tarjetas cerradas en esta vista.</p>
            ) : (
              closedCards.map((c, idx) => (
                <div key={c.id || idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span className="tag low" style={{ fontSize: '0.62rem' }}>Cerrado</span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{c.memberName}</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{c.title}</div>
                  </div>
                  
                  <button 
                    className="btn-secondary" 
                    onClick={() => handleStatusChange(c.id, c.notionPageId, 'Abierto')}
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                  >
                    Reabrir
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
