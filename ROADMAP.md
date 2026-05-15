# 무임승차 방지 AI — 프로젝트 로드맵

> 마지막 업데이트: 2026-05-15

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
| 경량 | `gpt-4o-mini-transcribe` | `gpt-4o-mini` (→ GPT-5 mini로 교체 예정) | ~300원 |
| 고성능 | `gpt-4o-transcribe` | GPT-5.5 | ~1,200원 |

---

## 현재 완료된 것 ✅

- [x] PRD.md 작성 (기획서)
- [x] 자료 조사.pdf 분석 — 화행 이론·3대 관점·AI 판단 로직 도출
- [x] `scripts/analyze.py` 생성 — 경량 파이프라인 완성
  - gpt-4o-mini-transcribe 전사 (MP3 직접 전송, WAV 변환 불필요)
  - gpt-4o-mini 질적 기여도 분석
  - 한글 인코딩 수정 (`sys.stdout.reconfigure`)
  - API 키 환경변수 처리 (`OPENAI_API_KEY`)
- [x] 프롬프트 설계 완료 (아래 참고)
- [x] 샘플 오디오로 시연 성공

---

## 프롬프트 설계 완료 내용

`scripts/analyze.py` 내 `SYSTEM_PROMPT` + `FEW_SHOT` 에 반영됨.

**System Prompt 구성**
- 역할 부여: "회의 조력자 + 인사평가 전문가"
- 화행 이론 적용: 오스틴·존 설, 5대 범주(단언·지시·**언약**·표현·선언)
- 3대 분석 관점: 언어적 / 관계적(다음 발화 반응 추적) / 구조적(전환점 위치)
- 6가지 유형별 AI 판단 로직 + 포함/제외 기준

**6가지 유형 점수**

| 유형 | 점수 | 핵심 판단 포인트 |
|------|------|----------------|
| 아이디어 제안 | 16점 | 의미적 신규성 + 제안형 어미 |
| 문제 제기 | 16점 | 부정 키워드 + 논리적 근거 (둘 다 필수) |
| 핵심 질문 | 16점 | 열린 질문 + 이후 논의 활성화 여부 |
| 논의 정리 | 16점 | 이전 키워드 재사용 + 연결어 |
| 의사결정 기여 | 16점 | 확정적 표현 + 동의 유도 |
| **실행 약속** | **20점** | 언약(Commissive) — 자기 자신의 미래 행동 선언 |

**퓨샷 예시**: 유형별 positive/negative 사례 포함 (역할 분담 선언도 실행 약속으로 처리)

---

## 남은 작업 🔲

### 즉시 해야 할 것
- [ ] 사용자가 직접 `scripts/analyze.py` 실행 테스트
  ```bash
  set OPENAI_API_KEY=sk-proj-...
  python scripts/analyze.py "오디오파일.mp3"
  ```
- [ ] OpenAI API 키 재발급 (채팅에 노출됨)

### 단기 (기능 구현)
- [ ] 고성능 버전 스크립트 추가 (`scripts/analyze_pro.py`)
  - 전사: `gpt-4o-transcribe`
  - 분석: GPT-5.5 (출시 후 모델 ID 확인 필요)
- [ ] 화자 분리(Speaker Diarization) 연동
  - 현재 화자 구분이 "화자1/화자2" 수준 → 실제 이름 매핑 필요
  - 방안: pyannote.audio 또는 AssemblyAI API 검토
- [ ] `.env` 파일로 API 키 관리 (`.gitignore` 추가)

### 중기 (서비스 연동)
- [ ] Next.js 프론트엔드 — 파일 업로드 UI
- [ ] API 라우트 (`/api/analyze`) — analyze.py 로직을 Next.js API로 이식
- [ ] 기여도 카드 UI 컴포넌트
- [ ] 약속 카드 UI 컴포넌트
- [ ] Vercel 배포 (현재 `free-riding.vercel.app` 운영 중)

---

## 파일 구조

```
free-riding/
├── PRD.md                  # 기획서
├── ROADMAP.md              # 이 파일
├── scripts/
│   └── analyze.py          # 경량 파이프라인 (완성)
└── app/                    # Next.js (미연동)
```

**참고 파일 위치**
- 샘플 오디오: `c:/Users/sh088/Downloads/대학생할과 자기계발- 2조 영어발표 1차회의 영상 - University of Ulsan Macroecon.mp3`
- 자료 조사: `c:/Users/sh088/OneDrive/Desktop/무임승차/자료 조사.pdf`

---

## 알려진 이슈

| 이슈 | 원인 | 해결책 |
|------|------|--------|
| `verbose_json` 미지원 | gpt-4o-mini-transcribe 제약 | `response_format="text"` 사용 (적용 완료) |
| 화자 이름 불명확 | Speaker Diarization 미구현 | 단기 과제로 분류 |
| GPT-5 mini 모델 ID 미확정 | 출시 예정 모델 | 출시 후 `ANALYSIS_MODEL` 상수만 변경하면 됨 |
