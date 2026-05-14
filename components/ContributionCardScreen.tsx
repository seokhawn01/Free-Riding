'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BottomNav, { TabName } from './BottomNav';
import { meetingsApi } from '@/lib/api';
import type { ContributionCard, ContributionType } from '@/lib/types';

type FilterType = '전체' | ContributionType;

const TYPE_LABEL: Record<ContributionType, string> = {
  idea: '아이디어 제안', problem: '문제제기', question: '핵심질문',
  summary: '논의정리', decision: '의사결정', promise: '실행약속',
};

const typeStyleMap: Record<ContributionType, { pillColor: string; cardBg: string }> = {
  idea:     { pillColor: '#3a7bd5', cardBg: 'rgba(58,123,213,0.1)' },
  problem:  { pillColor: '#e84040', cardBg: 'rgba(232,64,64,0.1)' },
  question: { pillColor: '#f5a623', cardBg: 'rgba(245,166,35,0.1)' },
  summary:  { pillColor: '#7c4dff', cardBg: 'rgba(124,77,255,0.1)' },
  decision: { pillColor: '#4caf82', cardBg: 'rgba(76,175,130,0.1)' },
  promise:  { pillColor: '#e65100', cardBg: 'rgba(230,81,0,0.1)' },
};

const ALL_TYPES: ContributionType[] = ['idea', 'problem', 'question', 'summary', 'decision', 'promise'];

interface ContributionCardScreenProps {
  meetingId: string | null;
  onBack?: () => void;
  onTabPress?: (tab: TabName) => void;
}

export default function ContributionCardScreen({ meetingId, onBack, onTabPress }: ContributionCardScreenProps) {
  const [cards, setCards] = useState<ContributionCard[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meetingId) { setLoading(false); return; }
    meetingsApi.getContributions(meetingId)
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [meetingId]);

  const filtered = activeFilter === '전체'
    ? cards
    : cards.filter((c) => c.contribution_type === activeFilter);

  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9" onClick={onBack}>
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">
          기여도 카드
        </h1>
      </header>

      {/* 필터 탭 */}
      <div className="flex gap-[10px] overflow-x-auto px-[10px] py-[10px] bg-white">
        <button
          onClick={() => setActiveFilter('전체')}
          className="shrink-0 rounded-full px-3 h-[31px] text-[16px] cursor-pointer leading-none transition-colors"
          style={{
            backgroundColor: activeFilter === '전체' ? '#1c1a1c' : '#f3f3f3',
            color: activeFilter === '전체' ? '#f3f3f3' : '#1c1a1c',
          }}
        >
          전체
        </button>
        {ALL_TYPES.map((type) => {
          const { pillColor } = typeStyleMap[type];
          const isActive = activeFilter === type;
          return (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className="shrink-0 rounded-full px-3 h-[31px] text-[16px] cursor-pointer leading-none transition-colors"
              style={{
                backgroundColor: isActive ? pillColor : 'white',
                color: isActive ? '#f3f3f3' : pillColor,
                border: `1.5px solid ${pillColor}`,
              }}
            >
              {TYPE_LABEL[type]}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-[26px] py-5 flex flex-col gap-[19px]">
        {loading && <p className="text-center text-sm text-[#989494] mt-10">불러오는 중...</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-sm text-[#989494] mt-10">해당 유형의 기여가 없습니다.</p>
        )}

        {filtered.map((card) => {
          const { pillColor, cardBg } = typeStyleMap[card.contribution_type];
          return (
            <div key={card.id} className="rounded-xl px-3 pt-3 pb-4" style={{ backgroundColor: cardBg }}>
              <div className="flex items-center justify-between mb-[11px]">
                <span
                  className="text-xs text-white rounded-full px-3 py-[5px] leading-none"
                  style={{ backgroundColor: pillColor }}
                >
                  {TYPE_LABEL[card.contribution_type]}
                </span>
                <span className="text-xs text-[#989494]">{card.member_name}</span>
              </div>
              <p className="text-xs text-black leading-5">{card.content}</p>
            </div>
          );
        })}
      </div>

      <BottomNav activeTab="card" onTabPress={onTabPress} />
    </div>
  );
}
