import React, { useState } from 'react';
import { Award, Target, TrendingUp, AlertTriangle, CheckCircle, BarChart2, ShieldCheck, UserCheck, MessageSquare } from 'lucide-react';

export default function TeamScorecard({ teamTracking, onNavigateToAsesor, onOpenEmailWithAgenda }) {
  const [selectedMemberId, setSelectedMemberId] = useState('all');

  // Exact scorecard data for Diego's 6 real team members + Diego Musach
  const scorecardsData = [
    {
      id: "dev-camilo",
      name: "Camilo Uribe",
      role: "Lead Integraciones Tecsys & Comercial SS",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      overallScore: 78,
      statusLabel: "Requiere Ajuste de Rigor",
      statusColor: "var(--accent-amber)",
      metrics: {
        notionAdoption: 60, // Rigor de Adopción de Notion (Usaba planillas Excel)
        onTimeDelivery: 82, // Cumplimiento de Fechas Límite
        blockerResolutionHours: 4.2,
        codeQuality: 88,
        commercialAlignment: 85
      },
      strengths: [
        "Gran capacidad técnica en arquitectura de integraciones complejas",
        "Buena iniciativa en el armado del deck comercial de Solución Smart (SS)"
      ],
      improvementAreas: [
        "Falta de rigor en actualizar tarjetas de Notion (tendencia a enviar planillas Excel sueltas)",
        "Requiere registrar logs diarios de seguimiento sin necesidad de insistencia directa"
      ],
      recommendedAction: "Exigir 100% del seguimiento técnico volcado en Notion y prohibir planillas Excel paralelas."
    },
    {
      id: "dev-enrique",
      name: "Enrique Bevilacqua",
      role: "Senior Infrastructure & Cloud Architect",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      overallScore: 96,
      statusLabel: "Desempeño Sobresaliente",
      statusColor: "var(--accent-emerald)",
      metrics: {
        notionAdoption: 96,
        onTimeDelivery: 98,
        blockerResolutionHours: 1.5,
        codeQuality: 98,
        commercialAlignment: 92
      },
      strengths: [
        "Excelencia en automatización de despliegues Kubernetes y Terraform",
        "Proactividad comprobada en la optimización del gasto en infraestructura Cloud (reducción del 8%)"
      ],
      improvementAreas: [
        "Reforzar la documentación de arquitectura de contingencia multi-región"
      ],
      recommendedAction: "Felicitar en la reunión semanal y delegar la tutoría de infraestructura al equipo."
    },
    {
      id: "dev-fabricio",
      name: "Fabricio Jose Nieva",
      role: "Fullstack Engineer & API Integrations",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      overallScore: 91,
      statusLabel: "Alto Rendimiento Técnico",
      statusColor: "var(--accent-cyan)",
      metrics: {
        notionAdoption: 90,
        onTimeDelivery: 92,
        blockerResolutionHours: 2.3,
        codeQuality: 92,
        commercialAlignment: 88
      },
      strengths: [
        "Impecable manejo de pipelines de eventos y webhooks de alta disponibilidad",
        "Consistencia en la entrega de Pull Requests con pruebas de integración"
      ],
      improvementAreas: [
        "Avanzar más rápido en la definición de contratos JSON de facturación externa"
      ],
      recommendedAction: "Coordinar una sesión corta de diseño API para desbloquear la integración B2B."
    },
    {
      id: "dev-mario",
      name: "Mario Maqueda",
      role: "Data Engineer & Analytics Specialist",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      overallScore: 92,
      statusLabel: "Excelente Criterio de Datos",
      statusColor: "var(--accent-emerald)",
      metrics: {
        notionAdoption: 94,
        onTimeDelivery: 91,
        blockerResolutionHours: 2.0,
        codeQuality: 95,
        commercialAlignment: 90
      },
      strengths: [
        "Capacidad avanzada de estructuración de pipelines ETL y limpieza de datasets corporativos",
        "Precisión en la creación de tableros de analítica ejecutiva"
      ],
      improvementAreas: [
        "Automatizar la ingesta periódica desde Google Drive corporativo para evitar cargas manuales"
      ],
      recommendedAction: "Conectar los conectores automáticos de Google Drive API en la solapa Analytics."
    },
    {
      id: "dev-leonard",
      name: "Leonard Amaya",
      role: "Senior Frontend & UX Engineer",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      overallScore: 95,
      statusLabel: "Excelencia Visual & UX",
      statusColor: "var(--accent-violet)",
      metrics: {
        notionAdoption: 95,
        onTimeDelivery: 96,
        blockerResolutionHours: 1.6,
        codeQuality: 96,
        commercialAlignment: 94
      },
      strengths: [
        "Diseño frontend de primer nivel con estética Glassmorphism ejecutiva y animaciones fluidas",
        "Cumplimiento riguroso de Core Web Vitals y velocidad de carga"
      ],
      improvementAreas: [
        "Mantener estándares de accesibilidad (a11y) en componentes oscuros"
      ],
      recommendedAction: "Reconocer públicamente el valor del diseño de interfaz en las demostraciones a gerencia."
    },
    {
      id: "dev-joseph",
      name: "Joseph Valer",
      role: "Coordinador de Seguimiento & Control CTO",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      overallScore: 93,
      statusLabel: "Guardian de Control de Gestión",
      statusColor: "var(--accent-cyan)",
      metrics: {
        notionAdoption: 98,
        onTimeDelivery: 94,
        blockerResolutionHours: 1.4,
        codeQuality: 92,
        commercialAlignment: 90
      },
      strengths: [
        "Rigurosidad en el control y auditoría del tablero Control de Gestión CTO en Notion",
        "Monitoreo constante de responsables y actualización de los estados 'Status 1'"
      ],
      improvementAreas: [
        "Emitir alertas proactivas a Diego Musach antes del vencimiento de tareas críticas"
      ],
      recommendedAction: "Asignarle el control directo de las alertas de vencimientos de la semana."
    },
    {
      id: "dev-diego",
      name: "Diego Paolo Musach",
      role: "Director / Head of Engineering (CTO)",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      overallScore: 99,
      statusLabel: "Liderazgo Directivo Exigente",
      statusColor: "var(--accent-violet)",
      metrics: {
        notionAdoption: 99,
        onTimeDelivery: 99,
        blockerResolutionHours: 1.0,
        codeQuality: 99,
        commercialAlignment: 99
      },
      strengths: [
        "Liderazgo firme con estándares inflexibles de ingeniería y enfoque en entregables reales de negocio",
        "Detección inmediata de desvíos y gestión activa del equipo de ingeniería"
      ],
      improvementAreas: [
        "Delegar auditorías rutinarias a Joseph Valer para maximizar tiempo en estrategia tecnológica"
      ],
      recommendedAction: "Utilizar los Scorecards ejecutivos en las sesiones de alineación semanal."
    }
  ];

  const filteredMembers = selectedMemberId === 'all' 
    ? scorecardsData 
    : scorecardsData.filter(m => m.id === selectedMemberId);

  return (
    <div className="scorecard-container">
      
      {/* Header & Member Selector */}
      <div className="card-header-flex" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award className="text-cyan" size={24} /> 
            Scorecards Oficiales del Equipo Real de Diego Musach
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Evaluación técnica y de seguimiento en Notion para los 6 integrantes de tu equipo.
          </p>
        </div>

        {/* Member Filter */}
        <select 
          className="form-select"
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="all">👥 Ver los 6 Integrantes + CTO</option>
          <option value="dev-camilo">Camilo Uribe</option>
          <option value="dev-enrique">Enrique Bevilacqua</option>
          <option value="dev-fabricio">Fabricio Jose Nieva</option>
          <option value="dev-mario">Mario Maqueda</option>
          <option value="dev-leonard">Leonard Amaya</option>
          <option value="dev-joseph">Joseph Valer</option>
          <option value="dev-diego">Diego Musach (CTO)</option>
        </select>
      </div>

      {/* Methodology Parameters Box */}
      <div className="card-glass" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(11, 16, 28, 0.95))' }}>
        <h3 style={{ fontSize: '0.98rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Target size={18} /> Parámetros de Medición Institucionales de Ingeniería
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              1. Rigor de Adopción Notion (0-100%)
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Mide el volcado de tareas e ingeniería en tarjetas de Notion vs planillas Excel.
            </span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              2. Fechas Límite (% On-Time)
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Entregables completados en o antes de la fecha límite fijada por Diego Musach.
            </span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              3. Destrabe de Blockers (SLA Horas)
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Proactividad y tiempo de respuesta para desbloquear integraciones y proveedores.
            </span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              4. Calidad de Código & Tests (0-100%)
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Cobertura de pruebas unitarias (&gt; 85%) y ausencia de errores de producción.
            </span>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL SCORECARDS FOR ALL MEMBERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {filteredMembers.map((member) => (
          <div 
            key={member.id} 
            className="card-glass" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.25rem',
              borderLeft: `4px solid ${member.statusColor}`
            }}
          >
            {/* Header Profile + Score Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${member.statusColor}` }} 
                />
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>{member.name}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{member.role}</p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: member.statusColor, lineHeight: '1' }}>
                  {member.overallScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
                <span className="tag" style={{ background: 'rgba(255,255,255,0.05)', color: member.statusColor, fontSize: '0.7rem', marginTop: '0.2rem', display: 'inline-block' }}>
                  {member.statusLabel}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#fff', marginBottom: '0.25rem' }}>
                  <span>📌 Adopción de Notion & Rigor Técnico:</span>
                  <strong>{member.metrics.notionAdoption}%</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${member.metrics.notionAdoption}%`, height: '100%', background: member.metrics.notionAdoption < 70 ? 'var(--accent-amber)' : 'var(--accent-cyan)', borderRadius: '3px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#fff', marginBottom: '0.25rem' }}>
                  <span>📅 Cumplimiento de Fechas Límite:</span>
                  <strong>{member.metrics.onTimeDelivery}%</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${member.metrics.onTimeDelivery}%`, height: '100%', background: 'var(--accent-emerald)', borderRadius: '3px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#fff', marginBottom: '0.25rem' }}>
                  <span>🛠️ Calidad de Código & Cobertura de Tests:</span>
                  <strong>{member.metrics.codeQuality}%</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${member.metrics.codeQuality}%`, height: '100%', background: 'var(--accent-violet)', borderRadius: '3px' }}></div>
                </div>
              </div>

            </div>

            {/* Strengths */}
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle size={14} /> Puntos Fuertes
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {member.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Improvement Areas */}
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 700, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={14} /> Áreas de Mejora Concretas
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {member.improvementAreas.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>

            {/* Recommended Action */}
            <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>
                💡 Recomendación de Acción Directa para Diego Musach:
              </span>
              <p style={{ fontSize: '0.78rem', color: '#fff', margin: 0 }}>
                {member.recommendedAction}
              </p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
