'use client';

import { ArrowLeft, Check } from 'lucide-react';
import BottomNav, { TabName } from './BottomNav';

interface PromiseTask {
  id: number;
  title: string;
  dday: string;
  assignee: string;
  completed: boolean;
}

const tasks: PromiseTask[] = [
  { id: 1, title: '캐시 모뮬 LFU방식으로 재구현', dday: 'D-DAY', assignee: '김민준', completed: true },
  { id: 2, title: '동시성 이슈 원인 분석 및 보고', dday: 'D-2',   assignee: '이서연', completed: true },
  { id: 3, title: '알고리즘 시간복잡도 검증 문...',  dday: 'D-9',   assignee: '박도현', completed: false },
  { id: 4, title: '다음 회의 일정 조율 및 공지',    dday: 'D-10',  assignee: '박도현', completed: false },
];

const completionRate = Math.round(
  (tasks.filter((t) => t.completed).length / tasks.length) * 100
);

function TaskCard({ task }: { task: PromiseTask }) {
  const done = task.completed;
  const cardBg     = done ? '#ebffec' : '#e2e2e2';
  const cardBorder = done ? '#2da433' : '#9b9b9b';
  const titleColor = done ? '#218643' : '#646363';
  const badgeBg    = done ? '#2da433' : '#9b9b9b';

  return (
    <div
      className="flex items-center h-[70px] px-4 rounded-[11px]"
      style={{ backgroundColor: cardBg, border: `1.5px solid ${cardBorder}` }}
    >
      {/* 할 일 제목 + 담당자 */}
      <div className="flex-1 min-w-0 mr-3">
        <div className="flex items-baseline gap-2">
          <p
            className="text-[16px] font-semibold flex-1 min-w-0 truncate"
            style={{
              color: titleColor,
              textDecoration: done ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </p>
          <span className="text-[14px] font-semibold text-[#ff5e5e] shrink-0">
            {task.dday}
          </span>
        </div>
        <p className="text-[13px] text-[#989494]">담당: {task.assignee}</p>
      </div>

      {/* 완료 체크 서클 */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: badgeBg }}
      >
        <Check size={16} color="white" strokeWidth={3} />
      </div>
    </div>
  );
}

interface PromiseCardScreenProps {
  onBack?: () => void;
  onTabPress?: (tab: TabName) => void;
}

export default function PromiseCardScreen({ onBack, onTabPress }: PromiseCardScreenProps) {
  return (
    <div className="flex flex-col flex-1 h-screen">
      {/* 헤더 */}
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9" onClick={onBack}>
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">
          약속 카드
        </h1>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-y-auto px-[23px] py-5 flex flex-col gap-4">
        {/* 섹션 제목 */}
        <p className="text-[20px] font-semibold text-black">
          회의에서 확정된 약속 사항
        </p>

        {/* 전체 이행률 카드 */}
        <div
          className="rounded-[11px] border-2 border-[#7b2fbe] px-4 py-4"
          style={{ backgroundColor: '#e5dbff' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[18px] font-semibold text-[#7b2fbe]">전체 이행률</span>
            <span className="text-[15px] text-[#7b2fbe]">{completionRate}%</span>
          </div>
          {/* 프로그레스 바 */}
          <div className="relative h-[11px] rounded-full bg-[#d9d9d9]">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${completionRate}%`,
                background: 'linear-gradient(to right, #7b2fbe, #a855f7)',
              }}
            />
          </div>
        </div>

        {/* 구분선 */}
        <hr className="border-t border-[#d9d9d9]" />

        {/* 약속 카드 목록 */}
        <div className="flex flex-col gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* 하단 내비게이션 */}
      <BottomNav activeTab="card" onTabPress={onTabPress} />
    </div>
  );
}
