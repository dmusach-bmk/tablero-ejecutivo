import React, { useState } from 'react';
import { Users, CheckSquare, MessageSquare, Send, Zap, AlertCircle, ChevronRight, RefreshCw, CheckCircle2, Plus, List, UserCheck, Search, Filter } from 'lucide-react';
import { postCommentToNotion } from '../services/notionService';
import NewTopicModal from './NewTopicModal';

export default function MicromanagementEngine({ teamTracking, credentials, onUpdateTeamTracking, onOpenEmailWithAgenda }) {
  const [viewMode, setViewMode] = useState('all_together'); // 'all_together' or 'by_member'
  const [selectedDevId, setSelectedDevId] = useState(teamTracking[0]?.id || 'dev-camilo');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMember, setFilterMember] = useState('Todos');
  const [commentInputs, setCommentInputs] = useState({});
  const [syncStatus, setSyncStatus] = useState({});
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);

  const selectedDev = teamTracking.find(d => d.id === selectedDevId) || teamTracking[0];

  // Flatten all topics across all members for the 'all_together' view mode
  const allTeamTopics = [];
  teamTracking.forEach(dev => {
    (dev.topics || []).forEach(t => {
      allTeamTopics.push({
        ...t,
        memberName: dev.name,
        memberRole: dev.role,
        memberAvatar: dev.avatar,
        devId: dev.id
      });
    });
  });

  // Filter flattened topics
  const filteredAllTopics = allTeamTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          topic.memberName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMember = filterMember === 'Todos' || topic.memberName.includes(filterMember);
    return matchesSearch && matchesMember;
  });

  const handleInputChange = (topicId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [topicId]: value
    }));
  };

  const handleAddCommentToTopic = async (topicId, targetDevName) => {
    const text = commentInputs[topicId];
    if (!text || !text.trim()) return;

    const newComment = {
      author: "Diego Musach",
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      text: text.trim()
    };

    // Update state
    const updatedTeam = teamTracking.map(dev => {
      const updatedTopics = (dev.topics || []).map(top => {
        if (top.id !== topicId) return top;
        return {
          ...top,
          comments: [...(top.comments || []), newComment]
        };
      });
      return { ...dev, topics: updatedTopics };
    });

    onUpdateTeamTracking(updatedTeam);
    setCommentInputs(prev => ({ ...prev, [topicId]: '' }));

    // Post directly to Notion API
    setSyncStatus(prev => ({ ...prev, [topicId]: 'syncing' }));
    const targetTopic = allTeamTopics.find(t => t.id === topicId);
    const result = await postCommentToNotion(
      credentials?.notionToken,
      targetTopic?.notionPageId,
      `[Tablero CTO Diego Musach]: ${text.trim()}`
    );

    if (result.success) {
      setSyncStatus(prev => ({ ...prev, [topicId]: 'success' }));
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, [topicId]: null }));
      }, 3000);
    } else {
      setSyncStatus(prev => ({ ...prev, [topicId]: 'error' }));
    }
  };

  const handleAddNewTopic = (newTopic) => {
    const updatedTeam = teamTracking.map(dev => {
      if (dev.name.toLowerCase().includes(newTopic.responsable.toLowerCase().split(' ')[0])) {
        return {
          ...dev,
          topics: [newTopic, ...(dev.topics || [])]
        };
      }
      return dev;
    });

    onUpdateTeamTracking(updatedTeam);
  };

  return (
    <div className="micromanagement-container">
      {/* Header */}
      <div className="card-header-flex" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users className="text-cyan" size={24} /> 
            Listado Completo de Temas del Equipo ({allTeamTopics.length} Temas Reales)
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Supervisión directa de Camilo Uribe, Enrique Bevilacqua, Fabricio, Mario, Leonard, Joseph y tareas de Notion.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn-primary"
            onClick={() => setIsNewTopicModalOpen(true)}
            style={{ padding: '0.65rem 1.1rem', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' }}
          >
            <Plus size={18} /> Crear Nuevo Tema en Notion
          </button>
        </div>
      </div>

      {/* View Switcher Bar: ALL TOGETHER vs BY MEMBER */}
      <div className="card-glass" style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Toggle Mode Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn-secondary ${viewMode === 'all_together' ? 'active' : ''}`}
            onClick={() => setViewMode('all_together')}
            style={{
              background: viewMode === 'all_together' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'rgba(255,255,255,0.04)',
              color: '#fff',
              fontWeight: viewMode === 'all_together' ? 700 : 400,
              padding: '0.55rem 1.1rem',
              borderRadius: '8px'
            }}
          >
            <List size={16} /> 📋 VER TODOS LOS TEMAS JUNTOS ({allTeamTopics.length})
          </button>

          <button
            className={`btn-secondary ${viewMode === 'by_member' ? 'active' : ''}`}
            onClick={() => setViewMode('by_member')}
            style={{
              background: viewMode === 'by_member' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'rgba(255,255,255,0.04)',
              color: '#fff',
              fontWeight: viewMode === 'by_member' ? 700 : 400,
              padding: '0.55rem 1.1rem',
              borderRadius: '8px'
            }}
          >
            <UserCheck size={16} /> 👤 Ver Agrupado por Integrante
          </button>
        </div>

        {/* Live Filter Controls */}
        {viewMode === 'all_together' && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <Search size={14} className="text-muted" />
              <input
                type="text"
                placeholder="Buscar tema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.8rem', width: '160px' }}
              />
            </div>

            <select
              className="form-select"
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', width: 'auto' }}
            >
              <option value="Todos">👤 Todos los Integrantes</option>
              <option value="Camilo Uribe">Camilo Uribe (18)</option>
              <option value="Enrique Bevilacqua">Enrique Bevilacqua (28)</option>
              <option value="Joseph Valer">Joseph Valer (16)</option>
              <option value="Leonard Amaya">Leonard Amaya (4)</option>
              <option value="Mario Maqueda">Mario Maqueda (1)</option>
              <option value="Fabricio">Fabricio Jose Nieva</option>
              <option value="Sin Asignar">Sin Asignar (12)</option>
            </select>
          </div>
        )}

      </div>

      {/* VIEW MODE 1: ALL TOPICS TOGETHER (UNTRUNCATED COMPREHENSIVE LIST) */}
      {viewMode === 'all_together' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.2rem' }}>
            Showing {filteredAllTopics.length} of {allTeamTopics.length} Total Topics from Notion:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
            {filteredAllTopics.map((topic, idx) => {
              const inputVal = commentInputs[topic.id] || '';
              const status = syncStatus[topic.id];

              return (
                <div 
                  key={topic.id || idx}
                  className="card-glass"
                  style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    borderLeft: '4px solid var(--accent-cyan)'
                  }}
                >
                  {/* Topic Title & Member Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem', alignItems: 'center' }}>
                        <img src={topic.memberAvatar} alt={topic.memberName} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                          {topic.memberName}
                        </span>
                        <span className={`tag ${topic.priority?.includes('P1') ? 'critical' : 'high'}`} style={{ fontSize: '0.65rem' }}>
                          {topic.priority}
                        </span>
                        <span className="tag info" style={{ fontSize: '0.65rem' }}>{topic.status}</span>
                      </div>

                      <h4 style={{ fontSize: '0.98rem', color: '#fff', lineHeight: '1.35', margin: 0 }}>
                        {topic.title}
                      </h4>
                    </div>
                  </div>

                  {/* Log de Seguimiento */}
                  {topic.log && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                      {topic.log}
                    </div>
                  )}

                  {/* Existing Comments */}
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                      💬 Comentarios ({(topic.comments || []).length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '120px', overflowY: 'auto' }}>
                      {(topic.comments || []).length === 0 ? (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>Sin comentarios aún.</span>
                      ) : (
                        topic.comments.map((c, cIdx) => (
                          <div key={cIdx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                            <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>{c.author} ({c.date}): </strong>
                            <span style={{ color: '#fff' }}>{c.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Comentar para ${topic.memberName}...`}
                        value={inputVal}
                        onChange={(e) => handleInputChange(topic.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddCommentToTopic(topic.id, topic.memberName);
                        }}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                      />
                      <button 
                        type="button"
                        className="btn-primary"
                        onClick={() => handleAddCommentToTopic(topic.id, topic.memberName)}
                        style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
                      >
                        <Send size={13} /> Publicar a Notion
                      </button>
                    </div>

                    {status === 'syncing' && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                        Enviando comentario a Notion API...
                      </div>
                    )}
                    {status === 'success' && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>
                        ¡Publicado en Notion!
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: BY MEMBER SPLIT GRID */}
      {viewMode === 'by_member' && (
        <div style={{ display: 'grid', gridTemplateColumns: '330px 1fr', gap: '1.5rem' }}>
          
          {/* Left: Real Team List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
              👥 Seleccionar Colaborador
            </div>

            {teamTracking.map((dev) => {
              const isSelected = dev.id === selectedDevId;
              return (
                <div
                  key={dev.id}
                  onClick={() => setSelectedDevId(dev.id)}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(59, 130, 246, 0.1))' : 'var(--bg-card)',
                    border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    padding: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img 
                    src={dev.avatar} 
                    alt={dev.name} 
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-main)', margin: 0 }}>
                      {dev.name}
                    </h4>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {(dev.topics || []).length} Temas en Notion
                    </p>
                  </div>
                  <ChevronRight size={18} style={{ color: isSelected ? 'var(--accent-cyan)' : 'var(--text-dim)' }} />
                </div>
              );
            })}
          </div>

          {/* Right: Selected Member Topics List */}
          {selectedDev && (
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <img src={selectedDev.avatar} alt={selectedDev.name} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-cyan)' }} />
                  <div>
                    <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>{selectedDev.name}</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selectedDev.role}</p>
                  </div>
                </div>

                <button className="btn-primary" onClick={() => onOpenEmailWithAgenda(selectedDev)}>
                  <MessageSquare size={16} /> Enviar Agenda
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>
                  Temas Asignados a {selectedDev.name} en Notion ({(selectedDev.topics || []).length}):
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(selectedDev.topics || []).map((topic, idx) => (
                    <div key={topic.id || idx} style={{ background: 'rgba(11, 16, 28, 0.85)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', color: '#fff', margin: '0 0 0.3rem 0' }}>{topic.title}</h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{topic.log}</div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Agregar comentario para Notion..."
                          value={commentInputs[topic.id] || ''}
                          onChange={(e) => handleInputChange(topic.id, e.target.value)}
                        />
                        <button className="btn-primary" onClick={() => handleAddCommentToTopic(topic.id, selectedDev.name)}>
                          Publicar a Notion
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Modal to Create New Topic */}
      <NewTopicModal
        isOpen={isNewTopicModalOpen}
        onClose={() => setIsNewTopicModalOpen(false)}
        credentials={credentials}
        onAddTopic={handleAddNewTopic}
      />
    </div>
  );
}
