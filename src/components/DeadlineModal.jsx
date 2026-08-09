import React, { useState } from 'react';
import { Calendar, AlertTriangle, Check, X, Clock } from 'lucide-react';

export default function DeadlineModal({ isOpen, onClose, missingTasks, onSetDeadline }) {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [customDate, setCustomDate] = useState('');

  if (!isOpen || missingTasks.length === 0) return null;

  const currentTask = missingTasks[selectedTaskIndex] || missingTasks[0];

  // Helper date generators
  const getNextFriday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + (5 - day + 7) % 7;
    const friday = new Date(d.setDate(diff));
    return friday.toISOString().split('T')[0];
  };

  const getNextMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + (1 - day + 7) % 7 + (day === 1 ? 7 : 0);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const getEndOfMonth = () => {
    const d = new Date();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return end.toISOString().split('T')[0];
  };

  const handleApplyPreset = (dateStr) => {
    onSetDeadline(currentTask.id, dateStr);
    if (selectedTaskIndex < missingTasks.length - 1) {
      setSelectedTaskIndex(selectedTaskIndex + 1);
    } else {
      onClose();
    }
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (customDate) {
      handleApplyPreset(customDate);
      setCustomDate('');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            <AlertTriangle className="text-amber" size={22} />
            Definición Requerida: Fechas Límite Pendientes
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Diego, las siguientes tareas activas en Notion no tienen una fecha límite definida. Selecciona una opción en 1-click para actualizarla:
        </div>

        <div className="card-glass" style={{ borderColor: 'var(--accent-amber)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span className="tag high">{currentTask.priority || 'Alta'}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Tarea {selectedTaskIndex + 1} de {missingTasks.length}
            </span>
          </div>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.4rem' }}>{currentTask.title}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {currentTask.summary}
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
            👤 Asignado a: <strong>{currentTask.assignedTo}</strong>
          </div>
        </div>

        <h4 style={{ fontSize: '0.88rem', color: '#fff', marginBottom: '0.75rem' }}>
          ⚡ Selección rápida de Fecha Límite (Click directo):
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button className="btn-secondary" onClick={() => handleApplyPreset(getNextFriday())}>
            <Clock size={16} /> Este Viernes ({getNextFriday()})
          </button>

          <button className="btn-secondary" onClick={() => handleApplyPreset(getNextMonday())}>
            <Calendar size={16} /> Próximo Lunes ({getNextMonday()})
          </button>

          <button className="btn-secondary" onClick={() => handleApplyPreset(getEndOfMonth())}>
            <Check size={16} /> Fin de Mes ({getEndOfMonth()})
          </button>
        </div>

        <form onSubmit={handleApplyCustom} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="date"
            className="form-input"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={!customDate}>
            Guardar Fecha
          </button>
        </form>
      </div>
    </div>
  );
}
