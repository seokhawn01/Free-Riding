---
name: project-free-riding
description: 무임승차 방지 서비스 핵심 아키텍처 및 결정 사항
metadata:
  type: project
---

팀 프로젝트 회의 녹음을 업로드하면 AI가 전사(Whisper) → 분석(LLM) → 기여도/약속 카드를 자동 생성하는 서비스.

핵심 파이프라인: `process_meeting()` (ai_service.py) — BackgroundTasks로 비동기 실행.
상태 머신: pending → transcribing → analyzing → completed | failed.
DB: Supabase (meetings, team_members, contribution_cards, promise_cards 테이블).
인증: Supabase JWT → `auth.py`의 `get_current_user` 의존성 주입.

**Why:** 팀 무임승차 문제를 정량적 기여도 데이터로 해결하려는 학술/프로젝트 서비스.
**How to apply:** 파이프라인 안정성(에러 → failed 상태 기록)과 팀원 이름 매핑 정확도가 핵심 품질 지표.
