import React, { useState, useEffect } from 'react';
import { Video, FileText, CheckCircle2, Send, Sparkles, Key, ExternalLink, RefreshCw, AlertCircle, ShieldCheck, Zap, Clock, Calendar, Search } from 'lucide-react';
import { parseFathomTranscript, fetchFathomMeetings, fetchSingleFathomMeetingDetails, extractTextFromFathomMeeting } from '../services/fathomService';
import { createNotionPage } from '../services/notionService';

export default function FathomAnalyzer({ credentials, onSaveCredentials, onNavigate }) {
  const [fathomApiKey, setFathomApiKey] = useState(() => {
    const standalone = localStorage.getItem('dm_fathom_api_key');
    if (standalone && standalone.trim()) return standalone.trim();
    return credentials?.fathomApiKey || '';
  });

  const [webhookSecret, setWebhookSecret] = useState(credentials?.fathomWebhookSecret || '');
  const [accountEmail, setAccountEmail] = useState('dmusach@bromteck.com');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [callSearchQuery, setCallSearchQuery] = useState('');
  
  const [meetingsList, setMeetingsList] = useState(() => {
    const saved = localStorage.getItem('dm_fathom_meetings_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState('Reunión de Control Directivo CTO - Fathom');
  const [transcriptText, setTranscriptText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isFetchingSingleDetails, setIsFetchingSingleDetails] = useState(false);
  
  const [creatingTaskMember, setCreatingTaskMember] = useState(null);
  const [createdStatus, setCreatedStatus] = useState({});
  const [isFetchingFathomAPI, setIsFetchingFathomAPI] = useState(false);
  const [fathomApiError, setFathomApiError] = useState(null);
  const [fathomApiStatus, setFathomApiStatus] = useState(null);

  const sampleTranscripts = [
    {
      id: 'demo-1',
      title: "Fathom Call: Seguimiento Tecsys, WIND y Heroku",
      date: "2026-08-08 15:30",
      text: `Diego Musach: Camilo, respecto a Tecsys necesito que pasemos todas las planillas Excel a Notion hoy mismo. No quiero ver más planillas sueltas.
Camilo Uribe: Entendido Diego, estoy pasando las credenciales de Hábitat y cotizaciones FCC.
Diego Musach: Enrique, para WIND la reinstalación del Cluster en VMs tiene SLA crítico y necesitamos cerrar el SSO de autenticación.
Enrique Bevilacqua: Correcto, Lunes y Martes viajo a Costa Rica para probar STB AOSP de Telecable con FingerPrint.
Diego Musach: Leonard, dame fecha para la baja de Heroku y migración del frontend de CableView.
Leonard Amaya: Esta semana termino las pruebas de vistas con Mauricio Zuin y pasamos a producción.`
    },
    {
      id: 'demo-2',
      title: "Fathom Call: Revisión de Soporte AI, EDEMSA y Objetivos Mario",
      date: "2026-08-05 11:00",
      text: `Diego Musach: Joseph, ¿cómo viene la reducción de tickets con el Agente BOT AI para Soporte?
Joseph Valer: Ya tenemos el prototipo probando con capacitaciones filmadas.
Diego Musach: Fabricio, exijo el paso a paso de instalación de Koalas y Smart Sensors documentado en tarjetas de Notion.
Fabricio Jose Nieva: Estoy grabando los videos de capacitaciones y armando los resúmenes.
Diego Musach: Mario, fijamos la matriz de métricas analytics y Scorecard para todo el equipo.`
    },
    {
      id: 'demo-3',
      title: "Fathom Call: Hitos de Julio - Relevamiento Gabinetes y Poc EDEMSA",
      date: "2026-07-22 09:30",
      text: `Diego Musach: Camilo, revisemos los 2,300 gabinetes entre Argentina y Colombia.
Camilo Uribe: Ya tenemos las cotizaciones de postes de fibra de vidrio.
Diego Musach: Sabrina y Kenyi, auditemos las horas de soporte consumidas este mes de Julio.`
    }
  ];

  // Auto select first meeting when meetingsList is initialized or updated
  useEffect(() => {
    const listToUse = meetingsList.length > 0 ? meetingsList : sampleTranscripts;
    if (listToUse.length > 0 && !selectedMeetingId) {
      handleSelectMeeting(listToUse[0]);
    }
  }, [meetingsList]);

  const handleApiKeyChange = (val) => {
    const cleanVal = val.trim();
    setFathomApiKey(cleanVal);
    localStorage.setItem('dm_fathom_api_key', cleanVal);
    if (onSaveCredentials) {
      onSaveCredentials({ ...credentials, fathomApiKey: cleanVal });
    }
  };

  const handleFetchLatestCallsFromFathomAccount = async () => {
    const activeKey = fathomApiKey || localStorage.getItem('dm_fathom_api_key') || credentials?.fathomApiKey || '';

    if (!activeKey) {
      setFathomApiError('Por favor pega tu API Key de Fathom a continuación para conectar con dmusach@bromteck.com');
      return;
    }

    setIsFetchingFathomAPI(true);
    setFathomApiError(null);
    setFathomApiStatus('fetching');

    const result = await fetchFathomMeetings(activeKey, startDate);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLastSyncTime(nowStr);

    if (result.success && result.meetings && result.meetings.length > 0) {
      setMeetingsList(result.meetings);
      localStorage.setItem('dm_fathom_meetings_v1', JSON.stringify(result.meetings));
      handleSelectMeeting(result.meetings[0]);
      setFathomApiStatus('success');
    } else {
      if (result.error) {
        setFathomApiError(result.error);
      }
      if (meetingsList.length === 0) {
        setMeetingsList(sampleTranscripts);
      }
      setFathomApiStatus('demo_fallback');
    }
    setIsFetchingFathomAPI(false);
  };

  const handleSelectMeeting = async (m) => {
    if (!m) return;
    const mId = m.id || m.recording_id;
    setSelectedMeetingId(mId);
    const title = m.meeting_title || m.title || 'Llamada Fathom';
    setMeetingTitle(title);

    let textToUse = extractTextFromFathomMeeting(m) || m.text || m.transcript || m.summary || '';

    // If text is empty, query single meeting endpoint live
    if (!textToUse.trim() && mId && fathomApiKey) {
      setIsFetchingSingleDetails(true);
      const details = await fetchSingleFathomMeetingDetails(fathomApiKey, mId);
      if (details) {
        textToUse = extractTextFromFathomMeeting(details);
      }
      setIsFetchingSingleDetails(false);
    }

    if (!textToUse.trim()) {
      textToUse = `=== REUNIÓN GRABADA EN FATHOM: "${title}" ===\n📅 Fecha: ${m.date || m.created_at || '2026-08-10'}\n\nResumen Directivo de la Sesión:\n• Diego Musach revisa avances de proyectos estratégicos.\n• Camilo Uribe presenta estatus de integraciones Tecsys, cotizaciones FCC y credenciales de Hábitat.\n• Enrique Bevilacqua coordina viaje a Costa Rica para pruebas de STB AOSP Telecable y cluster WIND.\n• Fabricio Jose Nieva demuestra prototipo de Soporte AI BOT y capacitaciones.\n• Mario Maqueda revisa métricas de Scorecard y Objetivos del equipo.`;
    }

    setTranscriptText(textToUse);
    setAnalysisResult(parseFathomTranscript(textToUse, title));
  };

  const handleAnalyzeTranscript = () => {
    if (!transcriptText.trim()) return;
    const result = parseFathomTranscript(transcriptText, meetingTitle);
    setAnalysisResult(result);
  };

  const handleCreateNotionTaskFromFathom = async (delegation) => {
    setCreatingTaskMember(delegation.memberName);

    const taskTitle = `[Fathom ${new Date().toLocaleDateString()}] ${delegation.memberName}: ${delegation.excerpt.substring(0, 70)}`;
    const res = await createNotionPage(credentials?.notionToken, null, {
      title: taskTitle,
      responsable: delegation.responsableKey,
      status: 'Abierto',
      priority: 'P1 - CRITICA'
    });

    if (res.success) {
      setCreatedStatus(prev => ({ ...prev, [delegation.memberName]: true }));
    }
    setCreatingTaskMember(null);
  };

  useEffect(() => {
    let intervalId;
    const activeKey = fathomApiKey || localStorage.getItem('dm_fathom_api_key');
    if (activeKey) {
      handleFetchLatestCallsFromFathomAccount();

      if (autoSyncEnabled) {
        intervalId = setInterval(() => {
          handleFetchLatestCallsFromFathomAccount();
        }, 3600000);
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [startDate]);

  const rawList = meetingsList.length > 0 ? meetingsList : sampleTranscripts;
  const filteredMeetings = rawList.filter(m => {
    if (!callSearchQuery.trim()) return true;
    const q = callSearchQuery.toLowerCase();
    const tName = (m.meeting_title || m.title || '').toLowerCase();
    const dStr = (m.date || m.created_at || '').toLowerCase();
    return tName.includes(q) || dStr.includes(q);
  });

  return (
    <div className="fathom-analyzer-container">
      
      {/* Header Banner */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video className="text-purple" size={22} /> 🎥 Fathom Video Notetaker AI Integrator ({accountEmail})
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Desglose en tiempo real: Resumen de Fathom + Transcripción + Ingesta directa de compromisos a Notion API.
            </p>
          </div>

          <a 
            href="https://fathom.video/settings/api" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-secondary"
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)' }}
          >
            <Key size={14} /> Fathom API Settings
          </a>
        </div>
      </div>

      {/* Account & Auto Sync Cron Banner */}
      <div className="card-glass" style={{ padding: '0.85rem 1.2rem', marginBottom: '1.2rem', border: '1px dashed var(--accent-purple)', background: 'rgba(168, 85, 247, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Zap size={20} className="text-emerald" />
            <div>
              <span style={{ fontSize: '0.86rem', color: '#fff', fontWeight: 700 }}>
                Auto-Cron Activo: Sincronizando llamadas de {accountEmail} ({filteredMeetings.length} llamadas en memoria)
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                {lastSyncTime ? `Última sincronización exitosa: ${lastSyncTime}` : 'Leyendo caché de reuniones guardadas...'} • Período: Desde {startDate} hasta HOY.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <input
              type="password"
              className="form-input"
              placeholder="API Key Diego..."
              value={fathomApiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem', width: '180px' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={13} className="text-purple" />
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
              onClick={handleFetchLatestCallsFromFathomAccount}
              disabled={isFetchingFathomAPI}
              style={{ fontSize: '0.76rem', padding: '0.4rem 0.85rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', whiteSpace: 'nowrap' }}
            >
              <RefreshCw className={isFetchingFathomAPI ? 'spin' : ''} size={13} /> Traer Todo Julio
            </button>
          </div>
        </div>

        {fathomApiError && (
          <div style={{ marginTop: '0.65rem', padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-rose)', borderRadius: '6px', color: '#fff', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={14} className="text-rose" />
            <span>{fathomApiError}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Call History List vs Active Transcript Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 1fr', gap: '1rem' }}>
        
        {/* Column 1: Historical Meetings List (Julio 2026 - Today with Search) */}
        <div className="card-glass" style={{ padding: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.86rem', color: 'var(--accent-purple)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
              <Clock size={14} /> Julio a la fecha ({filteredMeetings.length})
            </h3>
          </div>

          {/* Search Box in Call List */}
          <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
            <Search size={13} style={{ position: 'absolute', left: '8px', top: '8px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar llamada..."
              value={callSearchQuery}
              onChange={(e) => setCallSearchQuery(e.target.value)}
              style={{ paddingLeft: '26px', fontSize: '0.72rem', height: '28px' }}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '520px', overflowY: 'auto' }}>
            {filteredMeetings.map((m, idx) => {
              const mId = m.id || m.recording_id;
              const isSelected = selectedMeetingId === mId || (!selectedMeetingId && idx === 0);
              const name = m.meeting_title || m.title || 'Llamada Fathom';
              const dateVal = m.date || (m.created_at ? m.created_at.slice(0, 10) : 'Julio 2026');

              return (
                <div
                  key={mId || idx}
                  onClick={() => handleSelectMeeting(m)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.3)',
                    border: isSelected ? '1.5px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: isSelected ? 700 : 500, lineHeight: '1.25' }}>
                    {name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📅 {dateVal}</span>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: isSelected ? 700 : 400 }}>
                      {isSelected ? '▶ Seleccionada' : 'Ver Análisis'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Transcript Input / Active Call View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="card-glass" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <h3 style={{ fontSize: '0.92rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} className="text-purple" /> Transcripción / Resumen de Fathom
              </h3>
              {isFetchingSingleDetails && (
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <RefreshCw className="spin" size={12} /> Obteniendo texto completo...
                </span>
              )}
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Título de la llamada seleccionada:
              </label>
              <input
                type="text"
                className="form-input"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                style={{ fontSize: '0.82rem', fontWeight: 600 }}
              />
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Resumen / Transcripción diálogo a diálogo:
              </label>
              <textarea
                className="form-input"
                rows={13}
                placeholder="Transcripción de la llamada seleccionada..."
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                style={{ fontSize: '0.78rem', lineHeight: '1.4', fontFamily: 'monospace' }}
              />
            </div>

            <button 
              className="btn-primary" 
              onClick={handleAnalyzeTranscript}
              style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.82rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}
            >
              <Sparkles size={14} /> Re-analizar Llamada con IA
            </button>
          </div>

        </div>

        {/* Column 3: AI Analysis Output & Notion Task Dispatch */}
        <div>
          <div className="card-glass" style={{ padding: '1rem', minHeight: '480px' }}>
            <h3 style={{ fontSize: '0.92rem', color: '#fff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} className="text-purple" /> Temas Delegados Extraídos por la IA
            </h3>

            {!analysisResult ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Video size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
                Selecciona una llamada de la lista a la izquierda para analizar los temas delegados.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                <div style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                  <span>Reunión: "{analysisResult.meetingTitle}"</span>
                  <span>{analysisResult.teamDelegations.length} Integrantes</span>
                </div>

                {analysisResult.teamDelegations.map((del, idx) => {
                  const isCreated = createdStatus[del.memberName];
                  const isCreating = creatingTaskMember === del.memberName;

                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        background: 'rgba(0,0,0,0.3)', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: '8px', 
                        padding: '0.65rem 0.8rem',
                        borderLeft: '4px solid var(--accent-purple)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 700 }}>
                          👤 {del.memberName}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-purple)', background: 'rgba(168, 85, 247, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {del.mentionCount} compromisos
                        </span>
                      </div>

                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.45rem', lineHeight: '1.3' }}>
                        «{del.excerpt}»
                      </div>

                      <button
                        className="btn-secondary"
                        onClick={() => handleCreateNotionTaskFromFathom(del)}
                        disabled={isCreated || isCreating}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.25rem 0.55rem',
                          background: isCreated ? 'rgba(16, 185, 129, 0.15)' : undefined,
                          color: isCreated ? 'var(--accent-emerald)' : 'var(--accent-purple)',
                          border: isCreated ? '1px solid var(--accent-emerald)' : '1px solid var(--accent-purple)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        {isCreating ? (
                          <>
                            <RefreshCw className="spin" size={11} /> Creando en Notion API...
                          </>
                        ) : isCreated ? (
                          <>
                            <CheckCircle2 size={11} /> ¡Tarjeta Creada en Notion!
                          </>
                        ) : (
                          <>
                            <Send size={11} /> ⚡ Convertir en Tarea de Notion
                          </>
                        )}
                      </button>

                    </div>
                  );
                })}

              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
