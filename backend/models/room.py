from __future__ import annotations

from sqlalchemy import Enum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base
from models.base import SerializableMixin


class Room(Base, SerializableMixin):
    __tablename__ = "ROOMS"

    Room_No: Mapped[int] = mapped_column(Integer, primary_key=True)
    Floor_no: Mapped[int] = mapped_column(Integer, nullable=False)
    Room_Type: Mapped[str] = mapped_column(Enum("Single", "Double", "Triple", name="room_type"), nullable=False)
    S_ID: Mapped[int | None] = mapped_column(ForeignKey("STUDENT.S_ID", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
