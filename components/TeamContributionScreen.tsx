'use client';

import { ArrowLeft, Check } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  initial: string;
  avatarColor: string;
  contributions: string;
  agreed: boolean;
}

const members: TeamMember[] = [
  {
    id: 1,
    name: '김민준',
    initial: '김',
    avatarColor: '#5BBFA4',
    contributions: '아이디어 x2, 의사결정 x1, 실행약속x1',
    agreed: true,
  },
  {
    id: 2,
    name: '이서연',
    initial: '이',
    avatarColor: '#E8A87C',
    contributions: '문제제기 x2, 실행약속 x1',
    agreed: false,
  },
  {
    id: 3,
    name: '박도현',
    initial: '박',
    avatarColor: '#A78BDA',
    contributions: '핵심질문 x2, 논의정리 x1',
    agreed: false,
  },
  {
    id: 4,
    name: '최지우',
    initial: '최',
    avatarColor: '#7BB4D0',
    contributions: '논의정리 x1, 실행약속 x1',
    agreed: false,
  },
];

function MemberCard({ member }: { member: TeamMember }) {
  const agreed = member.agreed;
  const cardBg = agreed ? '#ebffec' : '#f5f5f5';
  const cardBorder = agreed ? '#21a74e' : '#1c1a1c';

  return (
    <div
      className="flex items-center h-[73px] px-4 rounded-[11px]"
      style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
    >
      {/* 아바타 원형 */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white text-[20px] mr-3"
        style={{ backgroundColor: member.avatarColor }}
      >
        {member.initial}
      </div>

      {/* 이름 + 기여 목록 */}
      <div className="flex-1 min-w-0">
        <p className="text-[20px] text-black leading-snug">{member.name}</p>
        <p className="text-[13px] text-[#767676]">{member.contributions}</p>
      </div>

      {/* 동의 여부 뱃지 */}
      {agreed ? (
        <div className="w-8 h-8 rounded-full bg-[#21a74e] flex items-center justify-center shrink-0">
          <Check size={16} color="white" strokeWidth={3} />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full border border-[#c8c8c8] shrink-0" />
      )}
    </div>
  );
}

interface TeamContributionScreenProps {
  onBack?: () => void;
  onConfirm?: () => void;
}

export default function TeamContributionScreen({ onBack, onConfirm }: TeamContributionScreenProps) {
  return (
    <div className="flex flex-col flex-1 h-screen">
      {/* 헤더 */}
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9" onClick={onBack}>
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">
          팀원 기여 확인
        </h1>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-y-auto px-[17px] py-5 flex flex-col gap-[11px]">
        {/* 안내 배너 */}
        <div
          className="rounded-[11px] px-4 py-3"
          style={{ backgroundColor: '#f9f9e9', border: '1px dashed #989494' }}
        >
          <p className="text-[17px] text-[#737373] leading-relaxed">
            AI가 분류한 기여카드를 확인하고 동의해주세요.
            <br />
            이의가 있으면 수정 요청이 가능합니다.
          </p>
        </div>

        {/* 팀원 카드 목록 */}
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>

      {/* 하단 확인 버튼 */}
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
