import React, { useState } from 'react';
import { Compass, Heart, ShieldCheck, Award, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { LEADERSHIP_PLAYBOOK, LEADERSHIP_SCENARIOS } from '../mockData';

export default function LeadershipAdvisor() {
  const [activeScenarioId, setActiveScenarioId] = useState(LEADERSHIP_SCENARIOS[0].id);

  const currentScenario = LEADERSHIP_SCENARIOS.find(s => s.id === activeScenarioId) || LEADERSHIP_SCENARIOS[0];

  return (
    <div className="leadership-advisor-container">
      <div className="card-header-flex" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>👑 Liderazgo Empático de Alta Exigencia en Ingeniería</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Principios estratégicos, resolución de escenarios reales y guía de excelencia técnica para Diego Paolo Musach.
          </p>
        </div>
      </div>

      {/* Playbook Pillars Grid */}
      <div className="grid-cards" style={{ marginBottom: '1.75rem' }}>
        {LEADERSHIP_PLAYBOOK.map((item) => (
          <div key={item.id} className="card-glass">
            <div className="card-header-flex">
              <span className="tag info">{item.category}</span>
              <ShieldCheck className="text-cyan" size={18} />
            </div>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.4rem' }}>{item.title}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{item.summary}</p>
            
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '10px', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>Claves de Ejecución:</h4>
              <ul style={{ paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {item.keyPoints.map((kp, idx) => (
                  <li key={idx}>{kp}</li>
                ))}
              </ul>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', italic: true }}>
              💡 Conseil Táctico: "{item.actionableAdvice}"
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Scenario Resolver */}
      <div className="card-glass">
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle className="text-purple" size={20} /> Resolución de Escenarios Tácticos de Liderazgo
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          
          {/* Scenario Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {LEADERSHIP_SCENARIOS.map((scen, idx) => {
              const isSelected = scen.id === activeScenarioId;
              return (
                <div
                  key={scen.id}
                  onClick={() => setActiveScenarioId(scen.id)}
                  style={{
                    background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(0,0,0,0.3)',
                    border: isSelected ? '1px solid var(--accent-violet)' : '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ fontSize: '0.85rem', color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                    Escenario {idx + 1}:
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-dim)', marginTop: '0.2rem' }}>
                    {scen.scenario}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Scenario Action Plan */}
          <div style={{ background: 'rgba(7, 10, 18, 0.6)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-violet)', marginBottom: '0.5rem' }}>
              Situación Planteada:
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '10px' }}>
              "{currentScenario.scenario}"
            </p>

            <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
              Respuesta Recomendada (Empatía + Exigencia):
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              {currentScenario.recommendedResponse}
            </p>

            <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
              Plan de Acción Paso a Paso para Diego Musach:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {currentScenario.diegoActionSteps.map((step, idx) => (
                <div key={idx} style={{ fontSize: '0.84rem', color: '#fff', background: 'rgba(6, 182, 212, 0.08)', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)' }}>
                  {step}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
