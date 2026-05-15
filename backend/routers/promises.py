from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from schemas import PromiseCardResponse, PromiseCompleteRequest
from database import get_supabase
from auth import get_current_user

router = APIRouter(prefix="/promises", tags=["promises"])


@router.get("/teams/{team_id}/promises", response_model=list[PromiseCardResponse])
def get_team_promises(team_id: str, user_id: str = Depends(get_current_user)):
    db = get_supabase()

    # 팀 소유권 확인
    team = db.table("teams").select("id").eq("id", team_id).eq("user_id", user_id).single().execute()
    if not team.data:
        raise HTTPException(status_code=404, detail="팀을 찾을 수 없습니다")

    meetings = db.table("meetings").select("id").eq("team_id", team_id).execute()
    if not meetings.data:
        return []

    meeting_ids = [m["id"] for m in meetings.data]

    rows = (
        db.table("promise_cards")
        .select("id, task_title, due_date, is_completed, team_members(member_name)")
        .in_("meeting_id", meeting_ids)
        .order("created_at")
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


@router.patch("/{promise_id}/complete")
def update_promise(promise_id: str, body: PromiseCompleteRequest):
    db = get_supabase()

    update_data: dict = {"is_completed": body.is_completed}
    if body.is_completed:
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
    else:
        update_data["completed_at"] = None

    result = db.table("promise_cards").update(update_data).eq("id", promise_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="약속 카드를 찾을 수 없습니다")

    return {"message": "업데이트 완료"}
