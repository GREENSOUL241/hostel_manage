from __future__ import annotations

from pydantic import Field

from schemas.base import ORMModel


class HostelBase(ORMModel):
    Hostel_name: str = Field(min_length=1, max_length=100)
    Hostel_Location: str = Field(min_length=1, max_length=255)
    Room_no: int
    Warden_ID: int | None = None


class HostelCreate(HostelBase):
    pass


class HostelUpdate(ORMModel):
    Hostel_Location: str | None = None
    Room_no: int | None = None
    Warden_ID: int | None = None


class HostelRead(HostelBase):
    pass
