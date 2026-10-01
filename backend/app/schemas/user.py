from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class UserRegister(BaseModel):
    """
    Schema for user registration.
    Validates input fields before creating a new user in the database.
    """
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of the user")
    email: str = Field(..., min_length=5, max_length=150, description="User email address")
    password: str = Field(..., min_length=6, max_length=100, description="Plaintext password (min 6 characters)")
    department: Optional[str] = Field(None, max_length=100, description="User's department (e.g., IT, Engineering)")
    role: Optional[str] = Field("EMPLOYEE", description="Role: EMPLOYEE or ADMIN")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Invalid email format. Must contain a valid domain (e.g., user@example.com)")
        return value

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: Optional[str]) -> str:
        if not value:
            return "EMPLOYEE"
        upper_role = value.strip().upper()
        if upper_role not in ["EMPLOYEE", "ADMIN"]:
            raise ValueError("Role must be either 'EMPLOYEE' or 'ADMIN'")
        return upper_role


class UserLogin(BaseModel):
    """
    Schema for user login credentials.
    """
    email: str = Field(..., description="User's registered email")
    password: str = Field(..., description="User's password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserResponse(BaseModel):
    """
    Safe public schema for returning user profile data.
    Notice: 'hashed_password' is deliberately omitted to prevent credential exposure.
    """
    id: int
    full_name: str
    email: str
    role: str
    department: Optional[str] = None
    created_at: datetime

    # from_attributes = True enables converting directly from a SQLAlchemy model instance
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """
    Schema returned upon successful authentication.
    """
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    """
    Internal schema representing decoded JWT claims.
    """
    sub: Optional[str] = None
    role: Optional[str] = None
