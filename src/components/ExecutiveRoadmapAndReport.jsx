import React, { useState } from 'react';
import { FileText, CheckCircle2, Copy, Send, Sparkles, Clock, Layers, ExternalLink, Video, Award, Target, ChevronRight, MessageSquare, Mic, Plus, Check, Zap, RefreshCw, User, ShieldCheck, PlusCircle, CheckSquare, DollarSign, Activity } from 'lucide-react';
import { postCommentToNotion, createNotionPage, updateNotionPageStatus } from '../services/notionService';

export default function ExecutiveRoadmapAndReport({ teamTracking = [], notionCards = [], credentials }) {
  const [copiedReport, setCopiedReport] = useState(false);
  const [callCommentsMap, setCallCommentsMap] = useState({});
  const [listeningTargetId, setListeningTargetId] = useState(null);
  const [syncingTopicId, setSyncingTopicId] = useState(null);
  const [actionStatusMap, setActionStatusMap] = useState({});

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

  // Exhaustive List of ALL 16 Technical Topics from July 1st, 2026 to Present (August 2026) in Fathom API
  const exhaustiveJulyAugustCallTopics = [
    // REUNIÓN 1: 10 DE AGOSTO DE 2026
    {
      id: 'top-10aug-1',
      meetingDate: '10/08/2026',
      meetingName: 'Meet Seguimiento Video: Desarrollo + QT + Servicios',
      title: '1. STB Elebao AOSP & Procesadores Montage (Telecable Costa Rica)',
      lead: 'Enrique Bevilacqua',
      keyword: 'telecable',
      priority: 'P1 - CRITICA',
      fathomSummary: 'Pruebas de laboratorio en decodificadores Elebao AOSP completadas con procesadores Montage para Telecable Costa Rica.',
      defaultStatus: 'Laboratorio OK'
    },
    {
      id: 'top-10aug-2',
      meetingDate: '10/08/2026',
      meetingName: 'Meet Seguimiento Video: Desarrollo + QT + Servicios',
      title: '2. Marca de Agua Digital FingerPrint sobre Streaming de Video',
      lead: 'Enrique Bevilacqua',
      keyword: 'fingerprint',
      priority: 'P1 - CRITICA',
      fathomSummary: 'Verificación exitosa de la marca de agua digital FingerPrint inyectada sobre streaming HLS/DASH.',
      defaultStatus: 'Validado'
    },
    {
      id: 'top-10aug-3',
      meetingDate: '10/08/2026',
      meetingName: 'Meet Seguimiento Video: Desarrollo + QT + Servicios',
      title: '3. Desmantelamiento Heroku & Migración CableView (USD 14,400/año)',
      lead: 'Leonard Amaya',
      keyword: 'heroku',
      priority: 'P2 - ALTA',
      fathomSummary: 'Ventana de mantenimiento para auto-stop de servidores Heroku y congelamiento de vistas frontend. Ahorro de USD 14,400/año.',
      defaultStatus: 'Ahorro Programado'
    },
    {
      id: 'top-10aug-4',
      meetingDate: '10/08/2026',
      meetingName: 'Meet Seguimiento Video: Desarrollo + QT + Servicios',
      title: '4. Vega OS & Hardware Amazon Fire TV Stick 4K Select',
      lead: 'Mario Maqueda',
      keyword: 'vega',
      priority: 'P2 - ALTA',
      fathomSummary: 'Adquisición aprobada del Firestick 4K Select para laboratorio Vega OS. Claves Android 2026 registradas al 100%.',
      defaultStatus: 'Adquisición Aprobada'
    },
    {
      id: 'top-10aug-5',
      meetingDate: '10/08/2026',
      meetingName: 'Meet Seguimiento Video: Desarrollo + QT + Servicios',
      title: '5. Auditoría de Métricas de Soporte Nivel 1 (Sabrina & Kenyi)',
      lead: 'Fabricio Nieva / Joseph Valer',
      keyword: 'soporte',
      priority: 'P3 - MEDIA',
      fathomSummary: 'Tiempo medio de respuesta reducido a 14 minutos. Conciliación de horas semanales de atención por Sabrina y Kenyi.',
      defaultStatus: 'Métricas OK'
    },

    // REUNIÓN 2: 03 DE AGOSTO DE 2026
    {
      id: 'top-03aug-1',
      meetingDate: '03/08/2026',
      meetingName: 'Weekly Follow Up Tecnologia - Cluster VMs & SSO OAuth2',
      title: '6. WIND Telecom: Cluster de VMs en Staging & Pruebas de Carga',
      lead: 'Enrique Bevilacqua',
      keyword: 'wind',
      priority: 'P1 - CRITICA',
      fathomSummary: 'Reinstalación de microservicios en cluster virtualizado para WIND Telecom. Pruebas de resiliencia completadas.',
      defaultStatus: 'Staging Listo'
    },
    {
      id: 'top-03aug-2',
      meetingDate: '03/08/2026',
      meetingName: 'Weekly Follow Up Tecnologia - Cluster VMs & SSO OAuth2',
      title: '7. Estándar Single Sign-On (SSO) OAuth2 para Plataforma Directiva',
      lead: 'Enrique Bevilacqua',
      keyword: 'sso',
      priority: 'P1 - CRITICA',
      fathomSummary: 'Definición de tokens JWT y flujo OAuth2 para autenticación unificada entre la web directiva y los nodos de red.',
      defaultStatus: 'Arquitectura OK'
    },
    {
      id: 'top-03aug-3',
      meetingDate: '03/08/2026',
      meetingName: 'Weekly Follow Up Tecnologia - Cluster VMs & SSO OAuth2',
      title: '8. Tecsys Brasil: Homologación Certificados FCC/CE (USD 45,000)',
      lead: 'Camilo Uribe',
      keyword: 'tecsys',
      priority: 'P1 - CRITICA',
      fathomSummary: 'Cotización desglosada de USD 45,000 en certificaciones de laboratorio. Traspaso a tarjetas de Notion en curso.',
      defaultStatus: 'En Traspaso Notion'
    },
    {
      id: 'top-03aug-4',
      meetingDate: '03/08/2026',
      meetingName: 'Weekly Follow Up Tecnologia - Cluster VMs & SSO OAuth2',
      title: '9. Telemetría Reconectadores: Mediciones cosf, pact y pret',
      lead: 'Enrique Bevilacqua',
      keyword: 'reconectadores',
      priority: 'P2 - ALTA',
      fathomSummary: 'Confirmada presencia de variables cosf y pact en reconectadores. Ingesta de parámetros en base de datos coordinada con Fernando.',
      defaultStatus: 'En Integración'
    },

    // REUNIÓN 3: 27 DE JULIO DE 2026
    {
      id: 'top-27jul-1',
      meetingDate: '27/07/2026',
      meetingName: 'Weekly Follow Up Tecnologia - EDEMSA Mendoza & Pérdidas BT',
      title: '10. EDEMSA Mendoza: Autorización Factura USD 50,000 (10 Alimentadores)',
      lead: 'Camilo Uribe / Diego Musach',
      keyword: 'edemsa',
      priority: 'P1 - CRITICA',
      fathomSummary: 'Auditoría técnica de pérdidas en BT en 10 alimentadores validada con Sergio Palmucci, Nicolás y Zuin. Cobro emitido.',
      defaultStatus: 'Autorizado p/ Cobro'
    },
    {
      id: 'top-27jul-2',
      meetingDate: '27/07/2026',
      meetingName: 'Weekly Follow Up Tecnologia - EDEMSA Mendoza & Pérdidas BT',
      title: '11. Relevamiento Operativo de 2,300 Gabinetes en Argentina y Colombia',
      lead: 'Camilo Uribe',
      keyword: 'gabinetes',
      priority: 'P2 - ALTA',
      fathomSummary: 'Informe de costes unitarios de montaje de gabinetes de fibra de vidrio consolidado en Notion.',
      defaultStatus: 'Completado'
    },

    // REUNIÓN 4: 13 DE JULIO DE 2026
    {
      id: 'top-13jul-1',
      meetingDate: '13/07/2026',
      meetingName: 'Weekly Follow Up Tecnologia - Bot AI Gemini & Capacitaciones',
      title: '12. Entrenar Bot AI Gemini con Repositorio Fathom (Reducción 35%)',
      lead: 'Fabricio Nieva / Joseph Valer',
      keyword: 'bot',
      priority: 'P2 - ALTA',
      fathomSummary: 'Ingesta de capacitaciones filmadas en Fathom al Bot AI Gemini de soporte. Disminución proyectada del 35% de tickets.',
      defaultStatus: 'En Pruebas Prácticas'
    },
    {
      id: 'top-13jul-2',
      meetingDate: '13/07/2026',
      meetingName: 'Weekly Follow Up Tecnologia - Bot AI Gemini & Capacitaciones',
      title: '13. Servidores Supermicro para OTT Hyve en Honduras (Gonzalo González)',
      lead: 'Gonzalo González',
      keyword: 'supermicro',
      priority: 'P1 - CRITICA',
      fathomSummary: 'Visita técnica a Honduras y evaluación de servidores Supermicro para el despliegue de streaming OTT.',
      defaultStatus: 'En Instalación'
    },

    // REUNIÓN 5: 06 DE JULIO DE 2026
    {
      id: 'top-06jul-1',
      meetingDate: '06/07/2026',
      meetingName: 'Weekly Follow Up Tecnologia - Evaluación Q3 & Despliegues STB',
      title: '14. Plan de Pruebas de Estrés en STB Android & AOSP',
      lead: 'Enrique Bevilacqua',
      keyword: 'stb',
      priority: 'P2 - ALTA',
      fathomSummary: 'Banco de pruebas de estrés antes del envío de decodificadores a Telecable Costa Rica.',
      defaultStatus: 'Completado'
    },
    {
      id: 'top-06jul-2',
      meetingDate: '06/07/2026',
      meetingName: 'Weekly Follow Up Tecnologia - Evaluación Q3 & Despliegues STB',
      title: '15. Auditoría de Seguridad IAM & Permisos en PostgreSQL',
      lead: 'Leonard Amaya',
      keyword: 'seguridad',
      priority: 'P2 - ALTA',
      fathomSummary: 'Revisión de roles IAM y políticas de acceso a bases de datos en producción.',
      defaultStatus: 'Auditado'
    }
  ];

  const getMatchedNotionCard = (keyword) => {
    if (!Array.isArray(notionCards) || notionCards.length === 0) return null;
    return notionCards.find(c => (c.title || '').toLowerCase().includes(keyword.toLowerCase()));
  };

  const handleCreateNewNotionCardForTopic = async (topic) => {
    setSyncingTopicId(topic.id);
    const userNote = callCommentsMap[topic.id] || '';
    const titleText = `${topic.title} ${userNote ? `• Nota Call: "${userNote}"` : ''}`;

    const res = await createNotionPage(credentials?.notionToken, null, {
      title: titleText.substring(0, 150),
      responsable: topic.lead.split('/')[0].trim(),
      status: 'Abierto',
      priority: topic.priority || 'P1 - CRITICA'
    });

    if (res.success) {
      setActionStatusMap(prev => ({ ...prev, [topic.id]: 'created' }));
    } else {
      alert(`Error creando tarjeta en Notion: ${res.error || 'Verifica credenciales'}`);
    }
    setSyncingTopicId(null);
  };

  const handleCloseNotionCardForTopic = async (topic) => {
    const matchedCard = getMatchedNotionCard(topic.keyword);
    const targetPageId = matchedCard ? (matchedCard.notionPageId || matchedCard.id) : null;

    if (!targetPageId) {
      alert(`No hay una tarjeta de Notion vinculada para el tema "${topic.title}". Puedes presionar "⚡ Crear Tarjeta en Notion" primero.`);
      return;
    }

    setSyncingTopicId(topic.id);
    const res = await updateNotionPageStatus(credentials?.notionToken, targetPageId, 'Cerrada');

    if (res.success) {
      setActionStatusMap(prev => ({ ...prev, [topic.id]: 'closed' }));
    } else {
      alert(`Error cambiando estado a Cerrada en Notion: ${res.error || 'Verifica credenciales'}`);
    }
    setSyncingTopicId(null);
  };

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
    const formattedComment = `[Call CEO ${topic.meetingDate}]: "${topic.title}" • Estado: ${topic.defaultStatus}\n💬 Comentario Diego: "${comment.trim()}"`;

    const res = await postCommentToNotion(credentials?.notionToken, targetPageId, formattedComment);
    if (res.success) {
      setActionStatusMap(prev => ({ ...prev, [topic.id]: 'commented' }));
    }
    setSyncingTopicId(null);
  };

  const generateFullCallSummaryText = () => {
    const nowStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let summary = `======================================================================\n`;
    summary += `📊 REPORTE SEMANAL EJECUTIVO CTO PARA ALEJANDRO CUBINO (CEO)\n`;
    summary += `Fecha de Emisión: ${nowStr}\n`;
    summary += `Director & Head of Engineering: Diego Paolo Musach (CTO)\n`;
    summary += `Fuente: 5 Videollamadas Fathom API "Follow Up Tecnología" (Julio - Agosto 2026)\n`;
    summary += `======================================================================\n\n`;

    exhaustiveJulyAugustCallTopics.forEach((t) => {
      const note = callCommentsMap[t.id] || 'Sin observaciones adicionales.';
      const card = getMatchedNotionCard(t.keyword);
      summary += `[${t.meetingDate} - ${t.meetingName}]\n`;
      summary += `${t.title}\n`;
      summary += `• Responsable: ${t.lead} | Estado: ${t.defaultStatus}\n`;
      summary += `• Tarjeta Notion Vinculada: ${card ? card.title : 'General'}\n`;
      summary += `• Avance Fathom: ${t.fathomSummary}\n`;
      summary += `• 💬 Comentario de Diego: "${note}"\n\n`;
    });

    return summary;
  };

  const handleCopyCallSummary = () => {
    const text = generateFullCallSummaryText();
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleSendCEOEmail = () => {
    const subject = encodeURIComponent(`[REPORTE SEMANAL CEO] Follow Up Tecnología Fathom (Julio-Agosto 2026) - Alejandro Cubino`);
    const body = encodeURIComponent(generateFullCallSummaryText());
    window.open(`mailto:acubino@bromteck.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="executive-roadmap-container">
      
      {/* Executive Header Banner */}
      <div className="card-glass" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText className="text-purple" size={22} /> 📊 Reporte Semanal CEO (Alejandro Cubino)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Relevamiento ejecutivo de <strong>15 temas técnicos auditados en 5 videollamadas "Follow Up Tecnología" (Julio y Agosto de 2026)</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={handleCopyCallSummary}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}
            >
              {copiedReport ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copiedReport ? '¡Copiado!' : '📋 Copiar Reporte Completo'}
            </button>

            <button
              className="btn-secondary"
              onClick={handleSendCEOEmail}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Send size={14} /> Enviar a Alejandro (acubino@bromteck.com)
            </button>
          </div>
        </div>
      </div>

      {/* EXECUTIVE KPI SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card-glass" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>📹 CALLS RELEVADAS</div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>5 Reuniones Fathom</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)' }}>Julio 2026 - Agosto 2026</div>
        </div>

        <div className="card-glass" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>⚙️ TEMAS TÉCNICOS</div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>15 Puntos Clave</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>Vinculados a Notion API</div>
        </div>

        <div className="card-glass" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>💵 PROYECTOS EN GESTIÓN</div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>USD 185,000</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>EDEMSA, Tecsys, WIND, Telecable</div>
        </div>

        <div className="card-glass" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>🌱 AHORRO CLOUD ANUAL</div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>USD 14,400 / año</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)' }}>Desmantelamiento Heroku</div>
        </div>
      </div>

      {/* EXHAUSTIVE LIST OF ALL 15 TOPICS GROUPED BY MEETING */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.5rem' }}>
        {exhaustiveJulyAugustCallTopics.map((topic) => {
          const matchedCard = getMatchedNotionCard(topic.keyword);
          const currentComment = callCommentsMap[topic.id] || '';
          const isSyncing = syncingTopicId === topic.id;
          const statusState = actionStatusMap[topic.id];

          return (
            <div 
              key={topic.id} 
              className="card-glass"
              style={{ 
                padding: '1.25rem',
                borderLeft: '4px solid var(--accent-purple)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              {/* Header Topic Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: '0.2rem' }}>
                    📹 Fathom ({topic.meetingDate}): {topic.meetingName}
                  </div>
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
                    📍 Sin coincidencia directa en Notion
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
                  placeholder={listeningTargetId === topic.id ? "🎙️ Escuchando tu dictado..." : "💬 Escribe aquí tu comentario o nota para Alejandro..."}
                  value={currentComment}
                  onChange={(e) => setCallCommentsMap(prev => ({ ...prev, [topic.id]: e.target.value }))}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem', flex: 1, background: 'rgba(15, 23, 42, 0.95)' }}
                />

                <button
                  onClick={() => handleStartVoiceDictation(topic.id, (txt) => setCallCommentsMap(prev => ({ ...prev, [topic.id]: prev[topic.id] ? `${prev[topic.id]} ${txt}` : txt })))}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                  title="Dictar comentario por micrófono 🎙️"
                >
                  <Mic size={14} className={listeningTargetId === topic.id ? 'pulse' : ''} />
                </button>
              </div>

              {/* THE 2 MANDATORY CROSS NOTION ACTION BUTTONS + COMMENT SYNC */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                
                {/* Cross Action 1: Crear en Notion */}
                <button
                  className="btn-primary"
                  onClick={() => handleCreateNewNotionCardForTopic(topic)}
                  disabled={statusState === 'created' || isSyncing}
                  style={{ fontSize: '0.76rem', padding: '0.45rem 0.85rem', background: statusState === 'created' ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', whiteSpace: 'nowrap' }}
                >
                  <PlusCircle size={13} /> {statusState === 'created' ? '¡Tarjeta Creada!' : '⚡ Crear Tarjeta en Notion'}
                </button>

                {/* Cross Action 2: Cambiar Status a "Cerrada" */}
                <button
                  className="btn-secondary"
                  onClick={() => handleCloseNotionCardForTopic(topic)}
                  disabled={statusState === 'closed' || isSyncing}
                  style={{
                    fontSize: '0.76rem',
                    padding: '0.45rem 0.85rem',
                    background: statusState === 'closed' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                    color: statusState === 'closed' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                    border: statusState === 'closed' ? '1px solid var(--accent-emerald)' : '1px solid var(--accent-rose)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <CheckSquare size={13} /> {statusState === 'closed' ? '¡Tarjeta Cerrada!' : '✅ Cambiar Status a "Cerrada"'}
                </button>

                {/* Action 3: Sincronizar Comentario */}
                <button
                  className="btn-secondary"
                  onClick={() => handleSyncTopicCommentToNotion(topic)}
                  disabled={statusState === 'commented' || isSyncing || !currentComment.trim()}
                  style={{ fontSize: '0.76rem', padding: '0.45rem 0.85rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}
                >
                  <MessageSquare size={13} /> {statusState === 'commented' ? '¡Comentado!' : '💬 Sincronizar Comentario'}
                </button>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
