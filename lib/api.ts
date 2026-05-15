import type { Team, MeetingStatusResponse, ContributionCard, PromiseCard, Report, SpeakerWithContributions } from './types';
import { supabase } from './supabase';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API 오류 (${res.status})`);
  }
  return res.json();
}

// 팀 API
export const teamsApi = {
  list: () => request<Team[]>('/teams'),

  get: (teamId: string) => request<Team>(`/teams/${teamId}`),

  create: (data: { name: string; subject: string; deadline: string; members: string[] }) =>
    request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  complete: (teamId: string) =>
    request<{ message: string }>(`/teams/${teamId}/complete`, { method: 'POST' }),
};

// 회의 API
export const meetingsApi = {
  upload: async (teamId: string, file: File, modelType: 'standard' | 'premium' = 'standard') => {
    const authHeaders = await getAuthHeaders();
    const form = new FormData();
    form.append('audio', file);
    form.append('model_type', modelType);
    const res = await fetch(`${BASE_URL}/teams/${teamId}/meetings/upload`, {
      method: 'POST',
      headers: authHeaders,
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `업로드 오류 (${res.status})`);
    }
    return res.json() as Promise<{ meeting_id: string; status: string }>;
  },

  getStatus: (meetingId: string) =>
    request<MeetingStatusResponse>(`/meetings/${meetingId}/status`),

  getContributions: (meetingId: string) =>
    request<ContributionCard[]>(`/meetings/${meetingId}/contributions`),

  getPromises: (meetingId: string) =>
    request<PromiseCard[]>(`/meetings/${meetingId}/promises`),

  getSpeakers: (meetingId: string) =>
    request<{ speakers: SpeakerWithContributions[] }>(`/meetings/${meetingId}/speakers`),

  applySpeakerMapping: (meetingId: string, mapping: Record<string, string>) =>
    request<{ status: string }>(`/meetings/${meetingId}/speaker-mapping`, {
      method: 'POST',
      body: JSON.stringify({ mapping }),
    }),
};

// 약속 카드 API
export const promisesApi = {
  listByTeam: (teamId: string) =>
    request<PromiseCard[]>(`/promises/teams/${teamId}/promises`),

  updateComplete: (promiseId: string, isCompleted: boolean) =>
    request<{ message: string }>(`/promises/${promiseId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed: isCompleted }),
    }),
};

// 리포트 API
export const reportsApi = {
  get: (teamId: string) => request<Report>(`/teams/${teamId}/report`),
};

// 분석 완료까지 폴링 (2초 간격, 최대 5분)
export async function pollMeetingStatus(
  meetingId: string,
  onStatusChange?: (status: string) => void,
): Promise<MeetingStatusResponse> {
  const MAX_ATTEMPTS = 150;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const result = await meetingsApi.getStatus(meetingId);
    onStatusChange?.(result.status);

    if (result.status === 'completed' || result.status === 'failed' || result.status === 'pending_speaker_mapping') {
      return result;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('분석 시간이 초과되었습니다');
}
