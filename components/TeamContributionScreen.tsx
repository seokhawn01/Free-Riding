'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { meetingsApi } from '@/lib/api';
import type { ContributionCard } from '@/lib/types';

const TYPE_LABEL: Record<string, string> = {
  idea: '아이디어 제안', problem: '문제제기', question: '핵심질문',
  summary: '논의정리', decision: '의사결정', promise: '실행약속',
};

const AVATAR_COLORS = ['#5BBFA4', '#E8A87C', '#A78BDA', '#7BB4D0', '#F06292'];

interface TeamContributionScreenProps {
  meetingId: string | null;
  onBack?: () => void;
  onConfirm?: () => void;
}

export default function TeamContributionScreen({ meetingId, onBack, onConfirm }: TeamContributionScreenProps) {
  const [cards, setCards] = useState<ContributionCard[]>([]);
  const [agreed, setAgreed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meetingId) { setLoading(false); return; }
    meetingsApi.getContributions(meetingId)
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [meetingId]);

  // 팀원별 기여 요약
  const memberMap = cards.reduce<Record<string, string[]>>((acc, c) => {
    if (!acc[c.member_name]) acc[c.member_name] = [];
    acc[c.member_name].push(TYPE_LABEL[c.contribution_type] || c.contribution_type);
    return acc;
  }, {});

  const members = Object.entries(memberMap).map(([name, types], i) => ({
    name,
    contributions: types.map((t) => t).join(', '),
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }));

  const toggleAgree = (name: string) => {
    setAgreed((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9" onClick={onBack}>
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">
          팀원 기여 확인
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-[17px] py-5 flex flex-col gap-[11px]">
        <div className="rounded-[11px] px-4 py-3 bg-[#f9f9e9] border border-dashed border-[#989494]">
          <p className="text-[17px] text-[#737373] leading-relaxed">
            AI가 분류한 기여카드를 확인하고 동의해주세요.
            <br />이의가 있으면 수정 요청이 가능합니다.
          </p>
        </div>

        {loading && <p className="text-center text-sm text-[#989494] mt-6">불러오는 중...</p>}

        <div className="flex flex-col gap-3">
          {members.map((m) => {
            const isAgreed = agreed.has(m.name);
            return (
              <button
                key={m.name}
                onClick={() => toggleAgree(m.name)}
                className="flex items-center h-[73px] px-4 rounded-[11px] w-full text-left"
                style={{
                  backgroundColor: isAgreed ? '#ebffec' : '#f5f5f5',
                  border: `1px solid ${isAgreed ? '#21a74e' : '#1c1a1c'}`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white text-[20px] mr-3"
                  style={{ backgroundColor: m.color }}
                >
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[20px] text-black leading-snug">{m.name}</p>
                  <p className="text-[13px] text-[#767676] truncate">{m.contributions}</p>
                </div>
                {isAgreed ? (
                  <div className="w-8 h-8 rounded-full bg-[#21a74e] flex items-center justify-center shrink-0">
                    <Check size={16} color="white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border border-[#c8c8c8] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-[17px] pb-8 pt-4">
        <button
          onClick={onConfirm}
          className="w-full bg-[#7b2fbe] rounded-[6px] py-[13px] text-[20px] font-semibold text-white cursor-pointer hover:bg-[#6a28a5] transition-colors"
        >
          내 기여 확인, 동의
        </button>
      </div>
    </div>
  );
}
