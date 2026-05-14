from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import teams, meetings, promises, reports

app = FastAPI(title="무임승차 방지 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(teams.router)
app.include_router(meetings.router)
app.include_router(promises.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    return {"status": "ok"}
