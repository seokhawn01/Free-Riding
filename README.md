# 무임승차 방지 AI 서비스

> **"누가 얼마나 말했는가"가 아닌, "누가 실제로 팀플에 얼마나 기여했는가"를 분석합니다.**

팀 프로젝트에서 흔히 발생하는 두 가지 문제를 AI로 해결합니다.
- 회의 때 "제가 할게요"라고 했지만 실제로 이행하지 않는 팀원
- 말은 적었지만 핵심 질문·문제 제기·정리를 담당한 팀원의 기여가 묻히는 현상

**라이브 서비스**: [free-riding.vercel.app](https://free-riding.vercel.app)

---

## 핵심 기능

### 1. 질적 기여도 카드
단순 발언량이 아닌 **팀 결과에 영향을 준 의미 있는 행동**을 6가지 유형으로 분류합니다.

| 유형 | 예시 발화 | 점수 |
|------|----------|:----:|
| 실행 약속 | "제가 ~까지 하겠습니다" | 20점 |
| 아이디어 제안 | "~하는 방안을 제안합니다" | 16점 |
| 문제 제기 | "하지만 ~한 리스크가 있습니다" | 16점 |
| 핵심 질문 | "왜?", "어떻게?" | 16점 |
| 논의 정리 | "정리하자면 ~라는 뜻이군요" | 16점 |
| 의사결정 기여 | "그럼 A안으로 최종 결정하겠습니다" | 16점 |

### 2. 약속 카드 (실행 약속 추적)
AI가 회의 후 자동으로 추출합니다.
- **누가 · 무엇을 · 언제까지** 하기로 했는지 카드 형태로 정리
- 완료 여부 체크 기능

### 3. 화자 매핑
음성 파일에서 화자를 자동 분리한 뒤, 발언 내용을 확인하고 팀원을 직접 연결합니다.
- 각 화자의 질적 기여 발언 최대 4개 미리보기
- 팀원 드롭다운으로 매핑
- 과감지 화자는 "이 화자 무시"로 처리

### 4. 최종 기여도 리포트
팀 프로젝트 종료 시 확인할 수 있는 종합 요약
- 팀원별 기여 점수 및 비율
- 유형별 기여 분포

---

## AI 분석 방식

### 화용론 기반 분류
발화의 언어적 패턴으로 기여 유형을 자동 판별합니다.

| 패턴 | 분류 결과 |
|------|----------|
| 제안형 어미 (`어떨까요?`, `제안합니다`) | 아이디어 제안 |
| 부정 키워드 + 논거 (`하지만`, `리스크`) | 문제 제기 |
| 열린 질문 (`왜?`, `어떻게?`) | 핵심 질문 |
| 핵심 키워드 재사용 + 연결어 (`정리하자면`) | 논의 정리 |
| 확정 표현 + 동의 유도 | 의사결정 기여 |
| 미래 지향·자기 주도 문장 (`제가 ~하겠습니다`) | 실행 약속 |

### 퓨샷 프롬프팅
6가지 유형별 실제 회의 예시 발화를 모델에 제공해 분류 정확도를 향상시킵니다.

---

## 요금제

| 구분 | 전사 모델 | 분석 모델 | 예상 비용 (회의당) |
|------|----------|----------|:------------------:|
| 일반 | gpt-4o-mini-transcribe | gpt-4o-mini | 약 300원 |
| 고성능 | gpt-4o-transcribe | GPT-5 / GPT-5.5 | 약 1,200원 |

> 환율 1,400원 기준

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 |
| 아이콘 | lucide-react |
| 백엔드 | FastAPI (Python) |
| DB / 인증 | Supabase (PostgreSQL + Auth) |
| AI 전사 | OpenAI gpt-4o-mini-transcribe / gpt-4o-transcribe |
| AI 분석 | gpt-4o-mini / GPT-5 |
| 프론트 배포 | Vercel |
| 백엔드 배포 | Railway |

---

## 시작하기

### 요구사항
- Node.js 18+
- Python 3.11+

### 프론트엔드 실행

```bash
git clone https://github.com/your-username/free-riding.git
cd free-riding
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 확인.

### 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

`.env` 파일에 다음 환경변수 필요:

```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_JWT_SECRET=...
```

---

## 프로젝트 구조

```
free-riding/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── LoginScreen.tsx           # 로그인
│   ├── HomeScreen.tsx            # 팀 목록 홈
│   ├── CreateTeamScreen.tsx      # 팀 생성
│   ├── MeetingAnalysisScreen.tsx # 회의 업로드
│   ├── AiAnalysisScreen.tsx      # AI 분석 대기
│   ├── SpeakerMappingScreen.tsx  # 화자 확인 및 매핑
│   ├── ContributionCardScreen.tsx
│   ├── PromiseCardScreen.tsx
│   ├── TeamContributionScreen.tsx
│   ├── FinalReportScreen.tsx
│   └── BottomNav.tsx
├── lib/
│   ├── api.ts                    # API 클라이언트
│   ├── types.ts                  # TypeScript 타입
│   └── supabase.ts
├── backend/
│   ├── main.py
│   ├── schemas.py
│   ├── auth.py
│   ├── database.py
│   ├── routers/
│   │   ├── teams.py
│   │   ├── meetings.py
│   │   ├── promises.py
│   │   └── reports.py
│   └── services/
│       └── ai_service.py         # OpenAI 파이프라인
└── scripts/
    └── analyze.py                # 로컬 테스트용 스크립트
```
