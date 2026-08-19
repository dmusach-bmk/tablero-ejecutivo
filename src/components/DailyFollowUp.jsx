import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, ShieldAlert, CheckCircle2, Send, RefreshCw, Search, Layers, ExternalLink, Archive, CheckSquare, Mic } from 'lucide-react';
import { postCommentToNotion, updateNotionPageStatus, fetchNotionComments } from '../services/notionService';

import { extractDateFromText } from '../utils/dateParser';
import GlobalAiInbox from './GlobalAiInbox';

export default function DailyFollowUp({ teamTracking, notionCards = [], credentials, onUpdateTeamTracking, onOpenEmailWithAgenda, onNavigate, onAddCommentAndSync, onAddNotionCard }) {
  const [activeMemberId, setActiveMemberId] = useState('all');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [syncStatus, setSyncStatus] = useState({});
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [commentedTopicIds, setCommentedTopicIds] = useState([]);
  const [showClosedSection, setShowClosedSection] = useState(false);
  const [cardStatusMap, setCardStatusMap] = useState({});
  const [localCommentsMap, setLocalCommentsMap] = useState({});
  const [localDeadlineMap, setLocalDeadlineMap] = useState({});
  const [isFetchingNotionComments, setIsFetchingNotionComments] = useState(false);
  const [listeningTargetId, setListeningTargetId] = useState(null);
  const [domainFilter, setDomainFilter] = useState('all');

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getNotionUrl = (notionPageId) => {
    if (!notionPageId) return 'https://notion.so';
    const cleanId = notionPageId.replace(/-/g, '');
    return `https://notion.so/${cleanId}`;
  };

  const handleStartVoiceDictation = (targetId, onSpeechText) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("🎙️ Dictado por voz: Te recomendamos abrir el tablero en Google Chrome para usar el micrófono.");
      return;
    }
    setListeningTargetId(targetId);
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onSpeechText(transcript);
      }
      setListeningTargetId(null);
    };

    recognition.onerror = () => setListeningTargetId(null);
    recognition.onend = () => setListeningTargetId(null);

    recognition.start();
  };

  // INTELLIGENT DYNAMIC SPEECH & REACTION GENERATOR PER SPECIFIC TOPIC TITLE
  const generateExecutiveSpeech = (topicTitle, memberName, log) => {
    const t = (topicTitle + ' ' + (log || '')).toLowerCase();
    const name = memberName.split(' ')[0];

    if (t.includes('edemsa')) {
      return {
        speech: `«${name}, con respecto a EDEMSA ("${topicTitle}"): es vital cerrar el informe de los alimentadores y corregir las vistas con Nicolás/Mauricio Zuin para habilitar la facturación. ¿Cuál es el bloqueo de hoy?»`,
        responseIf: "Falta que el cliente valide el reporte de los puntos nuevos.",
        diegoAnswer: "«Enviamos el informe de los 10 alimentadores hoy mismo y fijamos el compromiso de cobro para esta semana.»"
      };
    } else if (t.includes('tecsys') || t.includes('fcc') || t.includes('habitat')) {
      return {
        speech: `«${name}, en el tema Tecsys ("${topicTitle}"): debemos eliminar planillas Excel sueltas. Exijo volcar las cotizaciones (certificados FCC/CE) y las credenciales de Hábitat en tarjetas de Notion.»`,
        responseIf: "Tecsys no ha enviado el presupuesto desde Brasil.",
        diegoAnswer: "«Diego Musach formaliza el reclamo del presupuesto hoy con la gerencia de Tecsys; tú mantén actualizado el log en Notion.»"
      };
    } else if (t.includes('wind') || t.includes('sso') || t.includes('cluster') || t.includes('single sign on')) {
      return {
        speech: `«${name}, sobre el proyecto WIND ("${topicTitle}"): la prioridad es la estabilidad del Cluster (VMs) y la definición de Single Sign-On / Registro Web. ¿Cuándo entregamos la demo probada?»`,
        responseIf: "Hay dudas sobre la integración del SSO con la plataforma actual.",
        diegoAnswer: "«Definimos el estándar de OAuth2 hoy y congelamos requerimientos secundarios hasta validar la autenticación.»"
      };
    } else if (t.includes('telecable') || t.includes('aosp') || t.includes('elebao') || t.includes('fingerprint') || t.includes('stb')) {
      return {
        speech: `«${name}, en Telecable Costa Rica ("${topicTitle}"): debemos cerrar el armado del STB AOSP Elebao con FingerPrint y el test report de Montage. ¿Tienes confirmada la fecha de viaje o despliegue?»`,
        responseIf: "Dependemos de la entrega de equipos hardware o licencias DRM.",
        diegoAnswer: "«Validamos la logística con el proveedor hoy y avanzamos en staging con los equipos disponibles.»"
      };
    } else if (t.includes('bromteck') || t.includes('udid') || t.includes('pulse')) {
      return {
        speech: `«${name}, en Bromteck 4.0 / UDID ("${topicTitle}"): Marketing necesita la nueva presentación destacando UDID como feature diferenciador. ¿Cómo vienen los tiempos de render y carga en la nube?»`,
        responseIf: "Marketing solicitó cambios en la presentación a última hora.",
        diegoAnswer: "«Congelamos la versión actual para la demostración de esta semana y agendamos los ajustes para la v2.»"
      };
    } else if (t.includes('gabinete') || t.includes('ferrocarril') || t.includes('fibra')) {
      return {
        speech: `«${name}, en el relevamiento de gabinetes y fibra ("${topicTitle}"): tenemos un potencial de 2,300 gabinetes entre Argentina y Colombia. ¿Cuál es la cotización por poste de fibra de vidrio?»`,
        responseIf: "Los proveedores locales aún no enviaron presupuestos.",
        diegoAnswer: "«Exigimos 3 cotizaciones antes del jueves o avanzamos con el modelo estándar homologado.»"
      };
    } else if (t.includes('servidor') || t.includes('heroku') || t.includes('infra') || t.includes('costo')) {
      return {
        speech: `«${name}, en la infraestructura de Servidores / Heroku ("${topicTitle}"): debemos apagar entornos en desuso para reducir el gasto mensual. ¿Cuál es el plan de auto-stop?»`,
        responseIf: "Apagar servidores de test puede interferir con algunas pruebas.",
        diegoAnswer: "«Programamos ventana de auto-stop nocturna (19:00 a 08:00) y ahorramos consumo sin afectar el trabajo diario.»"
      };
    } else if (t.includes('soporte') || t.includes('bot') || t.includes('ticket') || t.includes('horas') || t.includes('gemini')) {
      return {
        speech: `«${name}, en Soporte & BOT AI ("${topicTitle}"): el objetivo es reducir tickets con el BOT de respuestas automáticas y auditar el consumo de horas de Soporte Premium por cliente.»`,
        responseIf: "Faltan datos o capacitaciones filmadas para entrenar al BOT.",
        diegoAnswer: "«Utilizamos la base de conocimiento actual y las capacitaciones grabadas para entrenar el BOT hoy mismo.»"
      };
    } else if (t.includes('poc') || t.includes('delsur') || t.includes('aes') || t.includes('edelap') || t.includes('naturgy') || t.includes('avangrid')) {
      return {
        speech: `«${name}, sobre la POC ("${topicTitle}"): necesito el reporte de validación con el cliente. Si hubo problemas de configuración en equipos remotamente, ¿cuál fue la causa raíz?»`,
        responseIf: "Falta respuesta o validación de los ingenieros del cliente.",
        diegoAnswer: "«Diego Musach escala con el sponsor del cliente en 1-click hoy; tú mantén la simulación en staging lista.»"
      };
    } else if (t.includes('comercial') || t.includes('perdidas') || t.includes('ss') || t.includes('godel')) {
      return {
        speech: `«${name}, en la Solución Smart para Pérdidas ("${topicTitle}"): debemos tener la propuesta comercial y el documento de preguntas FAQ listo para el equipo de ventas.»`,
        responseIf: "Falta información del área comercial para cerrar la presentación.",
        diegoAnswer: "«Solicito esa data comercial de inmediato; tú avanza con la estructura técnica del producto sin frenarte.»"
      };
    } else {
      return {
        speech: `«${name}, sobre la tarjeta "${topicTitle}": necesitamos definir los hitos de entrega de esta semana, desbloquear impedimentos de ingeniería y fijar el avance en Notion.»`,
        responseIf: "El tema requiere más tiempo del estimado por complejidad técnica.",
        diegoAnswer: "«Desglosamos la tarea en 2 entregables parciales; entregamos el MVP esta semana y la optimización la siguiente.»"
      };
    }
  };

  // Flatten all 165 cards across all team members
  const allCardsCross = [];
  teamTracking.forEach(mem => {
    (mem.topics || []).forEach(t => {
      // Find corresponding card in notionCards to pull the latest status and comments
      const matchingNotion = notionCards && notionCards.find(nc => nc.id === t.id || nc.notionPageId === t.id || nc.notionPageId === t.notionPageId);
      
      const currentStatus = cardStatusMap[t.id] || matchingNotion?.status || t.status || 'Abierto';
      
      // Merge comments from:
      // 1. Notion cards (matchingNotion?.comments)
      // 2. Local storage topics (t.comments)
      // 3. Current session memory map (localCommentsMap[t.id])
      const notionC = matchingNotion?.comments || [];
      const localT = t.comments || [];
      const sessionC = localCommentsMap[t.id] || [];
      
      const combinedComments = [...notionC];
      
      localT.forEach(lc => {
        if (!combinedComments.some(bc => bc.text.trim() === lc.text.trim())) {
          combinedComments.push(lc);
        }
      });
      
      sessionC.forEach(sc => {
        if (!combinedComments.some(bc => bc.text.trim() === sc.text.trim())) {
          combinedComments.push(sc);
        }
      });
      
      combinedComments.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

      allCardsCross.push({
        ...t,
        status: currentStatus,
        comments: combinedComments,
        memberName: mem.name,
        memberRole: mem.role,
        memberAvatar: mem.avatar,
        memberId: mem.id,
        notionPageId: t.notionPageId || t.notionId
      });
    });
  });

  const handleStatusChange = async (topicId, notionPageId, newStatus) => {
    setStatusUpdatingId(topicId);
    setCardStatusMap(prev => ({ ...prev, [topicId]: newStatus }));

    if (onUpdateTeamTracking) {
      onUpdateTeamTracking(prevTeam => prevTeam.map(mem => ({
        ...mem,
        topics: (mem.topics || []).map(top => 
          (top.id === topicId || top.notionPageId === topicId) ? { ...top, status: newStatus } : top
        )
      })));
    }

    // Sync live to Notion API
    await updateNotionPageStatus(credentials?.notionToken, notionPageId, newStatus);
    setStatusUpdatingId(null);
  };

  const handleFetchLiveCommentsForCard = async (topicId, notionPageId) => {
    setIsFetchingNotionComments(true);
    const freshComments = await fetchNotionComments(credentials?.notionToken, notionPageId);
    if (freshComments && freshComments.length > 0) {
      freshComments.sort((a, b) => a.date.localeCompare(b.date));
      
      setLocalCommentsMap(prev => {
        const existingCard = allCardsCross.find(c => c.id === topicId);
        const current = prev[topicId] || existingCard?.comments || [];
        const combined = [...current];
        freshComments.forEach(f => {
          if (!combined.some(c => c.text.trim() === f.text.trim())) {
            combined.push(f);
          }
        });
        combined.sort((a, b) => a.date.localeCompare(b.date));
        return {
          ...prev,
          [topicId]: combined
        };
      });

      if (onUpdateTeamTracking) {
        onUpdateTeamTracking(prevTeam => prevTeam.map(mem => ({
          ...mem,
          topics: (mem.topics || []).map(top => {
            if (top.id === topicId) {
              const current = top.comments || [];
              const combined = [...current];
              freshComments.forEach(f => {
                if (!combined.some(c => c.text.trim() === f.text.trim())) {
                  combined.push(f);
                }
              });
              combined.sort((a, b) => a.date.localeCompare(b.date));
              return { ...top, comments: combined };
            }
            return top;
          })
        })));
      }
    }
    setIsFetchingNotionComments(false);
  };

  const handleDeadlineChange = (topicId, newDeadline) => {
    if (!newDeadline) return;
    setLocalDeadlineMap(prev => ({ ...prev, [topicId]: newDeadline }));
    if (onUpdateTeamTracking) {
      onUpdateTeamTracking(prevTeam => {
        return prevTeam.map(mem => ({
          ...mem,
          topics: (mem.topics || []).map(top => {
            if (top.id === topicId) {
              return { ...top, deadline: newDeadline };
            }
            return top;
          })
        }));
      });
    }
  };

  const handlePostCommentForTopic = async (topicId, notionPageId, memberName) => {
    const text = commentInputs[topicId];
    if (!text || !text.trim()) return;

    setSyncStatus(prev => ({ ...prev, [topicId]: 'syncing' }));
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newCommentObj = { author: 'Diego Musach (CTO)', date: nowFormatted, text: text.trim() };

    // Automatic Date Extraction from comment text
    const extractedDate = extractDateFromText(text.trim());
    if (extractedDate) {
      setLocalDeadlineMap(prev => ({ ...prev, [topicId]: extractedDate }));
    }

    // 1. Immediately update React local state (0ms UI feedback)
    const existingTopic = allCardsCross.find(c => c.id === topicId);
    const prevComments = localCommentsMap[topicId] || existingTopic?.comments || [];
    const updatedComments = [...prevComments, newCommentObj];
    updatedComments.sort((a, b) => a.date.localeCompare(b.date));

    setLocalCommentsMap(prev => ({
      ...prev,
      [topicId]: updatedComments
    }));

    // 2. Persist to parent states (both teamTracking and notionCards) and execute reassignments
    if (onAddCommentAndSync) {
      onAddCommentAndSync(topicId, text.trim(), 'Diego Musach (CTO)');
    } else if (onUpdateTeamTracking) {
      onUpdateTeamTracking(prevTeam => {
        return prevTeam.map(mem => ({
          ...mem,
          topics: (mem.topics || []).map(top => {
            if (top.id === topicId) {
              return {
                ...top,
                deadline: extractedDate || top.deadline,
                comments: updatedComments
              };
            }
            return top;
          })
        }));
      });
    }

    setCommentInputs(prev => ({ ...prev, [topicId]: '' }));

    if (!commentedTopicIds.includes(topicId)) {
      setCommentedTopicIds(prev => [...prev, topicId]);
    }

    // 3. Send live to Notion API EXACTLY AS TYPED (no prefixes!)
    const targetNotionId = notionPageId || existingTopic?.notionPageId || existingTopic?.notionId;
    const result = await postCommentToNotion(
      credentials?.notionToken,
      targetNotionId,
      text.trim()
    );

    if (result.success) {
      setSyncStatus(prev => ({ ...prev, [topicId]: 'success' }));
      
      // Re-fetch live comments from Notion API to verify exact server state
      setTimeout(async () => {
        await handleFetchLiveCommentsForCard(topicId, targetNotionId);
        setSyncStatus(prev => ({ ...prev, [topicId]: null }));
      }, 1000);
    } else {
      setSyncStatus(prev => ({ ...prev, [topicId]: 'error' }));
    }
  };

  // Filter cards by member and search query
  let memberFilteredCards = activeMemberId === 'all'
    ? allCardsCross
    : allCardsCross.filter(c => c.memberId === activeMemberId);

  if (globalSearchQuery.trim()) {
    const q = globalSearchQuery.toLowerCase();
    const hasAfinia = q.includes('afinia');
    const hasAficia = q.includes('aficia');
    
    memberFilteredCards = memberFilteredCards.filter(c => {
      const checkMatch = (text) => {
        if (!text) return false;
        const t = text.toLowerCase();
        if (t.includes(q)) return true;
        if (hasAfinia && t.includes(q.replace(/afinia/g, 'aficia'))) return true;
        if (hasAficia && t.includes(q.replace(/aficia/g, 'afinia'))) return true;
        return false;
      };
      
      const matchTitle = checkMatch(c.title);
      const matchMember = checkMatch(c.memberName);
      const matchLog = checkMatch(c.log);
      const matchSummary = checkMatch(c.summary);
      const matchComments = c.comments && c.comments.some(comm => checkMatch(comm.text));
      
      return matchTitle || matchMember || matchLog || matchSummary || matchComments;
    });
  }

  // Get domain tag helper
  const getCardDomainTag = (card) => {
    const title = (card.title || '').toLowerCase();
    const log = (card.log || '').toLowerCase();
    const text = `${title} ${log}`;
    
    const videoKeywords = ['roku', 'ios', 'claro', 'wynn', 'betty', 'transcoder', 'catelsa', 'splash', 'video', 'multicable', 'streaming', 'tv', 'apple', 'wind', 'joseph', 'erik'];
    const energiaKeywords = ['enee', 'edemsa', 'tecsys', 'habitat', 'ts109', 'ts700', 'ts600', 'netmore', 'koala', 'gateway', 'lora', 'ute', 'aes', 'energia', 'operaciones', 'camilo', 'rodolfo', 'fabricio'];
    
    if (videoKeywords.some(kw => text.includes(kw))) {
      return { label: '📺 Operaciones Video', color: 'var(--accent-cyan)', bg: 'rgba(6, 182, 212, 0.15)' };
    }
    if (energiaKeywords.some(kw => text.includes(kw))) {
      return { label: '⚡ Operaciones Energía', color: 'var(--accent-emerald)', bg: 'rgba(52, 211, 153, 0.15)' };
    }
    return null;
  };

  // Split into OPEN vs CLOSED cards
  const allOpenCardsPre = memberFilteredCards.filter(c => 
    !['cerrado', 'completado', 'finalizado', 'closed'].includes((c.status || '').toLowerCase())
  );

  const allClosedCardsPre = memberFilteredCards.filter(c => 
    ['cerrado', 'completado', 'finalizado', 'closed'].includes((c.status || '').toLowerCase())
  );

  // Filter by domain
  const openCards = allOpenCardsPre.filter(c => {
    const tag = getCardDomainTag(c);
    if (domainFilter === 'video') return tag && tag.label.includes('Video');
    if (domainFilter === 'energy') return tag && tag.label.includes('Energía');
    if (domainFilter === 'other') return !tag;
    return true;
  });

  const closedCards = allClosedCardsPre.filter(c => {
    const tag = getCardDomainTag(c);
    if (domainFilter === 'video') return tag && tag.label.includes('Video');
    if (domainFilter === 'energy') return tag && tag.label.includes('Energía');
    if (domainFilter === 'other') return !tag;
    return true;
  });

  const getLatestCommentTime = (card) => {
    let latestTime = 0;
    if (commentedTopicIds.includes(card.id)) {
      // Local session comment has highest priority
      latestTime = Date.now();
    }
    if (card.comments && card.comments.length > 0) {
      card.comments.forEach(c => {
        if (!c.date) return;
        const normalizedDate = c.date.replace(/-/g, '/');
        const parsed = Date.parse(normalizedDate);
        if (!isNaN(parsed) && parsed > latestTime) {
          latestTime = parsed;
        }
      });
    }
    return latestTime;
  };

  const isCardCommentedToday = (card) => {
    if (commentedTopicIds.includes(card.id)) return true;
    if (!card.comments || card.comments.length === 0) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLocale = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
    return card.comments.some(c => {
      const cDate = (c.date || '').split(' ')[0];
      return cDate === todayStr || cDate === todayLocale || cDate.includes('2026-08-18');
    });
  };

  // Re-order OPEN cards: Uncommented first, Commented pushed to bottom (most recent to absolute bottom)
  // New cards without comments are also placed at the end of the open cards list
  const sortedOpenCards = [...openCards].sort((a, b) => {
    const timeA = getLatestCommentTime(a);
    const timeB = getLatestCommentTime(b);
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    
    // Sort recently added cards (starts with 'new-') to the bottom of uncommented cards
    const isNewA = String(a.id).startsWith('new-');
    const isNewB = String(b.id).startsWith('new-');
    if (isNewA && !isNewB) return 1;
    if (!isNewA && isNewB) return -1;
    if (isNewA && isNewB) {
      // Sort new cards chronologically by their timestamp in the ID (ascending, newest at absolute bottom)
      return String(a.id).localeCompare(String(b.id));
    }
    
    return 0;
  });

  // AUTO-SYNC LIVE COMMENTS FROM NOTION API FOR VISIBLE CARDS ON MOUNT OR MEMBER CHANGE
  useEffect(() => {
    let isMounted = true;

    async function syncVisibleNotionComments() {
      // Sincronizar tarjetas visibles del miembro seleccionado (tanto abiertas como cerradas)
      // O las primeras 15 abiertas si está en pestaña general 'all'
      const visibleCards = activeMemberId === 'all'
        ? sortedOpenCards.slice(0, 15)
        : allCardsCross.filter(c => c.memberId === activeMemberId);

      for (const card of visibleCards) {
        if (!isMounted) break;
        if (card.notionPageId) {
          const fresh = await fetchNotionComments(credentials?.notionToken, card.notionPageId);
          if (fresh && fresh.length > 0 && isMounted) {
            fresh.sort((a, b) => a.date.localeCompare(b.date));
            
            // 1. Actualizar el mapa local en memoria
            setLocalCommentsMap(prev => {
              const current = prev[card.id] || card.comments || [];
              const combined = [...current];
              fresh.forEach(f => {
                if (!combined.some(c => c.text.trim() === f.text.trim())) {
                  combined.push(f);
                }
              });
              combined.sort((a, b) => a.date.localeCompare(b.date));
              return {
                ...prev,
                [card.id]: combined
              };
            });

            // 2. Persistir en el estado global de teamTracking para que se guarde en localStorage
            if (onUpdateTeamTracking) {
              onUpdateTeamTracking(prevTeam => prevTeam.map(mem => ({
                ...mem,
                topics: (mem.topics || []).map(top => {
                  if (top.id === card.id || top.notionPageId === card.id || top.id === card.notionPageId) {
                    const current = top.comments || [];
                    const combined = [...current];
                    fresh.forEach(f => {
                      if (!combined.some(c => c.text.trim() === f.text.trim())) {
                        combined.push(f);
                      }
                    });
                    combined.sort((a, b) => a.date.localeCompare(b.date));
                    return { ...top, comments: combined };
                  }
                  return top;
                })
              })));
            }
          }
        }
      }
    }

    syncVisibleNotionComments();
    return () => { isMounted = false; };
  }, [activeMemberId]);

  return (
    <div className="daily-followup-container">
      
      <GlobalAiInbox 
        sectionName="Follow Up Diario" 
        notionCards={teamTracking.flatMap(m => m.topics || [])} 
        credentials={credentials} 
        onAddCommentAndSync={onAddCommentAndSync}
        onAddNotionCard={onAddNotionCard}
      />

      {/* Compact Header Banner */}
      <div className="card-glass" style={{ marginBottom: '0.85rem', padding: '0.75rem 1rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🚨 Follow Up Diario ({openCards.length} Tarjetas Abiertas)
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 400 }}>• {currentDate}</span>
            </h2>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>
              Entrada por voz habilitada: Haz clic en el ícono 🎙️ para dictar comentarios o búsquedas.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn-secondary ${showClosedSection ? 'active' : ''}`}
              onClick={() => setShowClosedSection(!showClosedSection)}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)' }}
            >
              <Archive size={13} /> {showClosedSection ? 'Ocultar' : '📁 Consultar'} Cerradas ({closedCards.length})
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('micromanagement')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
              👥 Ver Equipo Completo
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT MULTI-ROW MEMBER CHIPS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.85rem' }}>
        <button
          onClick={() => {
            setActiveMemberId('all');
            setGlobalSearchQuery('');
          }}
          style={{
            background: activeMemberId === 'all' && !globalSearchQuery ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'var(--bg-card)',
            color: '#fff',
            border: activeMemberId === 'all' && !globalSearchQuery ? 'none' : '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '0.35rem 0.7rem',
            cursor: 'pointer',
            fontSize: '0.76rem',
            fontWeight: activeMemberId === 'all' ? 700 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Layers size={13} />
          <span>TODOS ({openCards.length} Abiertas)</span>
        </button>

        {teamTracking.map((mem) => {
          const isActive = mem.id === activeMemberId && !globalSearchQuery;
          const openMemCards = (mem.topics || []).filter(t => {
            const currentStatus = cardStatusMap[t.id] || t.status || 'Abierto';
            const isOpen = !['cerrado', 'completado', 'finalizado', 'closed'].includes(currentStatus.toLowerCase());
            if (!isOpen) return false;

            const tag = getCardDomainTag(t);
            if (domainFilter === 'video') return tag && tag.label.includes('Video');
            if (domainFilter === 'energy') return tag && tag.label.includes('Energía');
            if (domainFilter === 'other') return !tag;
            return true;
          });
          
          let shortName = mem.name.split(' ')[0];
          if (mem.name.includes('Musach')) shortName = 'Diego (CTO)';
          else if (mem.name.includes('Sin Asignar')) shortName = 'Sin Asignar';
          else if (mem.name.includes('Sabrina')) shortName = 'Sabrina';
          else if (mem.name.includes('Kenyi')) shortName = 'Kenyi';
          else if (mem.name.includes('Martin')) shortName = 'Martin';

          return (
            <button
              key={mem.id}
              onClick={() => {
                setActiveMemberId(mem.id);
                setGlobalSearchQuery('');
              }}
              style={{
                background: isActive ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'var(--bg-card)',
                color: '#fff',
                border: isActive ? 'none' : '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.76rem',
                fontWeight: isActive ? 700 : 400,
                boxShadow: isActive ? '0 2px 10px rgba(6, 182, 212, 0.3)' : 'none'
              }}
            >
              <img src={mem.avatar} alt={mem.name} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
              <span>{shortName} ({openMemCards.length})</span>
            </button>
          );
        })}
      </div>

      {/* FILTROS POR ÁREA OPERATIVA EN FOLLOW UP */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, marginRight: '0.25rem' }}>Filtrar por Área:</span>
        <button 
          onClick={() => setDomainFilter('all')} 
          className={`nav-tab-btn ${domainFilter === 'all' ? 'active' : ''}`}
          style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: '4px', height: '28px' }}
        >
          📁 Todos ({allOpenCardsPre.length})
        </button>
        <button 
          onClick={() => setDomainFilter('video')} 
          className={`nav-tab-btn ${domainFilter === 'video' ? 'active' : ''}`}
          style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: '4px', border: '1px solid var(--accent-cyan)', height: '28px', color: domainFilter === 'video' ? '#fff' : 'var(--accent-cyan)' }}
        >
          📺 Video ({allOpenCardsPre.filter(c => getCardDomainTag(c)?.label.includes('Video')).length})
        </button>
        <button 
          onClick={() => setDomainFilter('energy')} 
          className={`nav-tab-btn ${domainFilter === 'energy' ? 'active' : ''}`}
          style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: '4px', border: '1px solid var(--accent-emerald)', height: '28px', color: domainFilter === 'energy' ? '#fff' : 'var(--accent-emerald)' }}
        >
          ⚡ Energía ({allOpenCardsPre.filter(c => getCardDomainTag(c)?.label.includes('Energía')).length})
        </button>
        <button 
          onClick={() => setDomainFilter('other')} 
          className={`nav-tab-btn ${domainFilter === 'other' ? 'active' : ''}`}
          style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: '4px', height: '28px' }}
        >
          📂 Otros ({allOpenCardsPre.filter(c => !getCardDomainTag(c)).length})
        </button>
      </div>

      {/* CROSS-TEAM GLOBAL SEARCH BAR WITH VOICE DICTATION */}
      <div className="card-glass" style={{ padding: '0.65rem 0.9rem', marginBottom: '1rem', border: '1.5px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Search size={18} className="text-cyan" />
          <input
            type="text"
            placeholder="🔍 BUSCADOR CROSS DE TEMAS: Escribe o dicta con el micrófono (ej: EDEMSA, Tecsys, WIND, Telecable)..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.88rem', width: '100%', fontWeight: 500 }}
          />

          <button
            className={`btn-icon ${listeningTargetId === 'globalSearch' ? 'active' : ''}`}
            onClick={() => handleStartVoiceDictation('globalSearch', (text) => setGlobalSearchQuery(prev => prev ? `${prev} ${text}` : text))}
            style={{
              padding: '0.3rem',
              borderRadius: '50%',
              background: listeningTargetId === 'globalSearch' ? 'var(--accent-rose)' : 'rgba(6, 182, 212, 0.2)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
            title="Dictar búsqueda por voz 🎙️"
          >
            <Mic size={15} className={listeningTargetId === 'globalSearch' ? 'pulse' : ''} />
          </button>

          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.72rem' }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* RESULT COUNT INDICATOR FOR OPEN CARDS */}
      <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          Mostrando {sortedOpenCards.length} tarjetas ABIERTAS {globalSearchQuery ? `para la búsqueda "${globalSearchQuery}"` : activeMemberId === 'all' ? 'de todos los integrantes' : `de ${teamTracking.find(m=>m.id===activeMemberId)?.name}`}:
        </span>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          (Las cerradas figuran en el panel de Histórico)
        </span>
      </div>

      {/* LIST OF OPEN COMPACT CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {sortedOpenCards.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No hay tarjetas abiertas con los filtros seleccionados.
          </div>
        ) : (
          sortedOpenCards.map((topic, idx) => {
            // Generate UNIQUE, TAILORED speech & reaction for THIS specific card
            const topicInfo = generateExecutiveSpeech(topic.title, topic.memberName, topic.log);
            const inputVal = commentInputs[topic.id] || '';
            const status = syncStatus[topic.id];
            const isCommented = commentedTopicIds.includes(topic.id) || isCardCommentedToday(topic);
            const notionUrl = getNotionUrl(topic.notionPageId);
            
            // STRICT CHRONOLOGICAL SORTING (NEWEST LAST)
            const rawComments = topic.comments || [];
            const sortedComments = [...rawComments].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
            const lastComment = sortedComments.length > 0 ? sortedComments[sortedComments.length - 1] : null;
            const isListeningCard = listeningTargetId === topic.id;

            return (
              <div 
                key={topic.id || idx} 
                className="card-glass"
                style={{
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                  borderLeft: isCommented ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-cyan)',
                  opacity: isCommented ? 0.78 : 1,
                  background: isCommented ? 'rgba(11, 16, 28, 0.6)' : 'rgba(15, 23, 42, 0.85)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Compact Card Header with Status Dropdown & Direct Notion Link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.15rem', flexWrap: 'wrap' }}>
                      <img src={topic.memberAvatar} alt={topic.memberName} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        {topic.memberName}
                      </span>
                      <span className={`tag ${topic.priority?.includes('P1') ? 'critical' : 'high'}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                        {topic.priority}
                      </span>
                      {(() => {
                        const tag = getCardDomainTag(topic);
                        if (!tag) return null;
                        return (
                          <span style={{ 
                            fontSize: '0.62rem', 
                            padding: '0.1rem 0.35rem', 
                            borderRadius: '10px', 
                            fontWeight: 700, 
                            color: tag.color, 
                            background: tag.bg, 
                            border: `1px solid ${tag.color}`,
                            whiteSpace: 'nowrap'
                          }}>
                            {tag.label}
                          </span>
                        );
                      })()}

                      {/* INLINE EDITABLE DEADLINE CONTROL */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.68rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.4)', padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Calendar size={11} style={{ color: 'var(--accent-cyan)' }} />
                        <span style={{ fontWeight: 600 }}>Plazo:</span>
                        <input
                          type="date"
                          value={(localDeadlineMap[topic.id] || topic.deadline || '').match(/^\d{4}-\d{2}-\d{2}$/) ? (localDeadlineMap[topic.id] || topic.deadline) : ''}
                          onChange={(e) => handleDeadlineChange(topic.id, e.target.value)}
                          title="Haz clic aquí para modificar el plazo de entrega"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#38bdf8',
                            fontSize: '0.68rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        />
                        {!((localDeadlineMap[topic.id] || topic.deadline || '').match(/^\d{4}-\d{2}-\d{2}$/)) && (
                          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                            ({localDeadlineMap[topic.id] || topic.deadline || 'Sin Fecha'})
                          </span>
                        )}
                      </div>

                      {/* LIVE NOTION STATUS DROPDOWN */}
                      <select
                        className="form-select"
                        value={topic.status}
                        onChange={(e) => handleStatusChange(topic.id, topic.notionPageId, e.target.value)}
                        style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', height: 'auto', background: 'rgba(0,0,0,0.4)', color: topic.status === 'Cerrado' ? 'var(--accent-emerald)' : '#fff' }}
                      >
                        <option value="Abierto">Abierto</option>
                        <option value="En Progreso">En Progreso</option>
                        <option value="En Revisión Técnica">En Revisión Técnica</option>
                        <option value="Bloqueado">Bloqueado</option>
                        <option value="Cerrado">Cerrado / Completado</option>
                      </select>
                      
                      {isCommented && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(16, 185, 129, 0.12)', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>
                          <CheckCircle2 size={11} /> Atendida • Al final
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '0.92rem', color: '#fff', margin: 0, fontWeight: 600, lineHeight: '1.3' }}>
                      {topic.title}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => handleFetchLiveCommentsForCard(topic.id, topic.notionPageId)}
                      className="btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '0.3rem 0.55rem' }}
                      title="Refrescar comentarios de Notion en vivo"
                    >
                      <RefreshCw size={12} className={isFetchingNotionComments ? 'spin' : ''} />
                    </button>

                    {/* DIRECT NOTION LINK */}
                    <a
                      href={notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                    >
                      <ExternalLink size={13} /> Abrir en Notion
                    </a>
                  </div>
                </div>

                {/* TAILORED DYNAMIC SPEECH & REACTION GRID FOR THIS EXACT TOPIC */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '0.45rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                    <span style={{ fontSize: '0.66rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'block', marginBottom: '0.1rem' }}>
                      🗣️ Speech Directivo para este tema:
                    </span>
                    <div style={{ color: '#fff', fontStyle: 'italic', lineHeight: '1.3' }}>
                      {topicInfo.speech}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.45rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                    <span style={{ fontSize: '0.66rem', color: 'var(--accent-amber)', fontWeight: 700, display: 'block', marginBottom: '0.1rem' }}>
                      🛡️ Si responde: "{topicInfo.responseIf}"
                    </span>
                    <div style={{ color: '#fff', fontWeight: 600, lineHeight: '1.3' }}>
                      👉 {topicInfo.diegoAnswer}
                    </div>
                  </div>
                </div>

                {/* FULL CHRONOLOGICAL COMMENTS HISTORY */}
                {sortedComments.length > 0 ? (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.55rem 0.85rem', borderRadius: '6px', fontSize: '0.76rem', borderLeft: '3px solid var(--accent-cyan)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.3rem' }}>
                      💬 Historial de Notas y Comentarios ({sortedComments.length}):
                    </div>
                    {sortedComments.map((cmt, cIdx) => (
                      <div key={cIdx} style={{ paddingBottom: cIdx < sortedComments.length - 1 ? '0.4rem' : '0', borderBottom: cIdx < sortedComments.length - 1 ? '1px dashed rgba(255,255,255,0.05)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#58a6ff', fontWeight: 600, fontSize: '0.72rem', marginBottom: '0.1rem' }}>
                          <span>👤 {cmt.author}</span>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.68rem' }}>{cmt.date}</span>
                        </div>
                        <div style={{ color: 'var(--text-body)', fontSize: '0.78rem', lineHeight: '1.3' }}>{cmt.text}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    Sin comentarios previos registrados en Notion.
                  </div>
                )}

                {/* Automatic Live Notion API Comment Input WITH MICROPHONE BUTTON */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={isListeningCard ? "🎙️ Escuchando tu voz por micrófono..." : `Comentar a Notion para ${topic.memberName}... (escribe o dicta con 🎙️)`}
                      value={inputVal}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [topic.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePostCommentForTopic(topic.id, topic.notionPageId, topic.memberName);
                      }}
                      style={{ 
                        fontSize: '0.78rem', 
                        padding: '0.4rem 0.75rem',
                        borderColor: isListeningCard ? 'var(--accent-rose)' : undefined
                      }}
                    />

                    {/* Microphone Dictation Button */}
                    <button
                      className={`btn-icon ${isListeningCard ? 'active' : ''}`}
                      onClick={() => handleStartVoiceDictation(topic.id, (text) => {
                        setCommentInputs(prev => ({
                          ...prev,
                          [topic.id]: prev[topic.id] ? `${prev[topic.id]} ${text}` : text
                        }));
                      })}
                      style={{
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        background: isListeningCard ? 'var(--accent-rose)' : 'rgba(6, 182, 212, 0.15)',
                        color: '#fff',
                        border: isListeningCard ? '1px solid var(--accent-rose)' : '1px solid var(--accent-cyan)',
                        cursor: 'pointer'
                      }}
                      title="Dictar comentario por micrófono 🎙️"
                    >
                      <Mic size={14} className={isListeningCard ? 'pulse' : ''} />
                    </button>

                    <button
                      className="btn-primary"
                      onClick={() => handlePostCommentForTopic(topic.id, topic.notionPageId, topic.memberName)}
                      style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
                    >
                      <Send size={12} /> Publicar a Notion
                    </button>
                  </div>

                  {status === 'syncing' && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <RefreshCw className="spin" size={11} /> Publicando comentario directamente en Notion API...
                    </div>
                  )}
                  {status === 'success' && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={12} /> ¡Comentario publicado automáticamente en Notion y tarjeta enviada al final!
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* SEPARATE SECTION FOR CLOSED / COMPLETED CARDS */}
      {showClosedSection && (
        <div className="card-glass" style={{ borderTop: '3px solid var(--accent-emerald)', marginTop: '1.5rem', padding: '1.1rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-emerald)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Archive size={18} /> 📁 Histórico de Tarjetas Cerradas / Completadas ({closedCards.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {closedCards.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No hay tarjetas cerradas en esta vista.</p>
            ) : (
              closedCards.map((c, idx) => {
                const sortedC = [...(c.comments || [])].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
                return (
                  <div key={c.id || idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.15rem' }}>
                          <span className="tag low" style={{ fontSize: '0.62rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.4)' }}>Cerrado</span>
                          <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{c.memberName}</span>
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 500 }}>{c.title}</div>
                      </div>
                      
                      <button 
                        className="btn-secondary" 
                        onClick={() => handleStatusChange(c.id, c.notionPageId, 'Abierto')}
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                      >
                        Reabrir
                      </button>
                    </div>

                    {sortedC.length > 0 && (
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.45rem 0.65rem', borderRadius: '4px', fontSize: '0.72rem', borderLeft: '2px solid var(--accent-emerald)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>
                          💬 Notas de cierre y comentarios ({sortedC.length}):
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {sortedC.map((cmt, cIdx) => (
                            <div key={cIdx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#58a6ff', fontWeight: 600, fontSize: '0.68rem' }}>
                                <span>👤 {cmt.author}</span>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.64rem' }}>{cmt.date}</span>
                              </div>
                              <div style={{ color: 'var(--text-body)', fontSize: '0.74rem', lineHeight: '1.3' }}>{cmt.text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}
