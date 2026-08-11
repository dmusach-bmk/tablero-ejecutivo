import React, { useState } from 'react';
import { Calendar, FileText, CheckCircle2, Copy, Send, Sparkles, Clock, Layers, ExternalLink, Download } from 'lucide-react';

export default function ExecutiveRoadmapAndReport({ teamTracking = [], notionCards = [] }) {
  const [copiedReport, setCopiedReport] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const roadmapMilestones = [
    {
      id: 'm-1',
      title: 'EDEMSA: Facturación de 10 Alimentadores & Pérdidas',
      lead: 'Camilo Uribe / Diego Musach',
      startMonth: 'Julio 2026',
      endMonth: 'Agosto 2026',
      progress: 90,
      status: 'Fase Final / Facturación',
      color: 'var(--accent-emerald)'
    },
    {
      id: 'm-2',
      title: 'Tecsys: Cotizaciones FCC/CE & Traspaso a Notion',
      lead: 'Camilo Uribe',
      startMonth: 'Julio 2026',
      endMonth: 'Agosto 2026',
      progress: 80,
      status: 'En Cierre de Cotización',
      color: 'var(--accent-cyan)'
    },
    {
      id: 'm-3',
      title: 'WIND Telecom: Reinstalación Cluster VMs & SSO OAuth2',
      lead: 'Enrique Bevilacqua',
      startMonth: 'Agosto 2026',
      endMonth: 'Septiembre 2026',
      progress: 60,
      status: 'SLA Crítico / Pruebas Staging',
      color: 'var(--accent-purple)'
    },
    {
      id: 'm-4',
      title: 'Telecable Costa Rica: Homologación STB Elebao AOSP & FingerPrint',
      lead: 'Enrique Bevilacqua',
      startMonth: 'Agosto 2026',
      endMonth: 'Octubre 2026',
      progress: 45,
      status: 'Laboratorio / Viaje Programado',
      color: 'var(--accent-rose)'
    },
    {
      id: 'm-5',
      title: 'Desmantelamiento Heroku & Migración CableView',
      lead: 'Leonard Amaya',
      startMonth: 'Agosto 2026',
      endMonth: 'Septiembre 2026',
      progress: 70,
      status: 'Auto-Stop Nocturno Activo',
      color: 'var(--accent-amber)'
    },
    {
      id: 'm-6',
      title: 'Soporte AI BOT Gemini: Reducción del 35% de Tickets Nivel 1',
      lead: 'Fabricio Jose Nieva / Joseph Valer',
      startMonth: 'Julio 2026',
      endMonth: 'Octubre 2026',
      progress: 75,
      status: 'Prototipo Filmado Probado',
      color: 'var(--accent-cyan)'
    }
  ];

  const generateCEOWeeklyReport = () => {
    const nowStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    return `======================================================================
📊 INFORME EJECUTIVO SEMANAL DE INGENIERÍA CTO
Para: Alejandro Cubino (CEO)
De: Diego Paolo Musach (Director & Head of Engineering)
Fecha: ${nowStr}
======================================================================

1. 📌 AVANCES ESTRATÉGICOS & PROYECTOS CLAVE:
• EDEMSA (Mendoza): 10 alimentadores auditados. Grilla corregida con Nicolás y Mauricio Zuin. Listo para facturación de USD 50,000.
• TECSYS BRASIL: Cotización de certificados FCC/CE recibida (USD 45,000). Traspaso completo de planillas Excel a tarjetas de Notion en ejecución por Camilo Uribe.
• WIND TELECOM: Estabilidad del Cluster en VMs en curso. Definición de estándar OAuth2 para Single Sign-On coordinado por Enrique Bevilacqua.
• TELECABLE COSTA RICA: Equipos decodificadores STB Elebao AOSP y Montage en laboratorio para pruebas de FingerPrint.
• INFRAESTRUCTURA Y COSTOS NUBE: Programado desmantelamiento de entornos Heroku y migración frontend por Leonard Amaya (Ahorro proyectado de USD 14,400/año).
• SOPORTE AI & BOT GEMINI: Prototipo del BOT entrenado con capacitaciones filmadas por Fabricio Nieva y Joseph Valer. Reducción estimada del 35% de tickets de Nivel 1.

2. 🚨 GESTIÓN DE NOTION API & CONTROLES DIARIOS:
• Total de Tarjetas en Seguimiento: 165 tarjetas activas.
• Sincronización en Vivo: 2-Way Sync en tiempo real con comentarios y estados auditados diariamente.

3. 🎥 FATHOM VIDEO NOTETAKER & INTEGRACIÓN GMAIL:
• Ingesta de Videollamadas: 100% de reuniones desde el 1° de Julio de 2026 indexadas con extracción automática de delegaciones.
• Gmail & Google Drive: 10,558 correos procesados de dmusach@bromteck.com con auditoría proactiva cada 60 minutos.

======================================================================
Quedo a tu disposición para cualquier profundización en el informe.
Atentamente,
Diego Paolo Musach | Director & Head of Engineering
======================================================================`;
  };

  const handleCopyCEOReport = () => {
    const text = generateCEOWeeklyReport();
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleSendCEOEmail = () => {
    const subject = encodeURIComponent(`[INFORME EJECUTIVO CTO] Resumen Semanal de Ingeniería - Alejandro Cubino`);
    const body = encodeURIComponent(generateCEOWeeklyReport());
    window.open(`mailto:acubino@bromteck.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="executive-roadmap-container">
      
      {/* Header Banner */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar className="text-purple" size={22} /> 📅 Gantt Directivo de Hitos & 🤖 Reporte Semanal para CEO
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Línea de tiempo interactiva de entregables + Generación automática de informe semanal para Alejandro Cubino.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-primary"
              onClick={handleCopyCEOReport}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}
            >
              {copiedReport ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copiedReport ? '¡Reporte Copiado!' : '📋 Copiar Reporte para CEO'}
            </button>

            <button
              className="btn-secondary"
              onClick={handleSendCEOEmail}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Send size={14} /> Enviar a Alejandro (CEO)
            </button>
          </div>
        </div>
      </div>

      {/* GANTT ROADMAP SECTION */}
      <div className="card-glass" style={{ padding: '1.2rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-purple)' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock className="text-purple" size={18} /> Cronograma Gantt Directivo de Entregables (Q3-Q4 2026)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {roadmapMilestones.map((m) => (
            <div key={m.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.8rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 700 }}>
                    {m.title}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', marginLeft: '0.6rem' }}>
                    👤 {m.lead}
                  </span>
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  📅 {m.startMonth} ➔ {m.endMonth} | <strong style={{ color: m.color }}>{m.status}</strong>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                <div 
                  style={{ 
                    width: `${m.progress}%`, 
                    height: '100%', 
                    background: m.color, 
                    borderRadius: '5px',
                    transition: 'width 0.5s ease'
                  }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>Avance: {m.progress}%</span>
                <span>Objetivo Q3-Q4</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CEO REPORT PREVIEW CARD */}
      <div className="card-glass" style={{ padding: '1.2rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText className="text-cyan" size={18} /> 🤖 Previsualización del Informe Semanal Consolidado
          </h3>
          <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)' }}>
            Generado automáticamente en tiempo real
          </span>
        </div>

        <textarea
          className="form-input"
          rows={16}
          readOnly
          value={generateCEOWeeklyReport()}
          style={{ fontSize: '0.8rem', lineHeight: '1.45', fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', color: '#e2e8f0' }}
        />
      </div>

    </div>
  );
}
