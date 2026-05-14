'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BottomNav, { TabName } from './BottomNav';

type ContributionType = '전체' | '아이디어 제안' | '문제제기' | '핵심질문' | '논의정리' | '의사결정' | '실행약속';
type CardType = Exclude<ContributionType, '전체'>;

interface ContributionCard {
  id: number;
  type: CardType;
  author: string;
  content: string;
}

// 기여 유형별 색상 (태그 뱃지 + 카드 배경)
const typeStyleMap: Record<CardType, { pillColor: string; cardBg: string }> = {
  '아이디어 제안': { pillColor: '#3a7bd5', cardBg: 'rgba(58, 123, 213, 0.1)' },
  '문제제기':      { pillColor: '#e84040', cardBg: 'rgba(232, 64, 64, 0.1)' },
  '핵심질문':      { pillColor: '#f5a623', cardBg: 'rgba(245, 166, 35, 0.1)' },
  '논의정리':      { pillColor: '#7c4dff', cardBg: 'rgba(124, 77, 255, 0.1)' },
  '의사결정':      { pillColor: '#4caf82', cardBg: 'rgba(76, 175, 130, 0.1)' },
  '실행약속':      { pillColor: '#e65100', cardBg: 'rgba(230, 81, 0, 0.1)' },
};

const filterList: ContributionType[] = [
  '전체', '아이디어 제안', '문제제기', '핵심질문', '논의정리', '의사결정', '실행약속',
];

const sampleCards: ContributionCard[] = [
  {
    id: 1,
    type: '아이디어 제안',
    author: '김민준',
    content: '"캐시 알고리즘을 LRU대신 LFU로 바꾸면 성능이 좋아질 것 같습니다."',
  },
  {
    id: 2,
    type: '문제제기',
    author: '이서연',
    content: '"현재 구현에서 동시성 처리가 제대로되지 않고 있어요."',
  },
  {
    id: 3,
    type: '핵심질문',
    author: '박도현',
    content: '"로그인 보장이 안 될 경우 어떻게 처리할 건가요?."',
  },
];

function ContributionCardItem({ card }: { card: ContributionCard }) {
  const { pillColor, cardBg } = typeStyleMap[card.type];

  return (
    <div className="rounded-xl px-3 pt-3 pb-4" style={{ backgroundColor: cardBg }}>
      {/* 태그 + 발언자 행 */}
      <div className="flex items-center justify-between mb-[11px]">
        <span
          className="text-xs text-white rounded-full px-3 py-[5px] leading-none"
          style={{ backgroundColor: pillColor }}
        >
          {card.type}
        </span>
        <span className="text-xs text-[#989494]">{card.author}</span>
      </div>
      {/* 발언 내용 */}
      <p className="text-xs text-black leading-5">{card.content}</p>
    </div>
  );
}

interface ContributionCardScreenProps {
  onBack?: () => void;
  onTabPress?: (tab: TabName) => void;
}

export default function ContributionCardScreen({ onBack, onTabPress }: ContributionCardScreenProps) {
  const [activeFilter, setActiveFilter] = useState<ContributionType>('전체');

  const filteredCards =
    activeFilter === '전체' ? sampleCards : sampleCards.filter((c) => c.type === activeFilter);

  return (
    <div className="flex flex-col flex-1 h-screen">
      {/* 헤더 */}
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9" onClick={onBack}>
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">
          기여도 카드
        </h1>
      </header>

      {/* 기여 유형 필터 탭 (가로 스크롤) */}
      <div className="flex gap-[10px] overflow-x-auto px-[10px] py-[10px] bg-white scrollbar-hide">
        {filterList.map((filter) => {
          const isActive = activeFilter === filter;
          const isAll = filter === '전체';
          const style = isAll ? null : typeStyleMap[filter as CardType];

          const bg = isAll
            ? isActive ? '#1c1a1c' : '#f3f3f3'
            : isActive ? style!.pillColor : 'white';

          const textColor = isAll
            ? isActive ? '#f3f3f3' : '#1c1a1c'
            : isActive ? '#f3f3f3' : style!.pillColor;

          const border = isAll ? undefined : `1.5px solid ${style!.pillColor}`;

          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="shrink-0 rounded-full px-3 h-[31px] text-[16px] cursor-pointer leading-none"
              style={{ backgroundColor: bg, color: textColor, border }}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* 기여도 카드 목록 */}
      <div className="flex-1 overflow-y-auto px-[26px] py-5 flex flex-col gap-[19px]">
        {filteredCards.length === 0 ? (
          <p className="text-center text-sm text-[#989494] mt-10">해당 유형의 기여가 없습니다.</p>
        ) : (
          filteredCards.map((card) => <ContributionCardItem key={card.id} card={card} />)
        )}
      </div>

      {/* 하단 내비게이션 */}
      <BottomNav activeTab="card" onTabPress={onTabPress} />
    </div>
  );
}
