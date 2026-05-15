from fastapi import APIRouter, HTTPException, Depends
from schemas import ReportResponse, MemberContribution
from database import get_supabase
from auth import get_current_user

router = APIRouter(prefix="/teams", tags=["reports"])

TYPE_SCORE = {
    "idea": 16, "problem": 16, "question": 16,
    "summary": 16, "decision": 16, "promise": 20,
}


@router.get("/{team_id}/report", response_model=ReportResponse)
def get_report(team_id: str, user_id: str = Depends(get_current_user)):
    db = get_supabase()

    team = db.table("teams").select("*").eq("id", team_id).eq("user_id", user_id).single().execute()
    if not team.data:
        raise HTTPException(status_code=404, detail="팀을 찾을 수 없습니다")

    t = team.data
    members = db.table("team_members").select("id, member_name").eq("team_id", team_id).execute()
    meetings = db.table("meetings").select("id").eq("team_id", team_id).execute()

    meeting_count = len(meetings.data)
    if not meetings.data:
        return ReportResponse(
            team_name=t["name"], subject=t["subject"], deadline=t["deadline"],
            meeting_count=0, promise_completion_rate=0.0,
            member_contributions=[], type_distribution={},
        )

    meeting_ids = [m["id"] for m in meetings.data]

    # 약속 이행률
    promises = db.table("promise_cards").select("is_completed").in_("meeting_id", meeting_ids).execute()
    total_promises = len(promises.data)
    completed_promises = sum(1 for p in promises.data if p["is_completed"])
    promise_rate = round(completed_promises / total_promises * 100, 1) if total_promises else 0.0

    # 기여도 카드 전체 조회
    contributions = (
        db.table("contribution_cards")
        .select("team_member_id, contribution_type, score")
        .in_("meeting_id", meeting_ids)
        .execute()
    )

    # 팀원별 집계
    member_map = {m["id"]: m["member_name"] for m in members.data}
    member_scores: dict[str, int] = {mid: 0 for mid in member_map}
    member_types: dict[str, dict[str, int]] = {mid: {} for mid in member_map}
    type_distribution: dict[str, int] = {}

    for c in contributions.data:
        mid = c["team_member_id"]
        ctype = c["contribution_type"]
        score = c["score"]

        if mid in member_scores:
            member_scores[mid] += score
            member_types[mid][ctype] = member_types[mid].get(ctype, 0) + 1

        type_distribution[ctype] = type_distribution.get(ctype, 0) + 1

    total_score = sum(member_scores.values()) or 1

    member_contributions = [
        MemberContribution(
            member_name=member_map[mid],
            total_score=score,
            percentage=round(score / total_score * 100, 1),
            type_counts=member_types[mid],
        )
        for mid, score in sorted(member_scores.items(), key=lambda x: -x[1])
    ]

    return ReportResponse(
        team_name=t["name"],
        subject=t["subject"],
        deadline=t["deadline"],
        meeting_count=meeting_count,
        promise_completion_rate=promise_rate,
        member_contributions=member_contributions,
        type_distribution=type_distribution,
    )
