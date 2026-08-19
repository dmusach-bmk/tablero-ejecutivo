import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import NotionTranscripts from './components/NotionTranscripts';
import ExcelAnalytics from './components/ExcelAnalytics';
import MicromanagementEngine from './components/MicromanagementEngine';
import AsesorEjecutivoChat from './components/AsesorEjecutivoChat';
import TeamScorecard from './components/TeamScorecard';
import DailyFollowUp from './components/DailyFollowUp';
import DiegoEjecutivo from './components/DiegoEjecutivo';
import FathomAnalyzer from './components/FathomAnalyzer';
import GoogleWorkspaceHub from './components/GoogleWorkspaceHub';
import ExecutiveFinancials from './components/ExecutiveFinancials';
import ExecutiveRoadmapAndReport from './components/ExecutiveRoadmapAndReport';
import DeadlinesManager from './components/DeadlinesManager';
import ActionHub from './components/ActionHub';
import LeadershipAdvisor from './components/LeadershipAdvisor';
import DeadlineModal from './components/DeadlineModal';
import SettingsModal from './components/SettingsModal';
import CriteriosYReglas from './components/CriteriosYReglas';
import RecursosHub from './components/RecursosHub';
import DelegacionHub from './components/DelegacionHub';
import ReportesExternos from './components/ReportesExternos';
import Estrategia306090 from './components/Estrategia306090';
import LlamadosEjecutivos from './components/LlamadosEjecutivos';

import { REAL_NOTION_CARDS, REAL_TEAM_TRACKING } from './realNotionData';
import { INITIAL_EXCEL_DATA } from './mockData';
import { extractDateFromText } from './utils/dateParser';

