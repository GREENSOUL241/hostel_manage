from __future__ import annotations

from datetime import datetime

from pydantic import Field

from schemas.base import ORMModel


class AdminRegister(ORMModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=100)
    password: str = Field(min_length=6, max_length=128)


class AdminLogin(ORMModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=128)


class AdminRead(ORMModel):
    admin_id: int
    username: str
    email: str
    created_at: datetime


class TokenResponse(ORMModel):
    access_token: str
    token_type: str = "bearer"
