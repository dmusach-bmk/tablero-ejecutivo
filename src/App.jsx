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

import { REAL_NOTION_CARDS, REAL_TEAM_TRACKING } from './realNotionData';
import { INITIAL_EXCEL_DATA } from './mockData';

export default function App() {
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash());
  
  // Use REAL_NOTION_CARDS from Notion API
  const [notionCards, setNotionCards] = useState(() => {
    const saved = localStorage.getItem('dm_notion_cards_v5');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length >= 160 && parsed[0].notionPageId) return parsed;
    }
    return REAL_NOTION_CARDS;
  });

  const [excelData, setExcelData] = useState(() => {
    const saved = localStorage.getItem('dm_excel_data');
    return saved ? JSON.parse(saved) : INITIAL_EXCEL_DATA;
  });

  // Use REAL_TEAM_TRACKING with 375 real Notion comments + valid notionPageId bound
  const [teamTracking, setTeamTracking] = useState(() => {
    const saved = localStorage.getItem('dm_team_tracking_v5');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length >= 10 && parsed[0].topics[0]?.notionPageId) return parsed;
    }
    return REAL_TEAM_TRACKING;
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
    localStorage.setItem('dm_notion_cards_v5', JSON.stringify(notionCards));
  }, [notionCards]);

  useEffect(() => {
    localStorage.setItem('dm_excel_data', JSON.stringify(excelData));
  }, [excelData]);

  useEffect(() => {
    localStorage.setItem('dm_team_tracking_v5', JSON.stringify(teamTracking));
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

        {activeTab === 'delegador' && (
          <DelegacionHub
            notionCards={notionCards}
            setNotionCards={setNotionCards}
            onAddNotionCard={(newCard) => setNotionCards(prev => [newCard, ...prev])}
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
