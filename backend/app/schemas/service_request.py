from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.schemas.user import UserResponse

ALLOWED_SERVICE_TYPES = ["VM_PROVISION", "S3_ACCESS", "DB_ACCOUNT", "PASSWORD_RESET"]
ALLOWED_PRIORITIES = ["LOW", "MEDIUM", "HIGH"]
ALLOWED_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"]


class RequestCreate(BaseModel):
    """
    Schema for creating a new IT service request ticket.
    """
    title: str = Field(..., min_length=3, max_length=150, description="Brief summary of the request")
    service_type: str = Field(..., description="Type of IT service requested")
    priority: Optional[str] = Field("MEDIUM", description="Priority level: LOW, MEDIUM, or HIGH")
    description: Optional[str] = Field(None, max_length=2000, description="Detailed requirements or parameters")

    @field_validator("service_type")
    @classmethod
    def validate_service_type(cls, value: str) -> str:
        upper_val = value.strip().upper()
        if upper_val not in ALLOWED_SERVICE_TYPES:
            raise ValueError(f"service_type must be one of: {', '.join(ALLOWED_SERVICE_TYPES)}")
        return upper_val

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: Optional[str]) -> str:
        if not value:
            return "MEDIUM"
        upper_val = value.strip().upper()
        if upper_val not in ALLOWED_PRIORITIES:
            raise ValueError(f"priority must be one of: {', '.join(ALLOWED_PRIORITIES)}")
        return upper_val


class RequestResponse(BaseModel):
    """
    Schema for returning service request ticket details and execution logs.
    """
    id: int
    user_id: int
    title: str
    service_type: str
    priority: str
    status: str
    description: Optional[str] = None
    automation_log: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    owner: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
