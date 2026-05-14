'use client';

import { useState } from 'react';
import HomeScreen from '@/components/HomeScreen';
import CreateTeamScreen from '@/components/CreateTeamScreen';
import MeetingAnalysisScreen from '@/components/MeetingAnalysisScreen';
import AiAnalysisScreen from '@/components/AiAnalysisScreen';
import TeamContributionScreen from '@/components/TeamContributionScreen';
import ContributionCardScreen from '@/components/ContributionCardScreen';
import PromiseCardScreen from '@/components/PromiseCardScreen';
import FinalReportScreen from '@/components/FinalReportScreen';
import { TabName } from '@/components/BottomNav';

type Screen =
  | 'home'
  | 'create-team'
  | 'meeting'
  | 'ai'
  | 'team-contribution'
  | 'card'
  | 'promise-card'
  | 'report';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('home');

  const handleTabPress = (tab: TabName) => {
    if (tab === 'home') setScreen('home');
    else if (tab === 'recording') setScreen('meeting');
    else if (tab === 'card') setScreen('promise-card');
    else if (tab === 'report') setScreen('report');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-[402px] min-h-screen bg-white flex flex-col shadow-xl">
        {screen === 'home' && (
          <HomeScreen
            onNewTeam={() => setScreen('create-team')}
            onTabPress={handleTabPress}
          />
        )}
        {screen === 'create-team' && (
          <CreateTeamScreen
            onBack={() => setScreen('home')}
            onCreate={() => setScreen('home')}
          />
        )}
        {screen === 'meeting' && (
          <MeetingAnalysisScreen
            onAnalysisStart={() => setScreen('ai')}
            onTabPress={handleTabPress}
          />
        )}
        {screen === 'ai' && (
          <AiAnalysisScreen
            onBack={() => setScreen('meeting')}
            onComplete={() => setScreen('team-contribution')}
          />
        )}
        {screen === 'team-contribution' && (
          <TeamContributionScreen
            onBack={() => setScreen('ai')}
            onConfirm={() => setScreen('card')}
          />
        )}
        {screen === 'card' && (
          <ContributionCardScreen
            onBack={() => setScreen('home')}
            onTabPress={handleTabPress}
          />
        )}
        {screen === 'promise-card' && (
          <PromiseCardScreen
            onBack={() => setScreen('home')}
            onTabPress={handleTabPress}
          />
        )}
        {screen === 'report' && (
          <FinalReportScreen
            onBack={() => setScreen('home')}
            onTabPress={handleTabPress}
          />
        )}
      </div>
    </div>
  );
}
