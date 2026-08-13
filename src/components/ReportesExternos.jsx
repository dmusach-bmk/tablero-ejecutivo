import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function ReportesExternos() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', padding: '1rem' }}>
      
      {/* Claude Usage Dashboard */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🤖 Claude Usage Dashboard
          </h2>
          <a href="https://claudeusagedashboard-eb11b8o2m-claude-dashboard.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
            Abrir en nueva pestaña <ExternalLink size={14} />
          </a>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <iframe 
            src="https://claudeusagedashboard-eb11b8o2m-claude-dashboard.vercel.app/"
            title="Claude Dashboard"
            style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0 }}
            allowFullScreen
          />
        </div>
      </div>

      {/* Google Sheets Dashboard */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Google Sheets - Reporte
          </h2>
          <a href="https://docs.google.com/spreadsheets/d/1wYtl9vmRuu6wulIfk7RdH-EIbcZ2QSjDgvA5gJEdGRw/edit?gid=1294858156#gid=1294858156" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
            Abrir en nueva pestaña <ExternalLink size={14} />
          </a>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <iframe 
            src="https://docs.google.com/spreadsheets/d/1wYtl9vmRuu6wulIfk7RdH-EIbcZ2QSjDgvA5gJEdGRw/edit?gid=1294858156#gid=1294858156"
            title="Google Sheets"
            style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0 }}
            allowFullScreen
          />
        </div>
      </div>

    </div>
  );
}
