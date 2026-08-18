import React from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, ShieldAlert, Zap, TrendingUp, Users, Cpu, FileSpreadsheet, Crown, Bot, Award, Calendar } from 'lucide-react';
import GlobalAiInbox from './GlobalAiInbox';

export default function Overview({ notionCards, excelData, teamTracking, onNavigate, onOpenDeadlineModal, credentials, searchQuery }) {
  const [filteredCards, setFilteredCards] = React.useState(notionCards);

  React.useEffect(() => {
    if (!searchQuery) {
      setFilteredCards(notionCards);
      return;
    }
    const keywords = searchQuery.toLowerCase().split(' ').filter(k => k.length > 2);
    
    setFilteredCards(notionCards.filter(c => {
      const txt = ((c.title || '') + ' ' + (c.summary || '') + ' ' + (c.responsable || '') + ' ' + (c.status || '')).toLowerCase();
      // Match if at least one meaningful keyword is found in the text
      return keywords.some(kw => txt.includes(kw));
    }));
  }, [searchQuery, notionCards]);

  const missingCount = filteredCards.filter(c => c.missingDeadline).length;
  const criticalCount = filteredCards.filter(c => c.priority?.includes('P1') || c.priority === 'Crítica').length;
  const totalCardsCount = filteredCards.length;

  return (
    <div className="overview-container">
      {searchQuery && (
        <div style={{ background: 'var(--accent-cyan)', color: '#000', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold' }}>
          🔍 Mostrando resultados para: "{searchQuery}"
        </div>
      )}
      
      <GlobalAiInbox 
        sectionName="Vista General (Overview)" 
        notionCards={notionCards} 
        credentials={credentials} 
      />

      {/* Executive Quick Access Hub Banners */}
      <div className="card-glass" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.18), rgba(6, 182, 212, 0.15))', borderLeft: '4px solid var(--accent-violet)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Crown className="text-violet" size={24} />
              Centro de Control Directivo • Diego Paolo Musach (CTO)
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0 }}>
              Acceso rápido a la gestión diaria, reuniones de Fathom, scorecards del equipo y asesoría de inteligencia directiva.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => onNavigate('diego_ejecutivo')} style={{ background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-blue))', padding: '0.55rem 1rem', fontSize: '0.82rem' }}>
              <Crown size={15} /> 👑 Diego Ejecutivo
            </button>
            <button className="btn-primary" onClick={() => onNavigate('followup')} style={{ background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-amber))', padding: '0.55rem 1rem', fontSize: '0.82rem' }}>
              <AlertCircle size={15} /> 🚨 Follow Up Hoy
            </button>
            <button className="btn-primary" onClick={() => onNavigate('asesor')} style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', padding: '0.55rem 1rem', fontSize: '0.82rem' }}>
              <Bot size={15} /> 🧠 ASESOR EJECUTIVO
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('scorecards')} style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}>
              <Award size={15} /> 📊 Scorecards
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Header Grid */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        <div className="card-glass">
          <div className="card-header-flex">
            <div className="card-title-group">
              <div className="icon-box cyan"><Zap size={20} /></div>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Temas Reales Notion</p>
                <h3>{totalCardsCount} Tareas</h3>
              </div>
            </div>
            <span className="tag low">100% Procesado</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Extraídas directamente de tu espacio de trabajo de Notion.
          </div>
        </div>

        <div className="card-glass">
          <div className="card-header-flex">
            <div className="card-title-group">
              <div className="icon-box amber"><AlertCircle size={20} /></div>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Prioridad P1 Crítica</p>
                <h3>{criticalCount} Tareas</h3>
              </div>
            </div>
            <span className="tag high">Alta Prioridad</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Requieren seguimiento directivo y destrabe con terceros.
          </div>
        </div>

        <div className="card-glass">
          <div className="card-header-flex">
            <div className="card-title-group">
              <div className="icon-box blue"><Users size={20} /></div>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Equipo de Ingeniería</p>
                <h3>6 Integrantes + CTO</h3>
              </div>
            </div>
            <span className="tag info">Activos</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Camilo, Enrique, Fabricio, Mario, Leonard, Joseph y Diego Musach.
          </div>
        </div>

        <div className="card-glass">
          <div className="card-header-flex">
            <div className="card-title-group">
              <div className="icon-box purple"><Cpu size={20} /></div>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sync 2-Way Notion & Fathom</p>
                <h3>Activo</h3>
              </div>
            </div>
            <span className="tag low">API Conectada</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Sincronización en tiempo real de comentarios y tareas.
          </div>
        </div>
      </div>

      {/* Main Executive Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Notion Cards & Active Projects */}
        <div className="card-glass">
          <div className="card-header-flex">
            <div className="card-title-group">
              <div className="icon-box cyan"><CheckCircle2 size={20} /></div>
              <h3>Últimos Temas de Notion ({totalCardsCount})</h3>
            </div>
            <button className="btn-secondary" onClick={() => onNavigate('notion')}>
              Ver Todos ({totalCardsCount}) <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '520px', overflowY: 'auto' }}>
            {filteredCards.slice(0, 8).map((card) => (
              <div 
                key={card.id}
                style={{
                  background: 'rgba(11, 16, 28, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className={`tag ${card.priority?.includes('P1') ? 'critical' : 'high'}`}>
                      {card.priority}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.project}</span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', color: '#fff', margin: 0 }}>{card.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem', margin: 0 }}>
                    👤 Responsable: <strong style={{ color: 'var(--accent-cyan)' }}>{card.responsable || card.assignedTo}</strong>
                  </p>
                </div>
                <span className="tag info">{card.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Fast Team Workload & Scorecards Quick View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Team Workload & Scorecards Overview */}
          <div className="card-glass">
            <div className="card-header-flex">
              <div className="card-title-group">
                <div className="icon-box purple"><ShieldAlert size={20} /></div>
                <h3>Métricas de Tu Equipo Real</h3>
              </div>
              <button className="btn-secondary" onClick={() => onNavigate('scorecards')}>
                Scorecards <ArrowUpRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {teamTracking.map((dev) => (
                <div 
                  key={dev.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.9rem',
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
                      <h4 style={{ fontSize: '0.88rem', color: '#fff', margin: 0 }}>{dev.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{dev.role}</p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="tag low" style={{ fontSize: '0.72rem' }}>
                      {(dev.topics || []).length} Temas en Notion
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
