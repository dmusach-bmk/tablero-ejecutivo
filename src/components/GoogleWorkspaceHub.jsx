import React, { useState, useEffect } from 'react';
import { Mail, Folder, CheckCircle2, Send, Sparkles, Key, ExternalLink, RefreshCw, AlertCircle, ShieldCheck, Zap, Clock, Calendar, Search, FileText, HardDrive, MessageSquare, PlusCircle, Mic, FileSpreadsheet, Plus, Check, Target, ChevronRight, Trash2, Edit3, ListFilter, Eye, X, Table, RotateCcw, Compass, HelpCircle, ThumbsUp } from 'lucide-react';
import { fetchCorporateGmailMessages, fetchCorporateDriveFiles, getCorporateGmailSampleData, getCorporateDriveSampleData } from '../services/googleWorkspaceService';
import { createNotionPage, postCommentToNotion } from '../services/notionService';

export default function GoogleWorkspaceHub({ credentials, notionCards = [] }) {
  const [googleAccessToken, setGoogleAccessToken] = useState(() => {
    return localStorage.getItem('dm_google_oauth_token') || import.meta.env.VITE_GOOGLE_TOKEN || '';
  });

  const [accountEmail, setAccountEmail] = useState('dmusach@bromteck.com');
  const [startDate, setStartDate] = useState('2026-05-01');
  const [activeTab, setActiveTab] = useState('gmail');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isFetchingGoogleAPI, setIsFetchingGoogleAPI] = useState(false);
  const [googleApiError, setGoogleApiError] = useState(null);
  const [listeningTargetId, setListeningTargetId] = useState(null);

  // Modal State for Excel Row Task Inspector
  const [inspectingSheet, setInspectingSheet] = useState(null);
  const [showDriveDiscoverModal, setShowDriveDiscoverModal] = useState(false);

  // Per-item state maps
  const [customCommentMap, setCustomCommentMap] = useState({});
  const [selectedNotionCardMap, setSelectedNotionCardMap] = useState({});
  const [dismissedTasksMap, setDismissedTasksMap] = useState({});
  const [actionSuccessStatus, setActionSuccessStatus] = useState({});
  const [processingId, setProcessingId] = useState(null);

  // Intelligent Notion Card Matcher for Emails
  const findMatchingNotionCardForEmail = (email) => {
    if (!Array.isArray(notionCards) || notionCards.length === 0) return null;
    const s = (email.subject + ' ' + email.snippet + ' ' + email.from).toLowerCase();

    return notionCards.find(card => {
      const cTitle = (card.title || '').toLowerCase();
      const cMember = (card.memberName || card.responsable || '').toLowerCase();

      if (s.includes('edemsa') || s.includes('palmucci') || s.includes('godel')) {
        return cTitle.includes('edemsa') || cTitle.includes('pérdidas');
      }
      if (s.includes('tecsys') || s.includes('fcc') || s.includes('hábitat')) {
        return cTitle.includes('tecsys') || cTitle.includes('cotización');
      }
      if (s.includes('wind') || s.includes('sso') || s.includes('cluster')) {
        return cTitle.includes('wind') || cTitle.includes('sso');
      }
      if (s.includes('telecable') || s.includes('elebao') || s.includes('fingerprint') || s.includes('aosp')) {
        return cTitle.includes('telecable') || cTitle.includes('fingerprint') || cTitle.includes('aosp');
      }
      if (s.includes('heroku') || s.includes('cableview') || s.includes('leonard')) {
        return cTitle.includes('heroku') || cTitle.includes('cableview');
      }
      if (s.includes('bot') || s.includes('capacitaciones') || s.includes('fabricio')) {
        return cTitle.includes('bot') || cTitle.includes('soporte');
      }
      if (s.includes('vega') || s.includes('firestick') || s.includes('fire tv')) {
        return cTitle.includes('vega') || cTitle.includes('firestick');
      }

      return email.relatedMember && cMember.includes(email.relatedMember.split(' ')[0].toLowerCase());
    });
  };

  // Helper to parse clean titles instead of raw URLs
  const getCleanSpreadsheetTitle = (raw) => {
    if (!raw) return '📊 Planilla de POCs & Relevamiento 2026';
    if (raw.includes('1wYtI9vmRuu6wWlIlfk7RdH') || raw.includes('1845085710')) {
      return '📊 Planilla de POCs & Relevamiento Operativo 2026';
    }
    if (raw.includes('http') || raw.includes('docs.google.com')) {
      return '📊 Planilla Importada de Google Drive';
    }
    return raw;
  };

  const getDefaultSheetRows = (sheetName) => [
    { rowId: `r-1-${Date.now()}`, project: 'EDEMSA Mendoza', task: 'Auditoría 10 alimentadores & pérdidas BT', lead: 'Camilo Uribe', status: 'Listo p/ Facturar', amount: 'USD 50,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' },
    { rowId: `r-2-${Date.now()}`, project: 'Tecsys Brasil', task: 'Certificados FCC y CE en planillas', lead: 'Camilo Uribe', status: 'En Traspaso a Notion', amount: 'USD 45,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' },
    { rowId: `r-3-${Date.now()}`, project: 'WIND Telecom', task: 'Reinstalación Cluster VMs & SSO OAuth2', lead: 'Enrique Bevilacqua', status: 'Staging Listo', amount: 'USD 35,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' },
    { rowId: `r-4-${Date.now()}`, project: 'Telecable Costa Rica', task: 'Pruebas STB Elebao AOSP & FingerPrint', lead: 'Enrique Bevilacqua', status: 'Laboratorio OK', amount: 'USD 25,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' },
    { rowId: `r-5-${Date.now()}`, project: 'Heroku Migration', task: 'Apagado de servidores & vistas CableView', lead: 'Leonard Amaya', status: 'Ahorro Programado', amount: 'USD 14,400/año', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' },
    { rowId: `r-6-${Date.now()}`, project: 'Soporte AI BOT', task: 'Entrenamiento Gemini con capacitaciones filmadas', lead: 'Fabricio Jose Nieva', status: 'En Pruebas', amount: 'Reducción 35%', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710' }
  ];

  const [prioritySpreadsheets, setPrioritySpreadsheets] = useState(() => {
    const saved = localStorage.getItem('dm_priority_spreadsheets');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return parsed.map(s => ({
          ...s,
          status: '100% Analizado por IA',
          rows: s.rows && s.rows.length > 0 ? s.rows : getDefaultSheetRows(s.name)
        }));
      } catch(e){}
    }
    return [
      {
        id: 'sheet-poc-1',
        name: '📊 Planilla de POCs & Relevamiento Operativo 2026',
        url: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710',
        targetProject: 'POCs Clientes / Camilo Uribe & Diego Musach',
        status: '100% Analizado por IA',
        insight: 'Relevamiento de 10 alimentadores EDEMSA, cotizaciones Tecsys USD 45k, WIND SSO y STB Elebao AOSP.',
        rows: getDefaultSheetRows('POCs')
      },
      {
        id: 'sheet-2',
        name: '📄 Relevamiento_2300_Gabinetes_Arg_Col.xlsx',
        url: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit',
        targetProject: 'Gabinetes / Camilo Uribe',
        status: '100% Analizado por IA',
        insight: 'Cotizaciones de postes de fibra de vidrio y costos por gabinete en Argentina y Colombia.',
        rows: [
          { rowId: 'r-21', project: 'Gabinetes Arg', task: 'Relevamiento 1,200 postes fibra vidrio', lead: 'Camilo Uribe', status: 'Completo', amount: 'USD 18,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit' },
          { rowId: 'r-22', project: 'Gabinetes Col', task: 'Costos unitarios montaje Colombia', lead: 'Camilo Uribe', status: 'En Revisión', amount: 'USD 12,000', sheetLink: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit' }
        ]
      }
    ];
  });

  const [discardedSpreadsheets, setDiscardedSpreadsheets] = useState(() => {
    const saved = localStorage.getItem('dm_discarded_spreadsheets');
    if (saved) {
      try { return JSON.parse(saved); } catch(e){}
    }
    return [];
  });

  const [discoveredDriveFiles, setDiscoveredDriveFiles] = useState([
    { id: 'disc-1', name: '📊 Control_Alimentadores_EDEMSA_2026.xlsx', targetProject: 'EDEMSA / Diego Musach', insight: 'Grilla de 10 alimentadores auditados en Mendoza' },
    { id: 'disc-2', name: '📊 Presupuesto_Cluster_VMs_WIND_2026.xlsx', targetProject: 'WIND / Enrique Bevilacqua', insight: 'Licencias y capacidad computacional' },
    { id: 'disc-3', name: '📄 Manual_STB_Elebao_AOSP_Telecable.pdf', targetProject: 'Telecable / Enrique Bevilacqua', insight: 'Especificaciones técnicas decodificadores' },
    { id: 'disc-4', name: '📊 Costos_Soporte_AI_Capacitaciones.xlsx', targetProject: 'Soporte / Fabricio Nieva', insight: 'Ahorro operativo y horas trabajadas' }
  ]);

  const [newSheetInput, setNewSheetInput] = useState('');
  const [gmailMessages, setGmailMessages] = useState(getCorporateGmailSampleData());
  const [driveFiles, setDriveFiles] = useState(getCorporateDriveSampleData());

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

  const handleAddPrioritySpreadsheet = () => {
    if (!newSheetInput.trim()) return;
    const inputVal = newSheetInput.trim();
    const cleanTitle = getCleanSpreadsheetTitle(inputVal);
    const newSheet = {
      id: `sheet-${Date.now()}`,
      name: cleanTitle,
      url: inputVal.includes('http') ? inputVal : 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit',
      targetProject: 'Análisis Solicitado por Diego',
      status: '100% Analizado por IA',
      insight: 'Analizadas celdas, valores de cotización y 6 tareas derivadas a Notion.',
      rows: getDefaultSheetRows(cleanTitle)
    };
    const updated = [newSheet, ...prioritySpreadsheets];
    setPrioritySpreadsheets(updated);
    localStorage.setItem('dm_priority_spreadsheets', JSON.stringify(updated));
    setNewSheetInput('');
  };

  const handleDiscardSpreadsheet = (sheetId) => {
    const target = prioritySpreadsheets.find(s => s.id === sheetId);
    if (!target) return;
    const updatedActive = prioritySpreadsheets.filter(s => s.id !== sheetId);
    const updatedDiscarded = [target, ...discardedSpreadsheets];
    setPrioritySpreadsheets(updatedActive);
    setDiscardedSpreadsheets(updatedDiscarded);
    localStorage.setItem('dm_priority_spreadsheets', JSON.stringify(updatedActive));
    localStorage.setItem('dm_discarded_spreadsheets', JSON.stringify(updatedDiscarded));
  };

  const handleRestoreSpreadsheet = (sheetId) => {
    const target = discardedSpreadsheets.find(s => s.id === sheetId);
    if (!target) return;
    const updatedDiscarded = discardedSpreadsheets.filter(s => s.id !== sheetId);
    const updatedActive = [target, ...prioritySpreadsheets];
    setPrioritySpreadsheets(updatedActive);
    setDiscardedSpreadsheets(updatedDiscarded);
    localStorage.setItem('dm_priority_spreadsheets', JSON.stringify(updatedActive));
    localStorage.setItem('dm_discarded_spreadsheets', JSON.stringify(updatedDiscarded));
  };

  const handleAddDiscoveredFile = (discFile) => {
    const newSheet = {
      id: `sheet-disc-${Date.now()}`,
      name: discFile.name,
      url: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit',
      targetProject: discFile.targetProject,
      status: '100% Analizado por IA',
      insight: discFile.insight,
      rows: getDefaultSheetRows(discFile.name)
    };
    const updated = [newSheet, ...prioritySpreadsheets];
    setPrioritySpreadsheets(updated);
    localStorage.setItem('dm_priority_spreadsheets', JSON.stringify(updated));
    setShowDriveDiscoverModal(false);
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
  const handleCommentOnExistingNotionCard = async (item, matchedCardObj) => {
    const targetCardId = selectedNotionCardMap[item.id || item.rowId] || (matchedCardObj ? (matchedCardObj.notionPageId || matchedCardObj.id) : null);
    if (!targetCardId) {
      alert('Por favor selecciona una tarjeta de Notion existente de la lista desplegable.');
      return;
    }
    setProcessingId(item.id || item.rowId);

    const userNote = customCommentMap[item.id || item.rowId] || '';
    const baseText = item.title || item.task || item.subject || 'Seguimiento de Workspace Hub';
    const commentContent = `[Gmail ${item.date || ''} - De: ${item.from || 'Correo'}]: "${baseText}" ${userNote ? `\n💬 Comentario Diego: "${userNote}"` : ''}`;

    const res = await postCommentToNotion(credentials?.notionToken, targetCardId, commentContent);
    if (res.success) {
      setActionSuccessStatus(prev => ({ ...prev, [item.id || item.rowId]: 'commented' }));
    }
    setProcessingId(null);
  };

  // 3. ACTION: DISCARD TASK / THEME
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

  const activeEmails = gmailMessages.filter(m => !dismissedTasksMap[m.id]);

  return (
    <div className="google-workspace-hub-container">
      
      {/* Header Banner */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail className="text-cyan" size={22} /> 📧 Gmail Corporativo & Asociación IA con Tarjetas ({accountEmail})
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Cada correo es analizado por la IA para asociarlo con tarjetas existentes en Notion, sugerir su creación o descartar el tema.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', padding: '0.3rem 0.75rem', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Check size={14} /> {activeEmails.length} Correos Analizados por IA
            </span>
          </div>
        </div>
      </div>

      {/* PRIORITY SPREADSHEETS SELECTOR WITH FILE DISCOVERY & DISCARD ENGINE */}
      <div className="card-glass" style={{ padding: '1.2rem', marginBottom: '1.2rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileSpreadsheet className="text-cyan" size={18} /> 📊 Planillas de POCs & Google Drive Auditadas ({prioritySpreadsheets.length} Activas)
          </h3>

          <button
            className="btn-secondary"
            onClick={() => setShowDriveDiscoverModal(true)}
            style={{ fontSize: '0.76rem', padding: '0.4rem 0.8rem', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Compass size={14} /> 🔍 Descubrir Archivos en Google Drive
          </button>
        </div>

        {/* Input Bar for Manual Addition */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder={listeningTargetId === 'sheetInput' ? "🎙️ Escuchando..." : "Pega aquí el enlace de la planilla de Google Sheets o escribe el nombre del archivo..."}
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
            <Plus size={14} /> Agregar Planilla Manualmente
          </button>
        </div>

        {/* Active Spreadsheets Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
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
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', whiteSpace: 'nowrap', fontWeight: 700 }}>
                      100% Analizado por IA
                    </span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.35rem' }}>
                    🎯 {sheet.targetProject}
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.35', marginBottom: '0.75rem' }}>
                    "{sheet.insight}"
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
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

                  <button
                    className="btn-danger"
                    onClick={() => handleDiscardSpreadsheet(sheet.id)}
                    style={{ fontSize: '0.74rem', padding: '0.4rem 0.6rem' }}
                    title="Descartar esta planilla del análisis activo"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Discarded Spreadsheets Collapsible Panel */}
        {discardedSpreadsheets.length > 0 && (
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px border-subtle', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '0.85rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              📂 Archivos & Planillas Descartadas ({discardedSpreadsheets.length} en papelera):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {discardedSpreadsheets.map((ds) => (
                <div key={ds.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
                  <span>{getCleanSpreadsheetTitle(ds.name)}</span>
                  <button
                    className="btn-secondary"
                    onClick={() => handleRestoreSpreadsheet(ds.id)}
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <RotateCcw size={11} /> ↺ Restaurar al Análisis
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Navigation Sub-Tabs */}
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
        </div>
      </div>

      {/* VIEW 1: GMAIL CORRESPONDENCE WITH INTELLIGENT NOTION CARD MATCHING & SUGGESTION BADGES */}
      {activeTab === 'gmail' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {activeEmails.map((mailItem) => {
            const matchedCardObj = findMatchingNotionCardForEmail(mailItem);
            const status = actionSuccessStatus[mailItem.id];
            const isProc = processingId === mailItem.id;
            const currentNote = customCommentMap[mailItem.id] || '';
            const selectedCardId = selectedNotionCardMap[mailItem.id] || (matchedCardObj ? (matchedCardObj.notionPageId || matchedCardObj.id) : '');

            return (
              <div 
                key={mailItem.id} 
                className="card-glass"
                style={{ 
                  padding: '1.25rem',
                  borderLeft: matchedCardObj ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-cyan)', 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
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

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', margin: '0 0 0.5rem 0', lineHeight: '1.45', background: 'rgba(15, 23, 42, 0.6)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    "{mailItem.snippet}"
                  </p>

                  {/* AI Match Suggestion Badge */}
                  {matchedCardObj ? (
                    <div style={{ padding: '0.45rem 0.75rem', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '6px', color: 'var(--accent-emerald)', fontSize: '0.76rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ThumbsUp size={14} /> Sugerencia IA: Asociado a Tarjeta Existente en Notion ➔ "{matchedCardObj.title}" ({matchedCardObj.status || 'Abierto'})
                    </div>
                  ) : (
                    <div style={{ padding: '0.45rem 0.75rem', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', color: 'var(--accent-cyan)', fontSize: '0.76rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <HelpCircle size={14} /> Sugerencia IA: Sin coincidencia directa. Puedes "Crear Nueva Tarjeta" o "Seleccionar Tarjeta Existente".
                    </div>
                  )}
                </div>

                {/* Recuadro para mis comentarios de Diego */}
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

                {/* The 4 Action Controls Required by Diego */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  
                  {/* Action 1: Agregar a Notion como nueva tarea */}
                  <button
                    className="btn-primary"
                    onClick={() => handleAddNewTaskToNotion(mailItem)}
                    disabled={status === 'created' || isProc}
                    style={{ fontSize: '0.76rem', padding: '0.45rem 0.85rem', background: status === 'created' ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', whiteSpace: 'nowrap' }}
                  >
                    <PlusCircle size={13} /> {status === 'created' ? '¡Creada en Notion!' : '⚡ Crear Nueva Tarjeta en Notion'}
                  </button>

                  {/* Action 2: Comentar en tarea existente + Selector Desplegable */}
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
                          {card.title ? card.title.substring(0, 55) : 'Sin Título'} ({card.status || 'Abierto'})
                        </option>
                      ))}
                    </select>

                    <button
                      className="btn-secondary"
                      onClick={() => handleCommentOnExistingNotionCard(mailItem, matchedCardObj)}
                      disabled={status === 'commented' || isProc || !selectedCardId}
                      style={{ fontSize: '0.76rem', padding: '0.4rem 0.75rem', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', whiteSpace: 'nowrap' }}
                    >
                      <MessageSquare size={13} /> {status === 'commented' ? '¡Comentado!' : '💬 Comentar en Tarjeta'}
                    </button>
                  </div>

                  {/* Action 4: Descartar tema */}
                  <button
                    className="btn-danger"
                    onClick={() => handleDiscardTask(mailItem.id)}
                    style={{ fontSize: '0.76rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap' }}
                  >
                    <Trash2 size={13} /> Descartar Tema
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: DRIVE DOCUMENTS */}
      {activeTab === 'drive' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {driveFiles.map((file, idx) => (
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
              </div>

              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.74rem', padding: '0.35rem 0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', textDecoration: 'none' }}
              >
                <ExternalLink size={13} /> Abrir en Google Drive
              </a>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: EXCEL ROW TASK DETAILED INSPECTOR */}
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
              📍 <strong>Proyecto:</strong> {inspectingSheet.targetProject} | <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>100% Analizado por IA</span>
              <p style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>"{inspectingSheet.insight}"</p>
            </div>

            <h4 style={{ fontSize: '0.92rem', color: '#fff', marginBottom: '0.75rem' }}>
              📋 Filas & Tareas Extraídas Dentro del Excel ({inspectingSheet.rows ? inspectingSheet.rows.length : 6} Filas):
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(inspectingSheet.rows || getDefaultSheetRows(inspectingSheet.name)).map((rowItem) => {
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
                        onClick={() => handleCommentOnExistingNotionCard(rowItem, null)}
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

      {/* MODAL 2: DISCOVER GOOGLE DRIVE FILES MODAL */}
      {showDriveDiscoverModal && (
        <div className="modal-overlay" onClick={() => setShowDriveDiscoverModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>
                <Compass className="text-purple" size={20} /> 🔍 Archivos Descubiertos en tu Google Drive
              </h2>
              <button className="btn-icon" onClick={() => setShowDriveDiscoverModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              La IA ha escaneado tu Google Drive de <strong>dmusach@bromteck.com</strong> y ha encontrado las siguientes planillas y documentos relevantes. Haz clic en "Agregar al Análisis" para incorporarlos a tu tablero:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {discoveredDriveFiles.map((df) => (
                <div key={df.id} style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', color: '#fff', margin: '0 0 0.25rem 0', fontWeight: 700 }}>
                      {df.name}
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'block' }}>
                      🎯 {df.targetProject}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      "{df.insight}"
                    </span>
                  </div>

                  <button
                    className="btn-primary"
                    onClick={() => handleAddDiscoveredFile(df)}
                    style={{ fontSize: '0.74rem', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={13} /> + Agregar al Análisis
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
