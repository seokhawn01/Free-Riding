import os
import json
import tempfile
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks, Depends
from schemas import (
    MeetingStatusResponse, ContributionCardResponse, PromiseCardResponse,
    SpeakersResponse, SpeakerMappingRequest,
)
from database import get_supabase
from auth import get_current_user
from services.ai_service import process_meeting

router = APIRouter(tags=["meetings"])


def verify_meeting_owner(meeting_id: str, user_id: str, db) -> None:
    """meeting_id가 현재 유저 소유인지 확인. 아니면 403."""
    row = db.table("meetings").select("teams(user_id)").eq("id", meeting_id).single().execute()
    if not row.data or not row.data.get("teams"):
        raise HTTPException(status_code=404, detail="회의를 찾을 수 없습니다")
    if row.data["teams"]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다")


@router.post("/teams/{team_id}/meetings/upload")
async def upload_meeting(
    team_id: str,
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    model_type: str = Form("standard"),
    user_id: str = Depends(get_current_user),
):
    db = get_supabase()

    # 팀 소유권 확인
    team = db.table("teams").select("id").eq("id", team_id).eq("user_id", user_id).single().execute()
    if not team.data:
        raise HTTPException(status_code=404, detail="팀을 찾을 수 없습니다")

    # 회의 레코드 생성
    meeting = db.table("meetings").insert({
        "team_id": team_id,
        "model_type": model_type,
        "status": "pending",
    }).execute()

    meeting_id = meeting.data[0]["id"]

    # 오디오 파일을 임시 저장
    suffix = os.path.splitext(audio.filename or "audio.mp4")[1] or ".mp4"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    contents = await audio.read()
    tmp.write(contents)
    tmp.close()

    # 백그라운드에서 AI 분석 실행
    background_tasks.add_task(process_meeting, meeting_id, tmp.name, model_type)

    return {"meeting_id": meeting_id, "status": "pending"}


@router.get("/meetings/{meeting_id}/status", response_model=MeetingStatusResponse)
def get_meeting_status(meeting_id: str, user_id: str = Depends(get_current_user)):
    db = get_supabase()

    meeting = (
        db.table("meetings")
        .select("id, status, error_message, teams(user_id)")
        .eq("id", meeting_id)
        .single()
        .execute()
    )
    if not meeting.data or not meeting.data.get("teams"):
        raise HTTPException(status_code=404, detail="회의를 찾을 수 없습니다")
    if meeting.data["teams"]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다")

    return MeetingStatusResponse(
        id=meeting.data["id"],
        status=meeting.data["status"],
        error_message=meeting.data.get("error_message"),
    )


@router.get("/meetings/{meeting_id}/contributions", response_model=list[ContributionCardResponse])
def get_contributions(meeting_id: str, user_id: str = Depends(get_current_user)):
    db = get_supabase()
    verify_meeting_owner(meeting_id, user_id, db)

    rows = (
        db.table("contribution_cards")
        .select("id, contribution_type, content, score, team_members(member_name)")
        .eq("meeting_id", meeting_id)
        .execute()
    )

    return [
        ContributionCardResponse(
            id=r["id"],
            member_name=r["team_members"]["member_name"],
            contribution_type=r["contribution_type"],
            content=r["content"],
            score=r["score"],
        )
        for r in rows.data
    ]


@router.get("/meetings/{meeting_id}/promises", response_model=list[PromiseCardResponse])
def get_meeting_promises(meeting_id: str, user_id: str = Depends(get_current_user)):
    db = get_supabase()
    verify_meeting_owner(meeting_id, user_id, db)

    rows = (
        db.table("promise_cards")
        .select("id, task_title, due_date, is_completed, team_members(member_name)")
        .eq("meeting_id", meeting_id)
        .execute()
    )

    return [
        PromiseCardResponse(
            id=r["id"],
            member_name=r["team_members"]["member_name"],
            task_title=r["task_title"],
            due_date=r.get("due_date"),
            is_completed=r["is_completed"],
        )
        for r in rows.data
    ]


@router.get("/meetings/{meeting_id}/speakers", response_model=SpeakersResponse)
def get_speakers(meeting_id: str, user_id: str = Depends(get_current_user)):
    """분석에서 등장한 고유 화자 레이블 목록 반환 (화자 매핑 UI용)"""
    db = get_supabase()
    verify_meeting_owner(meeting_id, user_id, db)

    row = (
        db.table("meetings")
        .select("status, speaker_analysis")
        .eq("id", meeting_id)
        .single()
        .execute()
    )
    if row.data["status"] != "pending_speaker_mapping":
        raise HTTPException(status_code=400, detail="화자 매핑이 필요한 상태가 아닙니다")

    analysis = row.data["speaker_analysis"]
    if isinstance(analysis, str):
        analysis = json.loads(analysis)

    speakers = sorted(set(c["speaker"] for c in analysis.get("contributions", [])))
    return SpeakersResponse(speakers=speakers)


@router.post("/meetings/{meeting_id}/speaker-mapping")
def apply_speaker_mapping(
    meeting_id: str,
    body: SpeakerMappingRequest,
    user_id: str = Depends(get_current_user),
):
    """화자 레이블 → 팀원 ID 매핑을 적용하여 기여도/약속 카드를 저장하고 완료 처리"""
    db = get_supabase()
    verify_meeting_owner(meeting_id, user_id, db)

    row = (
        db.table("meetings")
        .select("status, speaker_analysis")
        .eq("id", meeting_id)
        .single()
        .execute()
    )
    if row.data["status"] != "pending_speaker_mapping":
        raise HTTPException(status_code=400, detail="화자 매핑이 필요한 상태가 아닙니다")

    analysis = row.data["speaker_analysis"]
    if isinstance(analysis, str):
        analysis = json.loads(analysis)

    mapping = body.mapping  # {"화자1": "member_id_xxx", "화자2": "member_id_yyy"}

    # 기여도 카드 저장
    contribution_rows = [
        {
            "meeting_id": meeting_id,
            "team_member_id": mapping[item["speaker"]],
            "contribution_type": item["type"],
            "content": item["content"],
            "score": item["score"],
        }
        for item in analysis.get("contributions", [])
        if item["speaker"] in mapping
    ]
    if contribution_rows:
        db.table("contribution_cards").insert(contribution_rows).execute()

    # 약속 카드 저장
    promise_rows = [
        {
            "meeting_id": meeting_id,
            "team_member_id": mapping[promise["speaker"]],
            "task_title": promise["task"],
            "due_date": promise.get("due_date"),
        }
        for promise in analysis.get("promises", [])
        if promise["speaker"] in mapping
    ]
    if promise_rows:
        db.table("promise_cards").insert(promise_rows).execute()

    # 완료 처리
    db.table("meetings").update({
        "status": "completed",
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", meeting_id).execute()

    return {"status": "completed"}
