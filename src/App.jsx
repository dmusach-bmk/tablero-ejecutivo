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
import DeadlinesManager from './components/DeadlinesManager';
import ActionHub from './components/ActionHub';
import LeadershipAdvisor from './components/LeadershipAdvisor';
import DeadlineModal from './components/DeadlineModal';
import SettingsModal from './components/SettingsModal';

import {
  INITIAL_NOTION_CARDS,
  INITIAL_EXCEL_DATA,
  INITIAL_TEAM_TRACKING
} from './mockData';

export default function App() {
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash());
  const [notionCards, setNotionCards] = useState(() => {
    const saved = localStorage.getItem('dm_notion_cards');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length >= INITIAL_NOTION_CARDS.length) return parsed;
    }
    return INITIAL_NOTION_CARDS;
  });
  const [excelData, setExcelData] = useState(() => {
    const saved = localStorage.getItem('dm_excel_data');
    return saved ? JSON.parse(saved) : INITIAL_EXCEL_DATA;
  });
  const [teamTracking, setTeamTracking] = useState(() => {
    const saved = localStorage.getItem('dm_team_tracking');
    if (saved) {
      const parsed = JSON.parse(saved);
      const enrique = parsed.find(p => p.id === 'dev-enrique');
      if (enrique && enrique.topics?.length >= 25) return parsed;
    }
    return INITIAL_TEAM_TRACKING;
  });
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('dm_credentials');
    return saved ? JSON.parse(saved) : {};
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
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('dm_notion_cards', JSON.stringify(notionCards));
  }, [notionCards]);

  useEffect(() => {
    localStorage.setItem('dm_excel_data', JSON.stringify(excelData));
  }, [excelData]);

  useEffect(() => {
    localStorage.setItem('dm_team_tracking', JSON.stringify(teamTracking));
  }, [teamTracking]);

  useEffect(() => {
    localStorage.setItem('dm_credentials', JSON.stringify(credentials));
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
            ...card.comments,
            {
              author: "Diego Paolo Musach",
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              text: `📅 Fecha Límite fijada institucionalmente para el ${newDeadline}.`
            }
          ]
        };
      }
      return card;
    }));
  };

  const handleAddNotionComment = (taskId, commentText) => {
    setNotionCards(prev => prev.map(card => {
      if (card.id === taskId) {
        return {
          ...card,
          comments: [
            ...card.comments,
            {
              author: "Diego Paolo Musach (Director)",
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              text: commentText
            }
          ]
        };
      }
      return card;
    }));
  };

  const handleOpenEmailWithAgenda = (dev) => {
    setPrefilledEmailData({
      to: `${dev.name.toLowerCase().replace(' ', '.')}@empresa.com`,
      subject: `Agenda 1-on-1 & Alineación | Diego Musach`,
      body: `Hola ${dev.name},\n\nTe comparto los puntos de alineación para nuestra próxima sesión de 1-on-1:\n\n1. Estado de entregables del proyecto y seguimiento en Notion.\n2. Avance en el objetivo semanal: "${dev.weeklyGoal}".\n3. Feedback de reconocimiento y alineación de prioridades.\n\nSaludos,\nDiego Paolo Musach`
    });
    handleTabChange('actions');
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        missingDeadlinesCount={missingTasks.length}
        onOpenDeadlineModal={() => setIsDeadlineModalOpen(true)}
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
          />
        )}

        {activeTab === 'diego_ejecutivo' && (
          <DiegoEjecutivo
            teamTracking={teamTracking}
            notionCards={notionCards}
            credentials={credentials}
            onUpdateNotionCards={(updated) => setNotionCards(updated)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'followup' && (
          <DailyFollowUp
            teamTracking={teamTracking}
            credentials={credentials}
            onOpenEmailWithAgenda={handleOpenEmailWithAgenda}
            onNavigate={handleTabChange}
          />
        )}

        {activeTab === 'asesor' && (
          <AsesorEjecutivoChat
            teamTracking={teamTracking}
            notionCards={notionCards}
            credentials={credentials}
          />
        )}

        {activeTab === 'scorecards' && (
          <TeamScorecard
            teamTracking={teamTracking}
            onNavigateToAsesor={() => handleTabChange('asesor')}
            onOpenEmailWithAgenda={handleOpenEmailWithAgenda}
          />
        )}

        {activeTab === 'micromanagement' && (
          <MicromanagementEngine
            teamTracking={teamTracking}
            credentials={credentials}
            onUpdateTeamTracking={(updated) => setTeamTracking(updated)}
            onOpenEmailWithAgenda={handleOpenEmailWithAgenda}
          />
        )}

        {activeTab === 'notion' && (
          <NotionTranscripts
            notionCards={notionCards}
            onAddComment={handleAddNotionComment}
            onSetDeadline={handleSetDeadline}
            onOpenDeadlineModal={() => setIsDeadlineModalOpen(true)}
          />
        )}

        {activeTab === 'excel' && (
          <ExcelAnalytics
            excelData={excelData}
            onUploadData={(newData) => setExcelData(newData)}
          />
        )}

        {activeTab === 'deadlines' && (
          <DeadlinesManager
            notionCards={notionCards}
            onSetDeadline={handleSetDeadline}
            onOpenDeadlineModal={() => setIsDeadlineModalOpen(true)}
          />
        )}

        {activeTab === 'actions' && (
          <ActionHub
            prefilledEmailData={prefilledEmailData}
            onAddComment={handleAddNotionComment}
          />
        )}

        {activeTab === 'leadership' && (
          <LeadershipAdvisor />
        )}
      </main>

      <DeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
        missingTasks={missingTasks}
        onSetDeadline={handleSetDeadline}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        credentials={credentials}
        onSaveCredentials={(newCreds) => setCredentials(newCreds)}
      />
    </div>
  );
}
