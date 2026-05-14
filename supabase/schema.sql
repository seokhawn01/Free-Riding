-- 무임승차 방지 서비스 DB 스키마
-- Supabase SQL Editor에서 순서대로 실행하세요

-- 팀 테이블
CREATE TABLE IF NOT EXISTS teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  subject     TEXT NOT NULL,
  deadline    DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 팀원 테이블
CREATE TABLE IF NOT EXISTS team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 회의 테이블
CREATE TABLE IF NOT EXISTS meetings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id          UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  audio_url        TEXT,
  transcript       TEXT,
  model_type       TEXT DEFAULT 'standard' CHECK (model_type IN ('standard', 'premium')),
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'transcribing', 'analyzing', 'completed', 'failed')),
  error_message    TEXT,
  duration_seconds INTEGER,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

-- 기여도 카드 테이블
CREATE TABLE IF NOT EXISTS contribution_cards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id        UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  team_member_id    UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('idea', 'problem', 'question', 'summary', 'decision', 'promise')),
  content           TEXT NOT NULL,
  score             INTEGER NOT NULL CHECK (score IN (16, 20)),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 약속 카드 테이블
CREATE TABLE IF NOT EXISTS promise_cards (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id     UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  task_title     TEXT NOT NULL,
  due_date       DATE,
  is_completed   BOOLEAN DEFAULT FALSE,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Supabase Storage 버킷 생성 (audio 파일 저장용)
-- Storage > New Bucket > "meeting-audio" (public: false)
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-audio', 'meeting-audio', false)
ON CONFLICT (id) DO NOTHING;
