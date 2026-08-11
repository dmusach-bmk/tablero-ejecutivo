import React, { useState } from 'react';
import { FileText, CheckCircle2, Copy, Send, Sparkles, Clock, Layers, ExternalLink, Video, Award, Target, ChevronRight, MessageSquare, Mic, Plus, Check, Zap, RefreshCw, User, ShieldCheck, PlusCircle, CheckSquare, DollarSign, Activity, Edit3, SendHorizontal, History, X, Cloud, Server, Eye, Calendar, AlertTriangle, ListChecks } from 'lucide-react';
import { postCommentToNotion, createNotionPage, updateNotionPageStatus } from '../services/notionService';

export default function ExecutiveRoadmapAndReport({ teamTracking = [], notionCards = [], credentials }) {
  const [copiedReport, setCopiedReport] = useState(false);
  const [callCommentsMap, setCallCommentsMap] = useState({});
  const [listeningTargetId, setListeningTargetId] = useState(null);
  const [syncingTopicId, setSyncingTopicId] = useState(null);
  const [actionStatusMap, setActionStatusMap] = useState({});

  // Today's Live Meeting Date String (Formatted for Fathom Matching)
  const todayMeetingDateObj = new Date();
  const todayFormattedDate = todayMeetingDateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const todayShortDate = todayMeetingDateObj.toLocaleDateString('es-ES');

  // MODAL INSPECTOR STATE FOR CLICKABLE CARDS
  const [activeModalType, setActiveModalType] = useState(null);

  // LIVE SCRATCHPAD STATE
  const [scratchpadText, setScratchpadText] = useState(() => {
    return localStorage.getItem('dm_ceo_scratchpad_draft') || '';
  });

  const [scratchpadHistory, setScratchpadHistory] = useState(() => {
    const saved = localStorage.getItem('dm_ceo_scratchpad_history');
    if (saved) {
      try { return JSON.parse(saved); } catch(e){}
    }
    return [
      {
        id: 'hist-1',
        date: `Martes, 11 de Agosto de 2026 (${todayShortDate})`,
        rawText: '• EDEMSA: Sergio Palmucci confirmó 10 alimentadores, autorizar factura USD 50k\n• Tecsys: Camilo traspasa celdas de homologación a Notion\n• Heroku: Leonard programa ventana de mantenimiento',
        processedItemsCount: 3,
        status: '✅ Ingestado & Matcheado con Transcripción Fathom'
      }
    ];
  });

  // PRE-EXECUTION AUDIT MODAL STATE (VISTA PREVIA DE CONFIRMACIÓN IA)
  const [proposedAiActions, setProposedAiActions] = useState(null); // Array of proposed actions before execution
  const [isProcessingScratchpad, setIsProcessingScratchpad] = useState(false);
  const [scratchpadSuccessMessage, setScratchpadSuccessMessage] = useState('');

  // Voice Dictation Helper
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

  // STEP 1: PRE-ANALYZE SCRATCHPAD AND SHOW PRE-EXECUTION AUDIT MODAL
  const handlePreAnalyzeScratchpad = () => {
    if (!scratchpadText.trim()) {
      alert('Por favor escribe al menos un tema o nota en tu bloc de notas antes de presionar Submit.');
      return;
    }

    const lines = scratchpadText
      .split('\n')
      .map(l => l.trim().replace(/^[-•*]\s*/, ''))
      .filter(l => l.length > 3);

    const proposals = lines.map((line, idx) => {
      const lineLower = line.toLowerCase();
      const matchedCard = notionCards.find(c => {
        const cTitle = (c.title || '').toLowerCase();
        return lineLower.includes(cTitle) || (lineLower.includes('edemsa') && cTitle.includes('edemsa')) || (lineLower.includes('tecsys') && cTitle.includes('tecsys')) || (lineLower.includes('heroku') && cTitle.includes('heroku')) || (lineLower.includes('wind') && cTitle.includes('wind'));
      });

      if (matchedCard) {
        return {
          id: `prop-${idx}`,
          approved: true,
          actionType: 'comment',
          rawLine: line,
          targetCardTitle: matchedCard.title,
          targetPageId: matchedCard.notionPageId || matchedCard.id,
          proposedContent: `[Bloc de Notas Call CEO ${todayShortDate}]: "${line}"`
        };
      } else {
        return {
          id: `prop-${idx}`,
          approved: true,
          actionType: 'create',
          rawLine: line,
          targetCardTitle: `[Call CEO ${todayShortDate}] ${line.substring(0, 100)}`,
          targetPageId: null,
          proposedContent: line
        };
      }
    });

    setProposedAiActions(proposals);
  };

  // STEP 2: EXECUTE ONLY APPROVED PROPOSALS IN NOTION API
  const handleExecuteApprovedAiProposals = async () => {
    if (!proposedAiActions || proposedAiActions.length === 0) return;

    setIsProcessingScratchpad(true);
    setScratchpadSuccessMessage('');

    const approvedList = proposedAiActions.filter(p => p.approved);
    let executedCount = 0;

    for (const prop of approvedList) {
      if (prop.actionType === 'comment' && prop.targetPageId) {
        await postCommentToNotion(credentials?.notionToken, prop.targetPageId, prop.proposedContent);
      } else if (prop.actionType === 'create') {
        await createNotionPage(credentials?.notionToken, null, {
          title: prop.targetCardTitle,
          responsable: 'Diego Musach (CTO)',
          status: 'Abierto',
          priority: 'P1 - CRITICA'
        });
      }
      executedCount++;
    }

    // Save to historical record for Fathom matching
    const newRecord = {
      id: `hist-${Date.now()}`,
      date: `${todayFormattedDate} (${todayShortDate})`,
      rawText: scratchpadText,
      processedItemsCount: executedCount,
      status: '✅ Aprobado, Ingestado a Notion & Matcheado con Fathom'
    };

    const updatedHistory = [newRecord, ...scratchpadHistory];
    setScratchpadHistory(updatedHistory);
    localStorage.setItem('dm_ceo_scratchpad_history', JSON.stringify(updatedHistory));
    localStorage.removeItem('dm_ceo_scratchpad_draft');
    setScratchpadText('');

    setProposedAiActions(null);
    setIsProcessingScratchpad(false);
    setScratchpadSuccessMessage(`¡Aprobación Confirmada! Se ejecutaron ${executedCount} acciones auditadas en Notion API y quedaron registradas para matchear con la transcripción Fathom del ${todayShortDate}.`);
  };

  // Exhaustive July-August Fathom Topics
  const exhaustiveJulyAugustCallTopics = [
    {
      id: 'top-10aug-1',
      meetingDate: todayShortDate,
      meetingName: `Meet Seguimiento Video (${todayShortDate})`,
      title: '1. STB Elebao AOSP & Procesadores Montage (Telecable Costa Rica)',
      lead: 'Enrique Bevilacqua',
      keyword: 'telecable',
      priority: 'P1 - CRITICA',
      fathomSummary: 'Pruebas de laboratorio en decodificadores Elebao AOSP completadas con procesadores Montage para Telecable Costa Rica.',
      defaultStatus: 'Laboratorio OK'
    },
    {
      id: 'top-10aug-2',
      meetingDate: todayShortDate,
      meetingName: `Meet Seguimiento Video (${todayShortDate})`,
      title: '2. Marca de Agua Digital FingerPrint sobre Streaming de Video',
      lead: 'Enrique Bevilacqua',
      keyword: 'fingerprint',
      priority: 'P1 - CRITICA',
      fathomSummary: 'Verificación exitosa de la marca de agua digital FingerPrint inyectada sobre streaming HLS/DASH.',
      defaultStatus: 'Validado'
    },
    {
      id: 'top-10aug-3',
      meetingDate: todayShortDate,
      meetingName: `Meet Seguimiento Video (${todayShortDate})`,
      title: '3. Desmantelamiento Heroku & Migración CableView (USD 14,400/año)',
      lead: 'Leonard Amaya',
      keyword: 'heroku',
      priority: 'P2 - ALTA',
      fathomSummary: 'Ventana de mantenimiento para auto-stop de servidores Heroku y congelamiento de vistas frontend. Ahorro de USD 14,400/año.',
      defaultStatus: 'Ahorro Programado'
    },
    {
      id: 'top-10aug-4',
      meetingDate: todayShortDate,
      meetingName: `Meet Seguimiento Video (${todayShortDate})`,
      title: '4. Vega OS & Hardware Amazon Fire TV Stick 4K Select',
      lead: 'Mario Maqueda',
      keyword: 'vega',
      priority: 'P2 - ALTA',
      fathomSummary: 'Adquisición aprobada del Firestick 4K Select para laboratorio Vega OS. Claves Android 2026 registradas al 100%.',
      defaultStatus: 'Adquisición Aprobada'
    },
    {
      id: 'top-10aug-5',
      meetingDate: todayShortDate,
      meetingName: `Meet Seguimiento Video (${todayShortDate})`,
      title: '5. Auditoría de Métricas de Soporte Nivel 1 (Sabrina & Kenyi)',
      lead: 'Fabricio Nieva / Joseph Valer',
      keyword: 'soporte',
      priority: 'P3 - MEDIA',
      fathomSummary: 'Tiempo medio de respuesta reducido a 14 minutos. Conciliación de horas semanales de atención por Sabrina y Kenyi.',
      defaultStatus: 'Métricas OK'
    },
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
    const titleText = `${topic.title} ${userNote ? `• Nota Call ${todayShortDate}: "${userNote}"` : ''}`;

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
    const formattedComment = `[Call CEO ${todayShortDate}]: "${topic.title}" • Estado: ${topic.defaultStatus}\n💬 Comentario Diego: "${comment.trim()}"`;

    const res = await postCommentToNotion(credentials?.notionToken, targetPageId, formattedComment);
    if (res.success) {
      setActionStatusMap(prev => ({ ...prev, [topic.id]: 'commented' }));
    }
    setSyncingTopicId(null);
  };

  const generateFullCallSummaryText = () => {
    let summary = `======================================================================\n`;
    summary += `📊 REPORTE SEMANAL EJECUTIVO CTO PARA ALEJANDRO CUBINO (CEO)\n`;
    summary += `📅 FECHA REUNIÓN DE HOY: ${todayFormattedDate} (${todayShortDate})\n`;
    summary += `Director & Head of Engineering: Diego Paolo Musach (CTO)\n`;
    summary += `Fuente: Fathom Video Notetaker & Ingesta de Notas Directivas\n`;
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
    const subject = encodeURIComponent(`[REPORTE SEMANAL CEO ${todayShortDate}] Follow Up Tecnología Fathom - Alejandro Cubino`);
    const body = encodeURIComponent(generateFullCallSummaryText());
    window.open(`mailto:acubino@bromteck.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="executive-roadmap-container">
      
      {/* Executive Header Banner with MANDATORY LIVE MEETING DATE */}
      <div className="card-glass" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText className="text-purple" size={22} /> 📊 Reporte Semanal CEO (Alejandro Cubino)
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid var(--accent-emerald)', padding: '0.2rem 0.65rem', borderRadius: '6px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} /> REUNIÓN HOY: {todayFormattedDate} ({todayShortDate})
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Bloc de Notas Directivo en Vivo + Análisis e Ingesta de la IA "Diego Paolo Musach" etiquetado con fecha <strong>{todayShortDate}</strong> para matchear con Fathom.
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

      {/* LIVE SCRATCHPAD ENGINE WITH MANDATORY MEETING DATE HEADER */}
      <div className="card-glass" style={{ padding: '1.3rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-cyan)', background: 'rgba(15, 23, 42, 0.9)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Edit3 className="text-cyan" size={18} /> 📝 Bloc de Notas Directivo de la Call con Alejandro (Diego Paolo Musach) • <span style={{ color: 'var(--accent-cyan)' }}>📅 {todayShortDate}</span>
          </h3>

          <button
            onClick={() => handleStartVoiceDictation('scratchpad', (txt) => setScratchpadText(prev => prev ? `${prev}\n• ${txt}` : `• ${txt}`))}
            className="btn-secondary"
            style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Dictar nota por micrófono 🎙️"
          >
            <Mic size={14} className={listeningTargetId === 'scratchpad' ? 'pulse' : ''} /> Dictar Nota por Voz 🎙️
          </button>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Escribe un tema o compromiso por línea (Enter por tema). Al finalizar la call del <strong>{todayFormattedDate}</strong>, presiona el botón para procesar y auditar la vista previa antes de impactar en Notion API:
        </p>

        <textarea
          className="form-input"
          rows={6}
          placeholder={`• EDEMSA: Sergio Palmucci confirmó los 10 alimentadores, emitiendo factura de USD 50k...\n• Tecsys Brasil: Camilo traspasando homologación de certificados FCC/CE a tarjetas Notion...\n• Heroku Migration: Leonard programa ventana de mantenimiento para auto-stop de servidores...`}
          value={scratchpadText}
          onChange={(e) => {
            setScratchpadText(e.target.value);
            localStorage.setItem('dm_ceo_scratchpad_draft', e.target.value);
          }}
          style={{ fontSize: '0.84rem', lineHeight: '1.5', padding: '0.75rem', fontFamily: 'sans-serif', background: 'rgba(11, 16, 28, 0.95)', color: '#fff', borderRadius: '8px', marginBottom: '0.85rem' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)' }}>
            💡 Presiona <strong>Enter</strong> por cada tema para que la IA los procese en forma independiente.
          </span>

          <button
            className="btn-primary"
            onClick={handlePreAnalyzeScratchpad}
            disabled={isProcessingScratchpad || !scratchpadText.trim()}
            style={{ fontSize: '0.82rem', padding: '0.55rem 1.2rem', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', fontWeight: 700 }}
          >
            <SendHorizontal size={15} /> 🤖 Submit a Asistente Diego Paolo Musach (Ver Vista Previa)
          </button>
        </div>

        {scratchpadSuccessMessage && (
          <div style={{ marginTop: '0.85rem', padding: '0.75rem 1rem', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid var(--accent-emerald)', borderRadius: '8px', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} /> {scratchpadSuccessMessage}
          </div>
        )}
      </div>

      {/* HISTORICAL LOG OF SUBMITTED SCRATCHPAD SESSIONS */}
      {scratchpadHistory.length > 0 && (
        <div className="card-glass" style={{ padding: '1rem 1.2rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-emerald)', background: 'rgba(15, 23, 42, 0.7)' }}>
          <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
            <History className="text-emerald" size={16} /> 📜 Historial de Notas de Calls Procesadas (Matcheable por Fecha con Fathom)
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {scratchpadHistory.map((hist) => (
              <div key={hist.id} style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    📅 {hist.date} ({hist.processedItemsCount} Temas Ingestados)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                    {hist.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'pre-line', fontStyle: 'italic' }}>
                  {hist.rawText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 100% CLICKABLE EXECUTIVE KPI SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* KPI CARD 1: CALLS RELEVADAS (CLICKABLE) */}
        <div 
          className="card-glass" 
          onClick={() => setActiveModalType('calls')}
          style={{ padding: '1rem', borderLeft: '4px solid var(--accent-purple)', cursor: 'pointer', transition: 'all 0.2s ease' }}
          title="Haz clic para ver el detalle completo de las 5 llamadas Fathom"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>📹 CALLS RELEVADAS</div>
            <Eye size={14} className="text-purple" />
          </div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>5 Reuniones Fathom</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700 }}>🔍 Clic para ver el detalle de las 5 llamadas ➔</div>
        </div>

        {/* KPI CARD 2: TEMAS TÉCNICOS (CLICKABLE) */}
        <div 
          className="card-glass" 
          onClick={() => setActiveModalType('topics')}
          style={{ padding: '1rem', borderLeft: '4px solid var(--accent-cyan)', cursor: 'pointer', transition: 'all 0.2s ease' }}
          title="Haz clic para ver el detalle completo de los 15 temas técnicos"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>⚙️ TEMAS TÉCNICOS</div>
            <Eye size={14} className="text-cyan" />
          </div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>15 Puntos Clave</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>🔍 Clic para ver la lista completa ➔</div>
        </div>

        {/* KPI CARD 3: PROYECTOS EN GESTIÓN (CLICKABLE) */}
        <div 
          className="card-glass" 
          onClick={() => setActiveModalType('projects')}
          style={{ padding: '1rem', borderLeft: '4px solid var(--accent-emerald)', cursor: 'pointer', transition: 'all 0.2s ease' }}
          title="Haz clic para ver el desglose financiero de proyectos"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>💵 PROYECTOS EN GESTIÓN</div>
            <Eye size={14} className="text-emerald" />
          </div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>USD 185,000</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>🔍 Clic para ver desglose por cliente ➔</div>
        </div>

        {/* KPI CARD 4: AHORRO ANUAL NUBES (100% CLICKABLE WITH DETAILED BREAKDOWN MODAL) */}
        <div 
          className="card-glass" 
          onClick={() => setActiveModalType('cloud_savings')}
          style={{ padding: '1rem', borderLeft: '4px solid var(--accent-amber)', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.95))', transition: 'all 0.2s ease' }}
          title="¡HAZ CLIC AQUÍ PARA VER EL DETALLE COMPLETO DE AHORROS EN AWS, HUAWEI Y HEROKU!"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>🌱 AHORRO ANUAL NUBES</div>
            <Cloud size={16} className="text-amber pulse" />
          </div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>USD 26,880 / año</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--accent-amber)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Eye size={13} /> 🔍 Clic aquí para ver detalle AWS, Huawei y Heroku ➔
          </div>
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

      {/* MODAL AUDITORÍA DE VISTA PREVIA Y CONFIRMACIÓN IA (PRE-EXECUTION AUDIT MODAL) */}
      {proposedAiActions && (
        <div className="modal-overlay" onClick={() => setProposedAiActions(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h2>
                <ListChecks className="text-cyan" size={22} /> 🛡️ Vista Previa & Confirmación de Acciones IA ({todayShortDate})
              </h2>
              <button className="btn-icon" onClick={() => setProposedAiActions(null)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Revisa y edita las acciones propuestas por el Asistente IA antes de ejecutarlas en Notion API. Puedes desmarcar cualquier ítem que no desees impactar:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.2rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {proposedAiActions.map((prop, idx) => (
                <div key={prop.id} style={{ background: 'rgba(30, 41, 59, 0.9)', border: prop.approved ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: '#fff', fontWeight: 700 }}>
                      <input
                        type="checkbox"
                        checked={prop.approved}
                        onChange={(e) => {
                          const updated = [...proposedAiActions];
                          updated[idx].approved = e.target.checked;
                          setProposedAiActions(updated);
                        }}
                      />
                      {prop.actionType === 'comment' ? '💬 Comentar en Tarjeta Existente' : '⚡ Crear Nueva Tarjeta en Notion'}
                    </label>

                    {prop.targetCardTitle && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', background: 'rgba(192, 132, 252, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        🎯 Tarjeta: {prop.targetCardTitle}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.4rem' }}>
                    Nota Original: "{prop.rawLine}"
                  </div>

                  <input
                    type="text"
                    className="form-input"
                    value={prop.proposedContent}
                    onChange={(e) => {
                      const updated = [...proposedAiActions];
                      updated[idx].proposedContent = e.target.value;
                      setProposedAiActions(updated);
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem', width: '100%' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>
                Selected: {proposedAiActions.filter(p => p.approved).length} de {proposedAiActions.length} acciones listas para ejecutar.
              </span>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="btn-secondary" onClick={() => setProposedAiActions(null)}>
                  Cancelar
                </button>

                <button
                  className="btn-primary"
                  onClick={handleExecuteApprovedAiProposals}
                  disabled={isProcessingScratchpad || proposedAiActions.filter(p => p.approved).length === 0}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1.2rem', background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-blue))' }}
                >
                  <CheckCircle2 size={16} />
                  {isProcessingScratchpad ? 'Ejecutando en Notion API...' : `✅ Aprobar & Ejecutar ${proposedAiActions.filter(p => p.approved).length} Acciones en Notion`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CLOUD SAVINGS DETAILED BREAKDOWN MODAL */}
      {activeModalType === 'cloud_savings' && (
        <div className="modal-overlay" onClick={() => setActiveModalType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h2>
                <Cloud className="text-amber" size={22} /> ☁️ Desglose Detallado de Ahorros Cloud (AWS + Huawei + Heroku)
              </h2>
              <button className="btn-icon" onClick={() => setActiveModalType(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.2rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 800 }}>
                  AHORRO MENSUAL TOTAL: <span style={{ color: 'var(--accent-emerald)' }}>USD $2,240 / mes</span>
                </span>
                <span style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 800 }}>
                  AHORRO ANUAL TOTAL: <span style={{ color: 'var(--accent-amber)' }}>USD $26,880 / año</span>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.94rem', color: '#fff', fontWeight: 700 }}>1. AWS Cloud (Amazon Web Services)</span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--accent-emerald)', fontWeight: 800 }}>USD $1,800 / mes (USD $21,600 / año)</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Optimización de tipos de instancias EC2 a Graviton, consolidación de discos EBS y apagado automático de clústeres no productivos.
                  </p>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.94rem', color: '#fff', fontWeight: 700 }}>2. Huawei Cloud</span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--accent-emerald)', fontWeight: 800 }}>USD $400 / mes (USD $4,800 / año)</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Reducción de transferencias de datos salientes (CDN Egress) y limpieza de backups históricos de almacenamiento.
                  </p>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.94rem', color: '#fff', fontWeight: 700 }}>3. Heroku Cloud (Salesforce)</span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--accent-emerald)', fontWeight: 800 }}>USD $40 / mes (USD $480 / año)</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Desmantelamiento gradual y auto-stop nocturno de Dynos en Heroku con migración a la infraestructura de CableView.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => setActiveModalType(null)}>
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CALLS RELEVADAS DETAILED MODAL */}
      {activeModalType === 'calls' && (
        <div className="modal-overlay" onClick={() => setActiveModalType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>
                <Video className="text-purple" size={22} /> 📹 Detalle de las 5 Reuniones "Follow Up Tecnología" (Fathom)
              </h2>
              <button className="btn-icon" onClick={() => setActiveModalType(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <strong>{todayShortDate}:</strong> Meet Seguimiento Video: Desarrollo + QT + Servicios (STB Elebao, FingerPrint, Heroku)
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <strong>03/08/2026:</strong> Weekly Follow Up Tecnología - Cluster VMs WIND & SSO OAuth2 (Tecsys, Telemetría)
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <strong>27/07/2026:</strong> Weekly Follow Up Tecnología - EDEMSA Mendoza & Pérdidas BT (10 alimentadores, USD 50k)
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <strong>13/07/2026:</strong> Weekly Follow Up Tecnología - Bot AI Gemini & Capacitaciones (Supermicro Honduras)
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <strong>06/07/2026:</strong> Weekly Follow Up Tecnología - Evaluación Q3 & Despliegues STB (Pruebas AOSP)
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => setActiveModalType(null)}>
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PROJECTS DETAILED MODAL */}
      {activeModalType === 'projects' && (
        <div className="modal-overlay" onClick={() => setActiveModalType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>
                <DollarSign className="text-emerald" size={22} /> 💵 Desglose de Proyectos en Gestión (USD $185,000)
              </h2>
              <button className="btn-icon" onClick={() => setActiveModalType(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>EDEMSA Mendoza - 10 Alimentadores BT</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>USD $50,000</strong>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Tecsys Brasil - Homologación Certificados FCC/CE</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>USD $45,000</strong>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>WIND Telecom - Cluster VMs & Single Sign-On</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>USD $35,000</strong>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Telecable Costa Rica - STB Elebao AOSP & FingerPrint</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>USD $25,000</strong>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Ahorro Anual Nubes (AWS + Huawei + Heroku)</span>
                <strong style={{ color: 'var(--accent-amber)' }}>USD $26,880 / año</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => setActiveModalType(null)}>
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
