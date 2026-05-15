'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) setError(authError.message);
    } else {
      const { error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) {
        setError(authError.message);
      } else {
        setEmailSent(true);
      }
    }

    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 gap-4">
        <div className="w-16 h-16 rounded-full bg-[#f0e6ff] flex items-center justify-center text-3xl">
          ✉️
        </div>
        <h2 className="text-xl font-bold text-[#1c1a1c]">이메일을 확인해주세요</h2>
        <p className="text-sm text-[#989494] text-center leading-relaxed">
          {email}으로 인증 메일을 보냈습니다.
          <br />
          메일함을 확인하고 링크를 클릭해 인증을 완료해주세요.
        </p>
        <button
          onClick={() => { setEmailSent(false); setMode('login'); }}
          className="mt-4 text-sm text-[#7b2fbe] font-medium underline"
        >
          로그인 화면으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* 헤더 */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#7b2fbe] flex items-center justify-center mb-4">
          <span className="text-white text-2xl font-bold">무</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1c1a1c]">무임승차 방지</h1>
        <p className="text-sm text-[#989494] mt-1">팀 프로젝트 기여도 AI 분석 서비스</p>
      </div>

      {/* 탭 */}
      <div className="flex mx-6 mb-6 rounded-xl overflow-hidden bg-[#f5f5f5] p-1">
        {(['login', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-white text-[#7b2fbe] shadow-sm'
                : 'text-[#989494]'
            }`}
          >
            {m === 'login' ? '로그인' : '회원가입'}
          </button>
        ))}
      </div>

      {/* 폼 */}
      <div className="flex flex-col gap-3 mx-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#1c1a1c]">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] text-sm outline-none focus:border-[#7b2fbe] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#1c1a1c]">비밀번호</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력"
              className="w-full px-4 py-3 pr-11 rounded-xl border border-[#e0e0e0] text-sm outline-none focus:border-[#7b2fbe] transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#989494]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {mode === 'signup' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#1c1a1c]">비밀번호 확인</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 재입력"
              className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] text-sm outline-none focus:border-[#7b2fbe] transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
            />
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-2 w-full py-3 rounded-xl bg-[#7b2fbe] text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
        >
          {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </button>
      </div>
    </div>
  );
}
