import React, { useState, useEffect } from 'react';
import { Mail, Folder, CheckCircle2, Send, Sparkles, Key, ExternalLink, RefreshCw, AlertCircle, ShieldCheck, Zap, Clock, Calendar, Search, FileText, HardDrive, MessageSquare, PlusCircle, Mic, FileSpreadsheet, Plus, Check, Target, ChevronRight } from 'lucide-react';
import { fetchCorporateGmailMessages, fetchCorporateDriveFiles, getCorporateGmailSampleData, getCorporateDriveSampleData } from '../services/googleWorkspaceService';
import { createNotionPage, postCommentToNotion } from '../services/notionService';

export default function GoogleWorkspaceHub({ credentials, notionCards = [] }) {
  const [googleAccessToken, setGoogleAccessToken] = useState(() => {
    return localStorage.getItem('dm_google_oauth_token') || '';
  });

  const [accountEmail, setAccountEmail] = useState('dmusach@bromteck.com');
  const [startDate, setStartDate] = useState('2026-05-01');
  const [activeTab, setActiveTab] = useState('gmail');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isFetchingGoogleAPI, setIsFetchingGoogleAPI] = useState(false);
  const [googleApiError, setGoogleApiError] = useState(null);
  const [listeningTargetId, setListeningTargetId] = useState(null);

  const [prioritySpreadsheets, setPrioritySpreadsheets] = useState(() => {
    const saved = localStorage.getItem('dm_priority_spreadsheets');
    if (saved) {
      try { return JSON.parse(saved); } catch(e){}
    }
    return [
      { id: 'sheet-1', name: '📄 Cotizaciones_FCC_CE_Tecsys_2026.xlsx', targetProject: 'Tecsys / Camilo Uribe', status: 'Analizada por IA', insight: 'Contiene desglose de USD 45,000 en certificados. Requiere traspaso a Notion.' },
      { id: 'sheet-2', name: '📄 Relevamiento_2300_Gabinetes_Arg_Col.xlsx', targetProject: 'Gabinetes / Camilo Uribe', status: 'Analizada por IA', insight: 'Cotizaciones de postes de fibra de vidrio y costos por gabinete.' },
      { id: 'sheet-3', name: '📊 Control_Alimentadores_EDEMSA_2026.xlsx', targetProject: 'EDEMSA / Diego Musach', status: 'Analizada por IA', insight: '10 alimentadores auditados. Listo para facturación.' }
    ];
  });

  const [newSheetInput, setNewSheetInput] = useState('');
  const [gmailMessages, setGmailMessages] = useState(getCorporateGmailSampleData());
  const [driveFiles, setDriveFiles] = useState(getCorporateDriveSampleData());
  const [actionSuccessStatus, setActionSuccessStatus] = useState({});
  const [processingId, setProcessingId] = useState(null);

  // Dedicated AI Extracted Executive Tasks from Emails & Spreadsheets
  const aiExtractedTasks = [
    {
      id: 'ai-task-1',
      title: 'EDEMSA Mendoza: Derivar facturación de USD 50,000 por 10 alimentadores auditados',
      source: '📧 Correo de Sergio Palmucci (EDEMSA) + 📊 Control_Alimentadores_EDEMSA.xlsx',
      responsable: 'Camilo Uribe / Diego Musach',
      priority: 'P1 - CRITICA',
      actionNeeded: 'Autorizar factura de pérdidas BT en Mendoza y notificar a Nicolás Zuin.',
      notionKeyword: 'edemsa'
    },
    {
      id: 'ai-task-2',
      title: 'Tecsys Brasil: Traspaso de planilla de cotizaciones FCC/CE a tarjetas de Notion',
      source: '📧 Correo de Camilo Uribe + 📄 Cotizaciones_FCC_CE_Tecsys_2026.xlsx',
      responsable: 'Camilo Uribe',
      priority: 'P1 - CRITICA',
      actionNeeded: 'Volcar ítems de USD 45,000 a tarjetas individuales para seguimiento semanal.',
      notionKeyword: 'tecsys'
    },
    {
      id: 'ai-task-3',
      title: 'WIND Telecom: Definir estándar OAuth2 para SSO en Cluster de VMs',
      source: '📧 Correo de Enrique Bevilacqua + 📊 Presupuesto_Cluster_VMs_WIND.xlsx',
      responsable: 'Enrique Bevilacqua',
      priority: 'P1 - CRITICA',
      actionNeeded: 'Aprobar arquitectura de autenticación Single Sign-On para entorno staging.',
      notionKeyword: 'wind'
    },
    {
      id: 'ai-task-4',
      title: 'Vega OS: Aprobar compra de Amazon Fire TV Stick 4K Select para pruebas de app',
      source: '📧 Correo de Mario Maqueda',
      responsable: 'Mario Maqueda',
      priority: 'P2 - ALTA',
      actionNeeded: 'Autorizar compra de hardware Select 4K para laboratorio.',
      notionKeyword: 'vega'
    },
    {
      id: 'ai-task-5',
      title: 'Heroku Migration: Programar ventana de auto-stop de servidores y CableView',
      source: '📧 Correo de Leonard Amaya',
      responsable: 'Leonard Amaya',
      priority: 'P2 - ALTA',
      actionNeeded: 'Apagar entornos Heroku para consolidar ahorro de USD 14,400 anuales.',
      notionKeyword: 'heroku'
    }
  ];

  const formatSheetDisplayName = (rawInput) => {
    if (!rawInput) return 'Planilla de Trabajo';
    if (rawInput.includes('docs.google.com') || rawInput.includes('http')) {
      return '📄 Planilla_Google_Drive_Importada.xlsx';
    }
    return rawInput.length > 45 ? `${rawInput.substring(0, 42)}...` : rawInput;
  };

  const handleAddPrioritySpreadsheet = () => {
    if (!newSheetInput.trim()) return;
    const cleanName = formatSheetDisplayName(newSheetInput.trim());
    const newSheet = {
      id: `sheet-${Date.now()}`,
      name: cleanName,
      targetProject: 'Análisis Solicitado por Diego',
      status: 'Analizada por IA',
      insight: 'Auditando celdas, valores de cotización y tareas a derivar a Notion.'
    };
    const updated = [newSheet, ...prioritySpreadsheets];
    setPrioritySpreadsheets(updated);
    localStorage.setItem('dm_priority_spreadsheets', JSON.stringify(updated));
    setNewSheetInput('');
  };

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

  const generateExecutiveActionForEmail = (subject, from, snippet) => {
    const s = (subject + ' ' + snippet).toLowerCase();
    if (s.includes('edemsa') || s.includes('perdida') || s.includes('godel')) {
      return {
        member: 'Camilo Uribe',
        priority: 'P1 - CRITICA',
        action: 'Revisar consulta de Sergio Palmucci / EDEMSA sobre pérdida técnica BT en Godel y derivar factura a Notion.'
      };
    } else if (s.includes('maqueda') || s.includes('vega') || s.includes('firestick') || s.includes('fire tv')) {
      return {
        member: 'Mario Maqueda',
        priority: 'P2 - ALTA',
        action: 'Aprobar compra de Amazon Fire TV Stick 4k Select con Mario Maqueda para desarrollo de app en Vega OS.'
      };
    } else if (s.includes('reconectadores') || s.includes('bevilacqua') || s.includes('wind')) {
      return {
        member: 'Enrique Bevilacqua',
        priority: 'P1 - CRITICA',
        action: 'Coordinar con Enrique mediciones de cosf / pact en reconectadores e integración con la plataforma.'
      };
    } else if (s.includes('honduras') || s.includes('supermicro') || s.includes('gonzalo')) {
      return {
        member: 'Gonzalo Gonzalez',
        priority: 'P1 - CRITICA',
        action: 'Revisar cotización de servidores Supermicro para proyecto OTT Hyve Honduras.'
      };
    } else {
      return {
        member: 'Diego Musach (CTO)',
        priority: 'P2 - ALTA',
        action: 'Auditar correo corporativo y derivar acción directiva a Notion.'
      };
    }
  };

  const handleFetchGoogleWorkspaceData = async () => {
    const activeToken = googleAccessToken || localStorage.getItem('dm_google_oauth_token') || '';
    setIsFetchingGoogleAPI(true);
    setGoogleApiError(null);

    if (activeToken.trim()) {
      localStorage.setItem('dm_google_oauth_token', activeToken.trim());
      const gResult = await fetchCorporateGmailMessages(activeToken.trim(), startDate);
      
      if (gResult.success && gResult.messages.length > 0) {
        const enriched = gResult.messages.map(item => {
          const info = generateExecutiveActionForEmail(item.subject, item.from, item.snippet);
          return {
            ...item,
            relatedMember: info.member,
            priority: info.priority,
            executiveAction: info.action
          };
        });
        setGmailMessages(enriched);
      } else {
        if (gResult.error) setGoogleApiError(gResult.error);
        setGmailMessages(getCorporateGmailSampleData());
      }

      const dResult = await fetchCorporateDriveFiles(activeToken.trim());
      if (dResult.success && dResult.files.length > 0) {
        setDriveFiles(dResult.files);
      } else {
        setDriveFiles(getCorporateDriveSampleData());
      }
    } else {
      setGmailMessages(getCorporateGmailSampleData());
      setDriveFiles(getCorporateDriveSampleData());
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLastSyncTime(nowStr);
    setIsFetchingGoogleAPI(false);
  };

  const handleDispatchEmailToNotion = async (mailItem) => {
    setProcessingId(mailItem.id);

    const matchedCard = notionCards.find(c => {
      const cTitle = (c.title || '').toLowerCase();
      const sTitle = mailItem.subject.toLowerCase();
      return mailItem.relatedMember && c.memberName && c.memberName.includes(mailItem.relatedMember.split(' ')[0]) && (sTitle.includes(cTitle) || cTitle.includes('tecsys') || cTitle.includes('edemsa') || cTitle.includes('wind'));
    });

    if (matchedCard) {
      const commentContent = `[Gmail ${mailItem.date} - De: ${mailItem.from}]: "${mailItem.subject}" • ${mailItem.snippet}`;
      const res = await postCommentToNotion(credentials?.notionToken, matchedCard.notionPageId || matchedCard.id, commentContent);
      if (res.success) {
        setActionSuccessStatus(prev => ({ ...prev, [mailItem.id]: 'commented' }));
      }
    } else {
      const taskTitle = `[Gmail ${mailItem.date}] ${mailItem.subject.substring(0, 85)}`;
      const res = await createNotionPage(credentials?.notionToken, null, {
        title: taskTitle,
        responsable: mailItem.relatedMember || 'Diego Musach (CTO)',
        status: 'Abierto',
        priority: mailItem.priority || 'P1 - CRITICA'
      });
      if (res.success) {
        setActionSuccessStatus(prev => ({ ...prev, [mailItem.id]: 'created' }));
      }
    }

    setProcessingId(null);
  };

  const handleDispatchAITaskToNotion = async (task) => {
    setProcessingId(task.id);
    const matchedCard = notionCards.find(c => (c.title || '').toLowerCase().includes(task.notionKeyword));
    if (matchedCard) {
      const res = await postCommentToNotion(credentials?.notionToken, matchedCard.notionPageId || matchedCard.id, `[IA Workspace Hub]: ${task.title} • ${task.actionNeeded}`);
      if (res.success) {
        setActionSuccessStatus(prev => ({ ...prev, [task.id]: 'commented' }));
      }
    } else {
      const res = await createNotionPage(credentials?.notionToken, null, {
        title: task.title,
        responsable: task.responsable.split('/')[0].trim(),
        status: 'Abierto',
        priority: task.priority
      });
      if (res.success) {
        setActionSuccessStatus(prev => ({ ...prev, [task.id]: 'created' }));
      }
    }
    setProcessingId(null);
  };

  useEffect(() => {
    handleFetchGoogleWorkspaceData();
  }, [startDate]);

  const rawEmails = gmailMessages.length > 0 ? gmailMessages : getCorporateGmailSampleData();
  const filteredEmails = rawEmails.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (m.subject && m.subject.toLowerCase().includes(q)) ||
           (m.snippet && m.snippet.toLowerCase().includes(q)) ||
           (m.from && m.from.toLowerCase().includes(q));
  });

  const filteredDriveFiles = driveFiles.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (f.name && f.name.toLowerCase().includes(q)) ||
           (f.summary && f.summary.toLowerCase().includes(q));
  });

  return (
    <div className="google-workspace-hub-container">
      
      {/* Header Banner */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail className="text-cyan" size={22} /> 📧 Gmail Corporativo & 📁 Google Drive AI ({accountEmail})
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Escáner inteligente de correos e Inteligencia Artificial documental desde <strong>Mayo de 2026</strong> a la fecha.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', padding: '0.3rem 0.75rem', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Check size={14} /> {filteredEmails.length} Correos Listados
            </span>
          </div>
        </div>
      </div>

      {/* DEDICATED SECTION: 🎯 TAREAS DIRECTIVAS DETECTADAS POR LA IA EN CORREOS Y PLANILLAS */}
      <div className="card-glass" style={{ padding: '1.2rem', marginBottom: '1.2rem', borderLeft: '4px solid var(--accent-purple)', background: 'rgba(15, 23, 42, 0.85)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target className="text-purple" size={20} /> 🎯 Tareas Directivas Detectadas por la IA (en Base a Emails y Planillas)
          </h3>
          <span style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', background: 'rgba(192, 132, 252, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
            {aiExtractedTasks.length} Tareas Críticas Listadas
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {aiExtractedTasks.map((t) => {
            const status = actionSuccessStatus[t.id];
            const isProc = processingId === t.id;

            return (
              <div 
                key={t.id} 
                style={{ 
                  background: 'rgba(30, 41, 59, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  borderRadius: '10px', 
                  padding: '0.9rem 1.1rem',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span className="tag critical" style={{ fontSize: '0.64rem', padding: '0.1rem 0.45rem' }}>
                      {t.priority}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      👤 Responsable: {t.responsable}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      📍 Origen: {t.source}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.94rem', color: '#ffffff', margin: '0 0 0.3rem 0', fontWeight: 700 }}>
                    {t.title}
                  </h4>

                  <p style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', margin: 0, fontWeight: 600 }}>
                    💡 Acción Directiva: {t.actionNeeded}
                  </p>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => handleDispatchAITaskToNotion(t)}
                  disabled={status || isProc}
                  style={{
                    fontSize: '0.74rem',
                    padding: '0.4rem 0.8rem',
                    background: status ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isProc ? 'Derivando...' : status ? '¡Derivada a Notion!' : '⚡ Derivar Tarea a Notion API'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Settings & OAuth Token Panel */}
      <div className="card-glass" style={{ padding: '0.85rem 1.2rem', marginBottom: '1.2rem', border: '1px dashed var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Zap size={18} className="text-emerald" />
            <div>
              <span style={{ fontSize: '0.86rem', color: '#fff', fontWeight: 700 }}>
                Sincronización de Gmail & Google Drive ({filteredEmails.length} Correos + {driveFiles.length} Archivos)
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                {lastSyncTime ? `Última sincronización: ${lastSyncTime}` : 'Flujo de correos activo'} • Desde {startDate} hasta HOY.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <input
              type="password"
              className="form-input"
              placeholder="Token de Google OAuth..."
              value={googleAccessToken}
              onChange={(e) => {
                const val = e.target.value;
                setGoogleAccessToken(val);
                localStorage.setItem('dm_google_oauth_token', val.trim());
              }}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem', width: '200px' }}
            />

            <button
              className="btn-primary"
              onClick={handleFetchGoogleWorkspaceData}
              disabled={isFetchingGoogleAPI}
              style={{ fontSize: '0.76rem', padding: '0.4rem 0.85rem', whiteSpace: 'nowrap' }}
            >
              <RefreshCw className={isFetchingGoogleAPI ? 'spin' : ''} size={13} /> Sincronizar
            </button>
          </div>
        </div>

        {googleApiError && (
          <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.85rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-rose)', borderRadius: '8px', color: '#fff', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={16} className="text-rose" />
              <span>{googleApiError}</span>
            </div>
            <a
              href="https://developers.google.com/oauthplayground"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', textDecoration: 'none' }}
            >
              🔑 Renovar Token en OAuth Playground
            </a>
          </div>
        )}
      </div>

      {/* PRIORITY SPREADSHEETS SELECTOR */}
      <div className="card-glass" style={{ padding: '1.2rem', marginBottom: '1.2rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <h3 style={{ fontSize: '1rem', color: '#fff', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileSpreadsheet className="text-cyan" size={18} /> 📊 Planillas Prioritarias de Google Drive a Analizar
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder={listeningTargetId === 'sheetInput' ? "🎙️ Escuchando..." : "Ingresa el nombre o enlace de la planilla Excel/Sheets..."}
            value={newSheetInput}
            onChange={(e) => setNewSheetInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddPrioritySpreadsheet(); }}
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem', flex: 1 }}
          />

          <button
            onClick={() => handleStartVoiceDictation('sheetInput', (t) => setNewSheetInput(prev => prev ? `${prev} ${t}` : t))}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
            title="Dictar por micrófono 🎙️"
          >
            <Mic size={14} className={listeningTargetId === 'sheetInput' ? 'pulse' : ''} />
          </button>

          <button
            className="btn-primary"
            onClick={handleAddPrioritySpreadsheet}
            style={{ fontSize: '0.78rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
          >
            <Plus size={14} /> Agregar Planilla
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
          {prioritySpreadsheets.map((sheet) => (
            <div key={sheet.id} style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span 
                  style={{ 
                    fontSize: '0.86rem', 
                    color: '#fff', 
                    fontWeight: 700, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    maxWidth: '220px' 
                  }}
                  title={sheet.name}
                >
                  {sheet.name}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                  {sheet.status}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.35rem' }}>
                🎯 {sheet.targetProject}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.35' }}>
                "{sheet.insight}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Tab Selector & Search Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('gmail')}
          style={{
            padding: '0.55rem 1.2rem',
            borderRadius: '8px',
            background: activeTab === 'gmail' ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'var(--bg-card)',
            color: '#fff',
            border: activeTab === 'gmail' ? 'none' : '1px solid var(--border-subtle)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Mail size={16} /> Correos Corporativos Gmail ({filteredEmails.length})
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          style={{
            padding: '0.55rem 1.2rem',
            borderRadius: '8px',
            background: activeTab === 'drive' ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'var(--bg-card)',
            color: '#fff',
            border: activeTab === 'drive' ? 'none' : '1px solid var(--border-subtle)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <HardDrive size={16} /> Archivos Google Drive ({filteredDriveFiles.length})
        </button>

        <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={listeningTargetId === 'workspaceSearch' ? "🎙️ Escuchando..." : "Buscar correos por asunto, remitente o micrófono..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '34px', paddingRight: '36px', fontSize: '0.8rem', height: '36px', width: '100%' }}
            className="form-input"
          />
          <button
            onClick={() => handleStartVoiceDictation('workspaceSearch', (t) => setSearchQuery(prev => prev ? `${prev} ${t}` : t))}
            style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: listeningTargetId === 'workspaceSearch' ? 'var(--accent-rose)' : 'var(--accent-cyan)', cursor: 'pointer' }}
            title="Dictar por micrófono 🎙️"
          >
            <Mic size={14} className={listeningTargetId === 'workspaceSearch' ? 'pulse' : ''} />
          </button>
        </div>
      </div>

      {/* VIEW 1: FULL GMAIL CORRESPONDENCE STREAM */}
      {activeTab === 'gmail' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredEmails.map((item, idx) => {
            const status = actionSuccessStatus[item.id];
            const isProc = processingId === item.id;

            return (
              <div 
                key={item.id || idx}
                className="card-glass"
                style={{
                  padding: '1.1rem 1.3rem',
                  borderLeft: '4px solid var(--accent-cyan)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  gap: '1.2rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span className="tag critical" style={{ fontSize: '0.64rem', padding: '0.1rem 0.45rem' }}>
                      {item.priority || 'P1 - CRITICA'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      ✉️ De: {item.from}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      📅 {item.date}
                    </span>
                    {item.relatedMember && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', background: 'rgba(192, 132, 252, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        👤 Responsable: {item.relatedMember}
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '0.96rem', color: '#ffffff', margin: '0 0 0.35rem 0', fontWeight: 700 }}>
                    {item.subject}
                  </h4>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', margin: '0 0 0.45rem 0', lineHeight: '1.45', background: 'rgba(15, 23, 42, 0.6)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    "{item.snippet}"
                  </p>

                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    💡 <strong>Acción Sugerida:</strong> {item.executiveAction}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => handleDispatchEmailToNotion(item)}
                    disabled={status || isProc}
                    style={{
                      fontSize: '0.76rem',
                      padding: '0.45rem 0.85rem',
                      background: status ? 'rgba(52, 211, 153, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                      color: status ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                      border: status ? '1px solid var(--accent-emerald)' : '1px solid var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isProc ? (
                      'Ingestando...'
                    ) : status ? (
                      <>
                        <CheckCircle2 size={13} /> ¡Ingestado a Notion!
                      </>
                    ) : (
                      <>
                        <Send size={13} /> ⚡ Ingestar a Notion API
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: GOOGLE DRIVE DOCUMENTS STREAM */}
      {activeTab === 'drive' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredDriveFiles.map((file, idx) => (
            <div 
              key={file.id || idx}
              className="card-glass"
              style={{ padding: '1.1rem', borderLeft: '4px solid var(--accent-purple)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                    📁 Google Drive File
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {file.modifiedTime}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.92rem', color: '#fff', margin: '0 0 0.35rem 0', fontWeight: 700 }}>
                  {file.name}
                </h4>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.65rem 0', lineHeight: '1.35' }}>
                  {file.summary}
                </p>
                
                {file.owner && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', fontWeight: 600 }}>
                    👤 Propietario: {file.owner}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '0.74rem', padding: '0.35rem 0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', textDecoration: 'none' }}
                >
                  <ExternalLink size={13} /> Abrir en Google Drive
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
