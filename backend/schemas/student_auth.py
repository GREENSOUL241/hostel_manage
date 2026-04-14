from __future__ import annotations

from datetime import datetime

from pydantic import Field, model_validator

from schemas.base import ORMModel


class LoginRequest(ORMModel):
    username: str | None = Field(default=None, min_length=1, max_length=50)
    email: str | None = Field(default=None, min_length=5, max_length=100)
    password: str = Field(min_length=1, max_length=128)

    @model_validator(mode="after")
    def validate_identity(self):
        if not self.username and not self.email:
            raise ValueError("Either username or email is required")
        return self


class StudentRegisterRequest(ORMModel):
    Fname: str = Field(min_length=1, max_length=50)
    Minit: str | None = Field(default=None, max_length=1)
    Lname: str = Field(min_length=1, max_length=50)
    GENDER: str
    ADDRESS: str = Field(min_length=1)
    email: str = Field(min_length=5, max_length=100)
    password: str = Field(min_length=6, max_length=128)


class StudentProfileUpdate(ORMModel):
    Fname: str | None = Field(default=None, min_length=1, max_length=50)
    Minit: str | None = Field(default=None, max_length=1)
    Lname: str | None = Field(default=None, min_length=1, max_length=50)
    ADDRESS: str | None = Field(default=None, min_length=1)


class StudentAuthRead(ORMModel):
    student_auth_id: int
    email: str
    S_ID: int | None
    is_verified: bool
    created_at: datetime
