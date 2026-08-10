import React, { useState, useEffect } from 'react';
import { Video, FileText, CheckCircle2, Send, Sparkles, Key, ExternalLink, RefreshCw, AlertCircle, ShieldCheck, Zap, Clock, Calendar, Play } from 'lucide-react';
import { parseFathomTranscript, fetchFathomMeetings } from '../services/fathomService';
import { createNotionPage } from '../services/notionService';

export default function FathomAnalyzer({ credentials, onNavigate }) {
  const [fathomApiKey, setFathomApiKey] = useState(credentials?.fathomApiKey || '');
  const [webhookSecret, setWebhookSecret] = useState(credentials?.fathomWebhookSecret || '');
  const [accountEmail, setAccountEmail] = useState('dmusach@bromteck.com');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  const [meetingsList, setMeetingsList] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState('Reunión de Control Directivo CTO - Fathom');
  const [transcriptText, setTranscriptText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const [creatingTaskMember, setCreatingTaskMember] = useState(null);
  const [createdStatus, setCreatedStatus] = useState({});
  const [isFetchingFathomAPI, setIsFetchingFathomAPI] = useState(false);
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
    }
  ];

  const handleFetchLatestCallsFromFathomAccount = async () => {
    setIsFetchingFathomAPI(true);
    setFathomApiStatus('fetching');

    const meetings = await fetchFathomMeetings(fathomApiKey, startDate);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLastSyncTime(nowStr);

    if (meetings && meetings.length > 0) {
      setMeetingsList(meetings);
      const lastCall = meetings[0];
      setSelectedMeetingId(lastCall.id || '1');
      setMeetingTitle(lastCall.title || 'Llamada Fathom');
      const textToAnalyze = lastCall.transcript || lastCall.summary || '';
      setTranscriptText(textToAnalyze);
      if (textToAnalyze) {
        setAnalysisResult(parseFathomTranscript(textToAnalyze, lastCall.title));
      }
      setFathomApiStatus('success');
    } else {
      // Fallback to demo items if API returns empty
      setMeetingsList(sampleTranscripts);
      setFathomApiStatus('demo_fallback');
    }
    setIsFetchingFathomAPI(false);
  };

  const handleSelectMeeting = (m) => {
    setSelectedMeetingId(m.id);
    setMeetingTitle(m.title);
    setTranscriptText(m.text || m.transcript || m.summary || '');
    const result = parseFathomTranscript(m.text || m.transcript || m.summary || '', m.title);
    setAnalysisResult(result);
  };

  const handleAnalyzeTranscript = () => {
    if (!transcriptText.trim()) return;
    const result = parseFathomTranscript(transcriptText, meetingTitle);
    setAnalysisResult(result);
  };

  const handleCreateNotionTaskFromFathom = async (delegation) => {
    setCreatingTaskMember(delegation.memberName);

    const taskTitle = `[Fathom ${new Date().toLocaleDateString()}] ${delegation.memberName}: ${delegation.excerpt.substring(0, 70)}`;
    const result = await createNotionPage(credentials?.notionToken, null, {
      title: taskTitle,
      responsable: delegation.responsableKey,
      status: 'Abierto',
      priority: 'P1 - CRITICA'
    });

    if (result.success) {
      setCreatedStatus(prev => ({ ...prev, [delegation.memberName]: true }));
    }
    setCreatingTaskMember(null);
  };

  // AUTOMATIC BACKGROUND CRON EVERY 60 MINUTES (1 HOUR)
  useEffect(() => {
    let intervalId;
    if (autoSyncEnabled) {
      // Initial fetch on load
      handleFetchLatestCallsFromFathomAccount();

      // Set 1-hour recurring interval (3,600,000 ms)
      intervalId = setInterval(() => {
        handleFetchLatestCallsFromFathomAccount();
      }, 3600000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoSyncEnabled, fathomApiKey, startDate]);

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
              Histórico desde <strong style={{ color: 'var(--accent-purple)' }}>Julio 2026</strong> + Ingesta automática en segundo plano <strong style={{ color: 'var(--accent-emerald)' }}>cada 1 hora</strong>.
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
                Auto-Cron Activo: Sincronizando llamadas de {accountEmail} cada 60 minutos
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                {lastSyncTime ? `Última búsqueda exitosa: ${lastSyncTime}` : 'Iniciando primer escaneo...'} • Período: Desde {startDate} hasta HOY.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
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
              <RefreshCw className={isFetchingFathomAPI ? 'spin' : ''} size={13} /> Sincronizar Ahora
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Call History List vs Active Transcript Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 1fr', gap: '1rem' }}>
        
        {/* Column 1: Historical Meetings List (Julio 2026 - Today) */}
        <div className="card-glass" style={{ padding: '0.9rem' }}>
          <h3 style={{ fontSize: '0.88rem', color: 'var(--accent-purple)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
            <Clock size={15} /> Llamadas Grabadas desde Julio
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '520px', overflowY: 'auto' }}>
            {(meetingsList.length > 0 ? meetingsList : sampleTranscripts).map((m, idx) => {
              const isSelected = selectedMeetingId === m.id || (!selectedMeetingId && idx === 0);
              return (
                <div
                  key={m.id || idx}
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
                    {m.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📅 {m.date || m.created_at || 'Julio 2026'}</span>
                    <span style={{ color: 'var(--accent-purple)' }}>{isSelected ? '▶ Seleccionada' : 'Ver'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Transcript Input / Active Call View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="card-glass" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '0.92rem', color: '#fff', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} className="text-purple" /> Transcripción de la Llamada Seleccionada
            </h3>

            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Título de la llamada:
              </label>
              <input
                type="text"
                className="form-input"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                style={{ fontSize: '0.82rem' }}
              />
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Transcripción / Resumen generado por Fathom:
              </label>
              <textarea
                className="form-input"
                rows={12}
                placeholder="Pega aquí el texto completo o la transcripción exportada desde Fathom Video Notetaker..."
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
                  <span>Analizado a las {analysisResult.analyzedAt}</span>
                  <span>{analysisResult.teamDelegations.length} Integrantes Mencionados</span>
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
                          {del.mentionCount} menciones
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
