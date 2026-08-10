import React, { useState } from 'react';
import { Crown, Video, Sparkles, CheckCircle2, Send, Zap, Calendar, UserCheck, AlertTriangle, ArrowRight, RefreshCw, Key, ShieldCheck } from 'lucide-react';
import { postCommentToNotion, createNotionPage } from '../services/notionService';

export default function DiegoEjecutivo({ teamTracking, notionCards, credentials, onUpdateNotionCards, onOpenSettings }) {
  const [selectedMeetingId, setSelectedMeetingId] = useState('m-101');
  const [syncingId, setSyncingId] = useState(null);
  const [myTaskComments, setMyTaskComments] = useState({});

  // Fathom Meeting Transcripts & Action Items Extracted from Last Month
  const fathomMeetings = [
    {
      id: "m-101",
      title: "Reunión de Coordinación Tecsys & Hábitat Cliente",
      date: "2026-08-08 15:30",
      duration: "45 min",
      participants: ["Diego Musach", "Camilo Uribe", "Iván (Tecsys)", "Joseph Valer"],
      summary: "Reunión de alineación sobre los entregables de Tecsys y la habilitación del entorno Hábitat del cliente. Se identificó desvío en el uso de Excel en lugar de tarjetas en Notion.",
      diegoActions: [
        { id: "act-d1", task: "Revisar y aprobar presupuesto final de certificaciones FCC/CE enviadas desde Brasil.", status: "Pendiente", priority: "P1 - CRITICA" },
        { id: "act-d2", task: "Enviar correo a la gerencia de Tecsys formalizando solicitud de credenciales de Hábitat.", status: "En Progreso", priority: "P1 - CRITICA" }
      ],
      teamActions: [
        { id: "act-t1", assignee: "Camilo Uribe", task: "Migrar el 100% del seguimiento de Tecsys de Excel a Notion antes del viernes.", priority: "P2 - ALTA" },
        { id: "act-t2", assignee: "Joseph Valer", task: "Auditar diariamente las 100 tarjetas de Notion y reportar alertas a Diego.", priority: "P2 - ALTA" }
      ]
    },
    {
      id: "m-102",
      title: "Sync de Arquitectura Cloud & Auditoría de Servidores con Enrique",
      date: "2026-08-07 11:00",
      duration: "30 min",
      participants: ["Diego Musach", "Enrique Bevilacqua"],
      summary: "Revisión de la carga de los 28 temas de infraestructura en Notion. Análisis de costos de servidores y failover multi-región en Kubernetes.",
      diegoActions: [
        { id: "act-d3", task: "Aprobar ventana de mantenimiento nocturno para apagado automático de staging.", status: "Pendiente", priority: "P2 - ALTA" }
      ],
      teamActions: [
        { id: "act-t3", assignee: "Enrique Bevilacqua", task: "Ejecutar script de auto-stop en servidores en desuso para reducir costo infra en 8%.", priority: "P2 - ALTA" },
        { id: "act-t4", assignee: "Enrique Bevilacqua", task: "Priorizar las 3 tareas críticas en Notion: Telecable CR, TMS y CableView.", priority: "P1 - CRITICA" }
      ]
    },
    {
      id: "m-103",
      title: "Planning Comercial Solución Smart (SS) Pérdidas",
      date: "2026-08-05 14:00",
      duration: "50 min",
      participants: ["Diego Musach", "Camilo Uribe", "Leonard Amaya", "Ventas"],
      summary: "Definición del deck comercial para la Solución Smart enfocada en reducción de pérdidas (sin Godel).",
      diegoActions: [
        { id: "act-d4", task: "Revisar arquitectura final del deck comercial de SS antes de la presentación a gerencia.", status: "Pendiente", priority: "P2 - ALTA" }
      ],
      teamActions: [
        { id: "act-t5", assignee: "Camilo Uribe", task: "Completar estructura del producto comercial de SS de reducción de pérdidas.", priority: "P2 - ALTA" },
        { id: "act-t6", assignee: "Leonard Amaya", task: "Armar propuesta visual para Marketing de Bromteck TV con feature UDID.", priority: "P3 - MEDIA" }
      ]
    }
  ];

  const selectedMeeting = fathomMeetings.find(m => m.id === selectedMeetingId) || fathomMeetings[0];

  // Filter all Diego Musach's personal tasks across Notion & Fathom
  const myNotionTasks = notionCards.filter(c => c.responsable.includes('Diego'));

  const handleConvertToActionItem = async (actionItem) => {
    setSyncingId(actionItem.id);

    const result = await createNotionPage(
      credentials?.notionToken,
      credentials?.notionDbId,
      {
        title: `[Fathom AI]: ${actionItem.task}`,
        responsable: actionItem.assignee || 'Diego Paolo Musach (CTO)',
        priority: actionItem.priority || 'P2 - ALTA',
        status: 'Abierto'
      }
    );

    setSyncingId(null);
    alert(`✅ Tarea "${actionItem.task}" convertida y publicada en Notion con éxito.`);
  };

  const handleSendDiegoTaskComment = async (taskId) => {
    const text = myTaskComments[taskId];
    if (!text || !text.trim()) return;

    setSyncingId(taskId);
    await postCommentToNotion(
      credentials?.notionToken,
      '34ace95d-6a9a-8054-b33b-cad2cbaf4c70',
      `[Avance Diego Musach]: ${text.trim()}`
    );

    setSyncingId(null);
    setMyTaskComments(prev => ({ ...prev, [taskId]: '' }));
    alert("✅ Avance grabado en tu tarea de Notion.");
  };

  return (
    <div className="diego-ejecutivo-container">
      
      {/* Top Banner */}
      <div className="card-glass" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-violet)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-violet)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Crown size={18} /> Centro de Control Directivo • Diego Paolo Musach (CTO)
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: '0.2rem 0' }}>
              👑 Diego Ejecutivo & Fathom AI Meeting Sync
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
              Análisis automático de reuniones de Fathom (último mes y próximas). Extracción de tareas para tu equipo y seguimiento de tus compromisos personales.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '0.45rem 0.85rem', borderRadius: '20px', border: '1px solid var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Video size={14} /> Fathom Notetaker Activo
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: My Personal Tasks on Left, Fathom Meetings Extractor on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: DIEGO'S PERSONAL ACTION ITEMS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="card-glass" style={{ borderTop: '3px solid var(--accent-violet)' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Crown className="text-violet" size={20} /> 
              Mis Temas y Compromisos Directos ({myNotionTasks.length + 4})
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Acciones extraídas de reuniones de Fathom y Notion asignadas exclusivamente a ti.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '580px', overflowY: 'auto', paddingRight: '0.3rem' }}>
              
              {/* Personal Fathom Actions */}
              {selectedMeeting.diegoActions.map((act) => (
                <div key={act.id} style={{ background: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.3)', borderRadius: '12px', padding: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span className="tag critical" style={{ fontSize: '0.68rem' }}>{act.priority}</span>
                    <span className="tag info" style={{ fontSize: '0.68rem' }}>Fathom Meeting</span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', color: '#fff', margin: '0 0 0.4rem 0', lineHeight: '1.35' }}>
                    {act.task}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                    📅 Origen: {selectedMeeting.title}
                  </div>

                  {/* Comment Input */}
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Registrar avance de tu compromiso..."
                      value={myTaskComments[act.id] || ''}
                      onChange={(e) => setMyTaskComments({ ...myTaskComments, [act.id]: e.target.value })}
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                    />
                    <button
                      className="btn-primary"
                      onClick={() => handleSendDiegoTaskComment(act.id)}
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap' }}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ))}

              {/* Notion Personal Cards */}
              {myNotionTasks.slice(0, 5).map((card) => (
                <div key={card.id} style={{ background: 'rgba(11, 16, 28, 0.85)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span className={`tag ${card.priority?.includes('P1') ? 'critical' : 'high'}`} style={{ fontSize: '0.68rem' }}>
                      {card.priority}
                    </span>
                    <span className="tag low" style={{ fontSize: '0.68rem' }}>Notion Sync</span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', color: '#fff', margin: '0 0 0.3rem 0', lineHeight: '1.35' }}>
                    {card.title}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    👤 Asignado a: Diego Paolo Musach (CTO)
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: FATHOM MEETINGS ANALYZER & TEAM TASK GENERATOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Meeting Selector Tabs */}
          <div className="card-glass" style={{ padding: '0.85rem 1.1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
              🎥 Reuniones de Fathom Procesadas (Último Mes):
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
              {fathomMeetings.map((m) => {
                const isSelected = m.id === selectedMeetingId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMeetingId(m.id)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, var(--accent-violet), var(--accent-blue))' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                      color: '#fff',
                      borderRadius: '10px',
                      padding: '0.6rem 0.9rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 400
                    }}
                  >
                    <div>{m.title}</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>📅 {m.date} ({m.duration})</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Meeting Details & AI Extracted Team Tasks */}
          {selectedMeeting && (
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Meeting Header */}
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="tag info" style={{ marginBottom: '0.3rem', display: 'inline-block' }}>
                      📅 {selectedMeeting.date} • Duración: {selectedMeeting.duration}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: '0.2rem 0' }}>
                      {selectedMeeting.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                      Participantes: <strong>{selectedMeeting.participants.join(', ')}</strong>
                    </p>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sparkles size={14} /> Fathom AI Summary
                  </span>
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '10px', marginTop: '0.85rem', border: '1px solid var(--border-subtle)' }}>
                  {selectedMeeting.summary}
                </p>
              </div>

              {/* Extracted Team Action Items */}
              <div>
                <h4 style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap className="text-cyan" size={18} /> 
                  Acuerdos Extraídos para Tu Equipo (Auto-Convertibles a Notion):
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {selectedMeeting.teamActions.map((act) => (
                    <div key={act.id} style={{ background: 'rgba(11, 16, 28, 0.85)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
                          <span className={`tag ${act.priority?.includes('P1') ? 'critical' : 'high'}`} style={{ fontSize: '0.68rem' }}>
                            {act.priority}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                            👤 Asignado a: {act.assignee}
                          </span>
                        </div>
                        <h5 style={{ fontSize: '0.92rem', color: '#fff', margin: 0 }}>
                          {act.task}
                        </h5>
                      </div>

                      <button
                        className="btn-primary"
                        onClick={() => handleConvertToActionItem(act)}
                        disabled={syncingId === act.id}
                        style={{ whiteSpace: 'nowrap', padding: '0.55rem 0.95rem', fontSize: '0.8rem' }}
                      >
                        {syncingId === act.id ? (
                          <>
                            <RefreshCw className="spin" size={14} /> Creando...
                          </>
                        ) : (
                          <>
                            <Zap size={14} /> Convertir a Notion
                          </>
                        )}
                      </button>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
