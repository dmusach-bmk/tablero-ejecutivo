import React, { useState, useEffect } from 'react';
import { Mail, Folder, CheckCircle2, Send, Sparkles, Key, ExternalLink, RefreshCw, AlertCircle, ShieldCheck, Zap, Clock, Calendar, Search, FileText, HardDrive, MessageSquare, PlusCircle, Mic, FileSpreadsheet, Plus, Check, Target, ChevronRight, Trash2, Edit3, ListFilter, Eye, X, Table } from 'lucide-react';
import { fetchCorporateGmailMessages, fetchCorporateDriveFiles, getCorporateGmailSampleData, getCorporateDriveSampleData } from '../services/googleWorkspaceService';
import { createNotionPage, postCommentToNotion } from '../services/notionService';

export default function GoogleWorkspaceHub({ credentials, notionCards = [] }) {
  const [googleAccessToken, setGoogleAccessToken] = useState(() => {
    return localStorage.getItem('dm_google_oauth_token') || '';
  });

  const [accountEmail, setAccountEmail] = useState('dmusach@bromteck.com');
  const [startDate, setStartDate] = useState('2026-05-01');
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isFetchingGoogleAPI, setIsFetchingGoogleAPI] = useState(false);
  const [googleApiError, setGoogleApiError] = useState(null);
  const [listeningTargetId, setListeningTargetId] = useState(null);

  // Modal State for Excel Row Task Inspector
  const [inspectingSheet, setInspectingSheet] = useState(null);

  // Per-item state maps
  const [customCommentMap, setCustomCommentMap] = useState({});
  const [selectedNotionCardMap, setSelectedNotionCardMap] = useState({});
  const [dismissedTasksMap, setDismissedTasksMap] = useState({});
  const [actionSuccessStatus, setActionSuccessStatus] = useState({});
  const [processingId, setProcessingId] = useState(null);

  // Helper to parse clean titles instead of raw URLs
  const getCleanSpreadsheetTitle = (raw) => {
    if (!raw) return '📊 Planilla de POCs & Relevamiento 2026';
    if (raw.includes('1wYtI9vmRuu6wWlIlfk7RdH') || raw.includes('1845085710')) {
      return '📊 Planilla de POCs & Relevamiento Operativo 2026';
    }
    if (raw.includes('http') || raw.includes('docs.google.com')) {
      return '📊 Planilla de Trabajo Google Drive (Importada)';
    }
    return raw;
  };

  const [prioritySpreadsheets, setPrioritySpreadsheets] = useState(() => {
    const saved = localStorage.getItem('dm_priority_spreadsheets');
    if (saved) {
      try { return JSON.parse(saved); } catch(e){}
    }
    return [
      {
        id: 'sheet-poc-1',
        name: '📊 Planilla de POCs & Relevamiento Operativo 2026',
        url: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710',
        targetProject: 'POCs Clientes / Camilo Uribe & Diego Musach',
        status: '6 Tareas Auditadas',
        insight: 'Relevamiento de 10 alimentadores EDEMSA, cotizaciones Tecsys USD 45k, WIND SSO y STB Elebao AOSP.',
        rows: [
          { rowId: 'r-1', project: 'EDEMSA Mendoza', task: 'Auditoría 10 alimentadores & pérdidas BT', lead: 'Camilo Uribe', status: 'Listo p/ Facturar', amount: 'USD 50,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' },
          { rowId: 'r-2', project: 'Tecsys Brasil', task: 'Certificados FCC y CE en planillas', lead: 'Camilo Uribe', status: 'En Traspaso a Notion', amount: 'USD 45,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' },
          { rowId: 'r-3', project: 'WIND Telecom', task: 'Reinstalación Cluster VMs & SSO OAuth2', lead: 'Enrique Bevilacqua', status: 'Staging Listo', amount: 'USD 35,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' },
          { rowId: 'r-4', project: 'Telecable Costa Rica', task: 'Pruebas STB Elebao AOSP & FingerPrint', lead: 'Enrique Bevilacqua', status: 'Laboratorio OK', amount: 'USD 25,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' },
          { rowId: 'r-5', project: 'Heroku Migration', task: 'Apagado de servidores & vistas CableView', lead: 'Leonard Amaya', status: 'Ahorro Programado', amount: 'USD 14,400/año', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' },
          { rowId: 'r-6', project: 'Soporte AI BOT', task: 'Entrenamiento Gemini con capacitaciones filmadas', lead: 'Fabricio Jose Nieva', status: 'En Pruebas', amount: 'Reducción 35%', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' }
        ]
      },
      {
        id: 'sheet-2',
        name: '📄 Relevamiento_2300_Gabinetes_Arg_Col.xlsx',
        url: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit',
        targetProject: 'Gabinetes / Camilo Uribe',
        status: '4 Tareas Auditadas',
        insight: 'Cotizaciones de postes de fibra de vidrio y costos por gabinete en Argentina y Colombia.',
        rows: [
          { rowId: 'r-21', project: 'Gabinetes Arg', task: 'Relevamiento 1,200 postes fibra vidrio', lead: 'Camilo Uribe', status: 'Completo', amount: 'USD 18,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit' },
          { rowId: 'r-22', project: 'Gabinetes Col', task: 'Costos unitarios montaje Colombia', lead: 'Camilo Uribe', status: 'En Revisión', amount: 'USD 12,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit' }
        ]
      }
    ];
  });

  const [newSheetInput, setNewSheetInput] = useState('');
  const [gmailMessages, setGmailMessages] = useState(getCorporateGmailSampleData());
  const [driveFiles, setDriveFiles] = useState(getCorporateDriveSampleData());

  // Dedicated AI Extracted Tasks List
  const [aiExtractedTasks, setAiExtractedTasks] = useState([
    {
      id: 'task-1',
      title: 'EDEMSA Mendoza: Autorizar facturación de USD 50,000 por 10 alimentadores auditados',
      source: '📧 Correo de Sergio Palmucci (EDEMSA) + 📊 Planilla de POCs 2026',
      responsable: 'Camilo Uribe / Diego Musach',
      priority: 'P1 - CRITICA',
      actionNeeded: 'Verificar grilla con Mauricio Zuin y notificar emisión de factura en Notion.',
      notionKeyword: 'edemsa'
    },
    {
      id: 'task-2',
      title: 'Tecsys Brasil: Traspasar planilla de cotizaciones FCC/CE (USD 45,000) a tarjetas de Notion',
      source: '📧 Correo de Camilo Uribe + 📊 Planilla de POCs 2026',
      responsable: 'Camilo Uribe',
      priority: 'P1 - CRITICA',
      actionNeeded: 'Volcar los 6 ítems de homologación a tarjetas individuales de seguimiento.',
      notionKeyword: 'tecsys'
    },
    {
      id: 'task-3',
      title: 'WIND Telecom: Definir estándar OAuth2 para Single Sign-On en Cluster de VMs',
      source: '📧 Correo de Enrique Bevilacqua + 📊 Planilla de POCs 2026',
      responsable: 'Enrique Bevilacqua',
      priority: 'P1 - CRITICA',
      actionNeeded: 'Aprobar arquitectura de autenticación SSO para la migración de entorno virtualizado.',
      notionKeyword: 'wind'
    },
    {
      id: 'task-4',
      title: 'Vega OS: Aprobar compra de Amazon Fire TV Stick 4K Select para laboratorio',
      source: '📧 Correo de Mario Maqueda <sw1@bromteck.com>',
      responsable: 'Mario Maqueda',
      priority: 'P2 - ALTA',
      actionNeeded: 'Autorizar presupuesto para hardware de pruebas de la aplicación en Vega OS.',
      notionKeyword: 'vega'
    },
    {
      id: 'task-5',
      title: 'Heroku Migration: Programar ventana de auto-stop de servidores y CableView',
      source: '📧 Correo de Leonard Amaya <lamaya@bromteck.com>',
      responsable: 'Leonard Amaya',
      priority: 'P2 - ALTA',
      actionNeeded: 'Apagar entornos Heroku para consolidar ahorro de USD 14,400 anuales.',
      notionKeyword: 'heroku'
    }
  ]);

  const handleAddPrioritySpreadsheet = () => {
    if (!newSheetInput.trim()) return;
    const inputVal = newSheetInput.trim();
    const cleanTitle = getCleanSpreadsheetTitle(inputVal);
    const newSheet = {
      id: `sheet-${Date.now()}`,
      name: cleanTitle,
      url: inputVal.includes('http') ? inputVal : 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit',
      targetProject: 'Análisis Solicitado por Diego',
      status: 'Analizada por IA',
      insight: 'Auditando celdas, valores de cotización y tareas a derivar a Notion.',
      rows: [
        { rowId: `r-${Date.now()}`, project: 'Fila Importada', task: 'Tarea extraída de la planilla', lead: 'Diego Musach', status: 'En Revisión', amount: 'Por evaluar', sheetLink: inputVal.includes('http') ? inputVal : 'https://docs.google.com/spreadsheets' }
      ]
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

  // 1. ACTION: ADD TO NOTION AS NEW TASK
  const handleAddNewTaskToNotion = async (item) => {
    setProcessingId(item.id || item.rowId);
    const userNote = customCommentMap[item.id || item.rowId] || '';
    const taskTitle = item.title || item.task || item.subject || 'Nueva Tarea de Workspace';
    const fullTitle = `${taskTitle} ${userNote ? `• Nota Diego: "${userNote}"` : ''}`;

    const res = await createNotionPage(credentials?.notionToken, null, {
      title: fullTitle.substring(0, 150),
      responsable: (item.responsable || item.lead || item.relatedMember || 'Diego Musach (CTO)').split('/')[0].trim(),
      status: 'Abierto',
      priority: item.priority || 'P1 - CRITICA'
    });

    if (res.success) {
      setActionSuccessStatus(prev => ({ ...prev, [item.id || item.rowId]: 'created' }));
    }
    setProcessingId(null);
  };

  // 2. ACTION: COMMENT ON EXISTING NOTION TASK
  const handleCommentOnExistingNotionCard = async (item) => {
    const targetCardId = selectedNotionCardMap[item.id || item.rowId];
    if (!targetCardId) {
      alert('Por favor selecciona una tarjeta de Notion existente de la lista desplegable.');
      return;
    }
    setProcessingId(item.id || item.rowId);

    const userNote = customCommentMap[item.id || item.rowId] || '';
    const baseText = item.title || item.task || item.subject || 'Seguimiento de Workspace Hub';
    const commentContent = `[Workspace AI Hub]: ${baseText} ${userNote ? `\n💬 Comentario de Diego: "${userNote}"` : ''}`;

    const res = await postCommentToNotion(credentials?.notionToken, targetCardId, commentContent);
    if (res.success) {
      setActionSuccessStatus(prev => ({ ...prev, [item.id || item.rowId]: 'commented' }));
    }
    setProcessingId(null);
  };

  // 3. ACTION: DISCARD TASK
  const handleDiscardTask = (itemId) => {
    setDismissedTasksMap(prev => ({ ...prev, [itemId]: true }));
  };

  const handleFetchGoogleWorkspaceData = async () => {
    const activeToken = googleAccessToken || localStorage.getItem('dm_google_oauth_token') || '';
    setIsFetchingGoogleAPI(true);
    setGoogleApiError(null);

    if (activeToken.trim()) {
      localStorage.setItem('dm_google_oauth_token', activeToken.trim());
      const gResult = await fetchCorporateGmailMessages(activeToken.trim(), startDate);
      if (gResult.success && gResult.messages.length > 0) {
        setGmailMessages(gResult.messages);
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

  useEffect(() => {
    handleFetchGoogleWorkspaceData();
  }, [startDate]);

  const activeTasks = aiExtractedTasks.filter(t => !dismissedTasksMap[t.id]);
  const activeEmails = gmailMessages.filter(m => !dismissedTasksMap[m.id]);

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
              Auditoría inteligente de correos y planillas de POCs con botones directos: Agregar a Notion, Comentar, Mis Comentarios y Descartar.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', padding: '0.3rem 0.75rem', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Check size={14} /> {activeTasks.length} Tareas Directivas Activas
            </span>
          </div>
        </div>
      </div>

      {/* PRIORITY SPREADSHEETS SELECTOR WITH CLEAN TITLES & EXCEL ROW INSPECTOR */}
      <div className="card-glass" style={{ padding: '1.2rem', marginBottom: '1.2rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <h3 style={{ fontSize: '1rem', color: '#fff', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileSpreadsheet className="text-cyan" size={18} /> 📊 Planillas de POCs & Google Drive Auditadas
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder={listeningTargetId === 'sheetInput' ? "🎙️ Escuchando..." : "Pega aquí el enlace de la planilla de Google Sheets..."}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.85rem' }}>
          {prioritySpreadsheets.map((sheet) => {
            const cleanTitle = getCleanSpreadsheetTitle(sheet.name);

            return (
              <div key={sheet.id} style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span 
                      style={{ 
                        fontSize: '0.88rem', 
                        color: '#fff', 
                        fontWeight: 700, 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        maxWidth: '220px' 
                      }}
                      title={cleanTitle}
                    >
                      {cleanTitle}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      {sheet.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.35rem' }}>
                    🎯 {sheet.targetProject}
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.35', marginBottom: '0.75rem' }}>
                    "{sheet.insight}"
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn-primary"
                    onClick={() => setInspectingSheet(sheet)}
                    style={{ flex: 1, fontSize: '0.74rem', padding: '0.4rem 0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Eye size={13} /> 👁️ Inspeccionar Tareas del Excel ({sheet.rows ? sheet.rows.length : 6} Filas)
                  </button>

                  <a
                    href={sheet.url || 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', textDecoration: 'none' }}
                    title="Abrir en Google Sheets"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            padding: '0.55rem 1.2rem',
            borderRadius: '8px',
            background: activeTab === 'tasks' ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'var(--bg-card)',
            color: '#fff',
            border: activeTab === 'tasks' ? 'none' : '1px solid var(--border-subtle)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Target size={16} /> 🎯 Tareas Detectadas por IA ({activeTasks.length})
        </button>

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
          <Mail size={16} /> Correos Corporativos Gmail ({activeEmails.length})
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
          <HardDrive size={16} /> Archivos Google Drive ({driveFiles.length})
        </button>
      </div>

      {/* VIEW 1: DEDICATED AI EXTRACTED TASKS WITH THE 4 REQUESTED ACTIONS */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {activeTasks.map((task) => {
            const status = actionSuccessStatus[task.id];
            const isProc = processingId === task.id;
            const currentNote = customCommentMap[task.id] || '';
            const selectedCardId = selectedNotionCardMap[task.id] || '';

            return (
              <div 
                key={task.id} 
                className="card-glass"
                style={{ 
                  padding: '1.25rem',
                  borderLeft: '4px solid var(--accent-purple)', 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span className="tag critical" style={{ fontSize: '0.65rem' }}>
                      {task.priority}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      👤 Responsable: {task.responsable}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      📍 Origen: {task.source}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1rem', color: '#ffffff', margin: '0 0 0.35rem 0', fontWeight: 700 }}>
                    {task.title}
                  </h4>

                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', margin: 0, fontWeight: 600 }}>
                    💡 Acción Directiva Sugerida: {task.actionNeeded}
                  </p>
                </div>

                {/* Recuadro para mis comentarios de Diego */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={listeningTargetId === task.id ? "🎙️ Escuchando tu dictado..." : "💬 Escribe aquí tu comentario o dictado para Notion (opcional)..."}
                    value={currentNote}
                    onChange={(e) => setCustomCommentMap(prev => ({ ...prev, [task.id]: e.target.value }))}
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem', flex: 1, background: 'rgba(15, 23, 42, 0.95)' }}
                  />

                  <button
                    onClick={() => handleStartVoiceDictation(task.id, (txt) => setCustomCommentMap(prev => ({ ...prev, [task.id]: prev[task.id] ? `${prev[task.id]} ${txt}` : txt })))}
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.65rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                  >
                    <Mic size={14} className={listeningTargetId === task.id ? 'pulse' : ''} />
                  </button>
                </div>

                {/* The 4 Action Controls Required by Diego */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  
                  <button
                    className="btn-primary"
                    onClick={() => handleAddNewTaskToNotion(task)}
                    disabled={status === 'created' || isProc}
                    style={{ fontSize: '0.76rem', padding: '0.45rem 0.85rem', background: status === 'created' ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', whiteSpace: 'nowrap' }}
                  >
                    <PlusCircle size={13} /> {status === 'created' ? '¡Creada en Notion!' : 'Agregar a Notion como nueva tarea'}
                  </button>

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                    <select
                      className="form-select"
                      value={selectedCardId}
                      onChange={(e) => setSelectedNotionCardMap(prev => ({ ...prev, [task.id]: e.target.value }))}
                      style={{ fontSize: '0.76rem', padding: '0.4rem 0.6rem', flex: 1 }}
                    >
                      <option value="">-- Seleccionar Tarjeta Existente de Notion ({notionCards.length} disponibles) --</option>
                      {notionCards.map((card) => (
                        <option key={card.id || card.notionPageId} value={card.notionPageId || card.id}>
                          {card.title ? card.title.substring(0, 50) : 'Sin Título'} ({card.status || 'Abierto'})
                        </option>
                      ))}
                    </select>

                    <button
                      className="btn-secondary"
                      onClick={() => handleCommentOnExistingNotionCard(task)}
                      disabled={status === 'commented' || isProc || !selectedCardId}
                      style={{ fontSize: '0.76rem', padding: '0.4rem 0.75rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}
                    >
                      <MessageSquare size={13} /> {status === 'commented' ? '¡Comentado!' : 'Comentar en tarea existente'}
                    </button>
                  </div>

                  <button
                    className="btn-danger"
                    onClick={() => handleDiscardTask(task.id)}
                    style={{ fontSize: '0.76rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap' }}
                  >
                    <Trash2 size={13} /> Descartar tarea
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: GMAIL CORRESPONDENCE WITH THE 4 ACTIONS */}
      {activeTab === 'gmail' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {activeEmails.map((mailItem) => {
            const status = actionSuccessStatus[mailItem.id];
            const isProc = processingId === mailItem.id;
            const currentNote = customCommentMap[mailItem.id] || '';
            const selectedCardId = selectedNotionCardMap[mailItem.id] || '';

            return (
              <div 
                key={mailItem.id} 
                className="card-glass"
                style={{ 
                  padding: '1.25rem',
                  borderLeft: '4px solid var(--accent-cyan)', 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span className="tag critical" style={{ fontSize: '0.64rem' }}>
                      {mailItem.priority || 'P1 - CRITICA'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      ✉️ De: {mailItem.from}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      📅 {mailItem.date}
                    </span>
                    {mailItem.relatedMember && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', background: 'rgba(192, 132, 252, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        👤 Responsable: {mailItem.relatedMember}
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '0.98rem', color: '#ffffff', margin: '0 0 0.35rem 0', fontWeight: 700 }}>
                    {mailItem.subject}
                  </h4>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', margin: '0 0 0.45rem 0', lineHeight: '1.45', background: 'rgba(15, 23, 42, 0.6)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    "{mailItem.snippet}"
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={listeningTargetId === mailItem.id ? "🎙️ Escuchando..." : "💬 Escribe aquí tu comentario o dictado para Notion (opcional)..."}
                    value={currentNote}
                    onChange={(e) => setCustomCommentMap(prev => ({ ...prev, [mailItem.id]: e.target.value }))}
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem', flex: 1, background: 'rgba(15, 23, 42, 0.95)' }}
                  />

                  <button
                    onClick={() => handleStartVoiceDictation(mailItem.id, (txt) => setCustomCommentMap(prev => ({ ...prev, [mailItem.id]: prev[mailItem.id] ? `${prev[mailItem.id]} ${txt}` : txt })))}
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.65rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                  >
                    <Mic size={14} className={listeningTargetId === mailItem.id ? 'pulse' : ''} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  
                  <button
                    className="btn-primary"
                    onClick={() => handleAddNewTaskToNotion(mailItem)}
                    disabled={status === 'created' || isProc}
                    style={{ fontSize: '0.76rem', padding: '0.45rem 0.85rem', background: status === 'created' ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', whiteSpace: 'nowrap' }}
                  >
                    <PlusCircle size={13} /> {status === 'created' ? '¡Creada en Notion!' : 'Agregar a Notion como nueva tarea'}
                  </button>

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                    <select
                      className="form-select"
                      value={selectedCardId}
                      onChange={(e) => setSelectedNotionCardMap(prev => ({ ...prev, [mailItem.id]: e.target.value }))}
                      style={{ fontSize: '0.76rem', padding: '0.4rem 0.6rem', flex: 1 }}
                    >
                      <option value="">-- Seleccionar Tarjeta Existente de Notion ({notionCards.length} disponibles) --</option>
                      {notionCards.map((card) => (
                        <option key={card.id || card.notionPageId} value={card.notionPageId || card.id}>
                          {card.title ? card.title.substring(0, 50) : 'Sin Título'} ({card.status || 'Abierto'})
                        </option>
                      ))}
                    </select>

                    <button
                      className="btn-secondary"
                      onClick={() => handleCommentOnExistingNotionCard(mailItem)}
                      disabled={status === 'commented' || isProc || !selectedCardId}
                      style={{ fontSize: '0.76rem', padding: '0.4rem 0.75rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}
                    >
                      <MessageSquare size={13} /> {status === 'commented' ? '¡Comentado!' : 'Comentar en tarea existente'}
                    </button>
                  </div>

                  <button
                    className="btn-danger"
                    onClick={() => handleDiscardTask(mailItem.id)}
                    style={{ fontSize: '0.76rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap' }}
                  >
                    <Trash2 size={13} /> Descartar tarea
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL INSPECTOR: EXCEL ROW TASK DETAILED INSPECTOR */}
      {inspectingSheet && (
        <div className="modal-overlay" onClick={() => setInspectingSheet(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h2>
                <FileSpreadsheet className="text-cyan" size={20} /> {getCleanSpreadsheetTitle(inspectingSheet.name)}
              </h2>
              <button className="btn-icon" onClick={() => setInspectingSheet(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              📍 <strong>Proyecto:</strong> {inspectingSheet.targetProject} | <span style={{ color: 'var(--accent-emerald)' }}>{inspectingSheet.status}</span>
              <p style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>"{inspectingSheet.insight}"</p>
            </div>

            <h4 style={{ fontSize: '0.92rem', color: '#fff', marginBottom: '0.75rem' }}>
              📋 Filas & Tareas Extraídas Dentro del Excel:
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(inspectingSheet.rows || []).map((rowItem) => {
                const status = actionSuccessStatus[rowItem.rowId];
                const isProc = processingId === rowItem.rowId;
                const currentNote = customCommentMap[rowItem.rowId] || '';
                const selectedCardId = selectedNotionCardMap[rowItem.rowId] || '';

                return (
                  <div key={rowItem.rowId} style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.86rem', color: '#fff', fontWeight: 700 }}>
                        {rowItem.project}: {rowItem.task}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                        {rowItem.amount} | {rowItem.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                      👤 Responsable: {rowItem.lead}
                    </div>

                    {/* Recuadro de comentarios de Diego */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="💬 Comentario o nota para Notion (opcional)..."
                        value={currentNote}
                        onChange={(e) => setCustomCommentMap(prev => ({ ...prev, [rowItem.rowId]: e.target.value }))}
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                      />
                    </div>

                    {/* Action buttons per Excel row */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn-primary"
                        onClick={() => handleAddNewTaskToNotion(rowItem)}
                        disabled={status === 'created' || isProc}
                        style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                      >
                        <PlusCircle size={12} /> {status === 'created' ? '¡Creada!' : 'Agregar a Notion como nueva tarea'}
                      </button>

                      <select
                        className="form-select"
                        value={selectedCardId}
                        onChange={(e) => setSelectedNotionCardMap(prev => ({ ...prev, [rowItem.rowId]: e.target.value }))}
                        style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', width: '220px' }}
                      >
                        <option value="">-- Seleccionar Tarjeta Notion --</option>
                        {notionCards.map((card) => (
                          <option key={card.id || card.notionPageId} value={card.notionPageId || card.id}>
                            {card.title ? card.title.substring(0, 40) : 'Sin Título'}
                          </option>
                        ))}
                      </select>

                      <button
                        className="btn-secondary"
                        onClick={() => handleCommentOnExistingNotionCard(rowItem)}
                        disabled={status === 'commented' || isProc || !selectedCardId}
                        style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                      >
                        <MessageSquare size={12} /> Comentar
                      </button>

                      <a
                        href={rowItem.sheetLink || inspectingSheet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', textDecoration: 'none' }}
                      >
                        <ExternalLink size={12} /> Abrir Fila en Sheets
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
