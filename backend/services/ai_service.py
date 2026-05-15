import os
import json
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

[분류 기준 - 화용론 기반]
1. idea (아이디어 제안, 16점): "~하면 어떨까요?", "~방안을 제안합니다" 등 새로운 아이디어를 제안하는 발언
2. problem (문제제기, 16점): "하지만", "다만", "리스크" 등 부정적 키워드 + 논리적 근거로 문제를 제기하는 발언
3. question (핵심질문, 16점): "왜?", "어떻게?" 등 팀 논의를 심화시키는 열린 질문
4. summary (논의정리, 16점): "결국 ~이군요", "정리하자면" + 이전 발화 핵심어 재사용으로 논의를 정리하는 발언
5. decision (의사결정, 16점): "~로 최종 결정", "이견 없으면 확정" 등 확정적 표현으로 의사결정을 이끄는 발언
6. promise (실행약속, 20점): "제가 ~까지 하겠습니다" 등 자기 주도적이고 구체적인 실행 약속

[퓨샷 예시]
발화: "캐시 알고리즘을 LRU 대신 LFU로 바꾸면 성능이 좋아질 것 같아요"
→ type: "idea", score: 16

발화: "현재 구현에서 동시성 처리가 제대로 안 되고 있어요"
→ type: "problem", score: 16

발화: "로그인 보장이 안 될 경우 어떻게 처리할 건가요?"
→ type: "question", score: 16

발화: "결국 LFU 방식으로 재구현하고 다음 주까지 테스트하자는 거죠?"
→ type: "summary", score: 16

발화: "그럼 LFU 방식으로 최종 결정하겠습니다. 이견 없으시죠?"
→ type: "decision", score: 16

발화: "제가 목요일까지 캐시 모듈 재구현하겠습니다"
→ type: "promise", score: 20

[중요 규칙]
- 의미 없는 단순 발언("네", "알겠어요" 등)은 포함하지 마세요
- 하나의 발언이 여러 유형에 해당하면 가장 두드러진 유형 하나만 선택하세요
- promise 유형의 발언은 반드시 promises 배열에도 포함하세요

[출력 형식 - 반드시 유효한 JSON]
{
  "contributions": [
    {
      "speaker": "발언자 이름",
      "content": "발언 내용",
      "type": "idea|problem|question|summary|decision|promise",
      "score": 16
    }
  ],
  "promises": [
    {
      "speaker": "담당자 이름",
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


def analyze_transcript(transcript: str, member_names: list[str], model_type: str) -> dict:
    model = ANALYSIS_MODELS.get(model_type, "gpt-4o-mini")
    member_list = ", ".join(member_names)

    user_message = f"""다음은 팀 회의 전사본입니다. 팀원 목록: {member_list}

전사본:
{transcript}

위 전사본에서 의미 있는 기여 발언을 분류하고, 실행 약속을 추출해주세요."""

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    return json.loads(response.choices[0].message.content)


async def process_meeting(meeting_id: str, audio_path: str, model_type: str, member_names: list[str]):
    """회의 분석 전체 파이프라인 (백그라운드 실행)"""
    db = get_supabase()

    try:
        # 전사 시작
        db.table("meetings").update({"status": "transcribing"}).eq("id", meeting_id).execute()
        transcript = transcribe_audio(audio_path, model_type)

        # 분석 시작
        db.table("meetings").update({
            "status": "analyzing",
            "transcript": transcript,
        }).eq("id", meeting_id).execute()

        analysis = analyze_transcript(transcript, member_names, model_type)

        # 팀원 ID 매핑
        meeting_row = db.table("meetings").select("team_id").eq("id", meeting_id).single().execute()
        team_id = meeting_row.data["team_id"]
        members_rows = db.table("team_members").select("id, member_name").eq("team_id", team_id).execute()
        member_map = {m["member_name"]: m["id"] for m in members_rows.data}

        # 기여도 카드 저장
        for item in analysis.get("contributions", []):
            speaker = item["speaker"]
            member_id = member_map.get(speaker)
            if not member_id:
                # 가장 비슷한 이름 찾기
                for name, mid in member_map.items():
                    if speaker in name or name in speaker:
                        member_id = mid
                        break
            if not member_id:
                continue

            db.table("contribution_cards").insert({
                "meeting_id": meeting_id,
                "team_member_id": member_id,
                "contribution_type": item["type"],
                "content": item["content"],
                "score": item["score"],
            }).execute()

        # 약속 카드 저장
        for promise in analysis.get("promises", []):
            speaker = promise["speaker"]
            member_id = member_map.get(speaker)
            if not member_id:
                for name, mid in member_map.items():
                    if speaker in name or name in speaker:
                        member_id = mid
                        break
            if not member_id:
                continue

            db.table("promise_cards").insert({
                "meeting_id": meeting_id,
                "team_member_id": member_id,
                "task_title": promise["task"],
                "due_date": promise.get("due_date"),
            }).execute()

        # 완료
        from datetime import datetime, timezone
        db.table("meetings").update({
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", meeting_id).execute()

    except Exception as e:
        db.table("meetings").update({
            "status": "failed",
            "error_message": str(e),
        }).eq("id", meeting_id).execute()
        raise
    finally:
        # 임시 파일 삭제
        if os.path.exists(audio_path):
            os.remove(audio_path)
