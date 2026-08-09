import React, { useState } from 'react';
import { Calendar, AlertTriangle, Clock, CheckCircle2, Plus, ArrowRight } from 'lucide-react';

export default function DeadlinesManager({ notionCards, onSetDeadline, onOpenDeadlineModal }) {
  const [filterUrgency, setFilterUrgency] = useState('All');

  const missingTasks = notionCards.filter(c => c.missingDeadline);
  const scheduledTasks = notionCards.filter(c => !c.missingDeadline);

  return (
    <div className="deadlines-manager-container">
      <div className="card-header-flex" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>⏰ Gestor de Fechas Límite & Alertas de Compromiso</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Supervisión proactiva de entregas, prevención de retrasos en producción y solicitud activa de definición de fechas.
          </p>
        </div>

        {missingTasks.length > 0 && (
          <button className="btn-primary" onClick={onOpenDeadlineModal}>
            <AlertTriangle size={16} /> Resolver {missingTasks.length} Fechas Pendientes
          </button>
        )}
      </div>

      {/* Prompter Banner for Missing Deadlines */}
      {missingTasks.length > 0 && (
        <div className="banner-alert" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h4 style={{ color: '#fde047', fontSize: '0.95rem' }}>
              ⚠️ El sistema requiere tu confirmación sobre {missingTasks.length} proyecto(s)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Como líder técnico, definir una fecha clara evita ambigüedades en el equipo.
            </p>
          </div>
          <button className="btn-secondary" onClick={onOpenDeadlineModal}>
            Abrir Selector Rápido <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Tasks Grid by Deadline Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Missing Deadlines Column */}
        <div className="card-glass" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          <div className="card-header-flex">
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> Sin Fecha Definida ({missingTasks.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {missingTasks.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>¡Excelente! Todas las tareas tienen fecha pactada.</p>
            ) : (
              missingTasks.map((card) => (
                <div key={card.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span className="tag critical">{card.priority}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>Falta Fecha</span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.2rem' }}>{card.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>👤 {card.assignedTo}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scheduled Deadlines Column */}
        <div className="card-glass" style={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}>
          <div className="card-header-flex">
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} /> Fechas Programadas ({scheduledTasks.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {scheduledTasks.map((card) => (
              <div key={card.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span className={`tag ${card.priority === 'Alta' ? 'high' : 'info'}`}>{card.priority}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    📅 {card.deadline}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.2rem' }}>{card.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>👤 {card.assignedTo} | {card.project}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
