import React from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, ShieldAlert, Zap, TrendingUp, Users, Cpu, FileSpreadsheet } from 'lucide-react';

export default function Overview({ notionCards, excelData, teamTracking, onNavigate, onOpenDeadlineModal }) {
  const missingCount = notionCards.filter(c => c.missingDeadline).length;
  const criticalCount = notionCards.filter(c => c.priority === 'Crítica' || c.priority === 'Alta').length;
  const avgVelocity = Math.round(excelData.reduce((acc, curr) => acc + curr.velEquipo, 0) / excelData.length);
  const avgTestCoverage = (excelData.reduce((acc, curr) => acc + curr.coberturaTestPct, 0) / excelData.length).toFixed(1);

  return (
    <div className="overview-container">
      {/* Banner Alert for Deadlines */}
      {missingCount > 0 && (
        <div className="banner-alert">
          <div className="banner-alert-text">
            <h4>
              ⚠️ Atención Requerida: {missingCount} Tarea(s) sin Fecha Límite en Notion
            </h4>
            <p>
              Como Director Técnico, es clave mantener certidumbre en las fechas de entrega del equipo de ingeniería.
            </p>
          </div>
          <button className="btn-primary" onClick={onOpenDeadlineModal}>
            <Clock size={16} /> Asignar Fechas Ahora
          </button>
        </div>
      )}

      {/* KPI Cards Header Grid */}
      <div className="grid-cards">
        <div className="card-glass">
          <div className="card-header-flex">
            <div className="card-title-group">
              <div className="icon-box cyan"><Zap size={20} /></div>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Velocidad de Ingeniería</p>
                <h3>{avgVelocity} pts / sprint</h3>
              </div>
            </div>
            <span className="tag low">+4.2%</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Ritmo óptimo de entrega con cero errores críticos en prod esta semana.
          </div>
        </div>

        <div className="card-glass">
          <div className="card-header-flex">
            <div className="card-title-group">
              <div className="icon-box purple"><Cpu size={20} /></div>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cobertura de Tests</p>
                <h3>{avgTestCoverage}%</h3>
              </div>
            </div>
            <span className="tag info">Estándar Exigido</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Límite mínimo institucional: 85%. Cumplimiento riguroso verificado.
          </div>
        </div>

        <div className="card-glass">
          <div className="card-header-flex">
            <div className="card-title-group">
              <div className="icon-box amber"><AlertCircle size={20} /></div>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Vencimientos sin Fecha</p>
                <h3>{missingCount} tareas</h3>
              </div>
            </div>
            {missingCount > 0 ? (
              <span className="tag high">Requiere Acción</span>
            ) : (
              <span className="tag low">Al Día</span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {missingCount > 0 ? 'Faltan fechas tope de entrega en Notion' : 'Todas las tarjetas tienen fecha asignada'}
          </div>
        </div>

        <div className="card-glass">
          <div className="card-header-flex">
            <div className="card-title-group">
              <div className="icon-box blue"><Users size={20} /></div>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Equipo de Desarrolladores</p>
                <h3>{teamTracking.length} ingenieros</h3>
              </div>
            </div>
            <span className="tag info">1 Bloqueado</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Seguimiento semanal y feedback de 1-on-1 activo.
          </div>
        </div>
      </div>

      {/* Main Executive Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Notion Cards & Active Projects */}
        <div className="card-glass">
          <div className="card-header-flex">
            <div className="card-title-group">
              <div className="icon-box cyan"><CheckCircle2 size={20} /></div>
              <h3>Proyectos Críticos & Notion Cards</h3>
            </div>
            <button className="btn-secondary" onClick={() => onNavigate('notion')}>
              Ver Todo <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {notionCards.map((card) => (
              <div 
                key={card.id}
                style={{
                  background: 'rgba(11, 16, 28, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '0.9rem',
                  display: 'flex',
                  justify-content: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className={`tag ${card.priority === 'Crítica' ? 'critical' : card.priority === 'Alta' ? 'high' : 'medium'}`}>
                      {card.priority}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.project}</span>
                  </div>
                  <h4 style={{ fontSize: '0.92rem', color: '#fff' }}>{card.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                    👤 {card.assignedTo} {card.deadline ? `• 📅 ${card.deadline}` : '• ⚠️ Sin Fecha'}
                  </p>
                </div>
                <span className="tag info">{card.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Fast Micromanagement Status & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Team Workload & Blockers */}
          <div className="card-glass">
            <div className="card-header-flex">
              <div className="card-title-group">
                <div className="icon-box purple"><ShieldAlert size={20} /></div>
                <h3>Micromanagement: Estado del Equipo</h3>
              </div>
              <button className="btn-secondary" onClick={() => onNavigate('micromanagement')}>
                Gestionar <ArrowUpRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {teamTracking.map((dev) => (
                <div 
                  key={dev.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify-content: 'space-between',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img 
                      src={dev.avatar} 
                      alt={dev.name} 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <div>
                      <h4 style={{ fontSize: '0.88rem', color: '#fff' }}>{dev.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dev.role}</p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={`tag ${dev.blockers !== 'Ninguno' ? 'high' : 'low'}`}>
                      {dev.status}
                    </span>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      PRs: {dev.activePRs} • Vel: {dev.velocityScore}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Excel Daily Snapshot Card */}
          <div className="card-glass">
            <div className="card-header-flex">
              <div className="card-title-group">
                <div className="icon-box emerald"><FileSpreadsheet size={20} /></div>
                <h3>Métricas Diarias de Excel</h3>
              </div>
              <button className="btn-secondary" onClick={() => onNavigate('excel')}>
                Ver Gráficos <ArrowUpRight size={14} />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Último registro procesado: <strong>{excelData[excelData.length - 1]?.fecha}</strong> ({excelData[excelData.length - 1]?.sprint}). 
              Total de PRs revisadas: <strong>{excelData.reduce((a, b) => a + b.prsRevisadas, 0)}</strong>.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
