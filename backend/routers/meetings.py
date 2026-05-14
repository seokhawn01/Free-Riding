import os
import tempfile
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from schemas import MeetingStatusResponse, ContributionCardResponse, PromiseCardResponse
from database import get_supabase
from services.ai_service import process_meeting

router = APIRouter(tags=["meetings"])


@router.post("/teams/{team_id}/meetings/upload")
async def upload_meeting(
    team_id: str,
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    model_type: str = Form("standard"),
):
    db = get_supabase()

    # 팀 존재 확인
    team = db.table("teams").select("id").eq("id", team_id).single().execute()
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

    # 팀원 목록 조회
    members = db.table("team_members").select("member_name").eq("team_id", team_id).execute()
    member_names = [m["member_name"] for m in members.data]

    # 백그라운드에서 AI 분석 실행
    background_tasks.add_task(process_meeting, meeting_id, tmp.name, model_type, member_names)

    return {"meeting_id": meeting_id, "status": "pending"}


@router.get("/meetings/{meeting_id}/status", response_model=MeetingStatusResponse)
def get_meeting_status(meeting_id: str):
    db = get_supabase()

    meeting = db.table("meetings").select("id, status, error_message").eq("id", meeting_id).single().execute()
    if not meeting.data:
        raise HTTPException(status_code=404, detail="회의를 찾을 수 없습니다")

    return MeetingStatusResponse(**meeting.data)


@router.get("/meetings/{meeting_id}/contributions", response_model=list[ContributionCardResponse])
def get_contributions(meeting_id: str):
    db = get_supabase()

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
def get_meeting_promises(meeting_id: str):
    db = get_supabase()

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
