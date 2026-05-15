from fastapi import Header, HTTPException
from database import get_supabase


def get_current_user(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증이 필요합니다")

    token = authorization.removeprefix("Bearer ")
    try:
        db = get_supabase()
        response = db.auth.get_user(token)
        return response.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="유효하지 않은 인증 토큰입니다")
