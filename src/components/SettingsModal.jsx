import React, { useState } from 'react';
import { Settings, Shield, Key, Mail, Database, X, Check, RefreshCw, Bot, Cpu } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, credentials, onSaveCredentials }) {
  const [notionToken, setNotionToken] = useState(credentials?.notionToken || '');
  const [notionDbId, setNotionDbId] = useState(credentials?.notionDbId || '');
  const [fathomApiKey, setFathomApiKey] = useState(credentials?.fathomApiKey || '');
  const [smtpHost, setSmtpHost] = useState(credentials?.smtpHost || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(credentials?.smtpPort || '587');
  const [smtpUser, setSmtpUser] = useState(credentials?.smtpUser || 'diegomusach@empresa.com');
  const [smtpPass, setSmtpPass] = useState(credentials?.smtpPass || '');

  // AI Model & Agent Settings Configurable by Diego Directly from UI
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('dm_ai_provider') || 'google_gemini');
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem('dm_ai_api_key') || '');
  const [aiModelName, setAiModelName] = useState(() => localStorage.getItem('dm_ai_model_name') || 'gemini-2.5-pro');
  const [aiSystemPrompt, setAiSystemPrompt] = useState(() => {
    return localStorage.getItem('dm_ai_system_prompt') || `Eres el Asistente Ejecutivo del CTO (Diego Paolo Musach). Analiza cada nota escrita en la call con Alejandro Cubino (CEO), busca coincidencias semánticas con las 165 tarjetas de Notion, propone la creación o actualización de tarjetas y genera un reporte previo de vista previa para aprobación de Diego antes de ejecutar cualquier acción en Notion API.`;
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('dm_ai_provider', aiProvider);
    localStorage.setItem('dm_ai_api_key', aiApiKey);
    localStorage.setItem('dm_ai_model_name', aiModelName);
    localStorage.setItem('dm_ai_system_prompt', aiSystemPrompt);

    onSaveCredentials({
      notionToken,
      notionDbId,
      fathomApiKey,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      aiProvider,
      aiApiKey,
      aiModelName,
      aiSystemPrompt
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleLoadDemoCreds = () => {
    setNotionToken('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');
    setNotionDbId('34ace95d-6a9a-8054-b33b-cad2cbaf4c70');
    setFathomApiKey('fath_live_584192039104');
    setSmtpHost('smtp.gmail.com');
    setSmtpPort('587');
    setSmtpUser('dmusach@bromteck.com');
    setSmtpPass('••••••••••••••••');
    setAiProvider('google_gemini');
    setAiModelName('gemini-2.5-pro');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
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
            <Check size={16} /> Credenciales y Configuración de IA guardadas de forma segura.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            ⚡ Carga rápida de credenciales de Diego Musach en 1-click:
          </span>
          <button type="button" className="btn-secondary" onClick={handleLoadDemoCreds}>
            <RefreshCw size={14} /> Cargar Credenciales Directivas
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* AI MODEL & AGENT PROVIDER CONFIGURATION (FLEXIBLE AI ENGINE) */}
          <div style={{ background: 'rgba(168, 85, 247, 0.12)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--accent-purple)' }}>
            <h3 style={{ fontSize: '0.94rem', color: 'var(--accent-purple)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 0.75rem 0' }}>
              <Bot size={18} /> 🤖 Seleccionar Motor de IA & Agente Asistente
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.78rem' }}>Proveedor de IA (AI Provider):</label>
                <select
                  className="form-select"
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                >
                  <option value="google_gemini">Google Gemini API (Gemini 2.5 Pro / Flash)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="anthropic">Anthropic Claude (Claude 3.5 Sonnet)</option>
                  <option value="local_proxy">Local LLM / Proxy Personalizado (Ollama / VLLM)</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.78rem' }}>Modelo Específico (Model Name):</label>
                <input
                  type="text"
                  className="form-input"
                  value={aiModelName}
                  onChange={(e) => setAiModelName(e.target.value)}
                  placeholder="gemini-2.5-pro, gpt-4o, claude-3-5-sonnet"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.78rem' }}>API Key Personal de IA (Si vence la cuenta o usas propia):</label>
              <input
                type="password"
                className="form-input"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                placeholder="Ingresa tu API Key de Gemini, OpenAI o Claude..."
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.78rem' }}>System Prompt / Script de Criterios del Agente (Editable):</label>
              <textarea
                className="form-input"
                rows={3}
                value={aiSystemPrompt}
                onChange={(e) => setAiSystemPrompt(e.target.value)}
                style={{ fontSize: '0.78rem', lineHeight: '1.4', padding: '0.5rem' }}
              />
            </div>
          </div>

          {/* Fathom Section */}
          <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--accent-cyan)' }}>
            <h3 style={{ fontSize: '0.92rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 0.75rem 0' }}>
              <Key size={16} /> 🎙️ Fathom Video Notetaker — API Key
            </h3>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.78rem' }}>
                Fathom API Key (fath_live_...):
              </label>
              <input
                type="password"
                className="form-input"
                value={fathomApiKey}
                onChange={(e) => setFathomApiKey(e.target.value)}
                placeholder="fath_live_..."
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
              />
            </div>
            <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', margin: 0 }}>
              Obtené tu clave en: <strong>fathom.video → Settings → Integrations → API Keys</strong>. 
              Se guarda permanentemente en el navegador. La app leerá todas tus calls automáticamente (Follow Up Tecnología desde Enero 2026, otras desde Julio 2026).
            </p>
          </div>

          {/* Notion Section */}
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.92rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 0.75rem 0' }}>
              <Database size={16} /> Integración con Notion API
            </h3>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.78rem' }}>Notion Integration Internal Token (secret_...):</label>
              <input
                type="password"
                className="form-input"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                placeholder="secret_..."
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.78rem' }}>Database ID (Tablero Directivo):</label>
              <input
                type="text"
                className="form-input"
                value={notionDbId}
                onChange={(e) => setNotionDbId(e.target.value)}
                placeholder="34ace95d-6a9a-8054-b33b-cad2cbaf4c70"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>

            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
              <Check size={16} /> Guardar Configuración
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
