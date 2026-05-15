'use client';

import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import HomeScreen from '@/components/HomeScreen';
import CreateTeamScreen from '@/components/CreateTeamScreen';
import MeetingAnalysisScreen from '@/components/MeetingAnalysisScreen';
import AiAnalysisScreen from '@/components/AiAnalysisScreen';
import TeamContributionScreen from '@/components/TeamContributionScreen';
import ContributionCardScreen from '@/components/ContributionCardScreen';
import PromiseCardScreen from '@/components/PromiseCardScreen';
import FinalReportScreen from '@/components/FinalReportScreen';
import LoginScreen from '@/components/LoginScreen';
import { TabName } from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';

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
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [screen, setScreen] = useState<Screen>('home');
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTabPress = (tab: TabName) => {
    if (tab === 'home') setScreen('home');
    else if (tab === 'recording') setScreen('meeting');
    else if (tab === 'card') setScreen('promise-card');
    else if (tab === 'report') setScreen('report');
  };

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-[402px] min-h-screen bg-white flex items-center justify-center">
          <p className="text-[#989494] text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (session === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-[402px] min-h-screen bg-white flex flex-col shadow-xl">
          <LoginScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-[402px] min-h-screen bg-white flex flex-col shadow-xl">
        {screen === 'home' && (
          <HomeScreen
            onNewTeam={() => setScreen('create-team')}
            onTabPress={handleTabPress}
            onSelectTeam={(teamId) => {
              setCurrentTeamId(teamId);
              setScreen('meeting');
            }}
          />
        )}
        {screen === 'create-team' && (
          <CreateTeamScreen
            onBack={() => setScreen('home')}
            onCreate={(teamId) => {
              setCurrentTeamId(teamId);
              setScreen('home');
            }}
          />
        )}
        {screen === 'meeting' && (
          <MeetingAnalysisScreen
            teamId={currentTeamId}
            onAnalysisStart={(meetingId) => {
              setCurrentMeetingId(meetingId);
              setScreen('ai');
            }}
            onTabPress={handleTabPress}
          />
        )}
        {screen === 'ai' && (
          <AiAnalysisScreen
            meetingId={currentMeetingId}
            onBack={() => setScreen('meeting')}
            onComplete={() => setScreen('team-contribution')}
          />
        )}
        {screen === 'team-contribution' && (
          <TeamContributionScreen
            meetingId={currentMeetingId}
            onBack={() => setScreen('ai')}
            onConfirm={() => setScreen('card')}
          />
        )}
        {screen === 'card' && (
          <ContributionCardScreen
            meetingId={currentMeetingId}
            onBack={() => setScreen('home')}
            onTabPress={handleTabPress}
          />
        )}
        {screen === 'promise-card' && (
          <PromiseCardScreen
            teamId={currentTeamId}
            onBack={() => setScreen('home')}
            onTabPress={handleTabPress}
          />
        )}
        {screen === 'report' && (
          <FinalReportScreen
            teamId={currentTeamId}
            onBack={() => setScreen('home')}
            onTabPress={handleTabPress}
          />
        )}
      </div>
    </div>
  );
}
