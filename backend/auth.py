import os
import jwt
from fastapi import Header, HTTPException


def get_current_user(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증이 필요합니다")

    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(
            token,
            os.environ["SUPABASE_JWT_SECRET"],
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="세션이 만료되었습니다. 다시 로그인해주세요")
    except Exception:
        raise HTTPException(status_code=401, detail="유효하지 않은 인증 토큰입니다")
