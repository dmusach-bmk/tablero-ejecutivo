import React from 'react';
import { LayoutDashboard, Crown, AlertCircle, Video, Mail, DollarSign, Calendar, Bot, Award, Users, FileText, BarChart3, Compass, Bell, Settings } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, missingDeadlinesCount, onOpenDeadlineModal, onOpenSettings }) {
  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, inDevelopment: false },
    { id: 'diego_ejecutivo', label: '👑 Diego Ejecutivo', icon: Crown, inDevelopment: false },
    { id: 'followup', label: '🚨 Follow Up Diario', icon: AlertCircle, inDevelopment: false },
    { id: 'fathom', label: '🎥 Fathom Calls AI', icon: Video, inDevelopment: false },
    { id: 'google_workspace', label: '📧 Gmail & Drive AI', icon: Mail, inDevelopment: false },
    { id: 'financials', label: '💵 Control Financiero', icon: DollarSign, inDevelopment: false },
    { id: 'roadmap_report', label: '📅 Gantt & Reporte CEO', icon: Calendar, inDevelopment: false },
    { id: 'asesor', label: '🧠 ASESOR EJECUTIVO', icon: Bot, inDevelopment: false },
    { id: 'scorecards', label: '📊 Scorecard Equipo', icon: Award, inDevelopment: false },
    
    // Secondary items marked as (En desarrollo)
    { id: 'micromanagement', label: 'Equipo Real (En desarrollo)', icon: Users, inDevelopment: true },
    { id: 'notion', label: 'Notion (En desarrollo)', icon: FileText, inDevelopment: true },
    { id: 'excel', label: 'Excel (En desarrollo)', icon: BarChart3, inDevelopment: true },
    { id: 'leadership', label: 'Liderazgo (En desarrollo)', icon: Compass, inDevelopment: true },
  ];

  return (
    <header className="header-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-logo">DM</div>
          <div className="brand-titles">
            <h1>
              TABLERO DE COMANDOS EJECUTIVO
            </h1>
            <p>Diego Paolo Musach | Director & Head of Engineering</p>
          </div>
        </div>

        <div className="navbar-actions">
          <div className="status-badge">
            <span className="pulse-dot"></span>
            Notion Sync • SMTP Connected
          </div>

          <button 
            className="btn-icon" 
            title="Alertas de Fechas Límite"
            onClick={onOpenDeadlineModal}
          >
            <Bell size={16} />
            {missingDeadlinesCount > 0 && (
              <span className="badge-count">{missingDeadlinesCount}</span>
            )}
          </button>

          <button 
            className="btn-icon" 
            title="Configuración & Credenciales"
            onClick={onOpenSettings}
          >
            <Settings size={16} />
          </button>
        </div>
      </nav>

      {/* ALL TABS VISIBLE ON SCREEN WITHOUT HORIZONTAL SCROLL */}
      <div className="nav-tabs-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', padding: '0.45rem 1.5rem' }}>
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = tab.inDevelopment;

          return (
            <button
              key={tab.id}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (!isDisabled) setActiveTab(tab.id);
              }}
              disabled={isDisabled}
              style={{
                fontSize: '0.74rem',
                padding: '0.35rem 0.65rem',
                opacity: isDisabled ? 0.4 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                filter: isDisabled ? 'grayscale(0.8)' : 'none'
              }}
              title={isDisabled ? 'Módulo en desarrollo (No interactivo)' : tab.label}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
