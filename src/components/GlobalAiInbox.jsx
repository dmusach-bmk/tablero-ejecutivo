import React, { useState, useEffect } from 'react';
import { Bot, Mic, Send, MessageSquare, PlusCircle, Check, X, History, FileText, Zap } from 'lucide-react';
import { postCommentToNotion, createNotionPage } from '../services/notionService';

export default function GlobalAiInbox({ sectionName, notionCards = [], credentials }) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // History state per section
  const storageKey = `dm_ai_inbox_history_${sectionName.replace(/\s+/g, '_')}`;
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Modal State
  const [proposedAction, setProposedAction] = useState(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(history));
  }, [history, storageKey]);

  const handleStartVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("🎙️ Dictado por voz requiere Google Chrome.");
      return;
    }
    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
      }
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const analyzeNoteWithAI = (note) => {
    const stopWords = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'con', 'para', 'por', 'sobre', 'decir', 'hacer']);
    const tokens = note.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
    const keywords = tokens.filter(w => !stopWords.has(w));

    let bestMatch = null;
    let maxScore = 0;

    notionCards.forEach(card => {
      let score = 0;
      const targetText = ((card.title || '') + ' ' + (card.summary || '') + ' ' + (card.responsable || '')).toLowerCase();
      keywords.forEach(kw => {
        if (targetText.includes(kw)) score += 1;
      });
      if (score > maxScore) {
        maxScore = score;
        bestMatch = card;
      }
    });

    if (bestMatch && maxScore > 0) {
      return {
        type: 'comment',
        text: note,
        targetCard: bestMatch,
        rationale: `Se encontraron ${maxScore} coincidencias clave con la tarjeta "${bestMatch.title}".`
      };
    } else {
      return {
        type: 'create',
        text: note,
        targetCard: null,
        rationale: `No se encontró ninguna tarjeta en Notion que coincida semánticamente con esta anotación.`
      };
    }
  };

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const action = analyzeNoteWithAI(inputText);
      setProposedAction(action);
      setIsAnalyzing(false);
    }, 600);
  };

  const executeAction = async (actionType) => {
    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('es-ES'),
      text: proposedAction.text,
      status: 'pending',
      actionTaken: '',
      targetTitle: ''
    };

    if (actionType === 'comment') {
      try {
        await postCommentToNotion(credentials?.notionToken, proposedAction.targetCard.notionPageId || proposedAction.targetCard.id, proposedAction.text);
        newRecord.status = 'success';
        newRecord.actionTaken = 'Comentario Agregado';
        newRecord.targetTitle = proposedAction.targetCard.title;
      } catch (err) {
        newRecord.status = 'error';
        newRecord.actionTaken = 'Error al comentar';
        newRecord.targetTitle = proposedAction.targetCard.title;
      }
    } else {
      try {
        const title = proposedAction.text.split(' ').slice(0, 6).join(' ') + '...';
        await createNotionPage(credentials?.notionToken, { title, summary: proposedAction.text, status: 'Abierto' });
        newRecord.status = 'success';
        newRecord.actionTaken = 'Nueva Tarjeta Creada';
        newRecord.targetTitle = title;
      } catch(err) {
        newRecord.status = 'error';
        newRecord.actionTaken = 'Error al crear';
      }
    }

    setHistory(prev => [newRecord, ...prev]);
    setProposedAction(null);
    setInputText('');
  };

  return (
    <div style={{ marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
          <Bot size={18} /> AI Inbox: Anotaciones Inteligentes
        </h3>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
        >
          <History size={14} /> {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
        </button>
      </div>

      {/* INPUT AREA */}
      <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Escribe o dicta tu anotación para la sección ${sectionName}... La IA la ruteará a la tarjeta correcta.`}
            style={{ width: '100%', minHeight: '60px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem 2.5rem 0.75rem 0.75rem', color: '#fff', fontSize: '0.9rem', resize: 'vertical' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAnalyze();
              }
            }}
          />
          <button 
            onClick={handleStartVoiceDictation}
            style={{ position: 'absolute', right: '0.5rem', top: '0.75rem', background: 'transparent', border: 'none', color: isListening ? 'var(--accent-rose)' : 'var(--text-muted)', cursor: 'pointer' }}
            title="Dictar por voz"
          >
            <Mic size={18} className={isListening ? 'pulse' : ''} />
          </button>
        </div>
        
        <button 
          onClick={handleAnalyze}
          disabled={!inputText.trim() || isAnalyzing}
          className="btn-primary"
          style={{ padding: '0.75rem 1.25rem', height: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' }}
        >
          {isAnalyzing ? <Zap size={18} className="pulse" /> : <Send size={18} />}
          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{isAnalyzing ? 'Analizando...' : 'Procesar'}</span>
        </button>
      </div>

      {/* HISTORY PANEL */}
      {showHistory && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.15)', maxHeight: '300px', overflowY: 'auto' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Historial de Anotaciones en {sectionName}</h4>
          {history.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '1rem' }}>No hay anotaciones previas en esta sección.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {history.map(record => (
                <div key={record.id} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '0.75rem', borderRadius: '6px', borderLeft: record.status === 'success' ? '2px solid var(--accent-emerald)' : '2px solid var(--accent-rose)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '0.35rem' }}>"{record.text}"</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>📅 {record.date}</span>
                    <span style={{ color: record.status === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>
                      {record.actionTaken}: {record.targetTitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROPOSED ACTION MODAL */}
      {proposedAction && (
        <div className="modal-overlay" onClick={() => setProposedAction(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', borderTop: '4px solid var(--accent-cyan)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                <Bot size={22} className="text-cyan" /> Sugerencia de la IA
              </h2>
              <button className="btn-icon" onClick={() => setProposedAction(null)}><X size={18} /></button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              He analizado tu anotación y propongo la siguiente acción. ¿Deseas confirmarla?
            </p>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>📝 Tu Anotación Original:</span>
                <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.25rem', fontStyle: 'italic' }}>"{proposedAction.text}"</div>
              </div>

              {proposedAction.type === 'comment' ? (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px' }}>🎯 Tarjeta Encontrada:</span>
                  <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} /> {proposedAction.targetCard.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>💡 {proposedAction.rationale}</div>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '1px' }}>⚠️ Sin Coincidencias:</span>
                  <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.25rem' }}>
                    💡 {proposedAction.rationale} Se sugiere crear una tarjeta nueva.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {proposedAction.type === 'comment' && (
                <>
                  <button className="btn-secondary" onClick={() => executeAction('create')} style={{ borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}>
                    <PlusCircle size={14} /> Forzar Crear Nueva
                  </button>
                  <button className="btn-primary" onClick={() => executeAction('comment')}>
                    <MessageSquare size={14} /> Confirmar Comentario
                  </button>
                </>
              )}
              
              {proposedAction.type === 'create' && (
                <>
                  <button className="btn-secondary" onClick={() => setProposedAction(null)}>
                    Cancelar
                  </button>
                  <button className="btn-primary" onClick={() => executeAction('create')} style={{ background: 'var(--accent-emerald)', color: '#000' }}>
                    <PlusCircle size={14} /> Confirmar Crear Nueva
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
