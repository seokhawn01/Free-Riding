from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum


class ModelType(str, Enum):
    standard = "standard"
    premium = "premium"


class MeetingStatus(str, Enum):
    pending = "pending"
    transcribing = "transcribing"
    analyzing = "analyzing"
    pending_speaker_mapping = "pending_speaker_mapping"
    completed = "completed"
    failed = "failed"


class ContributionType(str, Enum):
    idea = "idea"
    problem = "problem"
    question = "question"
    summary = "summary"
    decision = "decision"
    promise = "promise"


# 팀 요청/응답
class TeamCreateRequest(BaseModel):
    name: str
    subject: str
    deadline: date
    members: list[str]


class TeamMemberResponse(BaseModel):
    id: str
    member_name: str


class TeamResponse(BaseModel):
    id: str
    name: str
    subject: str
    deadline: date
    is_completed: bool
    created_at: datetime
    members: list[TeamMemberResponse] = []
    meeting_count: int = 0
    promise_completion_rate: float = 0.0


# 회의 응답
class MeetingStatusResponse(BaseModel):
    id: str
    status: MeetingStatus
    error_message: Optional[str] = None


# 기여도 카드 응답
class ContributionCardResponse(BaseModel):
    id: str
    member_name: str
    contribution_type: ContributionType
    content: str
    score: int


# 약속 카드 응답
class PromiseCardResponse(BaseModel):
    id: str
    member_name: str
    task_title: str
    due_date: Optional[date]
    is_completed: bool


class PromiseCompleteRequest(BaseModel):
    is_completed: bool


# 화자 매핑
class SpeakersResponse(BaseModel):
    speakers: list[str]


class SpeakerMappingRequest(BaseModel):
    mapping: dict[str, str]  # {"화자1": "team_member_id"}


# 리포트 응답
class MemberContribution(BaseModel):
    member_name: str
    total_score: int
    percentage: float
    type_counts: dict[str, int]


class ReportResponse(BaseModel):
    team_name: str
    subject: str
    deadline: date
    meeting_count: int
    promise_completion_rate: float
    member_contributions: list[MemberContribution]
    type_distribution: dict[str, int]
