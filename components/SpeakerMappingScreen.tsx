'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { meetingsApi, teamsApi } from '@/lib/api';
import type { TeamMember, SpeakerWithContributions, ContributionType } from '@/lib/types';

interface SpeakerMappingScreenProps {
  meetingId: string | null;
  teamId: string | null;
  onBack?: () => void;
  onComplete?: () => void;
}

const TYPE_LABEL: Record<ContributionType, { emoji: string; label: string }> = {
  idea:     { emoji: '💡', label: '아이디어' },
  problem:  { emoji: '🔴', label: '문제 제기' },
  question: { emoji: '❓', label: '질문' },
  summary:  { emoji: '📋', label: '요약' },
  decision: { emoji: '✅', label: '결정' },
  promise:  { emoji: '📌', label: '약속' },
};

export default function SpeakerMappingScreen({ meetingId, teamId, onBack, onComplete }: SpeakerMappingScreenProps) {
  const [speakers, setSpeakers] = useState<SpeakerWithContributions[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!meetingId || !teamId) return;
    Promise.all([
      meetingsApi.getSpeakers(meetingId),
      teamsApi.get(teamId),
    ]).then(([speakersRes, team]) => {
      setSpeakers(speakersRes.speakers);
      setMembers(team.members);
      const initial: Record<string, string> = {};
      speakersRes.speakers.forEach((s, i) => {
        if (team.members[i]) initial[s.label] = team.members[i].id;
      });
      setMapping(initial);
    }).catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [meetingId, teamId]);

  const allMapped = speakers.length > 0 && speakers.every((s) => !!mapping[s.label]);

  const handleSubmit = async () => {
    if (!meetingId || !allMapped) return;
    setSubmitting(true);
    setError('');
    try {
      await meetingsApi.applySpeakerMapping(meetingId, mapping);
      onComplete?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9" onClick={onBack}>
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">화자 확인</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-[17px] py-5 flex flex-col gap-5">
        <div className="rounded-[11px] px-4 py-3 bg-[#f9f9e9] border border-dashed border-[#989494]">
          <p className="text-[15px] text-[#737373] leading-relaxed">
            아래 발언 내용을 확인하고 각 화자가 팀원 중 누구인지 선택해주세요.
          </p>
        </div>

        {loading && <p className="text-center text-sm text-[#989494] mt-6">불러오는 중...</p>}

        {speakers.map((speaker) => (
          <div key={speaker.label} className="flex flex-col gap-3 border border-[#e0dede] rounded-[14px] p-4">
            <p className="text-[18px] font-bold text-[#1c1a1c]">{speaker.label}</p>

            {/* 발언 내용 카드 */}
            <div className="flex flex-col gap-2">
              {speaker.contributions.slice(0, 4).map((c, i) => {
                const meta = TYPE_LABEL[c.type as ContributionType] ?? { emoji: '•', label: c.type };
                return (
                  <div key={i} className="flex gap-2 items-start bg-[#f9f9f9] rounded-[8px] px-3 py-2">
                    <span className="text-[13px] shrink-0 mt-[1px]">{meta.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] text-[#7b2fbe] font-semibold mr-1">{meta.label}</span>
                      <span className="text-[13px] text-[#444] leading-snug line-clamp-2">{c.content}</span>
                    </div>
                  </div>
                );
              })}
              {speaker.contributions.length > 4 && (
                <p className="text-[12px] text-[#989494] text-right">외 {speaker.contributions.length - 4}개 발언</p>
              )}
            </div>

            {/* 팀원 매핑 드롭다운 */}
            <select
              value={mapping[speaker.label] || ''}
              onChange={(e) => setMapping((prev) => ({ ...prev, [speaker.label]: e.target.value }))}
              className="w-full border border-[#cbc7c7] rounded-[11px] px-4 py-3 text-[16px] text-[#1c1a1c] bg-white cursor-pointer"
            >
              <option value="">팀원 선택</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.member_name}</option>
              ))}
            </select>
          </div>
        ))}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>

      <div className="px-[17px] pb-8 pt-4">
        <button
          onClick={handleSubmit}
          disabled={!allMapped || submitting}
          className="w-full bg-[#7b2fbe] rounded-[6px] py-[13px] text-[20px] font-semibold text-white cursor-pointer hover:bg-[#6a28a5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '처리 중...' : '확인'}
        </button>
      </div>
    </div>
  );
}
