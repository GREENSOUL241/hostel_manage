from __future__ import annotations

from typing import Literal

from pydantic import Field

from schemas.base import ORMModel


RoomType = Literal["Single", "Double", "Triple"]


class RoomBase(ORMModel):
    Room_No: int
    Floor_no: int
    Room_Type: RoomType
    S_ID: int | None = None


class RoomCreate(RoomBase):
    pass


class RoomUpdate(ORMModel):
    Floor_no: int | None = None
    Room_Type: RoomType | None = None
    S_ID: int | None = None


class RoomRead(RoomBase):
    pass
