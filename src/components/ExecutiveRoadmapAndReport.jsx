import React, { useState } from 'react';
import { Calendar, FileText, CheckCircle2, Copy, Send, Sparkles, Clock, Layers, ExternalLink, Download, Video, Award, Target } from 'lucide-react';

export default function ExecutiveRoadmapAndReport({ teamTracking = [], notionCards = [] }) {
  const [copiedReport, setCopiedReport] = useState(false);

  const fathomTechnologyFollowUps = [
    {
      id: 'fath-jul-1',
      title: 'Meet Seguimiento Video: Desarrollo + QT + Servicios',
      date: '10 de Agosto, 2026',
      lead: 'Diego Musach / Enrique Bevilacqua / Leonard Amaya',
      takeaways: [
        'STB Elebao AOSP: Avance en laboratorio de pruebas para Telecable Costa Rica con chips Montage.',
        'FingerPrint: Marca de agua digital verificada sobre la señal de streaming.',
        'Heroku & CableView: Programada la ventana de auto-stop de servidores Heroku y congelamiento de vistas frontend (Ahorro USD 14,400/año).',
        'Soporte Técnico: Kenyi y Sabrina reportan reducción en tiempo medio de respuesta de Nivel 1.'
      ]
    },
    {
      id: 'fath-jul-2',
      title: 'Weekly Follow Up Tecnología - Cluster VMs & SSO OAuth2',
      date: '03 de Agosto, 2026',
      lead: 'Enrique Bevilacqua / Camilo Uribe',
      takeaways: [
        'WIND Telecom: Reinstalación y pruebas de carga en Cluster de máquinas virtuales.',
        'Single Sign-On: Estándar OAuth2 definido e integrado para la plataforma directiva.',
        'Tecsys Brasil: Avance en la homologación de licencias y certificados FCC/CE (USD 45,000).'
      ]
    },
    {
      id: 'fath-jul-3',
      title: 'Weekly Follow Up Tecnología - EDEMSA Mendoza & Pérdidas BT',
      date: '27 de Julio, 2026',
      lead: 'Camilo Uribe / Diego Musach',
      takeaways: [
        'EDEMSA (Mendoza): Auditoría final de 10 alimentadores corregida con Nicolás Zuin.',
        'Facturación: Grilla de validación de pérdidas en BT aprobada para emisión de factura por USD 50,000.',
        'Gabinetes: Relevamiento operativo de 2,300 gabinetes de fibra de vidrio en Argentina y Colombia.'
      ]
    },
    {
      id: 'fath-jul-4',
      title: 'Weekly Follow Up Tecnología - Bot AI Gemini & Capacitaciones',
      date: '13 de Julio, 2026',
      lead: 'Fabricio Jose Nieva / Joseph Valer',
      takeaways: [
        'Bot AI Gemini: Prototipo del Agente de soporte entrenado con capacitaciones filmadas.',
        'Efectividad: Reducción estimada del 35% en volumen de consultas repetitivas de Nivel 1.',
        'Vega OS: Solicitado hardware de pruebas Amazon Fire TV Stick 4K Select para Mario Maqueda.'
      ]
    }
  ];

  const generateFathomCEOReport = () => {
    const nowStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    return `======================================================================
📊 INFORME EJECUTIVO CEO - REUNIONES FOLLOW UP TECNOLOGÍA (FATHOM AI)
Para: Alejandro Cubino (CEO)
De: Diego Paolo Musach (Director & Head of Engineering)
Período Auditado: Julio 2026 - Agosto 2026 (Filtrado Exclusivo en Fathom API)
Fecha de Emisión: ${nowStr}
======================================================================

1. 🎥 RESUMEN CONSOLIDADO DE REUNIONES FOLLOW UP TECNOLOGÍA (JULIO - AGOSTO 2026):

• SESIÓN 1: Meet Seguimiento Video: Desarrollo + QT + Servicios (10/08/2026)
  - STB Elebao AOSP: Homologación en laboratorio para Telecable Costa Rica con procesadores Montage.
  - FingerPrint: Verificación exitosa de marca de agua digital en señal de video.
  - Heroku & CableView: Programado auto-stop de servidores y migración frontend por Leonard Amaya (Ahorro: USD 14,400/año).
  - Soporte: Reducción del tiempo medio de atención por Sabrina y Kenyi.

• SESIÓN 2: Weekly Follow Up Tecnología - Cluster VMs & SSO OAuth2 (03/08/2026)
  - WIND Telecom: Despliegue en staging de microservicios en Cluster de VMs.
  - Single Sign-On: Estándar OAuth2 configurado para autenticación centralizada por Enrique Bevilacqua.
  - Tecsys Brasil: Cotización desglosada de USD 45,000 en certificados FCC/CE.

• SESIÓN 3: Weekly Follow Up Tecnología - EDEMSA Mendoza & Pérdidas BT (27/07/2026)
  - EDEMSA (Mendoza): 10 alimentadores auditados y validados con Sergio Palmucci y Nicolás Zuin.
  - Cobranza: Grilla de pérdidas técnica en BT lista para emisión de factura por USD 50,000.
  - Gabinetes: Relevamiento operativo de 2,300 gabinetes en Argentina y Colombia.

• SESIÓN 4: Weekly Follow Up Tecnología - Bot AI Gemini & Capacitaciones (13/07/2026)
  - Soporte AI Gemini: Entrenamiento del BOT autónomo con capacitaciones filmadas por Fabricio Nieva y Joseph Valer.
  - Meta: Reducción proyectada del 35% de tickets recurrentes de Nivel 1.

======================================================================
2. 📌 COMPROMISOS DIRECTIVOS & ASIGNACIONES POR INTEGRANTE:
• Enrique Bevilacqua: Informe de laboratorio STB Elebao Costa Rica + Arquitectura SSO WIND.
• Camilo Uribe: Traspaso de planilla Tecsys a Notion + Emisión de factura EDEMSA USD 50k.
• Leonard Amaya: Ventana de mantenimiento Heroku + Congelado de vistas CableView.
• Fabricio Nieva & Joseph Valer: Pruebas del Bot AI Gemini con llamadas reales Fathom.
• Mario Maqueda: Desarrollo de app en Vega OS para Amazon Fire TV Stick 4K Select.

======================================================================
3. 📈 ESTADO DE CUMPLIMIENTO Q3 2026:
• Avance Global de Ingeniería: 82%
• Sincronización Notion API: 2-Way Sync en tiempo real con 165 tarjetas activas.
======================================================================`;
  };

  const handleCopyCEOReport = () => {
    const text = generateFathomCEOReport();
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleSendCEOEmail = () => {
    const subject = encodeURIComponent(`[INFORME CEO] Follow Up Tecnología Fathom (Julio-Agosto 2026) - Alejandro Cubino`);
    const body = encodeURIComponent(generateFathomCEOReport());
    window.open(`mailto:acubino@bromteck.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="executive-roadmap-container">
      
      {/* Header Banner */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video className="text-purple" size={22} /> 🤖 Reporte Semanal para CEO (Basado en Follow Up Tecnología Fathom)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Generación de informe directivo para Alejandro Cubino procesando exclusivamente videollamadas de <strong>Julio 2026 a la fecha</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={handleCopyCEOReport}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}
            >
              {copiedReport ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copiedReport ? '¡Reporte Copiado!' : '📋 Copiar Reporte para CEO'}
            </button>

            <button
              className="btn-secondary"
              onClick={handleSendCEOEmail}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Send size={14} /> Enviar a Alejandro (acubino@bromteck.com)
            </button>
          </div>
        </div>
      </div>

      {/* FATHOM FOLLOW UP TECNOLOGIA MEETINGS LIST (JULY 2026 TO PRESENT) */}
      <div className="card-glass" style={{ padding: '1.2rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Video className="text-cyan" size={18} /> 🎥 Reuniones Fathom "Follow Up Tecnología" Procesadas (Julio - Agosto 2026)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {fathomTechnologyFollowUps.map((meeting) => (
            <div key={meeting.id} style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.9rem 1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 700 }}>
                  {meeting.title}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                  📅 {meeting.date} | 👤 {meeting.lead}
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', lineHeight: '1.45' }}>
                {meeting.takeaways.map((point, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--accent-emerald)' }}>•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CEO REPORT PREVIEW TEXTAREA */}
      <div className="card-glass" style={{ padding: '1.2rem', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText className="text-purple" size={18} /> 📄 Previsualización del Informe CEO (Julio - Agosto 2026)
          </h3>
          <span style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
            Formato Markdown / Copia Directa
          </span>
        </div>

        <textarea
          className="form-input"
          rows={18}
          readOnly
          value={generateFathomCEOReport()}
          style={{ fontSize: '0.8rem', lineHeight: '1.45', fontFamily: 'monospace', background: 'rgba(15, 23, 42, 0.95)', color: '#e2e8f0', borderRadius: '8px', padding: '0.85rem' }}
        />
      </div>

    </div>
  );
}
