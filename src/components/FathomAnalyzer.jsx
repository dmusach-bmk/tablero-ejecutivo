import React, { useState } from 'react';
import { Video, FileText, CheckCircle2, Send, Sparkles, Key, ExternalLink, RefreshCw, AlertCircle, ShieldCheck, Zap } from 'lucide-react';
import { parseFathomTranscript, fetchFathomMeetings } from '../services/fathomService';
import { createNotionPage } from '../services/notionService';

export default function FathomAnalyzer({ credentials, onNavigate }) {
  const [fathomApiKey, setFathomApiKey] = useState(credentials?.fathomApiKey || '');
  const [webhookSecret, setWebhookSecret] = useState(credentials?.fathomWebhookSecret || '');
  const [accountEmail, setAccountEmail] = useState('dmusach@bromteck.com');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [meetingTitle, setMeetingTitle] = useState('Reunión de Control Directivo CTO - Fathom');
  const [transcriptText, setTranscriptText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [creatingTaskMember, setCreatingTaskMember] = useState(null);
  const [createdStatus, setCreatedStatus] = useState({});
  const [isFetchingFathomAPI, setIsFetchingFathomAPI] = useState(false);
  const [fathomApiStatus, setFathomApiStatus] = useState(null);

  const sampleTranscripts = [
    {
      title: "Fathom Call: Seguimiento Tecsys, WIND y Heroku",
      text: `Diego Musach: Camilo, respecto a Tecsys necesito que pasemos todas las planillas Excel a Notion hoy mismo. No quiero ver más planillas sueltas.
Camilo Uribe: Entendido Diego, estoy pasando las credenciales de Hábitat y cotizaciones FCC.
Diego Musach: Enrique, para WIND la reinstalación del Cluster en VMs tiene SLA crítico y necesitamos cerrar el SSO de autenticación.
Enrique Bevilacqua: Correcto, Lunes y Martes viajo a Costa Rica para probar STB AOSP de Telecable con FingerPrint.
Diego Musach: Leonard, dame fecha para la baja de Heroku y migración del frontend de CableView.
Leonard Amaya: Esta semana termino las pruebas de vistas con Mauricio Zuin y pasamos a producción.`
    },
    {
      title: "Fathom Call: Revisión de Soporte AI, EDEMSA y Objetivos Mario",
      text: `Diego Musach: Joseph, ¿cómo viene la reducción de tickets con el Agente BOT AI para Soporte?
Joseph Valer: Ya tenemos el prototipo probando con capacitaciones filmadas.
Diego Musach: Fabricio, exijo el paso a paso de instalación de Koalas y Smart Sensors documentado en tarjetas de Notion.
Fabricio Jose Nieva: Estoy grabando los videos de capacitaciones y armando los resúmenes.
Diego Musach: Mario, fijamos la matriz de métricas analytics y Scorecard para todo el equipo.`
    }
  ];

  const handleFetchLatestCallsFromFathomAccount = async () => {
    if (!fathomApiKey) {
      setFathomApiStatus('no_key');
      return;
    }
    setIsFetchingFathomAPI(true);
    setFathomApiStatus('fetching');

    const meetings = await fetchFathomMeetings(fathomApiKey);
    if (meetings && meetings.length > 0) {
      const lastCall = meetings[0];
      setMeetingTitle(lastCall.title || 'Última llamada Grabada en Fathom');
      setTranscriptText(lastCall.transcript || lastCall.summary || 'Transcripción cargada automáticamente.');
      const result = parseFathomTranscript(lastCall.transcript || lastCall.summary, lastCall.title);
      setAnalysisResult(result);
      setFathomApiStatus('success');
    } else {
      setFathomApiStatus('empty');
    }
    setIsFetchingFathomAPI(false);
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

  return (
    <div className="fathom-analyzer-container">
      
      {/* Header Banner */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video className="text-purple" size={22} /> 🎥 Fathom Video Notetaker Auto-Integrator ({accountEmail})
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Sincronización en segundo plano con tu cuenta oficial de Fathom <strong style={{ color: '#fff' }}>dmusach@bromteck.com</strong>.
            </p>
          </div>

          <a 
            href="https://fathom.video/settings/api" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-secondary"
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)' }}
          >
            <Key size={14} /> Obtener API Key de Fathom
          </a>
        </div>
      </div>

      {/* Account & Auto Sync Banner */}
      <div className="card-glass" style={{ padding: '0.85rem 1.2rem', marginBottom: '1.2rem', border: '1px dashed var(--accent-purple)', background: 'rgba(168, 85, 247, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Zap size={18} className="text-purple" />
            <div>
              <span style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 700 }}>
                Cuenta Vinculada: {accountEmail}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', display: 'block' }}>
                {autoSyncEnabled ? '⚡ Auto-sync activo: Escaneando llamadas nuevas al finalizar' : 'Sincronización manual activa'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="password"
              className="form-input"
              placeholder="API Key (BgtG...)"
              value={fathomApiKey}
              onChange={(e) => setFathomApiKey(e.target.value)}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem', width: '170px' }}
            />
            <input
              type="password"
              className="form-input"
              placeholder="Webhook Secret (...oxVx)"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem', width: '170px' }}
            />
            <button
              className="btn-primary"
              onClick={handleFetchLatestCallsFromFathomAccount}
              disabled={isFetchingFathomAPI}
              style={{ fontSize: '0.76rem', padding: '0.4rem 0.85rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', whiteSpace: 'nowrap' }}
            >
              <RefreshCw className={isFetchingFathomAPI ? 'spin' : ''} size={13} /> Sincronizar Llamadas Recientes
            </button>
          </div>
        </div>

        {fathomApiStatus === 'no_key' && (
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <AlertCircle size={13} /> Ingresa tu Fathom API Key arriba o usa el pegado manual de transcripciones a continuación.
          </div>
        )}
      </div>

      {/* Main Grid: Input / Quick Samples vs Analysis Result */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
        
        {/* Left Column: Transcript Input & API Setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="card-glass" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} className="text-purple" /> Transcripción / Webhook de Fathom ({accountEmail})
            </h3>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
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

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Texto del resumen o transcripción completa de Fathom:
              </label>
              <textarea
                className="form-input"
                rows={9}
                placeholder="Pega aquí el texto completo o la transcripción automática exportada desde Fathom Video Notetaker..."
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                style={{ fontSize: '0.8rem', lineHeight: '1.4', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                className="btn-primary" 
                onClick={handleAnalyzeTranscript}
                style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.82rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}
              >
                <Sparkles size={14} /> Analizar Llamada Fathom con IA
              </button>
            </div>
          </div>

          {/* Quick Preset Samples */}
          <div className="card-glass" style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '0.82rem', color: 'var(--accent-purple)', marginBottom: '0.5rem', fontWeight: 700 }}>
              💡 Ejemplos Rápidos de Transcripts de Fathom:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {sampleTranscripts.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMeetingTitle(sample.title);
                    setTranscriptText(sample.text);
                  }}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📌 {sample.title}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: AI Analysis Output & Notion Task Dispatch */}
        <div>
          <div className="card-glass" style={{ padding: '1rem', minHeight: '400px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} className="text-purple" /> Temas Delegados Extraídos por la IA
            </h3>

            {!analysisResult ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Video size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
                Pega un transcript a la izquierda o haz clic en "Sincronizar Llamadas Recientes" para analizar automáticamente los temas delegados.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                
                <div style={{ fontSize: '0.76rem', color: 'var(--accent-purple)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', pb: '0.4rem' }}>
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
                        padding: '0.75rem 0.9rem',
                        borderLeft: '4px solid var(--accent-purple)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 700 }}>
                          👤 {del.memberName}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', background: 'rgba(168, 85, 247, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {del.mentionCount} menciones
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.55rem', lineHeight: '1.35' }}>
                        «{del.excerpt}»
                      </div>

                      <button
                        className="btn-secondary"
                        onClick={() => handleCreateNotionTaskFromFathom(del)}
                        disabled={isCreated || isCreating}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.25rem 0.6rem',
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
                            <RefreshCw className="spin" size={12} /> Creando en Notion API...
                          </>
                        ) : isCreated ? (
                          <>
                            <CheckCircle2 size={12} /> ¡Tarjeta Creada en Notion!
                          </>
                        ) : (
                          <>
                            <Send size={12} /> ⚡ Convertir en Tarea de Notion
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
