import os
import json
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from database import get_supabase

load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

TRANSCRIBE_MODELS = {
    "standard": "gpt-4o-mini-transcribe",
    "premium": "gpt-4o-transcribe",
}

ANALYSIS_MODELS = {
    "standard": "gpt-5-mini",
    "premium": "gpt-5.5",
}

SYSTEM_PROMPT = """당신은 한국어 팀 회의 전사본을 분석하여 각 발언을 6가지 기여 유형으로 분류하는 전문가입니다.

⚠️ 중요: speaker 필드에는 전사본에 표기된 화자 레이블(예: 화자1, 화자2)을 반드시 그대로 사용하세요.
임의로 이름을 추론하거나 변경하지 마세요.

[분류 기준 - 화용론 기반]
1. idea (아이디어 제안, 16점): "~하면 어떨까요?", "~방안을 제안합니다" 등 새로운 아이디어를 제안하는 발언
2. problem (문제제기, 16점): "하지만", "다만", "리스크" 등 부정적 키워드 + 논리적 근거로 문제를 제기하는 발언
3. question (핵심질문, 16점): "왜?", "어떻게?" 등 팀 논의를 심화시키는 열린 질문
4. summary (논의정리, 16점): "결국 ~이군요", "정리하자면" + 이전 발화 핵심어 재사용으로 논의를 정리하는 발언
5. decision (의사결정, 16점): "~로 최종 결정", "이견 없으면 확정" 등 확정적 표현으로 의사결정을 이끄는 발언
6. promise (실행약속, 20점): "제가 ~까지 하겠습니다" 등 자기 주도적이고 구체적인 실행 약속

[퓨샷 예시]
발화: "캐시 알고리즘을 LRU 대신 LFU로 바꾸면 성능이 좋아질 것 같아요"
→ speaker: "화자1", type: "idea", score: 16

발화: "현재 구현에서 동시성 처리가 제대로 안 되고 있어요"
→ speaker: "화자2", type: "problem", score: 16

발화: "로그인 보장이 안 될 경우 어떻게 처리할 건가요?"
→ speaker: "화자1", type: "question", score: 16

발화: "결국 LFU 방식으로 재구현하고 다음 주까지 테스트하자는 거죠?"
→ speaker: "화자3", type: "summary", score: 16

발화: "그럼 LFU 방식으로 최종 결정하겠습니다. 이견 없으시죠?"
→ speaker: "화자2", type: "decision", score: 16

발화: "제가 목요일까지 캐시 모듈 재구현하겠습니다"
→ speaker: "화자1", type: "promise", score: 20

[중요 규칙]
- 의미 없는 단순 발언("네", "알겠어요" 등)은 포함하지 마세요
- 하나의 발언이 여러 유형에 해당하면 가장 두드러진 유형 하나만 선택하세요
- promise 유형의 발언은 반드시 promises 배열에도 포함하세요

[출력 형식 - 반드시 유효한 JSON]
{
  "contributions": [
    {
      "speaker": "화자1",
      "content": "발언 내용",
      "type": "idea|problem|question|summary|decision|promise",
      "score": 16
    }
  ],
  "promises": [
    {
      "speaker": "화자1",
      "task": "할 일 내용",
      "due_date": "YYYY-MM-DD 또는 null"
    }
  ]
}"""


def transcribe_audio(audio_file_path: str, model_type: str) -> str:
    model = TRANSCRIBE_MODELS.get(model_type, "whisper-1")
    with open(audio_file_path, "rb") as f:
        response = client.audio.transcriptions.create(
            model=model,
            file=f,
            language="ko",
            response_format="text",
        )
    return response


def analyze_transcript(transcript: str, model_type: str) -> dict:
    model = ANALYSIS_MODELS.get(model_type, "gpt-4o-mini")

    user_message = f"""다음은 팀 회의 전사본입니다.

전사본:
{transcript}

위 전사본에서 의미 있는 기여 발언을 분류하고, 실행 약속을 추출해주세요.
speaker 필드에는 전사본의 화자 레이블(화자1, 화자2 등)을 그대로 사용하세요."""

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_object"},
    )

    return json.loads(response.choices[0].message.content)


async def process_meeting(meeting_id: str, audio_path: str, model_type: str):
    """전사 + 분석 후 speaker_analysis에 저장. 카드 저장은 화자 매핑 확인 후 별도 수행."""
    db = get_supabase()

    try:
        # 전사
        db.table("meetings").update({"status": "transcribing"}).eq("id", meeting_id).execute()
        transcript = await asyncio.to_thread(transcribe_audio, audio_path, model_type)

        # 분석 (화자 레이블 그대로 유지)
        db.table("meetings").update({
            "status": "analyzing",
            "transcript": transcript,
        }).eq("id", meeting_id).execute()

        analysis = await asyncio.to_thread(analyze_transcript, transcript, model_type)

        # 중간 결과 저장 → 사용자 화자 매핑 대기
        db.table("meetings").update({
            "status": "pending_speaker_mapping",
            "speaker_analysis": json.dumps(analysis, ensure_ascii=False),
        }).eq("id", meeting_id).execute()

    except Exception as e:
        db.table("meetings").update({
            "status": "failed",
            "error_message": str(e),
        }).eq("id", meeting_id).execute()
        raise
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)
