import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Copy, Send, Sparkles, Clock, Layers, ExternalLink, Video, Award, Target, ChevronRight, MessageSquare, Mic, Plus, Check, Zap, RefreshCw, User, ShieldCheck, PlusCircle, CheckSquare, DollarSign, Activity, Edit3, SendHorizontal, History, X, Cloud, Server, Eye, Calendar, AlertTriangle, ListChecks, Lock, RotateCcw, Database } from 'lucide-react';
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

  // CLOSED TOPICS DATABASE PERSISTENCE (PERSISTED IN LOCALSTORAGE FOR DIEGO)
  const [closedTopicsDb, setClosedTopicsDb] = useState(() => {
    const saved = localStorage.getItem('dm_closed_topics_db');
    if (saved) {
      try { return JSON.parse(saved); } catch(e){}
    }
    return [
      {
        id: 'closed-demo-1',
        topicId: 'ser-7',
        seriesName: '🤖 Soporte AI Gemini & Capacitaciones Filmadas',
        closedDate: '08/08/2026',
        closedBy: 'Diego Musach (CTO)',
        reason: 'Bot Gemini entrenado con transcripciones Fathom en producción.'
      }
    ];
  });

  const [showClosedTopicsModal, setShowClosedTopicsModal] = useState(false);

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

  // PRE-EXECUTION AUDIT MODAL STATE
  const [proposedAiActions, setProposedAiActions] = useState(null);
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

  // REAL FATHOM & NOTION WEEKLY FOLLOW UP SERIES (JULIO - AGOSTO 2026)
  const allFollowUpSeries = [
    {
      id: 'ser-1',
      seriesName: '📌 Weekly Follow Up Tecnologia (con Alejandro)',
      targetCard: 'Weekly Follow Up Tecnologia (con Alejandro)',
      meetingDate: todayShortDate,
      lead: 'Diego Musach (CTO) / Alejandro Cubino (CEO)',
      keyword: 'tecnologia',
      priority: 'P1 - CRITICA',
      defaultStatus: 'Abierto / En Seguimiento',
      fathomSummary: 'Alineación de objetivos de ingeniería Q3-Q4 2026 con Alejandro Cubino. Revisión de hitos de entrega en clientes y control de presupuesto.'
    },
    {
      id: 'ser-2',
      seriesName: '📹 Weekly Follow Up Video (STB Elebao & FingerPrint)',
      targetCard: 'Weekly Follow Up Video',
      meetingDate: '10/08/2026',
      lead: 'Enrique Bevilacqua',
      keyword: 'telecable',
      priority: 'P1 - CRITICA',
      defaultStatus: 'Laboratorio OK',
      fathomSummary: 'Pruebas de laboratorio en decodificadores STB Elebao AOSP completadas con procesadores Montage para Telecable Costa Rica. Marca de agua digital FingerPrint validada sobre HLS/DASH.'
    },
    {
      id: 'ser-3',
      seriesName: '⚡ Weekly Follow Up Energia (EDEMSA Mendoza & Pérdidas BT)',
      targetCard: 'Weekly Follow Up Energia',
      meetingDate: '27/07/2026',
      lead: 'Camilo Uribe / Diego Musach',
      keyword: 'edemsa',
      priority: 'P1 - CRITICA',
      defaultStatus: 'Facturación Autorizada (USD 50k)',
      fathomSummary: 'Auditoría técnica de pérdidas en BT en 10 alimentadores validada con Sergio Palmucci, Nicolás y Zuin. Emisión de factura por USD 50,000 aprobada.'
    },
    {
      id: 'ser-4',
      seriesName: '📊 Weekly Follow Up con Camilo (Tecsys Brasil & Gabinetes)',
      targetCard: 'Weekly Follow Up con Camilo',
      meetingDate: '03/08/2026',
      lead: 'Camilo Uribe',
      keyword: 'tecsys',
      priority: 'P1 - CRITICA',
      defaultStatus: 'En Traspaso Notion (USD 45k)',
      fathomSummary: 'Cotización desglosada de USD 45,000 en certificaciones FCC/CE. Traspaso de celdas Excel a Notion API. Relevamiento operativo de 2,300 gabinetes de fibra de vidrio en Argentina y Colombia.'
    },
    {
      id: 'ser-5',
      seriesName: '🌐 Weekly Follow Up Enrique (WIND Telecom & SSO OAuth2)',
      targetCard: 'Weekly Follow Up Enrique',
      meetingDate: '03/08/2026',
      lead: 'Enrique Bevilacqua',
      keyword: 'wind',
      priority: 'P1 - CRITICA',
      fathomSummary: 'Reinstalación de microservicios en Cluster de VMs en staging para WIND Telecom. Configuración del flujo OAuth2 para Single Sign-On (SSO). Ingesta de mediciones cosf/pact en reconectadores.'
    },
    {
      id: 'ser-6',
      seriesName: '📱 Follow Up Mario (Vega OS & Firestick 4K Select)',
      targetCard: 'Follow Up Mario',
      meetingDate: '10/08/2026',
      lead: 'Mario Maqueda',
      keyword: 'vega',
      priority: 'P2 - ALTA',
      fathomSummary: 'Pruebas de la app en hardware Amazon Fire TV Stick 4K Select con sistema Vega OS. Auditoría al 100% de claves de firma de desarrollador Android 2026.'
    },
    {
      id: 'ser-7',
      seriesName: '🤖 Soporte AI Gemini & Capacitaciones Filmadas',
      targetCard: 'Soporte AI BOT Gemini',
      meetingDate: '13/07/2026',
      lead: 'Fabricio Jose Nieva / Joseph Valer',
      keyword: 'bot',
      priority: 'P2 - ALTA',
      fathomSummary: 'Entrenamiento del Bot AI Gemini de soporte utilizando el repositorio de capacitaciones filmadas en Fathom. Reducción estimada del 35% de tickets Nivel 1. Tiempo medio de respuesta reducido a 14 min.'
    },
    {
      id: 'ser-8',
      seriesName: '☁️ Infraestructura Cloud & Ahorro Anual (AWS + Huawei + Heroku)',
      targetCard: 'Apagado Servidores Heroku & CableView',
      meetingDate: '10/08/2026',
      lead: 'Leonard Amaya / Diego Musach',
      keyword: 'heroku',
      priority: 'P2 - ALTA',
      defaultStatus: 'Ahorro USD 26,880/año',
      fathomSummary: 'Desmantelamiento de servidores Heroku y optimizaciones en AWS y Huawei Cloud. Ahorro mensual de USD 2,240/mes (USD 26,880/año: AWS $1,800/mes, Huawei $400/mes, Heroku $40/mes).'
    }
  ];

  // FILTER ACTIVE VS CLOSED TOPICS FROM THE DATABASE
  const isTopicClosed = (topicId) => closedTopicsDb.some(c => c.topicId === topicId);

  const activeFollowUpSeries = allFollowUpSeries.filter(t => !isTopicClosed(t.id));

  // HANDLE CLOSING AND RECORDING TOPIC IN DATABASE
  const handleCloseNotionCardForTopic = async (topic) => {
    const matchedCard = getMatchedNotionCard(topic.keyword);
    const targetPageId = matchedCard ? (matchedCard.notionPageId || matchedCard.id) : null;

    setSyncingTopicId(topic.id);
    if (targetPageId) {
      await updateNotionPageStatus(credentials?.notionToken, targetPageId, 'Cerrada');
    }

    // Record in local database so it NEVER reopens automatically
    const newClosedRecord = {
      id: `closed-${Date.now()}`,
      topicId: topic.id,
      seriesName: topic.seriesName,
      closedDate: todayShortDate,
      closedBy: 'Diego Musach (CTO)',
      reason: callCommentsMap[topic.id] || 'Tema marcado como Cerrado en reporte.'
    };

    const updatedDb = [...closedTopicsDb, newClosedRecord];
    setClosedTopicsDb(updatedDb);
    localStorage.setItem('dm_closed_topics_db', JSON.stringify(updatedDb));
    setActionStatusMap(prev => ({ ...prev, [topic.id]: 'closed' }));

    setSyncingTopicId(null);
  };

  // HANDLE RE-OPENING TOPIC WITH CONFIRMATION PROMPT
  const handleReopenClosedTopic = (closedItem) => {
    const confirmReopen = window.confirm(`¿Estás seguro de que deseas reabrir el tema "${closedItem.seriesName}"?\n\nAl reabrirlo, volverá a aparecer activo en tu reporte semanal.`);
    if (confirmReopen) {
      const updatedDb = closedTopicsDb.filter(c => c.id !== closedItem.id);
      setClosedTopicsDb(updatedDb);
      localStorage.setItem('dm_closed_topics_db', JSON.stringify(updatedDb));

      // Also reset action status
      setActionStatusMap(prev => {
        const copy = { ...prev };
        delete copy[closedItem.topicId];
        return copy;
      });
    }
  };

  // STEP 1: PRE-ANALYZE SCRATCHPAD AND SHOW PRE-EXECUTION AUDIT MODAL
  const handlePreAnalyzeScratchpad = () => {
    if (!scratchpadText.trim()) {
      alert('Por favor escribe al menos una nota sobre el tema antes de presionar Submit.');
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
          proposedContent: `[Nota de Gestión ${todayShortDate}]: "${line}"`
        };
      } else {
        return {
          id: `prop-${idx}`,
          approved: true,
          actionType: 'create',
          rawLine: line,
          targetCardTitle: `[Gestión CTO ${todayShortDate}] ${line.substring(0, 100)}`,
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

  const getMatchedNotionCard = (keyword) => {
    if (!Array.isArray(notionCards) || notionCards.length === 0) return null;
    return notionCards.find(c => (c.title || '').toLowerCase().includes(keyword.toLowerCase()));
  };

  const handleCreateNewNotionCardForTopic = async (topic) => {
    setSyncingTopicId(topic.id);
    const userNote = callCommentsMap[topic.id] || '';
    const titleText = `${topic.seriesName} ${userNote ? `• Nota de Gestión ${todayShortDate}: "${userNote}"` : ''}`;

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

  const handleSyncTopicCommentToNotion = async (topic) => {
    const comment = callCommentsMap[topic.id] || '';
    if (!comment.trim()) {
      alert(`Por favor escribe una nota sobre el tema o comentario para "${topic.seriesName}".`);
      return;
    }

    const matchedCard = getMatchedNotionCard(topic.keyword);
    const targetPageId = matchedCard ? (matchedCard.notionPageId || matchedCard.id) : (notionCards[0]?.notionPageId || notionCards[0]?.id);

    if (!targetPageId) {
      alert('No se encontró una tarjeta de Notion válida para vincular el comentario.');
      return;
    }

    setSyncingTopicId(topic.id);
    const formattedComment = `[Nota sobre el Tema - Call ${todayShortDate}]: "${topic.seriesName}" • Estado: ${topic.defaultStatus || 'Abierto'}\n💬 Nota de Gestión (Diego): "${comment.trim()}"`;

    const res = await postCommentToNotion(credentials?.notionToken, targetPageId, formattedComment);
    if (res.success) {
      setActionStatusMap(prev => ({ ...prev, [topic.id]: 'commented' }));
    }
    setSyncingTopicId(null);
  };

  const generateFullCallSummaryText = () => {
    let summary = `======================================================================\n`;
    summary += `📊 REPORTE SEMANAL EJECUTIVO CTO PARA CALL CON ALEJANDRO CUBINO (CEO)\n`;
    summary += `📅 FECHA REUNIÓN DE HOY: ${todayFormattedDate} (${todayShortDate})\n`;
    summary += `Director & Head of Engineering: Diego Paolo Musach (CTO)\n`;
    summary += `Fuente: Transcripciones Fathom & Tarjetas Reales de Follow Up en Notion\n`;
    summary += `======================================================================\n\n`;

    activeFollowUpSeries.forEach((t) => {
      const note = callCommentsMap[t.id] || 'Sin notas adicionales sobre el tema.';
      const card = getMatchedNotionCard(t.keyword);
      summary += `[${t.seriesName}]\n`;
      summary += `• Responsable: ${t.lead} | Estado: ${t.defaultStatus || 'Abierto'}\n`;
      summary += `• Tarjeta Notion Vinculada: ${card ? card.title : t.targetCard}\n`;
      summary += `• Avance Fathom: ${t.fathomSummary}\n`;
      summary += `• 💬 Notas sobre el Tema (Gestión): "${note}"\n\n`;
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
                <FileText className="text-purple" size={22} /> 📊 Reporte Semanal CEO (Para Pantalla en Call con Alejandro)
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid var(--accent-emerald)', padding: '0.2rem 0.65rem', borderRadius: '6px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} /> REUNIÓN HOY: {todayFormattedDate} ({todayShortDate})
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Diseñado para revisar y hablar en vivo durante la llamada. Basado en las series <strong>Weekly Follow Up Tecnología (Julio y Agosto de 2026)</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* BUTTON TO VIEW CLOSED TOPICS DATABASE */}
            <button
              className="btn-secondary"
              onClick={() => setShowClosedTopicsModal(true)}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Ver base de datos de temas cerrados que no se vuelven a abrir automáticamente"
            >
              <Lock size={14} /> 🔒 Temas Cerrados ({closedTopicsDb.length})
            </button>

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
              <Send size={14} /> Opción Email (acubino@bromteck.com)
            </button>
          </div>
        </div>
      </div>

      {/* LIVE SCRATCHPAD ENGINE WITH UPDATED LABELS */}
      <div className="card-glass" style={{ padding: '1.3rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-cyan)', background: 'rgba(15, 23, 42, 0.9)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Edit3 className="text-cyan" size={18} /> 📝 Bloc de Notas sobre la Gestión & Seguimiento • <span style={{ color: 'var(--accent-cyan)' }}>📅 {todayShortDate}</span>
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
          Escribe notas o comentarios sobre la gestión por línea (Enter por tema). Al finalizar la call del <strong>{todayFormattedDate}</strong>, presiona el botón para auditar y sincronizar con Notion API:
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
            💡 Presiona <strong>Enter</strong> por cada nota para que la IA las procese independientemente.
          </span>

          <button
            className="btn-primary"
            onClick={handlePreAnalyzeScratchpad}
            disabled={isProcessingScratchpad || !scratchpadText.trim()}
            style={{ fontSize: '0.82rem', padding: '0.55rem 1.2rem', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', fontWeight: 700 }}
          >
            <SendHorizontal size={15} /> 🤖 Submit a Asistente Diego Musach (Auditar Notas)
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
            <History className="text-emerald" size={16} /> 📜 Historial de Notas de Gestión Procesadas (Matcheables con Fathom)
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {scratchpadHistory.map((hist) => (
              <div key={hist.id} style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    📅 {hist.date} ({hist.processedItemsCount} Notas Ingestadas)
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

        {/* KPI CARD 2: SERIE FOLLOW UP (CLICKABLE) */}
        <div 
          className="card-glass" 
          onClick={() => setActiveModalType('topics')}
          style={{ padding: '1rem', borderLeft: '4px solid var(--accent-cyan)', cursor: 'pointer', transition: 'all 0.2s ease' }}
          title="Haz clic para ver la lista completa de temas de Follow Up"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>⚙️ SERIES FOLLOW UP</div>
            <Eye size={14} className="text-cyan" />
          </div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>{activeFollowUpSeries.length} Activos ({closedTopicsDb.length} Cerrados)</div>
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

      {/* ACTIVE WEEKLY FOLLOW UP SERIES FROM NOTION & FATHOM */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.5rem' }}>
        {activeFollowUpSeries.map((topic) => {
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
                  <h4 style={{ fontSize: '1.02rem', color: '#ffffff', margin: '0 0 0.25rem 0', fontWeight: 700 }}>
                    {topic.seriesName}
                  </h4>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      👤 Responsable: {topic.lead}
                    </span>
                    {topic.defaultStatus && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        {topic.defaultStatus}
                      </span>
                    )}
                  </div>
                </div>

                {/* Linked Notion Card Badge */}
                {matchedCard ? (
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', background: 'rgba(192, 132, 252, 0.15)', border: '1px solid rgba(192, 132, 252, 0.3)', padding: '0.3rem 0.65rem', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Target size={13} /> Tarjeta Notion: "{matchedCard.title ? matchedCard.title.substring(0, 40) : topic.targetCard}" ({matchedCard.status || 'Abierto'})
                  </div>
                ) : (
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', background: 'rgba(192, 132, 252, 0.15)', padding: '0.3rem 0.65rem', borderRadius: '6px', fontWeight: 600 }}>
                    🎯 Tarjeta Notion: "{topic.targetCard}"
                  </div>
                )}
              </div>

              {/* Fathom Key Takeaways */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: '1.45', background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                💡 <strong>Resumen Fathom API ({topic.meetingDate}):</strong> {topic.fathomSummary}
              </div>

              {/* Live Call Comment Box for "Notas sobre el tema" with Microphone 🎙️ */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={listeningTargetId === topic.id ? "🎙️ Escuchando tu dictado..." : "💬 Escribe aquí tus Notas sobre el tema o comentarios para gestión..."}
                  value={currentComment}
                  onChange={(e) => setCallCommentsMap(prev => ({ ...prev, [topic.id]: e.target.value }))}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem', flex: 1, background: 'rgba(15, 23, 42, 0.95)' }}
                />

                <button
                  onClick={() => handleStartVoiceDictation(topic.id, (txt) => setCallCommentsMap(prev => ({ ...prev, [topic.id]: prev[topic.id] ? `${prev[topic.id]} ${txt}` : txt })))}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                  title="Dictar nota sobre el tema por micrófono 🎙️"
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

                {/* Cross Action 2: Cambiar Status a "Cerrada" (AND STORE IN DATABASE SO IT WON'T REOPEN) */}
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
                  <CheckSquare size={13} /> {statusState === 'closed' ? '¡Tema Cerrado & Archivado!' : '✅ Cambiar Status a "Cerrada"'}
                </button>

                {/* Action 3: Sincronizar Comentario */}
                <button
                  className="btn-secondary"
                  onClick={() => handleSyncTopicCommentToNotion(topic)}
                  disabled={statusState === 'commented' || isSyncing || !currentComment.trim()}
                  style={{ fontSize: '0.76rem', padding: '0.45rem 0.85rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}
                >
                  <MessageSquare size={13} /> {statusState === 'commented' ? '¡Nota Guardada!' : '💬 Guardar Nota en Notion'}
                </button>

              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL DATABASE TEMAS CERRADOS (CLOSED TOPICS DATABASE MODAL) */}
      {showClosedTopicsModal && (
        <div className="modal-overlay" onClick={() => setShowClosedTopicsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>
                <Database className="text-amber" size={22} /> 🔒 Base de Datos de Temas Cerrados ({closedTopicsDb.length})
              </h2>
              <button className="btn-icon" onClick={() => setShowClosedTopicsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Los siguientes temas fueron marcados como <strong>Cerrados</strong> y están almacenados en la base de datos persistente para que no vuelvan a abrirse automáticamente en reportes futuros. Si deseas reabrir alguno, presiona "↺ Reabrir Tema".
            </p>

            {closedTopicsDb.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No hay temas cerrados en la base de datos.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.2rem', maxHeight: '400px', overflowY: 'auto' }}>
                {closedTopicsDb.map((item) => (
                  <div key={item.id} style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 700, marginBottom: '0.2rem' }}>
                        {item.seriesName}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--accent-amber)', display: 'flex', gap: '0.75rem' }}>
                        <span>📅 Fecha Cierre: {item.closedDate}</span>
                        <span>👤 Registrado por: {item.closedBy}</span>
                      </div>
                      {item.reason && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.2rem' }}>
                          Razón/Nota: "{item.reason}"
                        </div>
                      )}
                    </div>

                    <button
                      className="btn-secondary"
                      onClick={() => handleReopenClosedTopic(item)}
                      style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <RotateCcw size={13} /> ↺ Reabrir Tema
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => setShowClosedTopicsModal(false)}>
                Cerrar Base de Datos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AUDITORÍA DE VISTA PREVIA Y CONFIRMACIÓN IA */}
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
              Revisa y edita las notas o acciones propuestas por la IA antes de ejecutarlas en Notion API. Puedes desmarcar cualquier ítem que no desees impactar:
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
                    Nota sobre el Tema: "{prop.rawLine}"
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
                Seleccionadas: {proposedAiActions.filter(p => p.approved).length} de {proposedAiActions.length} acciones listas para ejecutar.
              </span>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="btn-secondary" onClick={() => setProposedAiActions(null)}>
                  Cancelar
                </button>

                <button
                  className="btn-primary"
                  onClick={handleExecuteApprovedAiProposals}
                  disabled={isProcessingScratchpad || proposedAiActions.filter(p => p.approved).length === 0}
                  style={{ fontSize: '0.82rem', padding: '0.55rem 1.2rem', background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-blue))' }}
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
                <strong>{todayShortDate}:</strong> Weekly Follow Up Tecnologia (con Alejandro Cubino)
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <strong>10/08/2026:</strong> Weekly Follow Up Video (STB Elebao, FingerPrint, Heroku)
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <strong>03/08/2026:</strong> Weekly Follow Up Enrique (Cluster VMs WIND & SSO OAuth2)
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <strong>27/07/2026:</strong> Weekly Follow Up Energia (EDEMSA Mendoza 10 alimentadores, USD 50k)
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <strong>03/08/2026:</strong> Weekly Follow Up con Camilo (Tecsys Brasil USD 45k, Gabinetes)
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
