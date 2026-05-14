'use client';

import { ArrowLeft } from 'lucide-react';
import BottomNav, { TabName } from './BottomNav';

interface Member {
  name: string;
  percentage: number;
  barColor: string;
}

const members: Member[] = [
  { name: '김민준', percentage: 38, barColor: '#3a7bd5' },
  { name: '이서연', percentage: 28, barColor: '#4caf82' },
  { name: '박도현', percentage: 22, barColor: '#f5a623' },
  { name: '최지우', percentage: 12, barColor: '#e84040' },
];

interface ContributionBadge {
  label: string;
  count: number;
  color: string;
}

const contributionBadges: ContributionBadge[] = [
  { label: '아이디어 제안', count: 3, color: '#3a7bd5' },
  { label: '문제제기',      count: 2, color: '#e84040' },
  { label: '핵심질문',      count: 2, color: '#f5a623' },
  { label: '논의정리',      count: 2, color: '#7c4dff' },
  { label: '의사결정',      count: 1, color: '#4caf82' },
  { label: '실행약속',      count: 4, color: '#f5a623' },
];

interface FinalReportScreenProps {
  onBack?: () => void;
  onTabPress?: (tab: TabName) => void;
}

export default function FinalReportScreen({ onBack, onTabPress }: FinalReportScreenProps) {
  return (
    <div className="flex flex-col flex-1 h-screen">
      {/* 헤더 */}
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9" onClick={onBack}>
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">
          최종 기여 리포트
        </h1>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-y-auto px-[26px] py-5 flex flex-col gap-5">
        {/* 팀 정보 카드 */}
        <div className="rounded-[11px] border border-[#d0d0d0] px-4 py-3">
          <p className="text-[15px] font-bold text-[#1c1a1c]">알고리즘 설계팀</p>
          <p className="text-[12px] text-[#989494] mt-1 leading-relaxed">
            컴퓨터알고리즘.회의 2회.역속 8건
            <br />
            이행률 62%.마감 D-5
          </p>
        </div>

        {/* 개인별 기여도 */}
        <div>
          <p className="text-[15px] text-[#1c1a1c] mb-[14px]">개인별 기여도</p>
          <div className="flex flex-col gap-[11px]">
            {members.map((m) => (
              <div key={m.name} className="flex items-center gap-[10px]">
                <span className="text-[15px] font-bold text-black w-[48px] shrink-0">
                  {m.name}
                </span>
                <div className="flex-1 h-[20px] rounded-sm bg-[#e8e8e8] relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-sm flex items-center justify-end pr-[6px]"
                    style={{ width: `${m.percentage}%`, backgroundColor: m.barColor }}
                  >
                    <span className="text-[10px] text-white leading-none">
                      {m.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 기여 유형 분포 */}
        <div>
          <p className="text-[15px] text-[#1c1a1c] mb-[14px]">기여 유형 분포</p>
          <div className="flex flex-wrap gap-[10px]">
            {contributionBadges.map((badge) => (
              <span
                key={badge.label}
                className="rounded-full px-4 py-[6px] text-[16px]"
                style={{
                  color: badge.color,
                  border: `1.5px solid ${badge.color}`,
                  backgroundColor: `${badge.color}1a`,
                }}
              >
                {badge.label} {badge.count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 내비게이션 */}
      <BottomNav activeTab="report" onTabPress={onTabPress} />
    </div>
  );
}
