from __future__ import annotations

from typing import Literal

from pydantic import Field

from schemas.base import ORMModel


GenderType = Literal["M", "F", "Other"]


class StudentBase(ORMModel):
    Fname: str = Field(min_length=1, max_length=50)
    Minit: str | None = Field(default=None, max_length=1)
    Lname: str = Field(min_length=1, max_length=50)
    GENDER: GenderType
    ADDRESS: str = Field(min_length=1)
    Room_No: int | None = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(ORMModel):
    Fname: str | None = None
    Minit: str | None = None
    Lname: str | None = None
    GENDER: GenderType | None = None
    ADDRESS: str | None = None
    Room_No: int | None = None


class StudentRead(StudentBase):
    S_ID: int
