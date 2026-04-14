from __future__ import annotations

from pydantic import Field

from schemas.base import ORMModel


class WardenBase(ORMModel):
    Name: str = Field(min_length=1, max_length=100)
    Contact: str = Field(min_length=5, max_length=20)
    Address: str = Field(min_length=1)


class WardenCreate(WardenBase):
    pass


class WardenUpdate(ORMModel):
    Name: str | None = None
    Contact: str | None = None
    Address: str | None = None


class WardenRead(WardenBase):
    Warden_ID: int
