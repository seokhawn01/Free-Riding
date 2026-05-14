'use client';

import BottomNav, { TabName } from './BottomNav';

interface HomeScreenProps {
  onNewTeam?: () => void;
  onTabPress?: (tab: TabName) => void;
}

const avatars = [
  { initial: '김', color: '#5BBFA4' },
  { initial: '이', color: '#E8A87C' },
  { initial: '박', color: '#A78BDA' },
  { initial: '최', color: '#7BB4D0' },
];

export default function HomeScreen({ onNewTeam, onTabPress }: HomeScreenProps) {
  return (
    <div className="flex flex-col flex-1 h-screen">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-[26px] py-5 bg-white border-b-2 border-[#7b2fbe]">
        <h1 className="text-[24px] font-bold text-[#1c1a1c]">내 팀플</h1>
        <button
          onClick={onNewTeam}
          className="flex flex-col items-center cursor-pointer text-[#1c1a1c] leading-tight"
        >
          <span className="text-[18px] leading-none">+</span>
          <span className="text-[12px]">새로 만들기</span>
        </button>
      </header>

      {/* 카드 목록 */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f5] px-[17px] py-4 flex flex-col gap-3">
        {/* 활성 팀 카드 */}
        <div className="bg-white rounded-2xl px-[18px] py-[18px] shadow-sm">
          {/* 과목명 + D-day 배지 */}
          <div className="flex items-start justify-between mb-1">
            <p className="text-[13px] text-[#989494]">컴퓨터알고리즘</p>
            <span
              className="text-[12px] font-bold text-white rounded-full px-[10px] py-[3px]"
              style={{ backgroundColor: '#ff6b35' }}
            >
              D-5
            </span>
          </div>

          {/* 팀명 */}
          <p className="text-[22px] font-bold text-[#1c1a1c] mb-[10px]">알고리즘 설계 팀</p>

          {/* 아바타 + 인원/회의 수 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {avatars.map((av, i) => (
                <div
                  key={av.initial}
                  className="w-[30px] h-[30px] rounded-full border-2 border-white flex items-center justify-center text-white text-[12px] font-medium shrink-0"
                  style={{
                    backgroundColor: av.color,
                    marginLeft: i > 0 ? '-8px' : '0',
                  }}
                >
                  {av.initial}
                </div>
              ))}
            </div>
            <span className="text-[13px] text-[#989494]">9명 · 회의 2회</span>
          </div>

          {/* 약속 이행률 바 */}
          <div
            className="h-[8px] rounded-full overflow-hidden mb-[6px]"
            style={{ backgroundColor: '#e8deff' }}
          >
            <div className="h-full rounded-full bg-[#7b2fbe]" style={{ width: '30%' }} />
          </div>
          <p className="text-[12px] text-[#989494]">약속 이행률 30%</p>
        </div>

        {/* 완료된 팀 카드 (흐리게 표시) */}
        <div className="rounded-2xl px-[18px] py-[18px]" style={{ backgroundColor: '#ebebeb' }}>
          <p className="text-[13px] mb-1" style={{ color: '#c0c0c0' }}>데이터베이스</p>
          <p className="text-[22px] font-bold mb-1" style={{ color: '#c0c0c0' }}>
            DB 설계 프로젝트
          </p>
          <p className="text-[13px]" style={{ color: '#c0c0c0' }}>
            진행 완료 · 최종 리포트 저장됨
          </p>
        </div>

        {/* 새 팀플 만들기 카드 */}
        <button
          onClick={onNewTeam}
          className="bg-white rounded-2xl px-[18px] py-[22px] border-2 border-dashed border-[#d0d0d0] flex items-center justify-center text-[16px] text-[#989494] cursor-pointer hover:border-[#7b2fbe] hover:text-[#7b2fbe] transition-colors"
        >
          + 새 팀플 만들기
        </button>
      </div>

      {/* 하단 내비게이션 */}
      <BottomNav activeTab="home" onTabPress={onTabPress} />
    </div>
  );
}
