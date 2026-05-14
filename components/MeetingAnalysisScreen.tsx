'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, ArrowUp, Music } from 'lucide-react';
import BottomNav, { TabName } from './BottomNav';
import { meetingsApi } from '@/lib/api';

type Tab = 'file' | 'realtime';

interface MeetingAnalysisScreenProps {
  teamId: string | null;
  onAnalysisStart?: (meetingId: string) => void;
  onTabPress?: (tab: TabName) => void;
}

export default function MeetingAnalysisScreen({ teamId, onAnalysisStart, onTabPress }: MeetingAnalysisScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState<'standard' | 'premium'>('standard');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  };

  const handleStart = async () => {
    if (!teamId) {
      setError('팀을 먼저 선택해주세요.');
      return;
    }
    if (!selectedFile) {
      setError('파일을 선택해주세요.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const result = await meetingsApi.upload(teamId, selectedFile, modelType);
      onAnalysisStart?.(result.meeting_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : '업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen">
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
        {(['file', 'realtime'] as Tab[]).map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative flex-1 py-3 text-base font-bold cursor-pointer"
            style={{ color: activeTab === tab ? '#7b2fbe' : '#1c1a1c' }}
          >
            {tab === 'file' ? '파일첨부' : '실시간 녹음'}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7b2fbe]" />
            )}
            {i === 0 && <span className="absolute right-0 top-2 bottom-2 w-px bg-[#1c1a1c]" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'file' ? (
          <>
            {/* 파일 업로드 영역 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl flex flex-col items-center py-12 bg-[#f5f5f5] border-2 border-dashed border-[#cbc7c7] cursor-pointer hover:border-[#7b2fbe] transition-colors"
            >
              <ArrowUp size={40} color="#1c1a1c" />
              <span className="mt-5 px-6 py-2 border border-[#1c1a1c] rounded-xl text-base font-bold text-[#1c1a1c]">
                파일 선택
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* 선택된 파일 */}
            {selectedFile && (
              <div className="mt-4 rounded-xl border border-gray-200 flex items-center p-3 gap-3">
                <div className="w-12 h-12 rounded-md bg-[#e8f0fe] flex items-center justify-center shrink-0">
                  <Music size={24} color="#4285f4" />
                </div>
                <div>
                  <p className="text-sm text-[#1c1a1c]">{selectedFile.name}</p>
                  <p className="text-xs text-[#989494] mt-1">{formatSize(selectedFile.size)}</p>
                </div>
              </div>
            )}

            {/* 모델 선택 */}
            <div className="mt-4 flex gap-3">
              {(['standard', 'premium'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setModelType(type)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors"
                  style={{
                    borderColor: modelType === type ? '#7b2fbe' : '#d0d0d0',
                    color: modelType === type ? '#7b2fbe' : '#989494',
                    backgroundColor: modelType === type ? '#f0e8ff' : 'white',
                  }}
                >
                  {type === 'standard' ? '⚡ 일반 (~300원)' : '✨ 고성능 (~1200원)'}
                </button>
              ))}
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <button
              onClick={handleStart}
              disabled={uploading || !selectedFile}
              className="mt-6 w-full bg-[#1c1a1c] rounded-xl py-4 text-xl font-bold text-white cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
            >
              {uploading ? '업로드 중...' : 'AI 분석 시작'}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-[#989494]">
            <p className="text-base">실시간 녹음은 준비 중입니다.</p>
          </div>
        )}
      </div>

      <BottomNav activeTab="recording" onTabPress={onTabPress} />
    </div>
  );
}
