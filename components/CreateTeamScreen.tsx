'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { teamsApi } from '@/lib/api';

interface CreateTeamScreenProps {
  onBack?: () => void;
  onCreate?: (teamId: string) => void;
}

export default function CreateTeamScreen({ onBack, onCreate }: CreateTeamScreenProps) {
  const [subject, setSubject] = useState('');
  const [teamName, setTeamName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addMember = () => {
    const name = memberInput.trim();
    if (name && !members.includes(name)) {
      setMembers((prev) => [...prev, name]);
      setMemberInput('');
    }
  };

  const removeMember = (name: string) => {
    setMembers((prev) => prev.filter((m) => m !== name));
  };

  const handleCreate = async () => {
    if (!subject || !teamName || !deadline || members.length === 0) {
      setError('모든 항목을 입력하고 팀원을 1명 이상 추가해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const team = await teamsApi.create({
        name: teamName,
        subject,
        deadline,
        members,
      });
      onCreate?.(team.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : '팀 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9" onClick={onBack}>
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">
          팀플 만들기
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        <div>
          <label className="block text-[15px] font-semibold text-[#1c1a1c] mb-2">과목명</label>
          <input
            type="text"
            placeholder="예) 컴퓨터알고리즘"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-[#d0d0d0] rounded-xl px-4 py-3 text-[15px] text-[#1c1a1c] placeholder:text-[#c8c8c8] outline-none focus:border-[#7b2fbe] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-[#1c1a1c] mb-2">팀명</label>
          <input
            type="text"
            placeholder="예) 알고리즘 설계팀"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full border border-[#d0d0d0] rounded-xl px-4 py-3 text-[15px] text-[#1c1a1c] placeholder:text-[#c8c8c8] outline-none focus:border-[#7b2fbe] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-[#1c1a1c] mb-2">마감일</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border border-[#d0d0d0] rounded-xl px-4 py-3 text-[15px] text-[#1c1a1c] outline-none focus:border-[#7b2fbe] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-[#1c1a1c] mb-2">팀원 추가</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="이름 입력"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addMember(); }}
              className="flex-1 border border-[#d0d0d0] rounded-xl px-4 py-3 text-[15px] text-[#1c1a1c] placeholder:text-[#c8c8c8] outline-none focus:border-[#7b2fbe] transition-colors"
            />
            <button
              onClick={addMember}
              className="w-12 h-12 rounded-xl border border-[#d0d0d0] flex items-center justify-center shrink-0 hover:border-[#7b2fbe] transition-colors"
            >
              <Plus size={20} color="#1c1a1c" />
            </button>
          </div>

          {members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <span
                  key={m}
                  className="flex items-center gap-1 px-3 py-[6px] rounded-full border border-[#d0d0d0] text-[14px] text-[#1c1a1c] bg-white"
                >
                  {m}
                  <button
                    onClick={() => removeMember(m)}
                    className="text-[#989494] hover:text-[#1c1a1c] leading-none ml-[2px]"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>

      <div className="px-6 pb-8 pt-4">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-[#1c1a1c] rounded-xl py-4 text-xl font-bold text-white cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
        >
          {loading ? '생성 중...' : '팀플 생성하기'}
        </button>
      </div>
    </div>
  );
}
