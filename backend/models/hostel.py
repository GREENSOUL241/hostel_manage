from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base
from models.base import SerializableMixin


class Hostel(Base, SerializableMixin):
    __tablename__ = "HOSTEL"

    Hostel_name: Mapped[str] = mapped_column(String(100), primary_key=True)
    Hostel_Location: Mapped[str] = mapped_column(String(255), nullable=False)
    Room_no: Mapped[int] = mapped_column(Integer, nullable=False)
    Warden_ID: Mapped[int | None] = mapped_column(ForeignKey("WARDEN.Warden_ID", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
