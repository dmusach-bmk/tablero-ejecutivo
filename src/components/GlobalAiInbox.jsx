import React, { useState, useEffect } from 'react';
import { Bot, Mic, Send, MessageSquare, PlusCircle, Check, X, History, FileText, Zap, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import { postCommentToNotion, createNotionPage, fetchNotionComments } from '../services/notionService';

export default function GlobalAiInbox({ sectionName, notionCards = [], credentials, onAddCommentAndSync, onAddNotionCard }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Modal State
  const [proposedAction, setProposedAction] = useState(null);
  const [cardContextLoading, setCardContextLoading] = useState(false);
  const [cardComments, setCardComments] = useState([]);

  // Contacts Directory State
  const [contactsDirectory, setContactsDirectory] = useState(() => {
    const saved = localStorage.getItem('dm_contacts_directory');
    return saved ? JSON.parse(saved) : {};
  });
  const [sendEmailCopy, setSendEmailCopy] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [addToCeoReport, setAddToCeoReport] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('Diego Musach (CTO)');
  const [addToDailyFollowUp, setAddToDailyFollowUp] = useState(false);
  const [subTasksState, setSubTasksState] = useState([]);

  // Unified global history across all sections
  const storageKey = 'dm_ai_inbox_history_global';
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(history));
  }, [history, storageKey]);

  useEffect(() => {
    // Migrate old section-specific histories to global history
    const oldKeys = [
      'dm_ai_inbox_history_Vista_General_(Overview)',
      'dm_ai_inbox_history_Reporte_Semanal_CEO',
      'dm_ai_inbox_history_Follow_Up_Diario'
    ];
    let migratedItems = [];
    oldKeys.forEach(key => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            migratedItems = [...migratedItems, ...parsed];
          }
        } catch(e) {}
        localStorage.removeItem(key);
      }
    });
    if (migratedItems.length > 0) {
      setHistory(prev => {
        const merged = [...prev, ...migratedItems];
        const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
        unique.sort((a, b) => b.id.localeCompare(a.id));
        return unique;
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProposedAction(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    const parseSuggestedAssignee = (text) => {
      const t = text.toLowerCase();
      const members = [
        { name: 'Mario Maqueda', key: 'mario' },
        { name: 'Camilo Uribe', key: 'camilo' },
        { name: 'Leonard Amaya', key: 'leo' },
        { name: 'Leonard Amaya', key: 'leonard' },
        { name: 'Joseph Valer', key: 'joseph' },
        { name: 'Fabricio Jose Nieva', key: 'fabricio' },
        { name: 'Enrique Bevilacqua', key: 'enrique' },
        { name: 'Rodolfo', key: 'rodolfo' }
      ];
      const found = members.find(m => t.includes(m.key));
      return found ? found.name : 'Diego Musach (CTO)';
    };

    const isQuestion = note.trim().endsWith('?') || /^(qué|que|quién|quien|cómo|como|cuál|cual|dónde|donde|estado de|tareas de|tiene)\b/i.test(note.trim());

    if (isQuestion) {
      const stopWords = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'con', 'para', 'por', 'sobre', 'decir', 'hacer']);
      const tokens = note.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
      const keywords = tokens.filter(w => !stopWords.has(w));
      const matches = notionCards.filter(card => {
        const targetText = ((card.title || '') + ' ' + (card.summary || '') + ' ' + (card.responsable || '') + ' ' + (card.status || '')).toLowerCase();
        return keywords.some(kw => targetText.includes(kw));
      });
      return {
        type: 'search',
        text: note,
        results: matches
      };
    }

    // Split note into sub-tasks if it contains numbered items (e.g. 1., 2.) or newlines
    const splitNoteIntoTasks = (text) => {
      // Look for numbered patterns like "1. ", "2. ", "1) ", "2) " or lists starting with dash/bullet
      const numberedRegex = /(?:\r?\n|^|\s)(?:\d+[\.\)]|[-*•])\s+/g;
      if (numberedRegex.test(text)) {
        const parts = text.split(/(?:\r?\n|^|\s)(?:\d+[\.\)]|[-*•])\s+/);
        let prefix = '';
        const tasks = [];
        
        // Extract common prefix (like "Joseph" or "Para Camilo")
        const firstPart = parts[0].trim();
        if (firstPart.split(/\s+/).length <= 4 && parts.length > 1) {
          prefix = firstPart;
        } else if (firstPart) {
          tasks.push(firstPart);
        }
        
        for (let i = 1; i < parts.length; i++) {
          const p = parts[i].trim();
          if (p) {
            // Keep the prefix context in each task
            tasks.push(prefix ? `${prefix} ${p}` : p);
          }
        }
        return tasks;
      }
      
      // Fallback: Split by newlines if there are multiple lines that look like tasks
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 5);
      if (lines.length > 1) {
        return lines;
      }
      
      return [text.trim()];
    };

    const rawTasks = splitNoteIntoTasks(note);

    const analyzeSubTask = (subTaskText) => {
      const stopWords = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'con', 'para', 'por', 'sobre', 'decir', 'hacer']);
      // Normalizing common typos to improve keyword matching accuracy
      const normalizedText = subTaskText.toLowerCase()
        .replace(/teelcable/g, 'telecable')
        .replace(/certicaion/g, 'certificacion');
      const tokens = normalizedText.match(/[a-záéíóúñ]{4,}/g) || [];
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

      const suggestedAssignee = parseSuggestedAssignee(subTaskText);
      const suggestedAddToDailyFollowUp = suggestedAssignee !== 'Diego Musach (CTO)';
      const suggestedAddToCeoReport = /ceo|roadmap|pillar|reunion|reunión|informe|reporte/i.test(subTaskText);

      // We require at least 2 keyword matches for a confident card matching
      const hasConfidentMatch = bestMatch && (maxScore >= 2 || (maxScore === 1 && keywords.some(kw => (bestMatch.title || '').toLowerCase().includes(kw))));

      if (bestMatch && hasConfidentMatch) {
        return {
          type: 'comment',
          text: subTaskText,
          targetCard: bestMatch,
          rationale: `Coincide con la tarjeta "${bestMatch.title}".`,
          suggestedAssignee,
          suggestedAddToDailyFollowUp,
          suggestedAddToCeoReport
        };
      } else {
        return {
          type: 'create',
          text: subTaskText,
          targetCard: null,
          rationale: `No se encontró coincidencia clara en Notion.`,
          suggestedAssignee,
          suggestedAddToDailyFollowUp,
          suggestedAddToCeoReport
        };
      }
    };

    if (rawTasks.length > 1) {
      return {
        type: 'multi',
        text: note,
        subTasks: rawTasks.map(t => analyzeSubTask(t))
      };
    } else {
      return analyzeSubTask(note);
    }
  };

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    const noteText = inputText.trim();
    setInputText(''); // Clear input text immediately

    // Add note to history immediately so it is recorded even if modal is cancelled
    const tempId = Date.now().toString();
    const newRecord = {
      id: tempId,
      date: new Date().toLocaleString('es-ES'),
      text: noteText,
      status: 'pending',
      actionTaken: 'Analizado',
      targetTitle: 'Pendiente de confirmación'
    };

    setHistory(prev => {
      // Prevent duplicate consecutive entries
      if (prev.length > 0 && prev[0].text === noteText) {
        return prev;
      }
      return [newRecord, ...prev];
    });
    
    setTimeout(async () => {
      const action = analyzeNoteWithAI(noteText);
      
      if (action.type === 'search') {
        setProposedAction(null);
        setIsAnalyzing(false);
        // Extract the search keywords from the query
        const stopWords = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'con', 'para', 'por', 'sobre', 'decir', 'hacer']);
        const tokens = noteText.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
        const keywords = tokens.filter(w => !stopWords.has(w)).join(' ');
        
        // Update history item to success for search
        setHistory(prev => prev.map(item => {
          if (item.id === tempId) {
            return {
              ...item,
              status: 'success',
              actionTaken: 'Búsqueda Realizada',
              targetTitle: keywords
            };
          }
          return item;
        }));

        // Open new tab with the search query
        window.open(window.location.origin + '/#overview?q=' + encodeURIComponent(keywords), '_blank');
        setInputText('');
      } else if (action.type === 'multi') {
        setProposedAction({ ...action, historyId: tempId });
        setIsAnalyzing(false);

        // Initialize subTasksState with the subtasks analyzed
        setSubTasksState(action.subTasks.map((st, idx) => ({
          id: `st-${idx}-${Date.now()}`,
          text: st.text,
          type: st.type,
          targetCard: st.targetCard,
          rationale: st.rationale,
          assignee: st.suggestedAssignee,
          addToDailyFollowUp: st.suggestedAddToDailyFollowUp,
          addToCeoReport: st.suggestedAddToCeoReport
        })));
      } else {
        // Attach tempId to proposed action to update it later
        setProposedAction({ ...action, historyId: tempId });
        setIsAnalyzing(false);

        // Pre-fill suggested values for single action
        if (action.suggestedAssignee) {
          setSelectedAssignee(action.suggestedAssignee);
        } else {
          setSelectedAssignee('Diego Musach (CTO)');
        }
        setAddToDailyFollowUp(!!action.suggestedAddToDailyFollowUp);
        setAddToCeoReport(!!action.suggestedAddToCeoReport);

        if (action.type === 'comment' && action.targetCard) {
          setCardContextLoading(true);
          try {
            const targetId = action.targetCard.notionPageId || action.targetCard.id;
            const comments = await fetchNotionComments(credentials?.notionToken, targetId);
            setCardComments(comments || []);
          } catch(e) {
            console.error("Error fetching context comments", e);
          } finally {
            setCardContextLoading(false);
          }
        }
      }
    }, 600);
  };

  const executeAction = async (actionType) => {
    if (proposedAction.type === 'multi') {
      const targetTitles = [];

      for (const subTask of subTasksState) {
        const finalAssignee = subTask.addToDailyFollowUp ? subTask.assignee : 'Diego Musach (CTO)';
        
        if (subTask.type === 'comment' && subTask.targetCard) {
          try {
            await postCommentToNotion(credentials?.notionToken, subTask.targetCard.notionPageId || subTask.targetCard.id, subTask.text);
            if (onAddCommentAndSync) {
              onAddCommentAndSync(subTask.targetCard.id, subTask.text, 'Diego Musach (CTO)', {
                responsable: finalAssignee,
                assignedTo: finalAssignee,
                isCEOCard: subTask.addToCeoReport
              });
            }
            targetTitles.push(`Comentó "${subTask.targetCard.title}"`);
          } catch (e) {
            console.error("Error saving subtask comment", e);
          }
        } else {
          try {
            const title = subTask.text.split(' ').slice(0, 6).join(' ') + '...';
            const newCard = {
              id: `new-${Date.now()}-${Math.random()}`,
              notionPageId: `new-${Date.now()}-${Math.random()}`,
              title: title,
              summary: subTask.text,
              status: 'Abierto',
              priority: 'P2 - ALTA',
              responsable: finalAssignee,
              assignedTo: finalAssignee,
              isCEOCard: subTask.addToCeoReport,
              comments: []
            };
            await createNotionPage(credentials?.notionToken, newCard);
            if (onAddNotionCard) {
              onAddNotionCard(newCard);
            }
            targetTitles.push(`Creó "${title}"`);
          } catch (e) {
            console.error("Error creating subtask card", e);
          }
        }
      }

      const outcomeTitle = targetTitles.join(', ');

      setHistory(prev => prev.map(item => {
        if (item.id === proposedAction.historyId) {
          return {
            ...item,
            status: 'success',
            actionTaken: 'Procesadas Acciones Múltiples',
            targetTitle: outcomeTitle
          };
        }
        return item;
      }));

      setProposedAction(null);
      setInputText('');
      setSubTasksState([]);
      return;
    }

    const updatedOutcome = {
      status: 'pending',
      actionTaken: '',
      targetTitle: ''
    };

    if (actionType === 'comment') {
      try {
        await postCommentToNotion(credentials?.notionToken, proposedAction.targetCard.notionPageId || proposedAction.targetCard.id, proposedAction.text);
        
        if (onAddCommentAndSync) {
          const finalAssignee = addToDailyFollowUp ? selectedAssignee : 'Diego Musach (CTO)';
          const updates = {
            responsable: finalAssignee,
            assignedTo: finalAssignee,
            isCEOCard: addToCeoReport
          };
          onAddCommentAndSync(proposedAction.targetCard.id, proposedAction.text, 'Diego Musach (CTO)', updates);
        }

        updatedOutcome.status = 'success';
        updatedOutcome.actionTaken = 'Comentario Agregado';
        updatedOutcome.targetTitle = proposedAction.targetCard.title;

        // EMAIL LOGIC
        if (sendEmailCopy) {
          const responsableName = proposedAction.targetCard.responsable || '';
          let emailToSend = contactsDirectory[responsableName] || newEmailInput;
          
          if (!contactsDirectory[responsableName] && newEmailInput) {
            const updatedDir = { ...contactsDirectory, [responsableName]: newEmailInput };
            setContactsDirectory(updatedDir);
            localStorage.setItem('dm_contacts_directory', JSON.stringify(updatedDir));
          }
          
          if (emailToSend) {
            const subject = encodeURIComponent(`Seguimiento: ${proposedAction.targetCard.title}`);
            const body = encodeURIComponent(proposedAction.text);
            window.open(`mailto:${emailToSend}?subject=${subject}&body=${body}`, '_blank');
          }
        }
      } catch (err) {
        updatedOutcome.status = 'error';
        updatedOutcome.actionTaken = 'Error al comentar';
        updatedOutcome.targetTitle = proposedAction.targetCard.title;
      }
    } else {
      try {
        const title = proposedAction.text.split(' ').slice(0, 6).join(' ') + '...';
        const finalAssignee = addToDailyFollowUp ? selectedAssignee : 'Diego Musach (CTO)';
        const newCard = {
          id: `new-${Date.now()}`,
          notionPageId: `new-${Date.now()}`,
          title: title,
          summary: proposedAction.text,
          status: 'Abierto',
          priority: 'P2 - ALTA',
          responsable: finalAssignee,
          assignedTo: finalAssignee,
          isCEOCard: addToCeoReport,
          comments: []
        };
        await createNotionPage(credentials?.notionToken, newCard);
        
        if (onAddNotionCard) {
          onAddNotionCard(newCard);
        }

        updatedOutcome.status = 'success';
        updatedOutcome.actionTaken = 'Nueva Tarjeta Creada';
        updatedOutcome.targetTitle = title;
      } catch(err) {
        updatedOutcome.status = 'error';
        updatedOutcome.actionTaken = 'Error al crear';
      }
    }

    // Update existing history item
    setHistory(prev => prev.map(item => {
      if (item.id === proposedAction.historyId) {
        return {
          ...item,
          status: updatedOutcome.status,
          actionTaken: updatedOutcome.actionTaken,
          targetTitle: updatedOutcome.targetTitle
        };
      }
      return item;
    }));

    setProposedAction(null);
    setInputText('');
    setSendEmailCopy(false);
    setNewEmailInput('');
    setAddToCeoReport(false);
    setAddToDailyFollowUp(false);
  };

  return (
    <>
      {/* FLOATING TOGGLE BUTTON (Visible when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
            color: '#fff',
            border: 'none',
            padding: '1rem 0.5rem',
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
            cursor: 'pointer',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            boxShadow: '-2px 0 10px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
          }}
          title="Abrir AI Inbox"
        >
          <ChevronLeft size={16} />
          <Bot size={18} />
        </button>
      )}

      {/* FIXED SIDEBAR OVERLAY (Optional, you can remove this if you don't want dimming) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998 }}
        />
      )}

      {/* FIXED SIDEBAR PANEL */}
      <div style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        width: '380px',
        maxWidth: '100vw',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        zIndex: 9999,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-5px 0 20px rgba(0,0,0,0.5)'
      }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(30, 41, 59, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
            <Bot size={20} /> AI Inbox: Anotaciones
          </h3>
          <button className="btn-icon" onClick={() => setIsOpen(false)}><X size={20} /></button>
        </div>

        {/* INPUT AREA */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Sección Actual: <strong>{sectionName}</strong>
          </div>
          
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe o dicta tu anotación..."
              style={{ width: '100%', minHeight: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 2.5rem 0.75rem 0.75rem', color: '#fff', fontSize: '0.95rem', resize: 'vertical' }}
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
              <Mic size={20} className={isListening ? 'pulse' : ''} />
            </button>
          </div>
          
          <button 
            onClick={handleAnalyze}
            disabled={!inputText.trim() || isAnalyzing}
            className="btn-primary"
            style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' }}
          >
            {isAnalyzing ? <Zap size={18} className="pulse" /> : <Send size={18} />}
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{isAnalyzing ? 'Procesando Inteligencia...' : 'Procesar / Preguntar'}</span>
          </button>
        </div>

        {/* HISTORY TOGGLE */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: showHistory ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            style={{ width: '100%', background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <History size={16} /> {showHistory ? 'Ocultar Historial' : 'Ver Historial de Anotaciones'}
          </button>
        </div>

        {/* HISTORY PANEL */}
        {showHistory && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem 1.25rem 1.25rem' }}>
            {history.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem 0' }}>No hay anotaciones previas.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.map(record => (
                  <div 
                    key={record.id} 
                    onClick={() => {
                      setInputText(record.text);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)'}
                    style={{ 
                      background: 'rgba(30, 41, 59, 0.4)', 
                      padding: '0.85rem', 
                      borderRadius: '8px', 
                      borderLeft: record.status === 'success' ? '3px solid var(--accent-emerald)' : '3px solid var(--accent-rose)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    title="Haz clic para volver a cargar esta nota en la caja de entrada"
                  >
                    <div style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem', fontStyle: 'italic' }}>"{record.text}"</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>📅 {record.date}</div>
                    <div style={{ fontSize: '0.8rem', color: record.status === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>
                      {record.actionTaken}: {record.targetTitle}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* PROPOSED ACTION MODAL */}
      {proposedAction && (
        <div className="modal-overlay" onClick={() => setProposedAction(null)} style={{ zIndex: 10000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', borderTop: '4px solid var(--accent-cyan)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                <Bot size={22} className="text-cyan" /> Sugerencia IA: Confirma Acción
              </h2>
              <button className="btn-icon" onClick={() => setProposedAction(null)}><X size={18} /></button>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>📝 Tu Anotación:</span>
                <div style={{ fontSize: '1rem', color: '#fff', marginTop: '0.35rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '6px' }}>"{proposedAction.text}"</div>
              </div>

              {proposedAction.type === 'multi' ? (
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, display: 'block', marginBottom: '0.75rem' }}>
                    🧩 Se detectaron {subTasksState.length} temas individuales:
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {subTasksState.map((subTask, idx) => (
                      <div key={subTask.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                            Tema #{idx + 1}
                          </span>
                          
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => {
                                setSubTasksState(prev => prev.map(st => st.id === subTask.id ? { ...st, type: 'create' } : st));
                              }}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: subTask.type === 'create' ? 'var(--accent-emerald)' : 'transparent',
                                color: subTask.type === 'create' ? '#000' : 'var(--text-muted)',
                                cursor: 'pointer'
                              }}
                            >
                              Crear Nueva
                            </button>
                            {subTask.targetCard && (
                              <button
                                onClick={() => {
                                  setSubTasksState(prev => prev.map(st => st.id === subTask.id ? { ...st, type: 'comment' } : st));
                                }}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  background: subTask.type === 'comment' ? 'var(--accent-cyan)' : 'transparent',
                                  color: subTask.type === 'comment' ? '#000' : 'var(--text-muted)',
                                  cursor: 'pointer'
                                }}
                              >
                                Comentar
                              </button>
                            )}
                          </div>
                        </div>

                        <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.65rem', fontStyle: 'italic' }}>
                          "{subTask.text}"
                        </div>

                        {subTask.type === 'comment' && subTask.targetCard && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.65rem' }}>
                            🎯 Coincide con: <strong>{subTask.targetCard.title}</strong>
                          </div>
                        )}

                        {/* ASSIGNEE DROP-DOWN FOR THIS SUBTASK */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                          <div style={{ flex: 1, minWidth: '180px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>👥 Responsable:</label>
                            <select
                              value={subTask.assignee}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSubTasksState(prev => prev.map(st => st.id === subTask.id ? { 
                                  ...st, 
                                  assignee: val, 
                                  addToDailyFollowUp: val !== 'Diego Musach (CTO)' 
                                } : st));
                              }}
                              style={{
                                width: '100%',
                                padding: '0.4rem',
                                borderRadius: '4px',
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: 'rgba(15, 23, 42, 0.9)',
                                color: '#fff',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Diego Musach (CTO)">Diego Musach (CTO) (Tú)</option>
                              <option value="Camilo Uribe">Camilo Uribe</option>
                              <option value="Mario Maqueda">Mario Maqueda</option>
                              <option value="Leonard Amaya">Leonard Amaya (Leo)</option>
                              <option value="Joseph Valer">Joseph</option>
                              <option value="Fabricio Jose Nieva">Fabricio Nieva</option>
                              <option value="Enrique Bevilacqua">Enrique</option>
                              <option value="Rodolfo">Rodolfo</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', justifyContent: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#fff', fontSize: '0.8rem' }}>
                              <input
                                type="checkbox"
                                checked={subTask.addToDailyFollowUp}
                                onChange={(e) => {
                                  const chk = e.target.checked;
                                  setSubTasksState(prev => prev.map(st => st.id === subTask.id ? { ...st, addToDailyFollowUp: chk } : st));
                                }}
                                style={{ accentColor: 'var(--accent-cyan)' }}
                              />
                              📋 Seguimiento Diario
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#fff', fontSize: '0.8rem' }}>
                              <input
                                type="checkbox"
                                checked={subTask.addToCeoReport}
                                onChange={(e) => {
                                  const chk = e.target.checked;
                                  setSubTasksState(prev => prev.map(st => st.id === subTask.id ? { ...st, addToCeoReport: chk } : st));
                                }}
                                style={{ accentColor: 'var(--accent-rose)' }}
                              />
                              🎯 Reporte CEO
                            </label>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {proposedAction.type === 'comment' ? (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px' }}>🎯 Tarjeta Asociada Encontrada:</span>
                      <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} /> {proposedAction.targetCard.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1rem' }}>💡 {proposedAction.rationale}</div>
                      
                      {/* EXISTING CARD CONTEXT */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <History size={14} /> Contexto Actual de la Tarjeta
                        </h4>
                        {cardContextLoading ? (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RefreshCw size={14} className="spin" /> Recuperando historial de comentarios de Notion...</div>
                        ) : (
                          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                            {cardComments.length === 0 ? (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>La tarjeta aún no tiene comentarios. Tu anotación será la primera.</div>
                            ) : (
                              cardComments.map((c, idx) => (
                                <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginRight: '0.5rem', fontSize: '0.75rem' }}>{c.author}:</span>
                                  <span style={{ color: 'var(--text-body)' }}>{c.text}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* EMAIL SUGGESTION */}
                      <div style={{ background: 'rgba(147, 51, 234, 0.1)', border: '1px solid var(--accent-purple)', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff', fontSize: '0.9rem' }}>
                          <input 
                            type="checkbox" 
                            checked={sendEmailCopy}
                            onChange={(e) => setSendEmailCopy(e.target.checked)}
                            style={{ accentColor: 'var(--accent-purple)' }}
                          />
                          📬 Enviar también una copia rápida por Email al Responsable
                        </label>
                        
                        {sendEmailCopy && (
                          <div style={{ marginTop: '0.75rem', paddingLeft: '1.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Responsable: <strong>{proposedAction.targetCard.responsable || 'Sin Asignar'}</strong>
                            </span>
                            {contactsDirectory[proposedAction.targetCard.responsable || ''] ? (
                              <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
                                ✓ Email conocido: {contactsDirectory[proposedAction.targetCard.responsable || '']}
                              </div>
                            ) : (
                              <div style={{ marginTop: '0.5rem' }}>
                                <input 
                                  type="email" 
                                  placeholder="Ingresa su email para aprenderlo..."
                                  value={newEmailInput}
                                  onChange={(e) => setNewEmailInput(e.target.value)}
                                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                                />
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '0.25rem' }}>
                                  Al enviar, el sistema recordará este correo para futuras ocasiones.
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '1px' }}>⚠️ Nueva Iniciativa:</span>
                      <div style={{ fontSize: '0.95rem', color: '#fff', marginTop: '0.35rem' }}>
                        💡 {proposedAction.rationale}<br/><br/>
                        Se sugiere crear una <strong>nueva tarjeta</strong> en Notion con esta anotación como objetivo principal.
                      </div>
                    </div>
                  )}

                  {/* SHARED ASSIGNEE SELECTOR */}
                  <div style={{ marginTop: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.45rem', fontWeight: 700 }}>👥 Asignar Responsable:</label>
                    <select
                      value={selectedAssignee}
                      onChange={(e) => {
                        setSelectedAssignee(e.target.value);
                        if (e.target.value !== 'Diego Musach (CTO)') {
                          setAddToDailyFollowUp(true);
                        } else {
                          setAddToDailyFollowUp(false);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(15, 23, 42, 0.95)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                      }}
                    >
                      <option value="Diego Musach (CTO)">Diego Musach (CTO) (Tú)</option>
                      <option value="Camilo Uribe">Camilo Uribe</option>
                      <option value="Mario Maqueda">Mario Maqueda</option>
                      <option value="Leonard Amaya">Leonard Amaya (Leo)</option>
                      <option value="Joseph Valer">Joseph</option>
                      <option value="Fabricio Jose Nieva">Fabricio Nieva</option>
                      <option value="Enrique Bevilacqua">Enrique</option>
                      <option value="Rodolfo">Rodolfo</option>
                    </select>
                  </div>

                  {/* SHARED DESTINATION SELECTION */}
                  <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.85rem' }}>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.55rem', fontWeight: 600 }}>📬 ¿Dónde crear/actualizar la tarjeta?</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={addToDailyFollowUp}
                          onChange={(e) => setAddToDailyFollowUp(e.target.checked)}
                          style={{ accentColor: 'var(--accent-cyan)' }}
                        />
                        📋 Seguimiento Diario (Backlog de Equipo)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={addToCeoReport}
                          onChange={(e) => setAddToCeoReport(e.target.checked)}
                          style={{ accentColor: 'var(--accent-rose)' }}
                        />
                        🎯 Reporte Semanal CEO (Iniciativa Principal)
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {proposedAction.type === 'multi' && (
                <>
                  <button className="btn-secondary" onClick={() => setProposedAction(null)}>
                    Cancelar
                  </button>
                  <button className="btn-primary" onClick={() => executeAction('multi')} style={{ background: 'var(--accent-emerald)', color: '#000' }}>
                    <Zap size={14} /> Confirmar y Procesar {subTasksState.length} Acciones
                  </button>
                </>
              )}

              {proposedAction.type === 'comment' && (
                <>
                  <button className="btn-secondary" onClick={() => executeAction('create')} style={{ borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}>
                    <PlusCircle size={14} /> Forzar Nueva Tarjeta
                  </button>
                  <button className="btn-primary" onClick={() => executeAction('comment')} disabled={cardContextLoading}>
                    <MessageSquare size={14} /> Confirmar Añadir a Tarjeta
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

    </>
  );
}
