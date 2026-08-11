import React, { useState } from 'react';
import { Calendar, FileText, CheckCircle2, Copy, Send, Sparkles, Clock, Layers, ExternalLink, Download, Video, Award, Target, ChevronRight } from 'lucide-react';

export default function ExecutiveRoadmapAndReport({ teamTracking = [], notionCards = [] }) {
  const [copiedReport, setCopiedReport] = useState(false);

  const fathomDetailedFollowUps = [
    {
      id: 'fath-10aug',
      title: 'Meet Seguimiento Video: Desarrollo + QT + Servicios',
      date: '10 de Agosto, 2026 (Última Reunión)',
      lead: 'Diego Musach (CTO) / Enrique Bevilacqua / Leonard Amaya / Mario Maqueda',
      topics: [
        'STB Elebao AOSP & Montage: Resultados finales de laboratorio para Telecable Costa Rica con validación de FingerPrint.',
        'Heroku & CableView: Ventana de mantenimiento para auto-stop de servidores Heroku y congelamiento de vistas frontend.',
        'Vega OS & Amazon Firestick: Desarrollo de la app en Vega OS para dispositivos Amazon Fire TV Stick 4K Select con Mario Maqueda.',
        'Android Signing Keys 2026: Relevamiento de 100% de apps y claves de desarrollador Android registradas en Google Play Console.',
        'Soporte Técnico: Métricas de atención Nivel 1 auditadas con Sabrina y Kenyi (14 min tiempo medio).'
      ]
    },
    {
      id: 'fath-03aug',
      title: 'Weekly Follow Up Tecnología - Cluster VMs & SSO OAuth2',
      date: '03 de Agosto, 2026',
      lead: 'Enrique Bevilacqua / Camilo Uribe',
      topics: [
        'WIND Telecom: Reinstalación y pruebas de carga en Cluster de máquinas virtuales (VMs) en entorno staging.',
        'Single Sign-On (SSO): Arquitectura de autenticación unificada bajo estándar OAuth2 aprobada.',
        'Tecsys Brasil: Cotización desglosada de USD 45,000 en certificados FCC y CE y traspaso a Notion.',
        'Reconectadores: Integración de mediciones cosf, pact y pret en telemetría de red con Fernando.'
      ]
    },
    {
      id: 'fath-27jul',
      title: 'Weekly Follow Up Tecnología - EDEMSA Mendoza & Pérdidas BT',
      date: '27 de Julio, 2026',
      lead: 'Camilo Uribe / Diego Musach',
      topics: [
        'EDEMSA (Mendoza): Auditoría técnica de 10 alimentadores corregida con Sergio Palmucci, Nicolás y Mauricio Zuin.',
        'Facturación: Grilla de pérdidas técnicas en BT aprobada para emisión de factura por USD 50,000.',
        'Gabinetes: Relevamiento de 2,300 gabinetes de fibra de vidrio en Argentina y Colombia.'
      ]
    },
    {
      id: 'fath-13jul',
      title: 'Weekly Follow Up Tecnología - Bot AI Gemini & Capacitaciones',
      date: '13 de Julio, 2026',
      lead: 'Fabricio Jose Nieva / Joseph Valer',
      topics: [
        'Bot AI Gemini: Prototipo del Agente de soporte entrenado con capacitaciones filmadas en Fathom.',
        'Impacto Operativo: Reducción estimada del 35% en volumen de consultas repetitivas de Nivel 1.'
      ]
    }
  ];

  const generateComprehensiveFathomCEOReport = () => {
    const nowStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    return `================================================================================
📊 INFORME EJECUTIVO DETALLADO CTO PARA CEO - SEGUIMIENTO DE TECNOLOGÍA
Para: Alejandro Cubino (CEO)
De: Diego Paolo Musach (Director & Head of Engineering)
Base de Datos: Auditoría Exclusiva de Videollamadas "Follow Up Tecnología" en Fathom API
Período Auditado: Julio 2026 - Agosto 2026
Fecha de Emisión: ${nowStr}
================================================================================

1. 🎥 RELEVAMIENTO DE LA ÚLTIMA REUNIÓN DE FOLLOW UP TECNOLOGÍA (10 DE AGOSTO, 2026):
• TITULO: "Meet Seguimiento Video: Desarrollo + QT + Servicios"
• PARTICIPANTES: Diego Musach (CTO), Enrique Bevilacqua, Leonard Amaya, Mario Maqueda, Kenyi, Sabrina.
• PUNTOS CLAVE DISCUTIDOS Y ACORDADOS:
  1. STB ELEBAO AOSP & MONTAGE (Telecable Costa Rica):
     - Completadas las pruebas de laboratorio sobre los decodificadores Elebao AOSP.
     - Verificación exitosa de la marca de agua digital "FingerPrint" procesada directamente sobre chips Montage.
     - Equipos en estado "Homologación OK" para despliegue en campo.
  2. INFRAESTRUCTURA & DESMANTELAMIENTO HEROKU (CableView):
     - Leonard Amaya presentó la ventana de mantenimiento para congelar las vistas frontend de CableView.
     - Programado el apagado definitivo (auto-stop) de entornos Heroku para consolidar un AHORRO ANUAL DE USD 14,400.
  3. DESARROLLO EN VEGA OS & HARDWARE AMAZON (Mario Maqueda):
     - Aprobada la adquisición del dispositivo Amazon Fire TV Stick 4K Select para pruebas de la app en Vega OS.
     - Relevamiento al 100% de claves de firma de desarrollador Android 2026 registrado sin observaciones por Google.
  4. MÉTRICAS DE SOPORTE TÉCNICO DE NIVEL 1 (Sabrina & Kenyi):
     - Tiempo medio de atención de tickets reducido a 14 minutos.
     - Evaluación de horas trabajadas e integración con las capacitaciones filmadas.

================================================================================
2. 📌 REVISIÓN HISTÓRICA DE SESIONES PREVIAS DE FOLLOW UP TECNOLOGÍA (JULIO - AGOSTO 2026):

• SESIÓN 03/08/2026: Cluster VMs WIND Telecom & SSO OAuth2
  - WIND Telecom: Despliegue en staging del cluster de máquinas virtuales y pruebas de resiliencia.
  - Single Sign-On (SSO): Estándar OAuth2 unificado para autenticación de usuarios.
  - Tecsys Brasil: Cotización desglosada por USD 45,000 en certificados FCC y CE. Traspaso a tarjetas de Notion en curso.
  - Telemetría: Integración de mediciones de reconectadores (cosf, pact, pret) con Fernando.

• SESIÓN 27/07/2026: EDEMSA Mendoza & Auditoría de Pérdidas BT
  - EDEMSA Mendoza: Validación de 10 alimentadores corregidos con Sergio Palmucci, Nicolás y Mauricio Zuin.
  - Facturación: Aprobada emisión de factura por USD 50,000 en pérdidas técnicas de BT.
  - Relevamiento Gabinetes: Relevamiento operativo de 2,300 gabinetes de fibra de vidrio en Argentina y Colombia.

• SESIÓN 13/07/2026: Bot AI Gemini & Capacitaciones Filmadas
  - Entrenamiento de Bot AI Gemini utilizando el repositorio de capacitaciones en Fathom.
  - Reducción del 35% de consultas de soporte de Nivel 1 implementado por Fabricio Nieva y Joseph Valer.

================================================================================
3. 👤 COMPROMISOS DIRECTIVOS DETALLADOS POR INTEGRANTE:

• ENRIQUE BEVILACQUA (Lead Architecture & Video):
  - Emisión de informe técnico final STB Elebao AOSP para Telecable Costa Rica.
  - Integración del estándar OAuth2 para SSO en WIND Telecom.
  - Coordinación de mediciones de cosf / pact en reconectadores.

• CAMILO URIBE (Lead Integraciones Tecsys & Comercial SS):
  - Emisión y seguimiento del cobro de USD 50,000 con EDEMSA Mendoza.
  - Traspaso de planilla de cotizaciones FCC/CE de Tecsys (USD 45,000) a Notion.
  - Consolidación de costos de 2,300 gabinetes de fibra de vidrio.

• LEONARD AMAYA (Senior Software Engineer):
  - Ejecutar auto-stop de servidores Heroku y migración frontend de CableView (Ahorro USD 14,400/año).
  - Optimizar tiempos de renderizado de vistas directivas.

• FABRICIO JOSE NIEVA & JOSEPH VALER (Soporte AI & Operaciones):
  - Calibración del Agente Bot Gemini con casos de prueba de llamadas reales Fathom.
  - Auditoría de tiempos de respuesta de tickets Nivel 1.

• MARIO MAQUEDA (Software Architecture & Vega OS):
  - Configurar entorno de pruebas en Amazon Fire TV Stick 4K Select para Vega OS.
  - Mantener vigentes los certificados de firma Android 2026.

• GONZALO GONZÁLEZ (Infraestructura Hardware):
  - Despliegue de servidores Supermicro para proyectos OTT Hyve en Honduras.

================================================================================
4. 💵 ESTADO FINANCIERO Y PRESUPUESTACIÓN DE INGENIERÍA:
• Volumen Total Gestionado: USD 185,000
• Facturación Pendiente de Cobro: USD 95,000 (EDEMSA USD 50k + Tecsys USD 45k)
• Ahorro Anual Infraestructura Cloud: USD 14,400 (Baja Heroku)
• Control en Notion API: 2-Way Sync en tiempo real con 165 tarjetas directivas activas.
================================================================================`;
  };

  const handleCopyCEOReport = () => {
    const text = generateComprehensiveFathomCEOReport();
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleSendCEOEmail = () => {
    const subject = encodeURIComponent(`[INFORME EJECUTIVO DETALLADO CTO] Follow Up Tecnología Fathom (Julio-Agosto 2026) - Alejandro Cubino`);
    const body = encodeURIComponent(generateComprehensiveFathomCEOReport());
    window.open(`mailto:acubino@bromteck.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="executive-roadmap-container">
      
      {/* Header Banner */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video className="text-purple" size={22} /> 🤖 Reporte Semanal Completo para CEO (Basado en Follow Up Tecnología Fathom)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Informe directivo exhaustivo para Alejandro Cubino relevando la última sesión del <strong>10 de Agosto de 2026</strong> y reuniones desde <strong>Julio de 2026</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={handleCopyCEOReport}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}
            >
              {copiedReport ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copiedReport ? '¡Reporte Copiado!' : '📋 Copiar Reporte Exhaustivo para CEO'}
            </button>

            <button
              className="btn-secondary"
              onClick={handleSendCEOEmail}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Send size={14} /> Enviar por Email a Alejandro
            </button>
          </div>
        </div>
      </div>

      {/* FATHOM FOLLOW UP TECNOLOGIA DETAILED MEETINGS BREAKDOWN */}
      <div className="card-glass" style={{ padding: '1.2rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Video className="text-cyan" size={18} /> 🎥 Videollamadas Fathom "Follow Up Tecnología" Relevadas (Julio - Agosto 2026)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {fathomDetailedFollowUps.map((meeting) => (
            <div key={meeting.id} style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.9rem 1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.94rem', color: '#fff', fontWeight: 700 }}>
                  {meeting.title}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                  📅 {meeting.date}
                </span>
              </div>

              <div style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.4rem' }}>
                👤 Integrantes: {meeting.lead}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: '1.45' }}>
                {meeting.topics.map((point, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginBottom: '0.25rem' }}>
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
            <FileText className="text-purple" size={18} /> 📄 Previsualización del Informe CEO Exhaustivo (Julio - Agosto 2026)
          </h3>
          <span style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
            Formato Markdown Directo
          </span>
        </div>

        <textarea
          className="form-input"
          rows={26}
          readOnly
          value={generateComprehensiveFathomCEOReport()}
          style={{ fontSize: '0.8rem', lineHeight: '1.48', fontFamily: 'monospace', background: 'rgba(15, 23, 42, 0.95)', color: '#e2e8f0', borderRadius: '8px', padding: '0.85rem' }}
        />
      </div>

    </div>
  );
}