export default function App() {
  const getTabFromHash = () => {
    let hash = window.location.hash.replace('#', '');
    if (hash.includes('?')) {
      hash = hash.split('?')[0];
    }
    return hash || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use REAL_NOTION_CARDS from Notion API
  const [notionCards, setNotionCards] = useState(() => {
    try {
      const saved = localStorage.getItem('dm_notion_cards_v11');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length >= 160 && parsed[0].notionPageId) return parsed;
      }
    } catch (e) {
      console.error('Error loading notion cards:', e);
    }
    return REAL_NOTION_CARDS;
  });

  const [excelData, setExcelData] = useState(() => {
    try {
      const saved = localStorage.getItem('dm_excel_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing excelData:', e);
    }
    return INITIAL_EXCEL_DATA;
  });

  // Use REAL_TEAM_TRACKING with 375 real Notion comments + valid notionPageId bound
  const [teamTracking, setTeamTracking] = useState(() => {
    try {
      const saved = localStorage.getItem('dm_team_tracking_v7');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (parsed && parsed.length >= 10 && parsed[0].topics && parsed[0].topics[0]?.notionPageId) {
          // Migración dinámica de IDs viejos
          parsed = parsed.map(mem => {
            if (mem.id === 'mem-1') mem.id = 'dev-mario';
            if (mem.id === 'mem-2') mem.id = 'dev-camilo';
            if (mem.id === 'mem-3') mem.id = 'dev-leonard';
            if (mem.id === 'mem-4') mem.id = 'dev-joseph';
            if (mem.id === 'mem-5') mem.id = 'dev-fabricio';
            if (mem.id === 'mem-6') mem.id = 'dev-enrique';
            if (mem.id === 'mem-7') mem.id = 'dev-rodolfo';
            if (mem.id === 'mem-8') mem.id = 'dev-diego';
            return mem;
          });
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error parsing teamTracking:', e);
    }
    return REAL_TEAM_TRACKING;
  });

  const [credentials, setCredentials] = useState(() => {
    try {
      const saved = localStorage.getItem('dm_credentials');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing credentials:', e);
    }
    return {};
  });

  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prefilledEmailData, setPrefilledEmailData] = useState(null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getTabFromHash());
      const hash = window.location.hash;
      if (hash.includes('?q=')) {
        const queryParams = new URLSearchParams(hash.split('?')[1]);
        setSearchQuery(queryParams.get('q') || '');
      } else {
        setSearchQuery('');
      }
    };
    handleHashChange(); // Run once to initialize
    window.addEventListener('hashchange', handleHashChange);
    
    // Clean up obsolete localStorage keys to free up quota
    try {
      const currentKeys = ['dm_notion_cards_v11', 'dm_team_tracking_v7', 'dm_excel_data', 'dm_credentials', 'dm_call_comments_drafts', 'dm_closed_topics_db', 'dm_contacts_directory'];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dm_') && !currentKeys.includes(key)) {
          localStorage.removeItem(key);
          i--; // Adjust index since we removed an item
        }
      }
    } catch (e) {
      console.error('Error cleaning up obsolete localStorage keys:', e);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dm_notion_cards_v11', JSON.stringify(notionCards));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for notion cards:', e);
    }
  }, [notionCards]);

  useEffect(() => {
    try {
      localStorage.setItem('dm_excel_data', JSON.stringify(excelData));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for excel data:', e);
    }
  }, [excelData]);

  useEffect(() => {
    try {
      localStorage.setItem('dm_team_tracking_v7', JSON.stringify(teamTracking));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for team tracking:', e);
    }
  }, [teamTracking]);

  useEffect(() => {
    try {
      localStorage.setItem('dm_credentials', JSON.stringify(credentials));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for credentials:', e);
    }
  }, [credentials]);

  const missingTasks = notionCards.filter(c => c.missingDeadline);

  const handleSetDeadline = (taskId, newDeadline) => {
    setNotionCards(prev => prev.map(card => {
      if (card.id === taskId) {
        return {
          ...card,
          deadline: newDeadline,
          missingDeadline: false,
          comments: [
            ...(card.comments || []),
            {
              author: "Diego Paolo Musach",
              date: new Date().toISOString().split('T')[0],
              text: `Plazo fijado/actualizado a ${newDeadline}`
            }
          ]
        };
      }
      return card;
    }));
  };

  const handleAddNotionCard = (newCard) => {
    // 1. Update notionCards
    setNotionCards(prev => [newCard, ...prev]);

    // 2. If it is assigned to a team member, append to their topics in teamTracking!
    const respName = (newCard.responsable || '').toLowerCase();
    
    setTeamTracking(prev => {
      // Find if the assignee matches any member's first name
      const matchedMember = prev.find(m => respName.includes(m.name.split(' ')[0].toLowerCase()));
      if (matchedMember) {
        return prev.map(m => {
          if (m.id === matchedMember.id) {
            const newTopic = {
              id: newCard.id,
              notionPageId: newCard.notionPageId || newCard.id,
              notionId: newCard.notionId || newCard.id,
              title: newCard.title,
              priority: newCard.priority || 'P2 - ALTA',
              status: newCard.status || 'Abierto',
              memberName: matchedMember.name,
              memberId: matchedMember.id,
              memberAvatar: matchedMember.avatar,
              responsable: matchedMember.name,
              assignedTo: matchedMember.name,
              comments: [],
              log: newCard.summary || ''
            };
            return {
              ...m,
              topics: [newTopic, ...(m.topics || [])]
            };
          }
          return m;
        });
      }
      return prev;
    });
  };

  const handleOpenEmailWithAgenda = (memberName, topics) => {
    const topicText = (topics || [])
      .map((t, idx) => `${idx + 1}. [${t.priority || 'P2'}] ${t.title}`)
      .join('\n');

    setPrefilledEmailData({
      to: `${memberName.toLowerCase().split(' ')[0]}@company.com`,
      subject: `🚨 Agenda de Prioridades y Bloqueos - 1-on-1 CTO`,
      body: `Hola ${memberName},\n\nRepasemos hoy los siguientes temas prioritarios:\n\n${topicText}\n\nPor favor trae tu status y blockers listos.\n\nSaludos,\nDiego Paolo Musach\nHead of Engineering (CTO)`
    });
    setIsDeadlineModalOpen(true);
  };

  const handleAddCommentAndSync = (cardId, commentText, author = 'Diego Musach (CTO)', extraUpdates = {}) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Parse reassignment from comment
    const membersMap = [
      { key: 'mario', id: 'dev-mario', name: 'Mario Maqueda', title: 'Mario Maqueda', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80' },
      { key: 'camilo', id: 'dev-camilo', name: 'Camilo Uribe', title: 'Camilo Uribe', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80' },
      { key: 'leo', id: 'dev-leonard', name: 'Leonard Amaya', title: 'Leo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80' },
      { key: 'leonard', id: 'dev-leonard', name: 'Leonard Amaya', title: 'Leo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80' },
      { key: 'joseph', id: 'dev-joseph', name: 'Joseph Valer', title: 'Joseph', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80' },
      { key: 'fabricio', id: 'dev-fabricio', name: 'Fabricio Jose Nieva', title: 'Fabricio Nieva', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80' },
      { key: 'enrique', id: 'dev-enrique', name: 'Enrique Bevilacqua', title: 'Enrique', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&q=80' },
      { key: 'rodolfo', id: 'dev-rodolfo', name: 'Rodolfo', title: 'Rodolfo', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80' },
      { key: 'diego', id: 'dev-diego', name: 'Diego Musach (CTO)', title: 'Diego Musach (CTO)', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=80&q=80' }
    ];

    const parseReassignment = (text) => {
      const t = text.toLowerCase();
      for (const mem of membersMap) {
        const patterns = [
          new RegExp(`pasar(?:la)?\\s+a\\s+${mem.key}`),
          new RegExp(`pas(?:a|ala)?\\s+a\\s+${mem.key}`),
          new RegExp(`asignar(?:la)?\\s+a\\s+${mem.key}`),
          new RegExp(`se\\s+la\\s+paso\\s+a\\s+${mem.key}`),
          new RegExp(`que\\s+(?:la|lo)\\s+haga\\s+${mem.key}`),
          new RegExp(`responsable\\s+${mem.key}`)
        ];

        if (patterns.some(regex => regex.test(t))) {
          return mem;
        }
      }
      return null;
    };

    const getDropdownMember = () => {
      if (!extraUpdates.responsable) return null;
      const respLower = extraUpdates.responsable.toLowerCase();
      return membersMap.find(m => respLower.includes(m.name.split(' ')[0].toLowerCase()));
    };

    const targetMember = getDropdownMember() || parseReassignment(commentText);
    const extractedDeadline = extractDateFromText(commentText.trim());

    // Update notionCards
    setNotionCards(prev => prev.map(c => {
      if (c.id === cardId || c.notionPageId === cardId || c.notionId === cardId) {
        const updatedComments = [
          ...(c.comments || []),
          { author, date: todayStr, text: commentText.trim() }
        ];
        
        const updatedObj = {
          ...c,
          ...extraUpdates,
          comments: updatedComments
        };

        if (targetMember) {
          updatedObj.responsable = targetMember.name;
          updatedObj.assignedTo = targetMember.name;
        }
        if (extractedDeadline) {
          updatedObj.deadline = extractedDeadline;
        }

        return updatedObj;
      }
      return c;
    }));

    // Update teamTracking
    setTeamTracking(prev => {
      let targetCardData = null;
      let oldMemberId = null;

      for (const mem of prev) {
        const found = (mem.topics || []).find(t => t.id === cardId || t.notionPageId === cardId || t.notionId === cardId);
        if (found) {
          targetCardData = { ...found };
          oldMemberId = mem.id;
          break;
        }
      }

      if (!targetCardData) {
        // If not found in teamTracking, it could be a newly created card or a CEO card not yet in team list.
        // We find it in notionCards
        const notionCard = notionCards.find(c => c.id === cardId || c.notionPageId === cardId || c.notionId === cardId);
        if (notionCard) {
          targetCardData = {
            id: notionCard.id,
            notionPageId: notionCard.notionPageId || notionCard.id,
            title: notionCard.title,
            priority: notionCard.priority || 'P2 - ALTA',
            status: notionCard.status || 'Abierto',
            responsable: notionCard.responsable,
            assignedTo: notionCard.assignedTo,
            comments: [],
            log: notionCard.summary || ''
          };
          // Try to assign it to whoever is responsible
          const respName = notionCard.responsable.toLowerCase();
          const foundMem = prev.find(m => respName.includes(m.name.split(' ')[0].toLowerCase()));
          oldMemberId = foundMem ? foundMem.id : 'dev-diego'; // Diego as default
        } else {
          return prev;
        }
      }

      const updatedComments = [
        ...(targetCardData.comments || []),
        { author, date: todayStr, text: commentText.trim() }
      ];

      // If reassignment is requested and it's to a different member
      if (targetMember && oldMemberId !== targetMember.id) {
        return prev.map(mem => {
          // Remove from old member
          if (mem.id === oldMemberId) {
            return {
              ...mem,
              topics: (mem.topics || []).filter(t => t.id !== cardId && t.notionPageId !== cardId && t.notionId !== cardId)
            };
          }
          // Add to new member
          if (mem.id === targetMember.id) {
            const newTopic = {
              ...targetCardData,
              comments: updatedComments,
              memberName: targetMember.name,
              memberId: targetMember.id,
              memberAvatar: targetMember.avatar,
              responsable: targetMember.name,
              assignedTo: targetMember.name
            };
            if (extractedDeadline) {
              newTopic.deadline = extractedDeadline;
            }
            return {
              ...mem,
              topics: [...(mem.topics || []).filter(t => t.id !== cardId), newTopic]
            };
          }
          return mem;
        });
      }

      // Standard comment update (no reassignment)
      return prev.map(mem => {
        if (mem.id === oldMemberId) {
          // Check if card is already in this member's list
          const hasCard = (mem.topics || []).some(t => t.id === cardId || t.notionPageId === cardId || t.notionId === cardId);
          if (hasCard) {
            return {
              ...mem,
              topics: (mem.topics || []).map(t => {
                if (t.id === cardId || t.notionPageId === cardId || t.notionId === cardId) {
                  const updatedT = { ...t, comments: updatedComments };
                  if (extractedDeadline) {
                    updatedT.deadline = extractedDeadline;
                  }
                  return updatedT;
                }
                return t;
              })
            };
          } else {
            // Append if not there
            const newTopic = {
              ...targetCardData,
              comments: updatedComments,
              memberName: mem.name,
              memberId: mem.id,
              memberAvatar: mem.avatar
            };
            if (extractedDeadline) {
              newTopic.deadline = extractedDeadline;
            }
            return {
              ...mem,
              topics: [...(mem.topics || []), newTopic]
            };
          }
        }
        return mem;
      });
    });
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        missingTasksCount={missingTasks.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="main-content">
        {activeTab === 'overview' && (
          <Overview 
            notionCards={notionCards}
            excelData={excelData}
            teamTracking={teamTracking}
            onNavigate={handleTabChange}
            onOpenDeadlineModal={() => setIsDeadlineModalOpen(true)}
            credentials={credentials}
            searchQuery={searchQuery}
            onAddCommentAndSync={handleAddCommentAndSync}
          />
        )}

        {activeTab === 'notion' && (
          <NotionTranscripts
            cards={notionCards}
            onUpdateCards={setNotionCards}
            credentials={credentials}
          />
        )}

        {activeTab === 'excel' && (
          <ExcelAnalytics data={excelData} />
        )}

        {activeTab === 'micromanagement' && (
          <MicromanagementEngine
            teamTracking={teamTracking}
            onOpenEmailWithAgenda={handleOpenEmailWithAgenda}
            onNavigate={handleTabChange}
          />
        )}

        {activeTab === 'followup' && (
          <DailyFollowUp
            teamTracking={teamTracking}
            credentials={credentials}
            onUpdateTeamTracking={setTeamTracking}
            onOpenEmailWithAgenda={handleOpenEmailWithAgenda}
            onNavigate={handleTabChange}
            onAddCommentAndSync={handleAddCommentAndSync}
            onAddNotionCard={handleAddNotionCard}
          />
        )}

        {activeTab === 'fathom' && (
          <FathomAnalyzer
            credentials={credentials}
            notionCards={notionCards}
            onSaveCredentials={setCredentials}
            onNavigate={handleTabChange}
          />
        )}

        {activeTab === 'llamados' && (
          <LlamadosEjecutivos credentials={credentials} />
        )}

        {activeTab === 'delegador' && (
          <DelegacionHub
            notionCards={notionCards}
            setNotionCards={setNotionCards}
            onAddNotionCard={handleAddNotionCard}
            teamTracking={teamTracking}
            setTeamTracking={setTeamTracking}
          />
        )}

        {activeTab === 'google_workspace' && (
          <GoogleWorkspaceHub
            credentials={credentials}
            notionCards={notionCards}
          />
        )}

        {activeTab === 'recursos' && (
          <RecursosHub credentials={credentials} />
        )}

        {activeTab === 'financials' && (
          <ExecutiveFinancials
            credentials={credentials}
            notionCards={notionCards}
          />
        )}

        {activeTab === 'roadmap_report' && (
          <ExecutiveRoadmapAndReport
            teamTracking={teamTracking}
            notionCards={notionCards}
            onUpdateNotionCards={setNotionCards}
            onAddCommentAndSync={handleAddCommentAndSync}
            onAddNotionCard={handleAddNotionCard}
          />
        )}

        {activeTab === 'reportes' && (
          <ReportesExternos />
        )}

        {activeTab === 'estrategia' && (
          <Estrategia306090 />
        )}

        {activeTab === 'diego_ejecutivo' && (
          <DiegoEjecutivo
            teamTracking={teamTracking}
            notionCards={notionCards}
            credentials={credentials}
            onNavigate={handleTabChange}
          />
        )}

        {activeTab === 'scorecard' && (
          <TeamScorecard teamTracking={teamTracking} />
        )}

        {activeTab === 'criterios' && (
          <CriteriosYReglas />
        )}

        {activeTab === 'deadlines' && (
          <DeadlinesManager
            cards={notionCards}
            onSetDeadline={handleSetDeadline}
          />
        )}

        {activeTab === 'action_hub' && (
          <ActionHub
            notionCards={notionCards}
            excelData={excelData}
            teamTracking={teamTracking}
            onOpenEmailWithAgenda={handleOpenEmailWithAgenda}
          />
        )}

        {activeTab === 'leadership_advisor' && (
          <LeadershipAdvisor teamTracking={teamTracking} />
        )}

        {activeTab === 'chat' && (
          <AsesorEjecutivoChat
            notionCards={notionCards}
            excelData={excelData}
            teamTracking={teamTracking}
            credentials={credentials}
            onAddNotionCard={handleAddNotionCard}
            onAddCommentAndSync={handleAddCommentAndSync}
          />
        )}
      </main>

      <DeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
        emailData={prefilledEmailData}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        credentials={credentials}
        onSaveCredentials={setCredentials}
      />
    </div>
  );
}
