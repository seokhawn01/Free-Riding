'use client';

import { ArrowLeft, Check, Settings } from 'lucide-react';

type StepStatus = 'completed' | 'active' | 'pending';

interface AnalysisStep {
  id: number;
  title: string;
  subtitle: string;
  status: StepStatus;
}

const analysisSteps: AnalysisStep[] = [
  { id: 1, title: '전사', subtitle: '음성 → 텍스트 변환', status: 'completed' },
  { id: 2, title: '화자 분리', subtitle: '발언자 구분 중...', status: 'active' },
  { id: 3, title: '기여 분류', subtitle: '기여 유형 분석', status: 'pending' },
];

// 단계 상태별 스타일 맵
const stepStyleMap: Record<StepStatus, { border: string; badgeBg: string; cardBg: string }> = {
  completed: { border: 'border-[#1abc9c]', badgeBg: 'bg-[#1abc9c]', cardBg: 'bg-[#f5f5f5]' },
  active:    { border: 'border-[#3a7bd5]', badgeBg: 'bg-[#3a7bd5]', cardBg: 'bg-white' },
  pending:   { border: 'border-[#cbc7c7]', badgeBg: 'bg-[#989494]', cardBg: 'bg-[#f5f5f5]' },
};

function StepCard({ step }: { step: AnalysisStep }) {
  const { border, badgeBg, cardBg } = stepStyleMap[step.status];

  return (
    <div className={`flex items-center px-4 py-[14px] rounded-xl border-2 ${border} ${cardBg} gap-3`}>
      {/* 상태 뱃지 */}
      <div className={`w-[37px] h-[37px] rounded-full ${badgeBg} flex items-center justify-center shrink-0`}>
        {step.status === 'completed' ? (
          <Check size={20} color="white" strokeWidth={3} />
        ) : (
          <span className="text-white font-bold text-lg leading-none">{step.id}</span>
        )}
      </div>

      {/* 단계 텍스트 */}
      <div className="flex-1">
        <p className="text-[20px] font-bold text-[#1c1a1c] leading-snug">{step.title}</p>
        <p className="text-[15px] text-[#989494] leading-snug">{step.subtitle}</p>
      </div>

      {/* 진행 중 라벨 */}
      {step.status === 'active' && (
        <span className="text-[15px] text-[#3a7bd5] shrink-0">진행 중</span>
      )}
    </div>
  );
}

interface AiAnalysisScreenProps {
  onBack?: () => void;
  onComplete?: () => void;
}

export default function AiAnalysisScreen({ onBack, onComplete }: AiAnalysisScreenProps) {
  return (
    <div className="flex flex-col flex-1 h-screen">
      {/* 헤더 */}
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9" onClick={onBack}>
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">
          AI 분석중...
        </h1>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-10">
        {/* 코그휠 애니메이션 (점선 원 + 회전 아이콘) */}
        <div className="w-[181px] h-[181px] rounded-full border-[5px] border-dashed border-[#7b2fbe] flex items-center justify-center mb-[69px]">
          <Settings
            size={48}
            className="text-[#7b2fbe] animate-spin"
            style={{ animationDuration: '3s' }}
          />
        </div>

        {/* AI 분석 단계 목록 */}
        <div className="w-full flex flex-col gap-[10px]">
          {analysisSteps.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </div>

        {/* 예상 소요 시간 안내 */}
        <p className="mt-6 text-[15px] text-[#989494] text-center">
          45분 회의 기준 약 2~3분 소요됩니다
        </p>

        {/* 결과 확인 버튼 */}
        <button
          onClick={onComplete}
          className="mt-8 w-full bg-[#7b2fbe] rounded-xl py-4 text-xl font-bold text-white cursor-pointer hover:bg-[#6a28a5] transition-colors"
        >
          분석 결과 확인하기
        </button>
      </div>
    </div>
  );
}
