'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { meetingsApi, teamsApi } from '@/lib/api';
import type { TeamMember } from '@/lib/types';

interface SpeakerMappingScreenProps {
  meetingId: string | null;
  teamId: string | null;
  onBack?: () => void;
  onComplete?: () => void;
}

export default function SpeakerMappingScreen({ meetingId, teamId, onBack, onComplete }: SpeakerMappingScreenProps) {
  const [speakers, setSpeakers] = useState<string[]>([]);
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
        if (team.members[i]) initial[s] = team.members[i].id;
      });
      setMapping(initial);
    }).catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [meetingId, teamId]);

  const allMapped = speakers.length > 0 && speakers.every((s) => !!mapping[s]);

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

      <div className="flex-1 overflow-y-auto px-[17px] py-5 flex flex-col gap-4">
        <div className="rounded-[11px] px-4 py-3 bg-[#f9f9e9] border border-dashed border-[#989494]">
          <p className="text-[17px] text-[#737373] leading-relaxed">
            녹음에서 구분된 화자를 팀원과 연결해주세요.
          </p>
        </div>

        {loading && <p className="text-center text-sm text-[#989494] mt-6">불러오는 중...</p>}

        {speakers.map((speaker) => (
          <div key={speaker} className="flex flex-col gap-2">
            <p className="text-[18px] font-bold text-[#1c1a1c]">{speaker}</p>
            <select
              value={mapping[speaker] || ''}
              onChange={(e) => setMapping((prev) => ({ ...prev, [speaker]: e.target.value }))}
              className="w-full border border-[#cbc7c7] rounded-[11px] px-4 py-3 text-[17px] text-[#1c1a1c] bg-white cursor-pointer"
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
