'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BottomNav, { TabName } from './BottomNav';
import { reportsApi } from '@/lib/api';
import type { Report, ContributionType } from '@/lib/types';

const TYPE_LABEL: Record<ContributionType, string> = {
  idea: '아이디어 제안', problem: '문제제기', question: '핵심질문',
  summary: '논의정리', decision: '의사결정', promise: '실행약속',
};

const TYPE_COLORS: Record<ContributionType, string> = {
  idea: '#3a7bd5', problem: '#e84040', question: '#f5a623',
  summary: '#7c4dff', decision: '#4caf82', promise: '#e65100',
};

const BAR_COLORS = ['#3a7bd5', '#4caf82', '#f5a623', '#e84040', '#7c4dff', '#F06292'];

interface FinalReportScreenProps {
  teamId: string | null;
  onBack?: () => void;
  onTabPress?: (tab: TabName) => void;
}

export default function FinalReportScreen({ teamId, onBack, onTabPress }: FinalReportScreenProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) { setLoading(false); return; }
    reportsApi.get(teamId)
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [teamId]);

  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9" onClick={onBack}>
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">
          최종 기여 리포트
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-[26px] py-5 flex flex-col gap-5">
        {loading && <p className="text-center text-sm text-[#989494] mt-10">불러오는 중...</p>}

        {!loading && !report && (
          <p className="text-center text-sm text-[#989494] mt-10">
            리포트 데이터가 없습니다. 먼저 회의를 분석해주세요.
          </p>
        )}

        {report && (
          <>
            {/* 팀 정보 */}
            <div className="rounded-[11px] border border-[#d0d0d0] px-4 py-3">
              <p className="text-[15px] font-bold text-[#1c1a1c]">{report.team_name}</p>
              <p className="text-[12px] text-[#989494] mt-1 leading-relaxed">
                {report.subject} · 회의 {report.meeting_count}회
                <br />
                이행률 {report.promise_completion_rate}% · 마감 {report.deadline}
              </p>
            </div>

            {/* 개인별 기여도 */}
            <div>
              <p className="text-[15px] text-[#1c1a1c] mb-[14px]">개인별 기여도</p>
              <div className="flex flex-col gap-[11px]">
                {report.member_contributions.map((m, i) => (
                  <div key={m.member_name} className="flex items-center gap-[10px]">
                    <span className="text-[15px] font-bold text-black w-[48px] shrink-0">
                      {m.member_name}
                    </span>
                    <div className="flex-1 h-[20px] rounded-sm bg-[#e8e8e8] relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-sm flex items-center justify-end pr-[6px]"
                        style={{
                          width: `${m.percentage}%`,
                          backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                        }}
                      >
                        <span className="text-[10px] text-white leading-none">{m.percentage}%</span>
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
                {(Object.entries(report.type_distribution) as [ContributionType, number][]).map(
                  ([type, count]) => {
                    const color = TYPE_COLORS[type] || '#989494';
                    return (
                      <span
                        key={type}
                        className="rounded-full px-4 py-[6px] text-[16px]"
                        style={{
                          color,
                          border: `1.5px solid ${color}`,
                          backgroundColor: `${color}1a`,
                        }}
                      >
                        {TYPE_LABEL[type] || type} {count}
                      </span>
                    );
                  },
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav activeTab="report" onTabPress={onTabPress} />
    </div>
  );
}
