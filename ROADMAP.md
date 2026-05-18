# 무임승차 방지 AI — 프로젝트 로드맵

> 마지막 업데이트: 2026-05-18

---

## 서비스 개요

팀 프로젝트 회의 녹음을 AI로 분석하여 **"누가 실제로 얼마나 기여했는가"** 를 측정하는 서비스.
단순 발언량이 아닌 6가지 질적 기여 유형으로 분류하고 점수화.

**핵심 기능 3가지**
1. **질적 기여도 카드** — 6가지 유형 분류 + 점수
2. **약속 카드** — AI가 자동 추출한 실행 약속 목록
3. **최종 기여도 분석** — 팀플 종료 시 전체 요약

---

## 모델 계획 (두 버전)

| 구분 | 전사 모델 | 분석 LLM | 예상 비용 |
|------|----------|----------|----------|
| 일반 | `gpt-4o-mini-transcribe` | `gpt-4o-mini` | ~300원 |
| 고성능 | `gpt-4o-transcribe` | `gpt-5` / GPT-5.5 | ~1,200원 |

---

## 완료된 것 ✅

### 기반 설계
- [x] PRD.md 작성 (기획서)
- [x] 자료 조사.pdf 분석 — 화행 이론·3대 관점·AI 판단 로직 도출
- [x] 프롬프트 설계 완료 (화용론 기반 분류 + 퓨샷 예시)
- [x] `scripts/analyze.py` 생성 — 로컬 경량 파이프라인 (파일 기반)

### 인프라 & 배포
- [x] Supabase DB 스키마 설계 및 구축
- [x] FastAPI 백엔드 구현 (`backend/`) — Railway 배포 완료
  - URL: `https://free-riding-production.up.railway.app`
- [x] Next.js 16 프론트엔드 — Vercel 배포 완료
  - URL: `https://free-riding.vercel.app`
- [x] Supabase Auth 연동 (JWT 기반 인증)
- [x] `.env` 환경변수 관리 (Railway/Vercel 환경변수 설정)

### 백엔드 API (FastAPI)
- [x] `POST /teams` — 팀 생성
- [x] `GET /teams` — 팀 목록 조회
- [x] `GET /teams/{id}` — 팀 상세 조회
- [x] `POST /teams/{id}/complete` — 팀 완료 처리
- [x] `POST /teams/{team_id}/meetings/upload` — 오디오 파일 업로드 + 백그라운드 AI 분석
- [x] `GET /meetings/{id}/status` — 분석 상태 폴링
- [x] `GET /meetings/{id}/contributions` — 기여도 카드 조회
- [x] `GET /meetings/{id}/promises` — 회의별 약속 카드 조회
- [x] `GET /meetings/{id}/speakers` — 화자 목록 + 기여 발언 내용 조회
- [x] `POST /meetings/{id}/speaker-mapping` — 화자 → 팀원 매핑 적용
- [x] `GET /promises/teams/{id}/promises` — 팀 전체 약속 목록
- [x] `PATCH /promises/{id}/complete` — 약속 완료 처리
- [x] `GET /teams/{id}/report` — 최종 기여도 리포트

### AI 파이프라인
- [x] gpt-4o-mini-transcribe / gpt-4o-transcribe 전사 (두 모델 선택 가능)
- [x] gpt-4o-mini / gpt-5 분석 (model_type으로 분기)
- [x] 화자 분리 — OpenAI 내장 화자 레이블(`화자1`, `화자2`, ...) 방식 채택
- [x] speaker_analysis JSONB로 원본 분석 결과 보존 → 화자 매핑 후 카드 생성
- [x] `pending_speaker_mapping` 상태를 통한 2-phase 처리 흐름

