import React, { useState } from 'react';
import { Settings, Shield, Key, Mail, Database, X, Check, RefreshCw } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, credentials, onSaveCredentials }) {
  const [notionToken, setNotionToken] = useState(credentials?.notionToken || '');
  const [notionDbId, setNotionDbId] = useState(credentials?.notionDbId || '');
  const [fathomApiKey, setFathomApiKey] = useState(credentials?.fathomApiKey || '');
  const [smtpHost, setSmtpHost] = useState(credentials?.smtpHost || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(credentials?.smtpPort || '587');
  const [smtpUser, setSmtpUser] = useState(credentials?.smtpUser || 'diegomusach@empresa.com');
  const [smtpPass, setSmtpPass] = useState(credentials?.smtpPass || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveCredentials({
      notionToken,
      notionDbId,
      fathomApiKey,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleLoadDemoCreds = () => {
    setNotionToken('secret_notion_demo_token_diego_musach_2026');
    setNotionDbId('db_exec_board_99218471');
    setSmtpHost('smtp.company.com');
    setSmtpPort('587');
    setSmtpUser('diego.musach@empresa.com');
    setSmtpPass('••••••••••••••••');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            <Settings className="text-cyan" size={22} />
            Configuración & Credenciales de Conexión
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {saveSuccess && (
          <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--accent-emerald)', borderRadius: '10px', color: '#fff', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={16} /> Credenciales guardadas de forma segura en local.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            ⚡ Carga rápida de credenciales preconfiguradas en 1-click:
          </span>
          <button type="button" className="btn-secondary" onClick={handleLoadDemoCreds}>
            <RefreshCw size={14} /> Cargar Datos Demo
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Notion Section */}
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.92rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Database size={16} /> Integración con Notion API
            </h3>

            <div className="form-group">
              <label>Notion Integration Internal Token (secret_...):</label>
              <input
                type="password"
                className="form-input"
                placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Notion Database ID de Tarjetas y Tareas:</label>
              <input
                type="text"
                className="form-input"
                placeholder="32-character database id"
                value={notionDbId}
                onChange={(e) => setNotionDbId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>Fathom Video API Key (Cuenta dmusach@bromteck.com):</label>
              <input
                type="password"
                className="form-input"
                placeholder="API Key Diego desde Fathom Settings"
                value={fathomApiKey}
                onChange={(e) => setFathomApiKey(e.target.value)}
              />
            </div>
          </div>

          {/* Email / SMTP Section */}
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.92rem', color: 'var(--accent-violet)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={16} /> Servidor de Correo Saliente (SMTP / Resend API)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Servidor SMTP (Host):</label>
                <input
                  type="text"
                  className="form-input"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Puerto:</label>
                <input
                  type="text"
                  className="form-input"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Usuario / Email Saliente:</label>
              <input
                type="email"
                className="form-input"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Contraseña / App Token de Email:</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••••••"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Shield size={16} /> Guardar Credenciales
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
