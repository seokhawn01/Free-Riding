'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowUp, Music } from 'lucide-react';
import BottomNav from './BottomNav';

type Tab = 'file' | 'realtime';

export default function MeetingAnalysisScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('file');

  return (
    <div className="flex flex-col flex-1 h-screen">
      {/* 헤더 */}
      <header className="flex items-center px-3 py-4 bg-white border-b-2 border-[#7b2fbe]">
        <button className="p-1 w-9">
          <ArrowLeft size={28} color="#1c1a1c" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-[#1c1a1c] -mr-9">
          회의 분석
        </h1>
      </header>

      {/* 탭 바 */}
      <div className="flex bg-white border-b border-gray-200">
        <button
          onClick={() => setActiveTab('file')}
          className="relative flex-1 py-3 text-base font-bold cursor-pointer"
          style={{ color: activeTab === 'file' ? '#7b2fbe' : '#1c1a1c' }}
        >
          파일첨부
          {activeTab === 'file' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7b2fbe]" />
          )}
        </button>

        <span className="w-px bg-[#1c1a1c] my-2" />

        <button
          onClick={() => setActiveTab('realtime')}
          className="relative flex-1 py-3 text-base font-bold cursor-pointer"
          style={{ color: activeTab === 'realtime' ? '#7b2fbe' : '#1c1a1c' }}
        >
          실시간 녹음
          {activeTab === 'realtime' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7b2fbe]" />
          )}
        </button>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* 파일 업로드 영역 */}
        <div
          className="rounded-xl flex flex-col items-center py-12 bg-[#f5f5f5]"
          style={{
            border: '2px dashed #cbc7c7',
          }}
        >
          <ArrowUp size={40} color="#1c1a1c" />
          <button className="mt-5 px-6 py-2 border border-[#1c1a1c] rounded-xl text-base font-bold text-[#1c1a1c] cursor-pointer hover:bg-gray-50 transition-colors">
            파일 선택
          </button>
        </div>

        {/* 선택된 파일 카드 */}
        <div className="mt-4 rounded-xl border border-gray-200 flex items-center p-3 gap-3">
          <div className="w-12 h-12 rounded-md bg-[#e8f0fe] flex items-center justify-center shrink-0">
            <Music size={24} color="#4285f4" />
          </div>
          <div>
            <p className="text-sm text-[#1c1a1c]">meeting_0512.mp4</p>
            <p className="text-xs text-[#989494] mt-1">45분&nbsp;&nbsp;124MB</p>
          </div>
        </div>

        {/* AI 분석 시작 버튼 */}
        <button className="mt-6 w-full bg-[#1c1a1c] rounded-xl py-4 text-xl font-bold text-white cursor-pointer hover:bg-black transition-colors">
          AI 분석 시작
        </button>
      </div>

      {/* 하단 내비게이션 */}
      <BottomNav activeTab="recording" />
    </div>
  );
}
