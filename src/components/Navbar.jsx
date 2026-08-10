import React from 'react';
import { ShieldCheck, Bell, Settings, LayoutDashboard, FileText, BarChart3, Users, Calendar, Mail, Compass, Bot, Award, AlertCircle, Crown, Video } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, missingDeadlinesCount, onOpenDeadlineModal, onOpenSettings }) {
  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, inDevelopment: false },
    { id: 'diego_ejecutivo', label: '👑 Diego Ejecutivo', icon: Crown, inDevelopment: false },
    { id: 'followup', label: '🚨 Follow Up Diario', icon: AlertCircle, inDevelopment: false },
    { id: 'fathom', label: '🎥 Fathom Calls AI', icon: Video, inDevelopment: false },
    { id: 'google_workspace', label: '📧 Gmail & Drive AI', icon: Mail, inDevelopment: false },
    { id: 'asesor', label: '🧠 ASESOR EJECUTIVO', icon: Bot, inDevelopment: false },
    { id: 'scorecards', label: '📊 Scorecard Equipo', icon: Award, inDevelopment: false },
    
    // Items not customized yet marked as (En desarrollo) and disabled
    { id: 'micromanagement', label: 'Equipo Real & Temas (En desarrollo)', icon: Users, inDevelopment: true },
    { id: 'notion', label: 'Notion & Transcripts (En desarrollo)', icon: FileText, inDevelopment: true },
    { id: 'excel', label: 'Excel Analytics (En desarrollo)', icon: BarChart3, inDevelopment: true },
    { id: 'deadlines', label: 'Fechas Límite (En desarrollo)', icon: Calendar, inDevelopment: true },
    { id: 'actions', label: 'Borrador Email / Notion (En desarrollo)', icon: Mail, inDevelopment: true },
    { id: 'leadership', label: 'Liderazgo & Eng (En desarrollo)', icon: Compass, inDevelopment: true },
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
            <Bell size={18} />
            {missingDeadlinesCount > 0 && (
              <span className="badge-count">{missingDeadlinesCount}</span>
            )}
          </button>

          <button 
            className="btn-icon" 
            title="Configuración & Credenciales"
            onClick={onOpenSettings}
          >
            <Settings size={18} />
          </button>
        </div>
      </nav>

      <div className="nav-tabs-bar">
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
                opacity: isDisabled ? 0.45 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                filter: isDisabled ? 'grayscale(0.6)' : 'none'
              }}
              title={isDisabled ? 'Módulo en desarrollo (No interactivo)' : tab.label}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
