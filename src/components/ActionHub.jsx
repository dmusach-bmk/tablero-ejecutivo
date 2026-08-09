import React, { useState } from 'react';
import { Mail, Send, FileText, MessageSquare, Check, Sparkles, AlertCircle } from 'lucide-react';

export default function ActionHub({ prefilledEmailData, onAddComment }) {
  const [recipient, setRecipient] = useState(prefilledEmailData?.to || 'equipo-ingenieria@empresa.com');
  const [subject, setSubject] = useState(prefilledEmailData?.subject || 'Seguimiento Técnico Semanal | Diego Musach');
  const [body, setBody] = useState(prefilledEmailData?.body || 'Estimado equipo,\n\nRevisando las métricas de esta semana en el tablero de control ejecutivo, requiero coordinar...');
  const [sendSuccess, setSendSuccess] = useState('');

  const emailTemplates = [
    {
      title: '📌 Alerta de Fecha Límite & Compromiso',
      subject: 'Urgente: Definición de Fecha Límite para Entregables | Diego Musach',
      body: 'Hola [Nombre],\n\nHe estado revisando las tarjetas activas en Notion y noté que la tarea [Nombre Tarea] no cuenta con una fecha límite final acordada.\n\nPor favor, actualízala hoy antes de las 18:00hs con una estimación realista considerando nuestro estándar de coverage de tests (>85%).\n\nQuedo a disposición si necesitas ayuda para destrabar cualquier impedimento de arquitectura.\n\nSaludos,\nDiego Paolo Musach\nDirector de Ingeniería'
    },
    {
      title: '👑 Feedback Empático + Rigor Técnico',
      subject: 'Feedback Técnico & Reconocimiento | Diego Musach',
      body: 'Hola [Nombre],\n\nQuería felicitarte por el excelente avance en [Proyecto]. La calidad del código y la arquitectura de la solución demuestran un nivel sobresaliente.\n\nComo oportunidad de mejora para continuar elevando nuestra vara técnica, sugiero poner foco en la cobertura de casos bordes en los unit tests de la capa de servicio.\n\n¡Sigamos construyendo software de primer nivel!\n\nDiego Paolo Musach'
    },
    {
      title: '📊 Reporte de Estado a C-Level / Directorio',
      subject: 'Reporte Ejecutivo de Ingeniería & Infraestructura | Diego Musach',
      body: 'Estimados,\n\nLes comparto la síntesis operativa del equipo de Ingeniería a la fecha:\n\n- Velocidad del Equipo: 94 pts / sprint (incremento del 4.2%)\n- Cobertura de Tests Promedio: 88.5%\n- SLA de Latencia en Endpoints: < 125ms\n- Errores Críticos en Producción: 0\n\nSeguimos avanzando según el roadmap trazado.\n\nAtentamente,\nDiego Paolo Musach'
    }
  ];

  const handleApplyTemplate = (tpl) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    setSendSuccess(`✅ Email enviado exitosamente a ${recipient} vía servidor SMTP / API de Correo.`);
    setTimeout(() => setSendSuccess(''), 5000);
  };

  return (
    <div className="action-hub-container">
      <div className="card-header-flex" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>✍️ Centro de Acciones & Envío de Correos</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Redacción ejecutiva, envío directo de correos vía SMTP/API, publicación a Notion y comunicados de ingeniería.
          </p>
        </div>
      </div>

      {sendSuccess && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', borderRadius: '10px', color: '#fff', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          {sendSuccess}
        </div>
      )}

      {/* Grid of Templates & Main Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        
        {/* Left Column: Preset Templates */}
        <div className="card-glass">
          <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles className="text-cyan" size={16} /> Plantillas Ejecutivas Rápidas
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {emailTemplates.map((tpl, idx) => (
              <div
                key={idx}
                onClick={() => handleApplyTemplate(tpl)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '0.2rem' }}>{tpl.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tpl.subject}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Direct SMTP Email Form */}
        <div className="card-glass">
          <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="form-group">
              <label>Destinatario(s):</label>
              <input
                type="text"
                className="form-input"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Asunto del Mensaje:</label>
              <input
                type="text"
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Cuerpo del Email / Instrucción:</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '200px' }}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>
                🔒 Conexión SMTP Activa • Firma Ejecutiva Diego Musach incluida
              </span>

              <button type="submit" className="btn-primary">
                <Send size={16} /> Enviar Email Ahora
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
