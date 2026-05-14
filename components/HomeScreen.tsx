'use client';

import { useEffect, useState } from 'react';
import BottomNav, { TabName } from './BottomNav';
import { teamsApi } from '@/lib/api';
import type { Team } from '@/lib/types';

interface HomeScreenProps {
  onNewTeam?: () => void;
  onTabPress?: (tab: TabName) => void;
  onSelectTeam?: (teamId: string) => void;
}

const AVATAR_COLORS = ['#5BBFA4', '#E8A87C', '#A78BDA', '#7BB4D0', '#F06292', '#FFB74D'];

function dday(deadline: string): string {
  const diff = Math.ceil(
    (new Date(deadline).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000,
  );
  if (diff === 0) return 'D-DAY';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export default function HomeScreen({ onNewTeam, onTabPress, onSelectTeam }: HomeScreenProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teamsApi.list()
      .then(setTeams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = teams.filter((t) => !t.is_completed);
  const done = teams.filter((t) => t.is_completed);

  return (
    <div className="flex flex-col flex-1 h-screen">
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

      <div className="flex-1 overflow-y-auto bg-[#f5f5f5] px-[17px] py-4 flex flex-col gap-3">
        {loading && (
          <p className="text-center text-sm text-[#989494] mt-10">불러오는 중...</p>
        )}

        {/* 활성 팀 */}
        {active.map((team) => (
          <button
            key={team.id}
            onClick={() => onSelectTeam?.(team.id)}
            className="bg-white rounded-2xl px-[18px] py-[18px] shadow-sm text-left w-full"
          >
            <div className="flex items-start justify-between mb-1">
              <p className="text-[13px] text-[#989494]">{team.subject}</p>
              <span className="text-[12px] font-bold text-white rounded-full px-[10px] py-[3px] bg-[#ff6b35]">
                {dday(team.deadline)}
              </span>
            </div>

            <p className="text-[22px] font-bold text-[#1c1a1c] mb-[10px]">{team.name}</p>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {team.members.slice(0, 4).map((m, i) => (
                  <div
                    key={m.id}
                    className="w-[30px] h-[30px] rounded-full border-2 border-white flex items-center justify-center text-white text-[12px] font-medium shrink-0"
                    style={{
                      backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
                      marginLeft: i > 0 ? '-8px' : '0',
                    }}
                  >
                    {m.member_name[0]}
                  </div>
                ))}
              </div>
              <span className="text-[13px] text-[#989494]">
                {team.members.length}명 · 회의 {team.meeting_count}회
              </span>
            </div>

            <div className="h-[8px] rounded-full overflow-hidden bg-[#e8deff] mb-[6px]">
              <div
                className="h-full rounded-full bg-[#7b2fbe]"
                style={{ width: `${team.promise_completion_rate}%` }}
              />
            </div>
            <p className="text-[12px] text-[#989494]">
              약속 이행률 {team.promise_completion_rate}%
            </p>
          </button>
        ))}

        {/* 완료된 팀 */}
        {done.map((team) => (
          <div key={team.id} className="rounded-2xl px-[18px] py-[18px] bg-[#ebebeb]">
            <p className="text-[13px] mb-1 text-[#c0c0c0]">{team.subject}</p>
            <p className="text-[22px] font-bold mb-1 text-[#c0c0c0]">{team.name}</p>
            <p className="text-[13px] text-[#c0c0c0]">진행 완료 · 최종 리포트 저장됨</p>
          </div>
        ))}

        {!loading && teams.length === 0 && (
          <p className="text-center text-sm text-[#989494] mt-10">
            아직 팀플이 없습니다. 새로 만들어보세요!
          </p>
        )}

        <button
          onClick={onNewTeam}
          className="bg-white rounded-2xl px-[18px] py-[22px] border-2 border-dashed border-[#d0d0d0] flex items-center justify-center text-[16px] text-[#989494] cursor-pointer hover:border-[#7b2fbe] hover:text-[#7b2fbe] transition-colors"
        >
          + 새 팀플 만들기
        </button>
      </div>

      <BottomNav activeTab="home" onTabPress={onTabPress} />
    </div>
  );
}
