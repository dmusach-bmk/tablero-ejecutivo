import React, { useState } from 'react';
import { Plus, X, Shield, CheckCircle2, RefreshCw, Database } from 'lucide-react';
import { createNotionPage } from '../services/notionService';

export default function NewTopicModal({ isOpen, onClose, credentials, onAddTopic }) {
  const [title, setTitle] = useState('');
  const [responsable, setResponsable] = useState('Camilo Uribe');
  const [priority, setPriority] = useState('P2 - ALTA');
  const [status, setStatus] = useState('Abierto');
  const [deadline, setDeadline] = useState('2026-08-25');
  const [log, setLog] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const teamMembers = [
    "Camilo Uribe",
    "Enrique Bevilacqua",
    "Fabricio Jose Nieva",
    "Mario Maqueda",
    "Leonard Amaya",
    "Joseph Valer",
    "Diego Paolo Musach (CTO)"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    const newTopicData = {
      id: `top-new-${Date.now()}`,
      title: title.trim(),
      responsable,
      priority,
      status,
      deadline,
      log: log.trim() || `Tema creado desde el Tablero Ejecutivo para ${responsable}.`,
      comments: [
        {
          author: "Diego Musach",
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          text: `📌 Tema creado institucionalmente desde el Tablero Ejecutivo.`
        }
      ]
    };

    // 1. Call Notion API
    const result = await createNotionPage(
      credentials?.notionToken,
      credentials?.notionDbId,
      {
        title: title.trim(),
        responsable,
        priority,
        status
      }
    );

    if (result.success && result.data?.id) {
      newTopicData.notionPageId = result.data.id;
    }

    // 2. Add to local state
    onAddTopic(newTopicData);

    setIsSubmitting(false);
    setSuccessMessage(true);

    setTimeout(() => {
      setSuccessMessage(false);
      setTitle('');
      setLog('');
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <h2>
            <Plus className="text-cyan" size={22} />
            Crear Nuevo Tema en Notion (Sync 2-Way)
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {successMessage && (
          <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--accent-emerald)', borderRadius: '10px', color: '#fff', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} /> ¡Tema creado en vivo en Notion y agregado a la web!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          <div className="form-group">
            <label style={{ fontWeight: 700, color: '#fff' }}>Título del Tema / Tarea (Name en Notion):</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Relevar requerimientos de integración con cliente..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            <div className="form-group">
              <label style={{ fontWeight: 700, color: '#fff' }}>Responsable (joseph):</label>
              <select
                className="form-select"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
              >
                {teamMembers.map((m, idx) => (
                  <option key={idx} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 700, color: '#fff' }}>Prioridad:</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="P1 - CRITICA">P1 - CRITICA</option>
                <option value="P2 - ALTA">P2 - ALTA</option>
                <option value="P3 - MEDIA">P3 - MEDIA</option>
              </select>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            <div className="form-group">
              <label style={{ fontWeight: 700, color: '#fff' }}>Estado (Status 1):</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Abierto">Abierto</option>
                <option value="En Progreso">En Progreso</option>
                <option value="En Revisión Técnica">En Revisión Técnica</option>
                <option value="Bloqueado">Bloqueado</option>
                <option value="Completado">Completado</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 700, color: '#fff' }}>Fecha Límite (Vencimiento):</label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

          </div>

          <div className="form-group">
            <label style={{ fontWeight: 700, color: '#fff' }}>Log de Seguimiento / Instrucción Inicial:</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Describir las instrucciones clave o contexto para el integrante..."
              value={log}
              onChange={(e) => setLog(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="spin" size={16} /> Creando en Notion...
                </>
              ) : (
                <>
                  <Database size={16} /> Crear y Publicar a Notion
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
