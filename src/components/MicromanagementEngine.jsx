import React, { useState } from 'react';
import { Users, CheckSquare, ShieldAlert, GitPullRequest, Calendar, MessageSquare, Award, AlertCircle, ChevronRight, Zap } from 'lucide-react';

export default function MicromanagementEngine({ teamTracking, onUpdateDevStatus, onOpenEmailWithAgenda }) {
  const [selectedDevId, setSelectedDevId] = useState(teamTracking[0]?.id || null);

  const selectedDev = teamTracking.find(d => d.id === selectedDevId) || teamTracking[0];

  const weeklyCadence = [
    { day: 'Lunes 09:00', title: 'Sprint & Alignment Sync', status: 'Completado', desc: 'Revisión de prioridades de la semana, desarticulación de riesgos de arquitectura y asignación de tareas con fecha tope.' },
    { day: 'Miércoles 14:00', title: 'Mid-Week Architecture & PR Audit', status: 'En Curso', desc: 'Micromanagement táctico: Auditoría de PRs acumuladas (> 4hs sin revisión), verificación de tests y destrabe de dependencias externas.' },
    { day: 'Viernes 17:00', title: 'Friday Quality Sign-off & Retrospectiva', status: 'Pendiente', desc: 'Validación de entregables del sprint, verificación de la métrica de cobertura de código (>85%) y felicitaciones públicas por desempeño.' }
  ];

  return (
    <div className="micromanagement-container">
      <div className="card-header-flex" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>🎯 Seguimiento Semanal & Micromanagement Técnico</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Supervisión continua de la velocidad del equipo, rigor técnico en Code Reviews, destrabe de blockers y preparación de 1-on-1s.
          </p>
        </div>
      </div>

      {/* Weekly Cadence Timeline */}
      <div className="card-glass" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckSquare className="text-cyan" size={18} /> Cadencia Semanal Ejecutiva de Diego Musach
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {weeklyCadence.map((cad, idx) => (
            <div key={idx} style={{ background: 'rgba(11, 16, 28, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{cad.day}</span>
                <span className={`tag ${cad.status === 'Completado' ? 'low' : cad.status === 'En Curso' ? 'info' : 'medium'}`}>
                  {cad.status}
                </span>
              </div>
              <h4 style={{ fontSize: '0.92rem', color: '#fff', marginBottom: '0.3rem' }}>{cad.title}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cad.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Engineer Detailed Micromanagement Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem' }}>
        
        {/* Left Team List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.2rem' }}>👨‍💻 Ingenieros a Cargo</h3>
          {teamTracking.map((dev) => {
            const isSelected = dev.id === selectedDevId;
            return (
              <div
                key={dev.id}
                onClick={() => setSelectedDevId(dev.id)}
                style={{
                  background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card)',
                  border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <img src={dev.avatar} alt={dev.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', color: isSelected ? '#fff' : 'var(--text-main)' }}>{dev.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dev.role}</p>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <span className={`tag ${dev.blockers !== 'Ninguno' ? 'high' : 'low'}`}>
                      {dev.status}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </div>
            );
          })}
        </div>

        {/* Right Engineer Deep-Dive & 1-on-1 Agenda Builder */}
        {selectedDev && (
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={selectedDev.avatar} alt={selectedDev.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-cyan)' }} />
                <div>
                  <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>{selectedDev.name}</h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selectedDev.role}</p>
                </div>
              </div>

              <button 
                className="btn-primary"
                onClick={() => onOpenEmailWithAgenda(selectedDev)}
              >
                <MessageSquare size={16} /> Enviar Agenda de 1-on-1
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PRs Activas</p>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>{selectedDev.activePRs} PRs</h4>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tiempo Review PR</p>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-violet)' }}>{selectedDev.prReviewTimeHours}hs</h4>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Velocidad Score</p>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>{selectedDev.velocityScore}%</h4>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Calidad de Código</p>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-amber)' }}>{selectedDev.codeQualityScore}%</h4>
              </div>
            </div>

            {/* Blockers & Goal */}
            <div>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-rose)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} /> Impedimentos & Blockers Actuales
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#fff', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', padding: '0.75rem', borderRadius: '8px' }}>
                {selectedDev.blockers}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={16} /> Objetivo Principal de la Semana
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#fff', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '0.75rem', borderRadius: '8px' }}>
                {selectedDev.weeklyGoal}
              </p>
            </div>

            {/* Last Feedback & 1-on-1 Agenda */}
            <div>
              <h4 style={{ fontSize: '0.88rem', color: '#fff', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} /> Próxima Sesión 1-on-1: <strong>{selectedDev.next1on1Date}</strong>
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', italic: true }}>
                Último Feedback Registrado: "{selectedDev.lastFeedback}"
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
