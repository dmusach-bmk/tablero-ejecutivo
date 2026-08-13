import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Edit2, Check, X, ShieldAlert, AlertCircle, Bookmark } from 'lucide-react';

const INITIAL_CRITERIA = [
  {
    id: 1,
    title: "Fecha en Títulos de Fathom",
    description: "El título de cada tema analizado por Fathom debe contener siempre la fecha de hoy para poder asociarlo de manera unívoca con el transcript correspondiente en Fathom Video.",
    category: "Fathom AI",
    enabled: true
  },
  {
    id: 2,
    title: "Notas sobre el tema",
    description: "El reporte y los comentarios no deben decir 'Notas para Alejandro', sino 'Notas sobre el tema'. Las notas son comentarios sobre la gestión o el reporte técnico, rara vez enviadas directamente por correo.",
    category: "Visual / Nombres",
    enabled: true
  },
  {
    id: 3,
    title: "Selección de Motor de IA Directo",
    description: "Permitir al usuario cambiar el proveedor de IA (Gemini, OpenAI, Claude, Local Proxy), modelo y System Prompt directamente desde la interfaz sin alterar código.",
    category: "IA Engine",
    enabled: true
  },
  {
    id: 4,
    title: "Confirmar antes de Abrir/Enviar Comentarios",
    description: "Para evitar saturación e ingobernabilidad, la IA debe proponer los temas comentados antes de abrir tarjetas en Notion o enviar comentarios al equipo.",
    category: "Seguridad / UX",
    enabled: true
  },
  {
    id: 5,
    title: "Base de Datos de Temas Cerrados",
    description: "Recordar los temas que el CTO/CEO ya cerraron en una base de datos histórica. La IA no debe volver a abrirlos automáticamente a menos que se consulte explícitamente.",
    category: "Base de Datos",
    enabled: true
  },
  {
    id: 6,
    title: "Envío con Enter en Comentarios",
    description: "Al agregar comentarios en la tarjeta de seguimiento, presionar la tecla Enter debe ingresar e iniciar el envío o guardado directamente, agilizando el flujo diario.",
    category: "Seguridad / UX",
    enabled: true
  },
  {
    id: 7,
    title: "Filtro de Ingesta Temporal de Fathom",
    description: "Las reuniones que se llaman 'Follow Up Tecnologia' se analizan desde Enero de 2026 en adelante. Para cualquier otro tipo de reunión directiva, se analizan desde Julio de 2026 en adelante.",
    category: "Fathom AI",
    enabled: true
  }
];

export default function CriteriosYReglas() {
  const [criteriaList, setCriteriaList] = useState(() => {
    const saved = localStorage.getItem('dm_tablero_criterios_v1');
    return saved ? JSON.parse(saved) : INITIAL_CRITERIA;
  });

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('dm_tablero_criterios_v1', JSON.stringify(criteriaList));
  }, [criteriaList]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newItem = {
      id: Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      enabled: true
    };

    setCriteriaList(prev => [newItem, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setNewCategory('General');
    setIsAddOpen(false);
  };

  const handleToggle = (id) => {
    setCriteriaList(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta regla o criterio del sistema?")) {
      setCriteriaList(prev => prev.filter(c => c.id !== id));
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditTitle(c.title);
    setEditDesc(c.description);
    setEditCategory(c.category);
  };

  const saveEdit = (id) => {
    setCriteriaList(prev => prev.map(c => c.id === id ? {
      ...c,
      title: editTitle.trim(),
      description: editDesc.trim(),
      category: editCategory
    } : c));
    setEditingId(null);
  };

  return (
    <div style={{ padding: '1rem', color: '#fff' }}>
      
      {/* Header */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings className="text-cyan" size={24} />
              Criterios, Reglas y Lineamientos del Tablero
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Fijá y editá las reglas que gobiernan el comportamiento de la IA, el procesamiento de las llamadas y el formato del reporte directivo.
            </p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setIsAddOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            <Plus size={15} /> Nuevo Criterio
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isAddOpen ? '1fr 350px' : '1fr', gap: '1rem', alignItems: 'start' }}>
        
        {/* Left column: List of criteria */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {criteriaList.map((c) => {
            const isEditing = editingId === c.id;

            return (
              <div 
                key={c.id} 
                className="card-glass"
                style={{ 
                  padding: '1rem', 
                  border: isEditing ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: c.enabled ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.15)',
                  opacity: c.enabled ? 1 : 0.6
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)} 
                        style={{ fontSize: '0.85rem', fontWeight: 700 }}
                      />
                      <select 
                        className="form-select" 
                        value={editCategory} 
                        onChange={(e) => setEditCategory(e.target.value)}
                        style={{ width: '150px', fontSize: '0.8rem' }}
                      >
                        <option value="Fathom AI">Fathom AI</option>
                        <option value="Visual / Nombres">Visual / Nombres</option>
                        <option value="IA Engine">IA Engine</option>
                        <option value="Seguridad / UX">Seguridad / UX</option>
                        <option value="Base de Datos">Base de Datos</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <textarea 
                      className="form-input" 
                      rows={3} 
                      value={editDesc} 
                      onChange={(e) => setEditDesc(e.target.value)}
                      style={{ fontSize: '0.8rem', lineHeight: '1.4' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                        <X size={12} /> Cancelar
                      </button>
                      <button className="btn-primary" onClick={() => saveEdit(c.id)} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Check size={12} /> Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.64rem', textTransform: 'uppercase', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                          {c.category}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#fff' }}>
                          {c.title}
                        </h3>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Switch Enable/Disable */}
                        <label className="switch-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.7rem' }}>
                          <input 
                            type="checkbox" 
                            checked={c.enabled} 
                            onChange={() => handleToggle(c.id)} 
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{c.enabled ? 'Activo' : 'Inactivo'}</span>
                        </label>

                        <button 
                          className="btn-icon" 
                          onClick={() => startEdit(c)}
                          title="Editar criterio"
                          style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        
                        <button 
                          className="btn-icon text-rose" 
                          onClick={() => handleDelete(c.id)}
                          title="Eliminar criterio"
                          style={{ padding: '0.25rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                      {c.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column: Form to Add New Criteria */}
        {isAddOpen && (
          <div className="card-glass" style={{ padding: '1rem', border: '1px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.92rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Plus size={16} className="text-cyan" />
                Nuevo Criterio o Regla
              </h3>
              <button className="btn-icon" onClick={() => setIsAddOpen(false)}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.74rem' }}>Título de la regla:</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="Ej: Formato de comentarios"
                  required
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.74rem' }}>Categoría / Módulo:</label>
                <select 
                  className="form-select" 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ fontSize: '0.8rem' }}
                >
                  <option value="General">General</option>
                  <option value="Fathom AI">Fathom AI</option>
                  <option value="Visual / Nombres">Visual / Nombres</option>
                  <option value="IA Engine">IA Engine</option>
                  <option value="Seguridad / UX">Seguridad / UX</option>
                  <option value="Base de Datos">Base de Datos</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.74rem' }}>Descripción / Criterio:</label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  placeholder="Detalla de forma explícita el criterio o regla que debe cumplir la aplicación..."
                  required
                  style={{ fontSize: '0.78rem', lineHeight: '1.4' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}
              >
                <Check size={14} /> Añadir Regla al Tablero
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
