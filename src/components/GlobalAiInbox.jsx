import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, Send, MessageSquare, PlusCircle, Check, X, History, FileText, Zap, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import { postCommentToNotion, createNotionPage, fetchNotionComments } from '../services/notionService';

const defaultContacts = {
  'Joseph Valer': 'jvaler@bromteck.com',
  'Joseph': 'jvaler@bromteck.com',
  'Diego Musach (CTO)': 'dmusach@bromteck.com',
  'Diego': 'dmusach@bromteck.com',
  'Mario Maqueda': 'sw1@bromteck.com',
  'Mario': 'sw1@bromteck.com',
  'Leonard Amaya': 'sw4@bromteck.com',
  'Leonard': 'sw4@bromteck.com',
  'Leo': 'sw4@bromteck.com',
  'Fabricio Jose Nieva': 'fjnieva@bromteck.com',
  'Fabricio': 'fjnieva@bromteck.com',
  'Camilo Uribe': 'preventa@bromteck.com',
  'Camilo': 'preventa@bromteck.com',
  'Enrique Bevilacqua': 'ebevilacqua@bromteck.com',
  'Enrique': 'ebevilacqua@bromteck.com'
};

export default function GlobalAiInbox({ sectionName, notionCards = [], credentials, onAddCommentAndSync, onAddNotionCard }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
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
  const [loadedComments, setLoadedComments] = useState({});
  const [collapsedComments, setCollapsedComments] = useState({});

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
      // Cmd+K or Option+I to toggle the sidebar
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const isOptI = e.altKey && e.key.toLowerCase() === 'i';
      
      if (isCmdK || isOptI) {
        e.preventDefault();
        setIsOpen(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setProposedAction(null);
        setIsOpen(false);
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
      const stopWords = new Set([
        'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 
        'con', 'para', 'por', 'sobre', 'decir', 'hacer',
        'de', 'en', 'y', 'o', 'a', 'al', 'del', 'se', 'es', 'su', 'sus'
      ]);
      // Normalizing common typos to improve keyword matching accuracy
      const normalizedText = subTaskText.toLowerCase()
        .replace(/teelcable/g, 'telecable')
        .replace(/certicaion/g, 'certificacion');
      const tokens = normalizedText.match(/[a-z0-9áéíóúñ]{2,}/g) || [];
      const keywords = tokens.filter(w => !stopWords.has(w));

      let bestMatch = null;
      let maxScore = 0;

      notionCards.forEach(card => {
        let score = 0;
        const targetText = ((card.title || '') + ' ' + (card.summary || '') + ' ' + (card.responsable || '')).toLowerCase()
          .replace(/teelcable/g, 'telecable')
          .replace(/certicaion/g, 'certificacion');
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

      // We require at least 2 keyword matches for a confident card matching OR 1 match if it is highly specific like 'telecable' in card title
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
      } else {
        setProposedAction({ ...action, historyId: tempId });
        setIsAnalyzing(false);

        if (action.type === 'multi') {
          setSubTasksState(action.subTasks.map((st, idx) => ({
            id: `st-${idx}-${Date.now()}`,
            text: st.text,
            type: st.type,
            targetCard: st.targetCard,
            rationale: st.rationale,
            assignee: st.suggestedAssignee,
            addToDailyFollowUp: st.suggestedAddToDailyFollowUp,
            addToCeoReport: st.suggestedAddToCeoReport,
            sendEmail: false
          })));
        } else {
          setSubTasksState([{
            id: `st-0-${Date.now()}`,
            text: action.text,
            type: action.type,
            targetCard: action.targetCard,
            rationale: action.rationale,
            assignee: action.suggestedAssignee,
            addToDailyFollowUp: action.suggestedAddToDailyFollowUp,
            addToCeoReport: action.suggestedAddToCeoReport,
            sendEmail: false
          }]);
        }
      }
    }, 600);
  };

  const executeAction = async () => {
    const targetTitles = [];

    for (const subTask of subTasksState) {
      if (subTask.type === 'discard') {
        targetTitles.push(`Descartó "${subTask.text.substring(0, 15)}..."`);
        continue;
      }

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

      // SEND EMAIL IF CHECKED
      if (subTask.sendEmail) {
        const toEmail = defaultContacts[subTask.assignee] || contactsDirectory[subTask.assignee] || '';
        const ccEmail = 'dmusach@bromteck.com';
        
        if (toEmail) {
          const emailSubject = `Seguimiento: ${subTask.targetCard ? subTask.targetCard.title : subTask.text.split(' ').slice(0, 6).join(' ')}`;
          const emailBody = `${subTask.text}\n\n--\nEnviado desde Tablero Ejecutivo (Diego Musach)`;
          
          const mailtoUrl = `mailto:${toEmail}?cc=${ccEmail}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          
          // Open mailto link
          window.open(mailtoUrl, '_blank');
        }
      }
    }

    const outcomeTitle = targetTitles.join(', ') || 'Sin acciones ejecutadas';

    setHistory(prev => prev.map(item => {
      if (item.id === proposedAction.historyId) {
        return {
          ...item,
          status: 'success',
          actionTaken: 'Procesadas Acciones AI',
          targetTitle: outcomeTitle
        };
      }
      return item;
    }));

    setProposedAction(null);
    setInputText('');
    setSubTasksState([]);
    setCollapsedComments({});
    setLoadedComments({});
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
              ref={textareaRef}
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

        {/* HISTORY HEADER */}
        <div style={{ padding: '1rem 1.25rem 0.5rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <h4 style={{ margin: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <History size={14} /> Historial de Anotaciones
          </h4>
        </div>

        {/* PERMANENT HISTORY PANEL */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.25rem 1.25rem 1.25rem' }}>
          {history.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '2rem 0' }}>No hay anotaciones previas en el historial.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map(record => (
                <div 
                  key={record.id} 
                  onClick={() => {
                    setInputText(record.text);
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                    }
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
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, display: 'block', marginBottom: '0.75rem' }}>
                🧩 {subTasksState.length > 1 ? `Se detectaron ${subTasksState.length} temas independientes:` : 'Acción Sugerida:'}
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {subTasksState.map((subTask, idx) => {
                  const isDiscarded = subTask.type === 'discard';
                  return (
                    <div 
                      key={subTask.id} 
                      style={{ 
                        background: isDiscarded ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', 
                        border: isDiscarded ? '1px dashed rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.08)', 
                        borderRadius: '8px', 
                        padding: '1rem',
                        opacity: isDiscarded ? 0.45 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          {subTasksState.length > 1 ? `Tema #${idx + 1}` : 'Anotación'}
                        </span>
                        
                        <div style={{ width: '280px' }}>
                          <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', overflow: 'hidden', height: '28px' }}>
                            {subTask.targetCard && (
                              <button
                                onClick={() => {
                                  setSubTasksState(prev => prev.map(st => st.id === subTask.id ? { ...st, type: 'comment' } : st));
                                }}
                                style={{
                                  flex: 1,
                                  fontSize: '0.65rem',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: subTask.type === 'comment' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                                  color: subTask.type === 'comment' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                  fontWeight: subTask.type === 'comment' ? 700 : 400,
                                  transition: 'all 0.15s ease'
                                }}
                                title="Añadir un comentario a la tarjeta encontrada"
                              >
                                💬 COMENTAR
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSubTasksState(prev => prev.map(st => st.id === subTask.id ? { ...st, type: 'create' } : st));
                              }}
                              style={{
                                flex: 1,
                                fontSize: '0.65rem',
                                border: 'none',
                                cursor: 'pointer',
                                background: subTask.type === 'create' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                                color: subTask.type === 'create' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                                fontWeight: subTask.type === 'create' ? 700 : 400,
                                borderLeft: subTask.targetCard ? '1px solid rgba(255,255,255,0.15)' : 'none',
                                borderRight: '1px solid rgba(255,255,255,0.15)',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              ➕ CREAR
                            </button>
                            <button
                              onClick={() => {
                                setSubTasksState(prev => prev.map(st => st.id === subTask.id ? { ...st, type: 'discard' } : st));
                              }}
                              style={{
                                flex: 1,
                                fontSize: '0.65rem',
                                border: 'none',
                                cursor: 'pointer',
                                background: subTask.type === 'discard' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                                color: subTask.type === 'discard' ? 'var(--accent-rose)' : 'var(--text-muted)',
                                fontWeight: subTask.type === 'discard' ? 700 : 400,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              🚫 DESCARTAR
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* EDITABLE SUBTASK TEXT */}
                      <input 
                        type="text"
                        value={subTask.text}
                        disabled={isDiscarded}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubTasksState(prev => prev.map(st => st.id === subTask.id ? { ...st, text: val } : st));
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(0,0,0,0.2)',
                          border: isDiscarded ? '1px dashed rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          color: isDiscarded ? 'var(--text-muted)' : '#fff',
                          fontSize: '0.9rem',
                          marginBottom: '0.5rem',
                          textDecoration: isDiscarded ? 'line-through' : 'none',
                          cursor: isDiscarded ? 'not-allowed' : 'text'
                        }}
                      />

                      {subTask.type === 'comment' && subTask.targetCard && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.08)', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '0.65rem', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🎯 Coincide con: <strong>{subTask.targetCard.title}</strong></span>
                            
                            <button 
                              onClick={() => handleToggleComments(subTask.targetCard.id, subTask.targetCard.notionPageId)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent-cyan)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <History size={12} /> 
                              {collapsedComments[subTask.targetCard.id] ? 'Ocultar' : 'Ver comentarios'}
                            </button>
                          </div>

                          {collapsedComments[subTask.targetCard.id] && (
                            <div style={{ marginTop: '0.5rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.5rem', borderRadius: '4px', maxHeight: '120px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                              {cardContextLoading && !(loadedComments[subTask.targetCard.id]) ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <RefreshCw size={10} className="spin" /> Cargando...
                                </div>
                              ) : (loadedComments[subTask.targetCard.id] || []).length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No hay comentarios anteriores en esta tarjeta.</div>
                              ) : (
                                (loadedComments[subTask.targetCard.id] || []).map((c, i) => (
                                  <div key={i} style={{ fontSize: '0.75rem', marginBottom: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.25rem' }}>
                                    <strong style={{ color: 'var(--accent-cyan)' }}>{c.author}:</strong> <span style={{ color: 'var(--text-body)' }}>{c.text}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ASSIGNEE DROP-DOWN FOR THIS SUBTASK */}
                      {!isDiscarded && (
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => setProposedAction(null)}>
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={executeAction} 
                style={{ 
                  background: 'var(--accent-emerald)', 
                  color: '#000',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Zap size={14} /> 
                {subTasksState.every(st => st.type === 'discard') 
                  ? 'Confirmar y Cerrar' 
                  : `Confirmar y Procesar ${subTasksState.filter(st => st.type !== 'discard').length} Acción(es)`
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
