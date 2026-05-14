'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import BottomNav, { TabName } from './BottomNav';
import { promisesApi } from '@/lib/api';
import type { PromiseCard } from '@/lib/types';

interface PromiseCardScreenProps {
  teamId: string | null;
  onBack?: () => void;
  onTabPress?: (tab: TabName) => void;
}

function dday(dueDateStr: string | null): string {
  if (!dueDateStr) return '';
  const diff = Math.ceil(
    (new Date(dueDateStr).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000,
  );
  if (diff === 0) return 'D-DAY';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export default function PromiseCardScreen({ teamId, onBack, onTabPress }: PromiseCardScreenProps) {
  const [promises, setPromises] = useState<PromiseCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) { setLoading(false); return; }
    promisesApi.listByTeam(teamId)
      .then(setPromises)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [teamId]);

  const toggleComplete = async (promise: PromiseCard) => {
    const updated = !promise.is_completed;
    setPromises((prev) =>
      prev.map((p) => (p.id === promise.id ? { ...p, is_completed: updated } : p)),
    );
    try {
      await promisesApi.updateComplete(promise.id, updated);
    } catch {
      // 실패 시 롤백
      setPromises((prev) =>
        prev.map((p) => (p.id === promise.id ? { ...p, is_completed: promise.is_completed } : p)),
      );
    }
  };

  const completed = promises.filter((p) => p.is_completed).length;
  const rate = promises.length ? Math.round((completed / promises.length) * 100) : 0;

  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9" onClick={onBack}>
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">
          약속 카드
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-[23px] py-5 flex flex-col gap-4">
        <p className="text-[20px] font-semibold text-black">회의에서 확정된 약속 사항</p>

        {/* 이행률 카드 */}
        <div className="rounded-[11px] border-2 border-[#7b2fbe] px-4 py-4 bg-[#e5dbff]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[18px] font-semibold text-[#7b2fbe]">전체 이행률</span>
            <span className="text-[15px] text-[#7b2fbe]">{rate}%</span>
          </div>
          <div className="relative h-[11px] rounded-full bg-[#d9d9d9]">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${rate}%`,
                background: 'linear-gradient(to right, #7b2fbe, #a855f7)',
              }}
            />
          </div>
        </div>

        <hr className="border-t border-[#d9d9d9]" />

        {loading && <p className="text-center text-sm text-[#989494]">불러오는 중...</p>}
        {!loading && promises.length === 0 && (
          <p className="text-center text-sm text-[#989494]">약속 카드가 없습니다.</p>
        )}

        <div className="flex flex-col gap-4">
          {promises.map((task) => {
            const done = task.is_completed;
            return (
              <button
                key={task.id}
                onClick={() => toggleComplete(task)}
                className="flex items-center h-[70px] px-4 rounded-[11px] w-full text-left"
                style={{
                  backgroundColor: done ? '#ebffec' : '#e2e2e2',
                  border: `1.5px solid ${done ? '#2da433' : '#9b9b9b'}`,
                }}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-baseline gap-2">
                    <p
                      className="text-[16px] font-semibold flex-1 min-w-0 truncate"
                      style={{
                        color: done ? '#218643' : '#646363',
                        textDecoration: done ? 'line-through' : 'none',
                      }}
                    >
                      {task.task_title}
                    </p>
                    {task.due_date && (
                      <span className="text-[14px] font-semibold text-[#ff5e5e] shrink-0">
                        {dday(task.due_date)}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#989494]">담당: {task.member_name}</p>
                </div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: done ? '#2da433' : '#9b9b9b' }}
                >
                  <Check size={16} color="white" strokeWidth={3} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav activeTab="card" onTabPress={onTabPress} />
    </div>
  );
}
