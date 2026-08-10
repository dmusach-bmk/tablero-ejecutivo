import React from 'react';
import { ShieldCheck, Bell, Settings, LayoutDashboard, FileText, BarChart3, Users, Calendar, Mail, Compass, Bot, Award, AlertCircle, Crown, Video } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, missingDeadlinesCount, onOpenDeadlineModal, onOpenSettings }) {
  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'diego_ejecutivo', label: '👑 Diego Ejecutivo', icon: Crown },
    { id: 'followup', label: '🚨 Follow Up Diario', icon: AlertCircle },
    { id: 'fathom', label: '🎥 Fathom Calls AI', icon: Video },
    { id: 'google_workspace', label: '📧 Gmail & Drive AI', icon: Mail },
    { id: 'asesor', label: '🧠 ASESOR EJECUTIVO', icon: Bot },
    { id: 'scorecards', label: '📊 Scorecard Equipo', icon: Award },
    { id: 'micromanagement', label: 'Equipo Real & Temas', icon: Users },
    { id: 'notion', label: 'Notion & Transcripts', icon: FileText },
    { id: 'excel', label: 'Excel Analytics', icon: BarChart3 },
    { id: 'deadlines', label: 'Fechas Límite', icon: Calendar },
    { id: 'actions', label: 'Borrador Email / Notion', icon: Mail },
    { id: 'leadership', label: 'Liderazgo & Eng', icon: Compass },
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
          return (
            <button
              key={tab.id}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
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
