import React, { useState } from 'react';
import { FileText, MessageSquare, Send, Search, Filter, ExternalLink, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { postCommentToNotion } from '../services/notionService';

export default function NotionTranscripts({ notionCards, credentials, onAddComment }) {
  const [selectedCardId, setSelectedCardId] = useState(notionCards[0]?.id || null);
  const [commentText, setCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResponsable, setFilterResponsable] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [syncStatus, setSyncStatus] = useState(null);

  // Filter cards dynamically
  const filteredCards = notionCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          card.responsable.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesResp = filterResponsable === 'Todos' || card.responsable.includes(filterResponsable);
    const matchesStatus = filterStatus === 'Todos' || card.status === filterStatus;

    return matchesSearch && matchesResp && matchesStatus;
  });

  const selectedCard = notionCards.find(c => c.id === selectedCardId) || filteredCards[0] || notionCards[0];

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedCard) return;

    const newCommentText = commentText.trim();
    setCommentText('');

    // 1. Add locally
    onAddComment(selectedCard.id, newCommentText);

    // 2. Post to Notion API
    setSyncStatus('syncing');
    const result = await postCommentToNotion(
      credentials?.notionToken,
      selectedCard.notionId,
      `[Tablero CTO Diego Musach]: ${newCommentText}`
    );

    if (result.success) {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus(null), 3000);
    } else {
      setSyncStatus('error');
    }
  };

  return (
    <div className="notion-transcripts-container">
      
      {/* Header Banner */}
      <div className="card-header-flex" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText className="text-cyan" size={24} /> 
            Explorador Completo de Notion ({notionCards.length} Temas Reales)
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Consulta el 100% de las tarjetas de tu espacio de trabajo. Filtra por integrante o busca por palabra clave y publica comentarios en tiempo real.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6, 182, 212, 0.12)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--accent-cyan)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
            {filteredCards.length} de {notionCards.length} Temas Visibles
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card-glass" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.1rem', display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
        
        {/* Live Search */}
        <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Buscar por título de tema o palabra clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.85rem' }}
          />
        </div>

        {/* Filter by Responsable */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={15} className="text-cyan" />
          <select 
            className="form-select"
            value={filterResponsable}
            onChange={(e) => setFilterResponsable(e.target.value)}
            style={{ width: 'auto', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
          >
            <option value="Todos">👤 Todos los Integrantes</option>
            <option value="Camilo Uribe">Camilo Uribe</option>
            <option value="Enrique Bevilacqua">Enrique Bevilacqua</option>
            <option value="Fabricio Jose Nieva">Fabricio Jose Nieva</option>
            <option value="Mario Maqueda">Mario Maqueda</option>
            <option value="Leonard Amaya">Leonard Amaya</option>
            <option value="Joseph Valer">Joseph Valer</option>
            <option value="Sin Asignar">Sin Asignar</option>
            <option value="Diego Paolo Musach">Diego Musach (CTO)</option>
          </select>
        </div>

        {/* Filter by Status */}
        <div>
          <select 
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: 'auto', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
          >
            <option value="Todos">📌 Todos los Estados</option>
            <option value="Abierto">Abierto</option>
            <option value="En Progreso">En Progreso</option>
            <option value="En Revisión Técnica">En Revisión Técnica</option>
            <option value="Bloqueado">Bloqueado</option>
            <option value="Completado">Completado</option>
          </select>
        </div>

      </div>

      {/* Main 2-Column Split: List on Left, Detail & Commenting on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>
        
        {/* Left List of 100 Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '680px', overflowY: 'auto', paddingRight: '0.4rem' }}>
          {filteredCards.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No se encontraron temas con los filtros seleccionados.
            </div>
          ) : (
            filteredCards.map((card) => {
              const isSelected = card.id === selectedCardId;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  style={{
                    background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card)',
                    border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span className={`tag ${card.priority?.includes('P1') ? 'critical' : 'high'}`} style={{ fontSize: '0.68rem' }}>
                      {card.priority}
                    </span>
                    <span className="tag info" style={{ fontSize: '0.68rem' }}>{card.status}</span>
                  </div>

                  <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: isSelected ? '#fff' : 'var(--text-main)', marginBottom: '0.3rem', lineHeight: '1.3' }}>
                    {card.title}
                  </h4>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>👤 {card.responsable}</span>
                    <span>💬 {(card.comments || []).length}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail View & Live Notion Commenting */}
        {selectedCard ? (
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Header of Selected Card */}
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="tag info">{selectedCard.project}</span>
                <span className={`tag ${selectedCard.priority?.includes('P1') ? 'critical' : 'high'}`}>
                  {selectedCard.priority}
                </span>
                <span className="tag low">{selectedCard.status}</span>
              </div>

              <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: '0.2rem 0' }}>
                {selectedCard.title}
              </h2>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Responsable Asignado: <strong style={{ color: 'var(--accent-cyan)' }}>{selectedCard.responsable}</strong> | Notion ID: <code style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{selectedCard.notionId}</code>
              </div>
            </div>

            {/* Resumen & Contexto */}
            <div>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} /> Registro e Histórico en Notion
              </h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
                {selectedCard.transcript || selectedCard.summary}
              </div>
            </div>

            {/* Comentarios de Notion Existentes */}
            <div>
              <h4 style={{ fontSize: '0.88rem', color: '#fff', marginBottom: '0.6rem' }}>
                💬 Comentarios de Notion ({(selectedCard.comments || []).length})
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                {(selectedCard.comments || []).length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>Sin comentarios registrados aún. Publica el primero abajo.</p>
                ) : (
                  selectedCard.comments.map((cmt, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                        <strong>{cmt.author}</strong>
                        <span>{cmt.date}</span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: 0 }}>{cmt.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Formulario de Escritura a Notion */}
              <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Escribir instrucción o comentario directo a Notion para ${selectedCard.responsable}...`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    <Send size={16} /> Publicar a Notion
                  </button>
                </div>

                {syncStatus === 'syncing' && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <RefreshCw className="spin" size={12} /> Enviando comentario a Notion...
                  </div>
                )}
                {syncStatus === 'success' && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} /> ¡Comentario enviado en tiempo real a Notion!
                  </div>
                )}
                {syncStatus === 'error' && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>
                    ⚠️ Comentario guardado localmente.
                  </div>
                )}
              </form>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
