import React, { useState, useEffect } from 'react';
import { Target, Flag, Calendar, Sparkles, Plus, Trash2, ChevronRight, Edit3, Save, X } from 'lucide-react';

export default function Estrategia306090() {
  const [strategies, setStrategies] = useState(() => {
    const saved = localStorage.getItem('dm_estrategia_306090_v1');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newGoalInput, setNewGoalInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionAlert, setActionAlert] = useState(null);

  // Edit states
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    localStorage.setItem('dm_estrategia_306090_v1', JSON.stringify(strategies));
  }, [strategies]);

  const generateAIStrategy = (goalText) => {
    // Simple heuristic-based mock AI logic to break down a strategy
    const lowerText = goalText.toLowerCase();
    let d30, d60, d90;

    if (lowerText.includes('kotlin') || lowerText.includes('android')) {
      d30 = 'Auditoría del código Android actual. Setup del entorno Kotlin. Capacitación básica del equipo.';
      d60 = 'Refactorización de módulos no críticos (UI/Helpers). Pruebas unitarias de integración.';
      d90 = 'Migración del core (Network/DB). Release a producción de la primera versión 100% Kotlin.';
    } else if (lowerText.includes('habitat') || lowerText.includes('perdidas')) {
      d30 = 'Mapeo de requerimientos con el cliente. Diseño de la arquitectura de base de datos para pérdidas.';
      d60 = 'Desarrollo de los algoritmos de cálculo. Prototipo inicial del dashboard UI.';
      d90 = 'Pruebas en Staging con datos reales. Despliegue a Producción y capacitación al usuario.';
    } else if (lowerText.includes('equipo') || lowerText.includes('recursos')) {
      d30 = 'Diagnóstico 1-on-1 con cada miembro. Definición clara de roles y Scorecard.';
      d60 = 'Implementación de nuevas ceremonias ágiles (Dailies, Retros). Ajuste de métricas.';
      d90 = 'Evaluación de desempeño. El equipo opera de forma autónoma con la nueva cultura.';
    } else {
      d30 = `[Diagnóstico y Plan] Analizar la situación actual respecto a "${goalText.substring(0, 30)}...". Identificar dependencias críticas y definir las métricas de éxito (KPIs).`;
      d60 = `[Ejecución Temprana] Implementar las primeras soluciones. Conseguir "Quick Wins" para validar la estrategia y ajustar el rumbo según el feedback inicial.`;
      d90 = `[Optimización y Escala] Desplegar la solución definitiva. Establecer procesos operativos estándar (SOPs) y delegar el mantenimiento al equipo técnico.`;
    }

    return [
      { id: Date.now() + 1, phase: 30, text: d30, status: 'pending' },
      { id: Date.now() + 2, phase: 60, text: d60, status: 'pending' },
      { id: Date.now() + 3, phase: 90, text: d90, status: 'pending' }
    ];
  };

  const handleGenerate = () => {
    if (!newGoalInput.trim()) return;

    setIsGenerating(true);
    
    // Simulate AI delay
    setTimeout(() => {
      const milestones = generateAIStrategy(newGoalInput.trim());
      
      const newStrategy = {
        id: `strat-${Date.now()}`,
        goal: newGoalInput.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        milestones: milestones
      };

      setStrategies(prev => [newStrategy, ...prev]);
      setNewGoalInput('');
      setIsGenerating(false);
      
      setActionAlert({ type: 'success', text: '✨ ¡Estrategia generada con éxito!' });
      setTimeout(() => setActionAlert(null), 3000);
    }, 1500);
  };

  const handleDeleteStrategy = (id) => {
    setStrategies(prev => prev.filter(s => s.id !== id));
  };

  const toggleMilestoneStatus = (strategyId, milestoneId) => {
    setStrategies(prev => prev.map(strat => {
      if (strat.id === strategyId) {
        return {
          ...strat,
          milestones: strat.milestones.map(m => {
            if (m.id === milestoneId) {
              return { ...m, status: m.status === 'pending' ? 'done' : 'pending' };
            }
            return m;
          })
        };
      }
      return strat;
    }));
  };

  const startEditing = (milestone) => {
    setEditingCardId(milestone.id);
    setEditingText(milestone.text);
  };

  const saveEditing = (strategyId, milestoneId) => {
    setStrategies(prev => prev.map(strat => {
      if (strat.id === strategyId) {
        return {
          ...strat,
          milestones: strat.milestones.map(m => {
            if (m.id === milestoneId) {
              return { ...m, text: editingText };
            }
            return m;
          })
        };
      }
      return strat;
    }));
    setEditingCardId(null);
  };

  return (
    <div className="tab-pane active" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem', overflow: 'hidden' }}>
      
      {actionAlert && (
        <div className="action-alert" style={{ background: actionAlert.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
          {actionAlert.text}
        </div>
      )}

      {/* Header & Input Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)' }}>
          <Target size={24} /> Framework 30-60-90
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '800px' }}>
          Ingresá un objetivo estratégico de largo plazo. El Asesor IA lo desglosará automáticamente en hitos de 30 días (Diagnóstico), 60 días (Ejecución Temprana) y 90 días (Impacto y Escala).
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="chat-input"
            placeholder="Ej: Migrar toda la aplicación nativa de Android a Kotlin sin afectar los releases de este Q3..."
            value={newGoalInput}
            onChange={e => setNewGoalInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            disabled={isGenerating}
            style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
          />
          <button 
            className="action-btn primary" 
            onClick={handleGenerate}
            disabled={isGenerating || !newGoalInput.trim()}
            style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-purple)', color: 'white' }}
          >
            {isGenerating ? (
              <>Generando Plan... <span className="pulse-dot"></span></>
            ) : (
              <><Sparkles size={18} /> Generar Estrategia IA</>
            )}
          </button>
        </div>
      </div>

      {/* Strategies List (Scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
        {strategies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <Flag size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <h3>No hay estrategias activas</h3>
            <p>Escribí un objetivo arriba para comenzar a planificar el próximo trimestre.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {strategies.map(strat => (
              <div key={strat.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-purple)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.3rem 0', color: 'var(--text-bright)' }}>{strat.goal}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generado el: {strat.createdAt}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteStrategy(strat.id)}
                    className="btn-icon" 
                    title="Eliminar estrategia completa"
                    style={{ color: 'var(--accent-red)' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* 3-Column Kanban Board for 30-60-90 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  
                  {[30, 60, 90].map(phaseDays => {
                    const milestone = strat.milestones.find(m => m.phase === phaseDays);
                    if (!milestone) return null;

                    const isDone = milestone.status === 'done';
                    const isEditing = editingCardId === milestone.id;

                    return (
                      <div key={milestone.id} style={{ 
                        background: 'rgba(0,0,0,0.2)', 
                        border: `1px solid ${isDone ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                        borderRadius: '8px', 
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        opacity: isDone ? 0.7 : 1,
                        transition: 'all 0.2s'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: phaseDays === 30 ? '#60a5fa' : phaseDays === 60 ? '#f472b6' : '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={14} /> Plan {phaseDays} Días
                          </span>
                          <input 
                            type="checkbox" 
                            checked={isDone}
                            onChange={() => toggleMilestoneStatus(strat.id, milestone.id)}
                            style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                            title="Marcar como completado"
                          />
                        </div>

                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <textarea 
                              value={editingText}
                              onChange={e => setEditingText(e.target.value)}
                              style={{ width: '100%', minHeight: '100px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', color: 'white', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button onClick={() => setEditingCardId(null)} className="btn-icon" style={{ padding: '4px' }}><X size={14} /></button>
                              <button onClick={() => saveEditing(strat.id, milestone.id)} className="btn-icon" style={{ padding: '4px', color: 'var(--accent-green)' }}><Save size={14} /></button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-normal)', lineHeight: 1.5, margin: 0, flex: 1, textDecoration: isDone ? 'line-through' : 'none' }}>
                              {milestone.text}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                              <button onClick={() => startEditing(milestone)} className="btn-icon" style={{ padding: '4px', opacity: 0.6 }} title="Editar hito">
                                <Edit3 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
