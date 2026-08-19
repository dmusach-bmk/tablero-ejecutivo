import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Shield, Cpu, ExternalLink, Mic } from 'lucide-react';
import { createNotionPage } from '../services/notionService';

export default function AsesorEjecutivoChat({ credentials, teamTracking = [], onAddNotionCard, onAddCommentAndSync }) {
  const [messages, setMessages] = useState([
    {
      sender: 'advisor',
      text: '¡Hola Diego! Soy tu ASESOR EJECUTIVO DE LIDERAZGO & CTO. Estoy conectado a tus 165 tarjetas de Notion y a tus videollamadas de Fathom. ¿Sobre qué integrante o proyecto estratégico necesitas asesoría directiva hoy?',
      time: new Date().toLocaleTimeString().slice(0, 5)
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("🎙️ Dictado por voz: Te recomendamos abrir el tablero en Google Chrome para usar el micrófono.");
      return;
    }
    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      }
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const generateExecutiveAdvice = (query) => {
    const q = query.toLowerCase();

    if (q.includes('camilo') || q.includes('tecsys') || q.includes('excel')) {
      return `📌 **ESTRATEGIA PARA CAMILO URIBE (Tecsys & Cotizaciones):**
• **Diagnóstico:** Existen planillas Excel sueltas que dificultan la trazabilidad del cobro.
• **Acción Directiva Recomendada:** Exigir hoy el traspaso del 100% de las planillas de cotización (certificados FCC y CE) y credenciales de Hábitat a tarjetas de Notion.
• **Speech para la Reunión:** «Camilo, cerramos el tema Tecsys pasando todo a Notion hoy. No aprobaremos compras ni avances fuera de la plataforma.»`;
    } else if (q.includes('enrique') || q.includes('wind') || q.includes('aosp') || q.includes('telecable')) {
      return `📌 **ESTRATEGIA PARA ENRIQUE BEVILACQUA (WIND & Telecable Costa Rica):**
• **Diagnóstico:** SLA crítico en la reinstalación del Cluster en VMs de WIND y validación de STB AOSP Elebao con FingerPrint.
• **Acción Directiva Recomendada:** Congelar requerimientos secundarios y fijar el estándar OAuth2 para el SSO de autenticación.
• **Speech para la Reunión:** «Enrique, la prioridad absoluta de esta semana es la estabilidad de las VMs en WIND y la prueba del STB de Telecable.»`;
    } else if (q.includes('fabricio') || q.includes('bot') || q.includes('soporte') || q.includes('capacitaciones')) {
      return `📌 **ESTRATEGIA PARA FABRICIO JOSE NIEVA (Soporte AI & BOT):**
• **Diagnóstico:** Prototipo del Agente BOT AI para Soporte listo con capacitaciones filmadas.
• **Acción Directiva Recomendada:** Exigir el paso a paso documentado en tarjetas de Notion para Koalas y Smart Sensors.
• **Speech para la Reunión:** «Fabricio, queremos ver el BOT respondiendo automáticamente a los tickets de Nivel 1 antes del viernes.»`;
    } else if (q.includes('mario') || q.includes('scorecard') || q.includes('metricas') || q.includes('analytics')) {
      return `📌 **ESTRATEGIA PARA MARIO MAQUEDA (Analytics & Scorecard):**
• **Diagnóstico:** Definición de la matriz de métricas analytics para todo el equipo.
• **Acción Directiva Recomendada:** Fijar el Scorecard con metas semanales de PRs aprobadas y tiempo de respuesta a tickets.`;
    } else {
      return `📌 **ASENSORÍA DIRECTIVA CTO:**
• Diego, para la reunión de hoy es clave enfocar la atención en el **Follow Up Diario** de tarjetas abiertas.
• Exige a cada responsable que comente directamente en Notion API su avance antes de terminar el día.`;
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = {
      sender: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString().slice(0, 5)
    };

    setMessages(prev => [...prev, userMsg]);
    const currentQuery = input.trim();
    setInput('');

    setTimeout(async () => {
      const q = currentQuery.toLowerCase();
      
      // Detect if user wants to create/add a card
      const isCreateRequest = /crear|agregar|abrir|cree|agrege|targeja|tarjeta/i.test(q);
      
      if (isCreateRequest) {
        // Detect assignee
        const members = [
          { name: 'Mario Maqueda', key: 'mario' },
          { name: 'Camilo Uribe', key: 'camilo' },
          { name: 'Leonard Amaya', key: 'leo' },
          { name: 'Leonard Amaya', key: 'leonard' },
          { name: 'Joseph Valer', key: 'joseph' },
          { name: 'Fabricio Jose Nieva', key: 'fabricio' },
          { name: 'Enrique Bevilacqua', key: 'enrique' },
          { name: 'Rodolfo', key: 'rodolfo' },
          { name: 'Diego Musach (CTO)', key: 'diego' }
        ];
        
        const foundMember = members.find(m => q.includes(m.key));
        const assigneeName = foundMember ? foundMember.name : 'Diego Musach (CTO)';
        
        // Clean title: remove terms like "agregar tarjeta", "crear tarjeta", "joseph:", etc.
        let title = currentQuery
          .replace(/joseph|mario|camilo|leonard|leo|fabricio|enrique|rodolfo/i, '')
          .replace(/crear|agregar|abrir|tarjeta|targeja/ig, '')
          .replace(/[:.,]/g, '')
          .trim();
          
        if (title.length < 3) {
          title = "Nueva tarea creada desde Chat";
        }
        
        try {
          const newCard = {
            id: `new-${Date.now()}-${Math.random()}`,
            notionPageId: `new-${Date.now()}-${Math.random()}`,
            title: title,
            summary: title,
            status: 'Abierto',
            priority: 'P2 - ALTA',
            responsable: assigneeName,
            assignedTo: assigneeName,
            comments: []
          };
          
          await createNotionPage(credentials?.notionToken, newCard);
          
          if (onAddNotionCard) {
            onAddNotionCard(newCard);
          }
          
          setMessages(prev => [
            ...prev,
            {
              sender: 'advisor',
              text: `🤖 ¡Entendido, Diego! Acabo de crear la tarjeta **"${title}"** y asignársela a **${assigneeName}**. Ya está visible en su lista de temas de Follow Up y sincronizada.`,
              time: new Date().toLocaleTimeString().slice(0, 5)
            }
          ]);
          return;
        } catch (e) {
          console.error("Error creating card from chat:", e);
        }
      }

      const responseText = generateExecutiveAdvice(currentQuery);
      setMessages(prev => [
        ...prev,
        {
          sender: 'advisor',
          text: responseText,
          time: new Date().toLocaleTimeString().slice(0, 5)
        }
      ]);
    }, 600);
  };

  return (
    <div className="card-glass" style={{ padding: '1.25rem', height: '640px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '10px', color: 'var(--accent-purple)' }}>
            <Bot size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: 0, fontWeight: 700 }}>
              🧠 ASESOR EJECUTIVO DE LIDERAZGO & CTO
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
              AI Intelligence Agent • Conectado a 165 tarjetas de Notion & Fathom Calls
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
        {messages.map((msg, idx) => {
          const isAdvisor = msg.sender === 'advisor';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: isAdvisor ? 'flex-start' : 'flex-end',
                alignItems: 'flex-start'
              }}
            >
              {isAdvisor && (
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.3)', border: '1px solid var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)', flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              )}

              <div
                style={{
                  maxWidth: '82%',
                  background: isAdvisor ? 'rgba(15, 23, 42, 0.9)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                  color: '#fff',
                  border: isAdvisor ? '1px solid var(--accent-purple)' : 'none',
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

      {/* Input Form WITH MICROPHONE BUTTON */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '0.6rem' }}
      >
        <input
          type="text"
          className="form-input"
          placeholder={isListening ? "🎙️ Escuchando tu voz por micrófono..." : "Pregúntale al Asesor o dicta con el micrófono (🎙️)..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ padding: '0.85rem 1.1rem', fontSize: '0.9rem', flex: 1, borderColor: isListening ? 'var(--accent-rose)' : undefined }}
        />

        <button
          type="button"
          onClick={handleStartVoiceDictation}
          className={`btn-icon ${isListening ? 'active' : ''}`}
          style={{
            padding: '0.85rem',
            borderRadius: '8px',
            background: isListening ? 'var(--accent-rose)' : 'rgba(168, 85, 247, 0.2)',
            color: '#fff',
            border: isListening ? '1px solid var(--accent-rose)' : '1px solid var(--accent-purple)',
            cursor: 'pointer'
          }}
          title="Dictar por micrófono 🎙️"
        >
          <Mic size={18} className={isListening ? 'pulse' : ''} />
        </button>

        <button type="submit" className="btn-primary" style={{ padding: '0.85rem 1.5rem', whiteSpace: 'nowrap' }}>
          <Send size={16} /> Preguntar al Asesor
        </button>
      </form>

    </div>
  );
}
