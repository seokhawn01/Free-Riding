from fastapi import APIRouter, HTTPException, Depends
from schemas import TeamCreateRequest, TeamResponse, TeamMemberResponse
from database import get_supabase
from auth import get_current_user

router = APIRouter(prefix="/teams", tags=["teams"])


def _verify_owner(db, team_id: str, user_id: str) -> dict:
    team = db.table("teams").select("*").eq("id", team_id).eq("user_id", user_id).single().execute()
    if not team.data:
        raise HTTPException(status_code=404, detail="팀을 찾을 수 없습니다")
    return team.data


@router.post("", response_model=TeamResponse)
def create_team(body: TeamCreateRequest, user_id: str = Depends(get_current_user)):
    db = get_supabase()

    team = db.table("teams").insert({
        "name": body.name,
        "subject": body.subject,
        "deadline": str(body.deadline),
        "user_id": user_id,
    }).execute()

    team_id = team.data[0]["id"]

    members_to_insert = [
        {"team_id": team_id, "member_name": name}
        for name in body.members
    ]
    members = db.table("team_members").insert(members_to_insert).execute()

    return TeamResponse(
        **team.data[0],
        members=[TeamMemberResponse(**m) for m in members.data],
    )


@router.get("", response_model=list[TeamResponse])
def list_teams(user_id: str = Depends(get_current_user)):
    db = get_supabase()

    teams = (
        db.table("teams")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    result = []

    for t in teams.data:
        members = db.table("team_members").select("*").eq("team_id", t["id"]).execute()
        meetings = db.table("meetings").select("id").eq("team_id", t["id"]).execute()
        meeting_count = len(meetings.data)
        promise_rate = _calc_promise_rate(db, t["id"])

        result.append(TeamResponse(
            **t,
            members=[TeamMemberResponse(**m) for m in members.data],
            meeting_count=meeting_count,
            promise_completion_rate=promise_rate,
        ))

    return result


@router.get("/{team_id}", response_model=TeamResponse)
def get_team(team_id: str, user_id: str = Depends(get_current_user)):
    db = get_supabase()

    t = _verify_owner(db, team_id, user_id)
    members = db.table("team_members").select("*").eq("team_id", team_id).execute()
    meetings = db.table("meetings").select("id").eq("team_id", team_id).execute()
    promise_rate = _calc_promise_rate(db, team_id)

    return TeamResponse(
        **t,
        members=[TeamMemberResponse(**m) for m in members.data],
        meeting_count=len(meetings.data),
        promise_completion_rate=promise_rate,
    )


@router.post("/{team_id}/complete")
def complete_team(team_id: str, user_id: str = Depends(get_current_user)):
    db = get_supabase()
    _verify_owner(db, team_id, user_id)
    db.table("teams").update({"is_completed": True}).eq("id", team_id).execute()
    return {"message": "팀플이 완료 처리되었습니다"}


def _calc_promise_rate(db, team_id: str) -> float:
    meetings = db.table("meetings").select("id").eq("team_id", team_id).execute()
    if not meetings.data:
        return 0.0

    meeting_ids = [m["id"] for m in meetings.data]
    promises = db.table("promise_cards").select("is_completed").in_("meeting_id", meeting_ids).execute()

    if not promises.data:
        return 0.0

    completed = sum(1 for p in promises.data if p["is_completed"])
    return round(completed / len(promises.data) * 100, 1)
