---
name: recurring-issues
description: 이 프로젝트에서 첫 리뷰 시 발견된 안티패턴 및 취약점 목록
metadata:
  type: feedback
---

## 인증/인가
- status/contributions/promises 조회 엔드포인트에 인증 미적용 → meeting_id만 알면 누구나 접근 가능.
- 팀 소속 여부 검증 없이 meeting_id로 직접 데이터 조회 허용 (인가 부재).

## 퍼지 매칭
- 팀원 이름 매핑에 단순 substring 매칭 사용 (`speaker in name or name in speaker`).
- "김민준", "김민" 처럼 이름이 겹칠 때 잘못된 팀원에 기여도 귀속 가능.
- 기여도/약속 카드 두 곳에 동일 로직 중복.

## 백그라운드 파이프라인
- contribution_cards, promise_cards 개별 insert가 원자적이지 않음 — 중간 실패 시 partial 데이터 잔류.
- 파이프라인 실패 후 `raise`로 예외 재전파하지만 BackgroundTasks 컨텍스트에서 무시됨.
- `import datetime`이 함수 내부에서 지연 import됨 (모듈 상단으로 이동 필요).

## LLM 파싱
- `json.loads(response.choices[0].message.content)` — response_format=json_object라도 파싱 실패 가능.
- score 필드 유효성 검증 없이 DB에 그대로 insert.

## 프론트엔드
- `getStatus` 폴링이 탭 비활성화/컴포넌트 언마운트 시에도 계속 실행됨 (취소 메커니즘 없음).
- `promisesApi.listByTeam` URL이 `/promises/teams/{teamId}/promises`로 중복 경로 가능성 있음.

**How to apply:** 향후 리뷰에서 위 항목들이 수정되었는지 우선 확인.
