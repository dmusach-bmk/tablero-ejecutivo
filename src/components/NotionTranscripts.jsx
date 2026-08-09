import React, { useState } from 'react';
import { FileText, MessageSquare, Send, Plus, Calendar, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

export default function NotionTranscripts({ notionCards, onAddComment, onSetDeadline, onOpenDeadlineModal }) {
  const [selectedCardId, setSelectedCardId] = useState(notionCards[0]?.id || null);
  const [commentText, setCommentText] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const selectedCard = notionCards.find(c => c.id === selectedCardId) || notionCards[0];

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(selectedCard.id, commentText);
    setCommentText('');
  };

  const filteredCards = notionCards.filter(c => {
    if (filterStatus === 'Todos') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="notion-transcripts-container">
      <div className="card-header-flex" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>📌 Notion Sync & Transcripciones de Reuniones</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Visualización de tarjetas diarias, resúmenes técnicos, decisiones de arquitectura y comentarios directos en Notion.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select 
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="Todos">Todos los Estados</option>
            <option value="En Progreso">En Progreso</option>
            <option value="En Revisión Técnica">En Revisión Técnica</option>
            <option value="Bloqueado">Bloqueado</option>
            <option value="Completado">Completado</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>
        
        {/* Left List of Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredCards.map((card) => {
            const isSelected = card.id === selectedCardId;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                style={{
                  background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-card)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span className={`tag ${card.priority === 'Crítica' ? 'critical' : card.priority === 'Alta' ? 'high' : 'medium'}`}>
                    {card.priority}
                  </span>
                  <span className="tag info">{card.status}</span>
                </div>
                <h4 style={{ fontSize: '0.95rem', color: isSelected ? '#fff' : 'var(--text-main)', marginBottom: '0.3rem' }}>
                  {card.title}
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  👤 {card.assignedTo}
                </div>
                <div style={{ fontSize: '0.75rem', color: card.missingDeadline ? 'var(--accent-amber)' : 'var(--text-dim)', marginTop: '0.3rem' }}>
                  {card.missingDeadline ? '⚠️ Sin fecha tope definida' : `📅 Fecha Límite: ${card.deadline}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane & Notion Comment Writing */}
        {selectedCard ? (
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span className="tag info">{selectedCard.project}</span>
                  <span className={`tag ${selectedCard.priority === 'Crítica' ? 'critical' : selectedCard.priority === 'Alta' ? 'high' : 'medium'}`}>
                    {selectedCard.priority}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>{selectedCard.title}</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Responsable: <strong>{selectedCard.assignedTo}</strong> | Estado: <strong>{selectedCard.status}</strong>
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                {selectedCard.missingDeadline ? (
                  <button className="btn-danger" onClick={onOpenDeadlineModal}>
                    <AlertTriangle size={16} /> Asignar Fecha Límite
                  </button>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    📅 Entrega: {selectedCard.deadline}
                  </span>
                )}
              </div>
            </div>

            {/* Resumen de la Tarjeta */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} /> Resumen Ejecutivo
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                {selectedCard.summary}
              </p>
            </div>

            {/* Transcripción de Audio / reunión */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-violet)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageSquare size={16} /> Transcripción de Reunión y Acuerdos Técnicos
              </h4>
              <pre style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.8rem', 
                color: 'var(--text-muted)', 
                background: 'rgba(7, 10, 18, 0.9)', 
                padding: '1rem', 
                borderRadius: '10px', 
                whiteSpace: 'pre-wrap',
                border: '1px solid var(--border-subtle)'
              }}>
                {selectedCard.transcript}
              </pre>
            </div>

            {/* Comentarios de Notion Existentes */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.6rem' }}>
                💬 Comentarios e Historial de Notion ({selectedCard.comments.length})
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                {selectedCard.comments.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', italic: true }}>No hay comentarios aún.</p>
                ) : (
                  selectedCard.comments.map((cmt, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        <strong>{cmt.author}</strong>
                        <span>{cmt.date}</span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>{cmt.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Formulario de Escritura a Notion */}
              <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Escribir un comentario de instrucción o feedback directo a Notion..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  <Send size={16} /> Publicar a Notion
                </button>
              </form>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