### 프론트엔드 화면 (Next.js 16)
- [x] 로그인 화면 (`LoginScreen.tsx`) — Supabase Auth
- [x] 홈 화면 (`HomeScreen.tsx`) — 팀 목록
- [x] 팀 생성 화면 (`CreateTeamScreen.tsx`)
- [x] 회의 업로드 화면 (`MeetingAnalysisScreen.tsx`) — 파일 선택 + 모델 선택
- [x] AI 분석 대기 화면 (`AiAnalysisScreen.tsx`) — 상태 폴링
- [x] 화자 매핑 화면 (`SpeakerMappingScreen.tsx`)
  - 화자별 질적 기여 발언 내용 카드 표시 (최대 4개)
  - 팀원 드롭다운 매핑
  - "이 화자 무시" 옵션 (과감지 화자 처리)
  - 무시된 화자는 opacity-40 + "무시됨" 뱃지 표시
- [x] 기여도 카드 화면 (`ContributionCardScreen.tsx`)
- [x] 약속 카드 화면 (`PromiseCardScreen.tsx`) — 완료 체크 기능
- [x] 팀 기여도 화면 (`TeamContributionScreen.tsx`)
- [x] 최종 리포트 화면 (`FinalReportScreen.tsx`)
- [x] 하단 탭 내비게이션 (`BottomNav.tsx`)

---

## 남은 작업 🔲

### 안정성
- [ ] OpenAI API 키 재발급 (이전 키 채팅에 노출됨)
- [ ] 화자 분리 정확도 개선
  - 현재: gpt-4o-mini-transcribe → 과소 감지 (3명 → 실제 4명)
  - 현재: gpt-4o-transcribe → 과다 감지 (5명 → 실제 4명)
  - "이 화자 무시" 옵션으로 과다 감지는 우선 대응 완료
  - 장기: pyannote.audio 또는 AssemblyAI 연동 검토

### 기능 추가
- [ ] 약속 카드 기한 알림 (due_date 기반 푸시/이메일)
- [ ] 기여도 점수 시각화 강화 (차트, 그래프)
- [ ] 회의 목록 화면 (팀별 회의 히스토리)
- [ ] 고성능 버전 별도 스크립트 (`scripts/analyze_pro.py`) — 로컬 실행용

### 개선
- [ ] 폴링 방식 → 웹소켓 또는 SSE로 교체 (분석 완료 실시간 알림)
- [ ] 에러 핸들링 강화 (분석 실패 시 재시도 UI)

---

## 파일 구조

```
free-riding/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── CreateTeamScreen.tsx
│   ├── MeetingAnalysisScreen.tsx
│   ├── AiAnalysisScreen.tsx
│   ├── SpeakerMappingScreen.tsx      ← 화자 확인 + 매핑 + 무시
│   ├── ContributionCardScreen.tsx
│   ├── PromiseCardScreen.tsx
│   ├── TeamContributionScreen.tsx
│   ├── FinalReportScreen.tsx
│   └── BottomNav.tsx
├── lib/
│   ├── api.ts                         ← API 클라이언트
│   ├── types.ts                       ← TypeScript 타입 정의
│   └── supabase.ts                    ← Supabase 클라이언트
├── backend/
│   ├── main.py
│   ├── schemas.py
│   ├── database.py
│   ├── auth.py
│   ├── routers/
│   │   ├── teams.py
│   │   ├── meetings.py
│   │   ├── promises.py
│   │   └── reports.py
│   └── services/
│       └── ai_service.py             ← OpenAI 전사 + 분석 파이프라인
├── scripts/
│   └── analyze.py                    ← 로컬 테스트용 파이프라인
├── PRD.md
├── ROADMAP.md
└── README.md
```

---

## 알려진 이슈

| 이슈 | 원인 | 해결책 |
|------|------|--------|
| `verbose_json` 미지원 | gpt-4o-mini-transcribe 제약 | `response_format="text"` 사용 (적용 완료) |
| 화자 과소 감지 (일반 모델) | gpt-4o-mini-transcribe 정확도 한계 | "이 화자 무시" 기능으로 부분 대응 |
| 화자 과다 감지 (고성능 모델) | gpt-4o-transcribe 과민 감지 | "이 화자 무시" 기능으로 초과 화자 처리 |
| GPT-5 mini 모델 ID 불안정 | 출시 직후 | `ANALYSIS_MODEL` 상수만 변경하면 됨 |
