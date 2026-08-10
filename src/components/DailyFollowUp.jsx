import React, { useState } from 'react';
import { Calendar, MessageSquare, ShieldAlert, CheckCircle2, Send, ArrowRight, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';
import { postCommentToNotion } from '../services/notionService';

export default function DailyFollowUp({ teamTracking, credentials, onOpenEmailWithAgenda, onNavigate }) {
  const [activeMemberId, setActiveMemberId] = useState('dev-camilo');
  const [commentInputs, setCommentInputs] = useState({});
  const [syncStatus, setSyncStatus] = useState({});

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const followUpGuideData = [
    {
      id: "dev-camilo",
      name: "Camilo Uribe",
      role: "Lead Integraciones Tecsys & Comercial SS",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      urgentTopic: "Transición de planillas Excel a Notion (POCs AES/Delsur) & Deck Comercial SS (Pérdidas)",
      notionPageId: "34ace95d-6a9a-8054-b33b-cad2cbaf4c70",
      speechText: "«Camilo, hoy necesitamos erradicar el uso de planillas Excel sueltas. La ingeniería de las POCs de Tecsys (AES, Delsur) DEBE estar 100% estructurada en tarjetas de Notion con fecha límite. Además, ¿qué nos falta para cerrar hoy la presentación comercial de Solución Smart (SS)?»",
      scenarios: [
        {
          devSays: "El Excel me resulta más rápido y cómodo para armar los reportes semanales.",
          diegoResponse: "«El Excel aísla la información y me obliga a pedirte reportes. Notion le da visibilidad a todo el equipo en tiempo real. Asumimos la tarjeta de Notion como la única fuente de verdad a partir de hoy.»"
        },
        {
          devSays: "No pude avanzar con el deck comercial porque estoy esperando data del área de ventas.",
          diegoResponse: "«Escalo esa solicitud con comercial en 1-click ahora mismo; mientras tanto, tú avanza y deja lista la arquitectura técnica del deck sin frenarte por la data de ventas.»"
        }
      ]
    },
    {
      id: "dev-enrique",
      name: "Enrique Bevilacqua",
      role: "Senior Infrastructure & Cloud Architect",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      urgentTopic: "Priorización de las 28 tarjetas en Notion (Telecable CR, TMS) & Apagado de Servidores en Desuso",
      notionPageId: "34ace95d-6a9a-8054-b33b-cad2cbaf4c70",
      speechText: "«Enrique, tienes 28 tarjetas asignadas en Notion. Hoy vamos a congelar las secundarias y concentrarnos en los 3 entregables clave: Telecable Costa Rica, TMS y CableView. Además, necesito la lista de servidores que podemos apagar hoy mismo para reducir costos Cloud.»",
      scenarios: [
        {
          devSays: "Los 28 temas son urgentes y no puedo dejar ninguno sin atención.",
          diegoResponse: "«Si todo es urgente, nada es prioridad. Telecable CR y TMS mueven la aguja del negocio; congelamos las tareas menores hasta el viernes y nos enfocamos al 100% en esas dos.»"
        },
        {
          devSays: "Apagar servidores de staging puede interferir con pruebas de otros desarrolladores.",
          diegoResponse: "«Establezcamos un script de auto-stop fuera del horario de oficina (19:00 a 08:00) para ahorrar sin afectar el trabajo diario.»"
        }
      ]
    },
    {
      id: "dev-joseph",
      name: "Joseph Valer",
      role: "Coordinador de Seguimiento & Control CTO",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      urgentTopic: "Status del Agente AI de Soporte, Balance de Horas Premium & Control de Tareas Sin Asignar",
      notionPageId: "34ace95d-6a9a-8054-b33b-cad2cbaf4c70",
      speechText: "«Joseph, revisemos dos frentes para hoy: status de avance del Agente AI de Soporte para clientes y el reporte de balance de horas consumidas en Soporte Premium. Asume la tarea de auditar diariamente que no quede ninguna tarjeta 'Sin Asignar' en Notion.»",
      scenarios: [
        {
          devSays: "Hay desarrolladores que se olvidan de actualizar el estado de sus tarjetas en Notion.",
          diegoResponse: "«Repórtamelo al inicio del día y yo intervengo directamente en su Scorecard para exigir la actualización.»"
        }
      ]
    },
    {
      id: "dev-fabricio",
      name: "Fabricio Jose Nieva",
      role: "Fullstack Engineer & API Integrations",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      urgentTopic: "Contratos API de Facturación B2B & Configuración Remota Equipos Delsur/AES",
      notionPageId: "34ace95d-6a9a-8054-b33b-cad2cbaf4c70",
      speechText: "«Fabricio, hoy coordinemos con Enrique la finalización de los endpoints idempotentes y la configuración remota de los equipos de Delsur y AES. ¿Qué porcentaje de pruebas unitarias alcanzamos en el pipeline?»",
      scenarios: [
        {
          devSays: "Falta confirmación del esquema JSON por parte del proveedor externo.",
          diegoResponse: "«Construyamos un mock server interno hoy mismo para validar la lógica local sin depender del proveedor.»"
        }
      ]
    },
    {
      id: "dev-mario",
      name: "Mario Maqueda",
      role: "Data Engineer & Analytics Specialist",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      urgentTopic: "Automatización del Pipeline de Datos Corporativos de Google Drive & Excel hacia el Dashboard CTO",
      notionPageId: "34ace95d-6a9a-8054-b33b-cad2cbaf4c70",
      speechText: "«Mario, el objetivo central de hoy es dejar automatizado el proceso de ingesta para que las planillas de Google Drive impacien directamente en el Dashboard CTO sin carga manual.»",
      scenarios: [
        {
          devSays: "Las planillas de entrada tienen columnas y nombres inconsistentes.",
          diegoResponse: "«Fijemos una plantilla estandarizada única en Google Drive y rechazamos automáticamente archivos fuera de formato.»"
        }
      ]
    },
    {
      id: "dev-leonard",
      name: "Leonard Amaya",
      role: "Senior Frontend & UX Engineer",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      urgentTopic: "Documento de Requerimientos UDID / Bromteck 4.0 & Presentación Marketing Bromteck TV",
      notionPageId: "34ace95d-6a9a-8054-b33b-cad2cbaf4c70",
      speechText: "«Leonard, hoy revisamos el documento con los requerimientos de cada desarrollo (UDID, Bromteck 4.0) y la propuesta visual para Marketing de Bromteck TV / WIND. ¿Cómo venimos en tiempos de render?»",
      scenarios: [
        {
          devSays: "Marketing pidió incluir nuevas funciones a última hora.",
          diegoResponse: "«Congelamos la versión actual para la demo de esta semana y agendamos las nuevas peticiones para el siguiente release.»"
        }
      ]
    }
  ];

  const currentMember = followUpGuideData.find(m => m.id === activeMemberId) || followUpGuideData[0];

  const handlePostComment = async (member) => {
    const text = commentInputs[member.id];
    if (!text || !text.trim()) return;

    setSyncStatus(prev => ({ ...prev, [member.id]: 'syncing' }));

    const result = await postCommentToNotion(
      credentials?.notionToken,
      member.notionPageId,
      `[Follow Up Diario Diego Musach - ${new Date().toLocaleDateString()}]: ${text.trim()}`
    );

    if (result.success) {
      setSyncStatus(prev => ({ ...prev, [member.id]: 'success' }));
      setCommentInputs(prev => ({ ...prev, [member.id]: '' }));
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, [member.id]: null }));
      }, 3000);
    } else {
      setSyncStatus(prev => ({ ...prev, [member.id]: 'error' }));
    }
  };

  return (
    <div className="daily-followup-container">
      
      {/* Header Banner */}
      <div className="card-glass" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Calendar size={16} /> Guía Diaria de Gestión CTO • {currentDate}
            </div>
            <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: '0.2rem 0' }}>
              🚨 Follow Up Diario & Guía Directiva de Reunión
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
              Temas obligatorios a hablar HOY con cada integrante de tu equipo, speeches preparados y manejo táctico de respuestas.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn-secondary" 
              onClick={() => onNavigate('micromanagement')}
              style={{ fontSize: '0.82rem' }}
            >
              👥 Ver Equipo Completo
            </button>
          </div>
        </div>
      </div>

      {/* Member Selector Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
        {followUpGuideData.map((mem) => {
          const isActive = mem.id === activeMemberId;
          return (
            <button
              key={mem.id}
              onClick={() => setActiveMemberId(mem.id)}
              style={{
                background: isActive ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'var(--bg-card)',
                color: '#fff',
                border: isActive ? 'none' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '0.65rem 1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                whiteSpace: 'nowrap',
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? '0 4px 15px rgba(6, 182, 212, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <img src={mem.avatar} alt={mem.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              <span>{mem.name}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN FOLLOW UP CARD FOR SELECTED MEMBER */}
      {currentMember && (
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Member Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <img src={currentMember.avatar} alt={currentMember.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-cyan)' }} />
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
                  Follow Up del Día con <strong>{currentMember.name}</strong>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>{currentMember.role}</p>
              </div>
            </div>

            <button 
              className="btn-primary"
              onClick={() => onOpenEmailWithAgenda(currentMember)}
            >
              <MessageSquare size={16} /> Enviar Agenda a {currentMember.name}
            </button>
          </div>

          {/* Urgent Topic of the Day */}
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--accent-rose)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <AlertCircle size={16} /> Tema Obligatorio a Tratar Hoy (Si o Si):
            </span>
            <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: 0 }}>
              {currentMember.urgentTopic}
            </h4>
          </div>

          {/* Speech Directivo (Lo que Diego debe decir) */}
          <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '1.1rem', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.92rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={18} /> 🗣️ Speech Directivo Sugerido (Lo que Diego debe decir):
            </h4>
            <p style={{ fontSize: '0.92rem', color: '#fff', fontStyle: 'italic', lineHeight: '1.5', margin: 0 }}>
              {currentMember.speechText}
            </p>
          </div>

          {/* Reacción & Manejo de Respuestas */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldAlert className="text-amber" size={18} /> 🛡️ Reacción y Manejo Directivo ante Posibles Respuestas:
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {currentMember.scenarios.map((sc, idx) => (
                <div key={idx} style={{ background: 'rgba(11, 16, 28, 0.85)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  
                  {/* Si el dev responde... */}
                  <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '0.75rem' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-amber)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      ❌ Si {currentMember.name} responde:
                    </span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', margin: 0 }}>
                      "{sc.devSays}"
                    </p>
                  </div>

                  {/* Tu reaccion de liderazgo... */}
                  <div style={{ paddingLeft: '0.25rem' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      ✅ Tu Respuesta / Reacción Directiva de Diego:
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, margin: 0 }}>
                      {sc.diegoResponse}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Direct Comment Box to Notion */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.88rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Send size={15} className="text-cyan" /> ✍️ Registrar Acuerdo de la Reunión & Publicar a Notion
            </h4>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder={`Escribir acuerdo o fecha pactada con ${currentMember.name} para Notion...`}
                value={commentInputs[currentMember.id] || ''}
                onChange={(e) => setCommentInputs({ ...commentInputs, [currentMember.id]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePostComment(currentMember);
                }}
              />
              <button 
                className="btn-primary"
                onClick={() => handlePostComment(currentMember)}
                style={{ whiteSpace: 'nowrap' }}
              >
                <Send size={16} /> Publicar a Notion
              </button>
            </div>

            {syncStatus[currentMember.id] === 'syncing' && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <RefreshCw className="spin" size={12} /> Enviando acuerdo a la API de Notion...
              </div>
            )}
            {syncStatus[currentMember.id] === 'success' && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={13} /> ¡Acuerdo publicado en vivo en Notion!
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
