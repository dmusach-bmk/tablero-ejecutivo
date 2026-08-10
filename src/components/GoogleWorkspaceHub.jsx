import React, { useState, useEffect } from 'react';
import { Mail, Folder, CheckCircle2, Send, Sparkles, Key, ExternalLink, RefreshCw, AlertCircle, ShieldCheck, Zap, Clock, Calendar, Search, FileText, HardDrive, MessageSquare, PlusCircle, Mic, FileSpreadsheet, Plus } from 'lucide-react';
import { fetchCorporateGmailMessages, fetchCorporateDriveFiles, getCorporateGmailSampleData, getCorporateDriveSampleData } from '../services/googleWorkspaceService';
import { createNotionPage, postCommentToNotion } from '../services/notionService';

export default function GoogleWorkspaceHub({ credentials, notionCards = [] }) {
  const [googleAccessToken, setGoogleAccessToken] = useState(() => {
    return localStorage.getItem('dm_google_oauth_token') || '';
  });

  const [accountEmail, setAccountEmail] = useState('dmusach@bromteck.com');
  const [startDate, setStartDate] = useState('2026-05-01');
  const [activeTab, setActiveTab] = useState('gmail'); // 'gmail' or 'drive'
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isFetchingGoogleAPI, setIsFetchingGoogleAPI] = useState(false);
  const [googleApiError, setGoogleApiError] = useState(null);
  const [listeningTargetId, setListeningTargetId] = useState(null);

  // Custom priority spreadsheets list defined by Diego
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

  const handleAddPrioritySpreadsheet = () => {
    if (!newSheetInput.trim()) return;
    const newSheet = {
      id: `sheet-${Date.now()}`,
      name: newSheetInput.trim(),
      targetProject: 'Análisis Solicitado por Diego',
      status: 'Análisis IA Pendiente...',
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
      alert("🎙️ Dictado por voz: Te recomendamos abrir el tablero en Google Chrome para usar el micrófono.");
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

  const handleFetchGoogleWorkspaceData = async () => {
    setIsFetchingGoogleAPI(true);
    setGoogleApiError(null);

    if (googleAccessToken.trim()) {
      localStorage.setItem('dm_google_oauth_token', googleAccessToken.trim());
      const gResult = await fetchCorporateGmailMessages(googleAccessToken.trim(), startDate);
      if (gResult.success && gResult.messages.length > 0) {
        setGmailMessages(gResult.messages);
      }

      const dResult = await fetchCorporateDriveFiles(googleAccessToken.trim());
      if (dResult.success && dResult.files.length > 0) {
        setDriveFiles(dResult.files);
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
      return mailItem.relatedMember && c.memberName.includes(mailItem.relatedMember.split(' ')[0]) && (sTitle.includes(cTitle) || cTitle.includes('tecsys') || cTitle.includes('edemsa') || cTitle.includes('wind'));
    });

    if (matchedCard) {
      const commentContent = `[Gmail Corporativo ${mailItem.date} - De: ${mailItem.from}]: "${mailItem.subject}" • ${mailItem.snippet}`;
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

  useEffect(() => {
    handleFetchGoogleWorkspaceData();
    const interval = setInterval(() => {
      handleFetchGoogleWorkspaceData();
    }, 3600000);
    return () => clearInterval(interval);
  }, [startDate]);

  const filteredEmails = gmailMessages.filter(m => {
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
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail className="text-rose" size={22} /> 📧 Gmail & 📁 Google Drive Corporativo ({accountEmail})
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Auditoría proactiva en tiempo real: Emails y planillas seleccionadas desde <strong>Mayo de 2026</strong> a la fecha.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
              ● Polling Activo cada 60m
            </span>
          </div>
        </div>
      </div>

      {/* Account Settings & OAuth Token Panel */}
      <div className="card-glass" style={{ padding: '0.85rem 1.2rem', marginBottom: '1.2rem', border: '1px dashed var(--accent-rose)', background: 'rgba(234, 67, 53, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Zap size={20} className="text-rose" />
            <div>
              <span style={{ fontSize: '0.86rem', color: '#fff', fontWeight: 700 }}>
                Escaneando Gmail & Drive ({gmailMessages.length} Correos + {driveFiles.length} Archivos + {prioritySpreadsheets.length} Planillas Específicas)
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                {lastSyncTime ? `Última sincronización: ${lastSyncTime}` : 'Analizando bandeja y disco corporativo...'} • Desde {startDate} hasta HOY.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <input
              type="password"
              className="form-input"
              placeholder="Google OAuth Token (Opcional)..."
              value={googleAccessToken}
              onChange={(e) => setGoogleAccessToken(e.target.value)}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem', width: '200px' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={13} className="text-rose" />
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Desde:</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ fontSize: '0.74rem', padding: '0.25rem 0.5rem', width: '130px' }}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleFetchGoogleWorkspaceData}
              disabled={isFetchingGoogleAPI}
              style={{ fontSize: '0.76rem', padding: '0.4rem 0.85rem', background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-purple))', whiteSpace: 'nowrap' }}
            >
              <RefreshCw className={isFetchingGoogleAPI ? 'spin' : ''} size={13} /> Sincronizar Ahora
            </button>
          </div>
        </div>
      </div>

      {/* PRIORITY SPREADSHEETS CUSTOM SELECTOR FOR DIEGO */}
      <div className="card-glass" style={{ padding: '1rem', marginBottom: '1.2rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <h3 style={{ fontSize: '0.94rem', color: '#fff', margin: '0 0 0.65rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileSpreadsheet className="text-cyan" size={18} /> 📊 Planillas Prioritarias a Analizar por la IA en Google Drive
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder={listeningTargetId === 'sheetInput' ? "🎙️ Escuchando..." : "Ingresa el nombre o enlace de la planilla Excel/Sheets que quieres que analice la IA..."}
            value={newSheetInput}
            onChange={(e) => setNewSheetInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddPrioritySpreadsheet(); }}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', flex: 1 }}
          />

          <button
            onClick={() => handleStartVoiceDictation('sheetInput', (t) => setNewSheetInput(prev => prev ? `${prev} ${t}` : t))}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.65rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
            title="Dictar nombre de la planilla por micrófono 🎙️"
          >
            <Mic size={14} className={listeningTargetId === 'sheetInput' ? 'pulse' : ''} />
          </button>

          <button
            className="btn-primary"
            onClick={handleAddPrioritySpreadsheet}
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', whiteSpace: 'nowrap' }}
          >
            <Plus size={14} /> Agregar Planilla para Análisis
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '0.65rem' }}>
          {prioritySpreadsheets.map((sheet) => (
            <div key={sheet.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
                  {sheet.name}
                </span>
                <span style={{ fontSize: '0.66rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {sheet.status}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
                🎯 {sheet.targetProject}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.3' }}>
                "{sheet.insight}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Tab Selector (Gmail Emails vs Google Drive Files) */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('gmail')}
          style={{
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            background: activeTab === 'gmail' ? 'linear-gradient(135deg, var(--accent-rose), var(--accent-purple))' : 'var(--bg-card)',
            color: '#fff',
            border: activeTab === 'gmail' ? 'none' : '1px solid var(--border-subtle)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Mail size={16} /> Correos Corporativos Gmail ({filteredEmails.length})
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          style={{
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            background: activeTab === 'drive' ? 'linear-gradient(135deg, var(--accent-rose), var(--accent-purple))' : 'var(--bg-card)',
            color: '#fff',
            border: activeTab === 'drive' ? 'none' : '1px solid var(--border-subtle)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <HardDrive size={16} /> Archivos & Documentos Google Drive ({filteredDriveFiles.length})
        </button>

        {/* Global Search Box for Workspace with Voice Dictation */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={listeningTargetId === 'workspaceSearch' ? "🎙️ Escuchando..." : "Buscar correos o archivos por texto o micrófono (🎙️)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '30px', paddingRight: '32px', fontSize: '0.78rem', height: '36px', width: '100%' }}
            className="form-input"
          />
          <button
            onClick={() => handleStartVoiceDictation('workspaceSearch', (t) => setSearchQuery(prev => prev ? `${prev} ${t}` : t))}
            style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', color: listeningTargetId === 'workspaceSearch' ? 'var(--accent-rose)' : 'var(--accent-cyan)', cursor: 'pointer' }}
            title="Dictar búsqueda por micrófono 🎙️"
          >
            <Mic size={14} className={listeningTargetId === 'workspaceSearch' ? 'pulse' : ''} />
          </button>
        </div>
      </div>

      {/* VIEW 1: GMAIL CORRESPONDENCE STREAM */}
      {activeTab === 'gmail' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredEmails.map((item, idx) => {
            const status = actionSuccessStatus[item.id];
            const isProc = processingId === item.id;

            return (
              <div 
                key={item.id || idx}
                className="card-glass"
                style={{
                  padding: '0.85rem 1.1rem',
                  borderLeft: '4px solid var(--accent-rose)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span className="tag critical" style={{ fontSize: '0.64rem', padding: '0.1rem 0.4rem' }}>
                      {item.priority || 'P1 - CRITICA'}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-rose)', fontWeight: 700 }}>
                      ✉️ De: {item.from}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      📅 {item.date}
                    </span>
                    {item.relatedMember && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        👤 {item.relatedMember}
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '0.92rem', color: '#fff', margin: '0 0 0.25rem 0', fontWeight: 700 }}>
                    {item.subject}
                  </h4>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.35rem 0', lineHeight: '1.35' }}>
                    "{item.snippet}"
                  </p>

                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontStyle: 'italic' }}>
                    💡 <strong>Acción Ejecutiva Sugerida:</strong> {item.executiveAction}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => handleDispatchEmailToNotion(item)}
                    disabled={status || isProc}
                    style={{
                      fontSize: '0.74rem',
                      padding: '0.4rem 0.75rem',
                      background: status ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 67, 53, 0.15)',
                      color: status ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                      border: status ? '1px solid var(--accent-emerald)' : '1px solid var(--accent-rose)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isProc ? (
                      <>
                        <RefreshCw className="spin" size={12} /> Ingestando a Notion...
                      </>
                    ) : status === 'commented' ? (
                      <>
                        <CheckCircle2 size={12} /> ¡Comentario Agregado en Notion!
                      </>
                    ) : status === 'created' ? (
                      <>
                        <CheckCircle2 size={12} /> ¡Tarjeta Creada en Notion!
                      </>
                    ) : (
                      <>
                        <Send size={12} /> ⚡ Ingestar Correo a Notion API
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
          {filteredDriveFiles.map((file, idx) => (
            <div 
              key={file.id || idx}
              className="card-glass"
              style={{ padding: '0.9rem', borderLeft: '4px solid var(--accent-cyan)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    📁 Google Drive File
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Modificado: {file.modifiedTime}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.88rem', color: '#fff', margin: '0 0 0.3rem 0', fontWeight: 700 }}>
                  {file.name}
                </h4>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 0.6rem 0', lineHeight: '1.3' }}>
                  {file.summary}
                </p>
                
                {file.owner && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', marginBottom: '0.6rem' }}>
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
                  style={{ flex: 1, fontSize: '0.72rem', padding: '0.3rem 0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', textDecoration: 'none' }}
                >
                  <ExternalLink size={12} /> Abrir en Google Drive
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
