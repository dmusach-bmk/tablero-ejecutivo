import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AsesorEjecutivoChat({ teamTracking, notionCards, credentials }) {
  const [messages, setMessages] = useState([
    {
      sender: 'advisor',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "Hola Diego. Soy tu ASESOR EJECUTIVO. Tengo visibilidad completa de las tareas de Camilo, Iván, Joseph y tus proyectos en Notion. ¿En qué tema técnico o de liderazgo necesitas asesoramiento o redacción ahora mismo?"
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const presetQuestions = [
    "¿Cómo le exijo a Camilo que use Notion en lugar de planillas Excel sin fricción?",
    "¿Cuál es el estado crítico de las certificaciones FCC/CE con Iván y cómo destrabarlo?",
    "Redactar un borrador de correo asertivo para Tecsys sobre el entorno Hábitat.",
    "Resumen de prioridades ejecutivas de la semana para Diego Musach."
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query || !query.trim()) return;

    const userMsg = {
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate tailored response from ASESOR EJECUTIVO
    setTimeout(() => {
      let reply = "";
      const qLower = query.toLowerCase();

      if (qLower.includes('camilo') || qLower.includes('excel')) {
        reply = `**Recomendación del Asesor Ejecutivo para tratar con Camilo:**\n\n` +
          `1. **Alineación de Expectativas:** En tu próxima sesión 1-on-1, comunícale que el seguimiento en Excel dispersa la información de ingeniería y genera retrabajo.\n` +
          `2. **Estándar Inflexible:** Exige que cada entregable de Tecsys tenga su tarjeta en Notion con los 3 campos obligatorios: *Responsable*, *Fecha Límite* y *Log de Seguimiento*.\n` +
          `3. **Acción Recomendada:** Publica el comentario directamente en la tarjeta de Camilo desde la solapa de *Micromanagement*.`;
      } else if (qLower.includes('iván') || qLower.includes('fcc') || qLower.includes('hábitat') || qLower.includes('habitat')) {
        reply = `**Análisis Táctico para Iván (Hábitat & Certificaciones Brasil):**\n\n` +
          `1. **Trámites FCC/CE:** La cotización de certificados desde Brasil está clasificada como **P1 - CRÍTICA**. Iván necesita un timebox de 48hs para obtener respuesta del proveedor.\n` +
          `2. **Entorno Hábitat:** Solicita a Iván el contacto directo del líder técnico en Tecsys para agilizar la entrega de credenciales.\n` +
          `3. **Borrador sugerido para enviar a Iván:** *"Iván, necesitamos cerrar la propuesta de FCC/CE esta semana. Por favor actualízame si tenemos novedades de Brasil antes del jueves."*`;
      } else if (qLower.includes('resumen') || qLower.includes('prioridad') || qLower.includes('semana')) {
        reply = `**Resumen Ejecutivo Semanal para Diego Musach (CTO):**\n\n` +
          `• 🔴 **Top Prioridad Crítica (P1):** Cotización de certificados FCC/CE de Tecsys (Iván) y credenciales de Hábitat.\n` +
          `• 🟡 **Prioridad Alta (P2):** Transición del seguimiento de Camilo de Excel a Notion y finalización del deck comercial de SS.\n` +
          `• 🟢 **Control de Gestión:** Auditoría de tarjetas y vencimientos a cargo de Joseph.\n\n` +
          `¿Deseas que redacte una instrucción o correo automático para alguno de ellos?`;
      } else {
        reply = `Entendido, Diego. Como tu **ASESOR EJECUTIVO**, he analizado tu consulta sobre "${query}".\n\n` +
          `Manteniendo tu estándar de **Alta Exigencia Técnica + Empatía Humana**, sugiero:\n` +
          `1. Definir un responsable único y una fecha límite concreta.\n` +
          `2. Documentar la decisión técnica en la tarjeta de Notion correspondiente.\n` +
          `3. ¿Deseas que publique esta instrucción directamente como comentario en Notion o la envíe por correo?`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'advisor',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: reply
        }
      ]);
    }, 600);
  };

  return (
    <div className="asesor-ejecutivo-container card-glass" style={{ minHeight: '650px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ASESOR EJECUTIVO
              <Sparkles size={16} className="text-cyan" />
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Asistente de Liderazgo & Estrategia Técnica para Diego Paolo Musach
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} /> Conectado a Notion & Equipo Real
        </div>
      </div>

      {/* Preset 1-Click Prompt Pills */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ⚡ Consultas Frecuentes en 1-Click:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              className="btn-secondary"
              onClick={() => handleSend(q)}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)' }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1.25rem', maxHeight: '420px' }}>
        {messages.map((msg, idx) => {
          const isAdvisor = msg.sender === 'advisor';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignSelf: isAdvisor ? 'flex-start' : 'flex-end',
                maxWidth: '85%'
              }}
            >
              {isAdvisor && (
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              )}

              <div
                style={{
                  background: isAdvisor ? 'rgba(15, 23, 42, 0.9)' : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                  border: isAdvisor ? '1px solid var(--border-subtle)' : 'none',
                  color: '#fff',
                  borderRadius: isAdvisor ? '0 16px 16px 16px' : '16px 0 16px 16px',
                  padding: '0.9rem 1.1rem',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: isAdvisor ? 'var(--text-muted)' : 'rgba(255,255,255,0.8)', marginBottom: '0.3rem' }}>
                  <strong>{isAdvisor ? 'ASESOR EJECUTIVO' : 'Diego Musach'}</strong>
                  <span>{msg.time}</span>
                </div>
                {msg.text}
              </div>

              {!isAdvisor && (
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  DM
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '0.75rem' }}
      >
        <input
          type="text"
          className="form-input"
          placeholder="Pregúntale a tu ASESOR EJECUTIVO sobre Camilo, Iván, Joseph, Notion o estrategias..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ padding: '0.85rem 1.1rem', fontSize: '0.9rem' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.85rem 1.5rem', whiteSpace: 'nowrap' }}>
          <Send size={16} /> Preguntar al Asesor
        </button>
      </form>

    </div>
  );
}
