
from pydantic import BaseModel, Field, ConfigDict, AliasChoices
from typing import Optional
import uuid
from datetime import datetime

class MatchResult(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    collab_request_id: str
    creator_profile_id: str
    score: float
    analysis: str = Field(validation_alias=AliasChoices('analysis', 'ai_analysis'))
    status: str = "suggested"
    startup_agreed: bool = False
    creator_agreed: bool = False

try:
    # Test with old data
    m = MatchResult(
        collab_request_id="123",
        creator_profile_id="456",
        score=90.0,
        ai_analysis="Good match"
    )
    print("SUCCESS: Validated with ai_analysis")
    print(m.model_dump())
except Exception as e:
    print(f"FAILURE: {e}")
