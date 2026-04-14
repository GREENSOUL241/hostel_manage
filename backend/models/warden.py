from __future__ import annotations

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base
from models.base import SerializableMixin


class Warden(Base, SerializableMixin):
    __tablename__ = "WARDEN"

    Warden_ID: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    Name: Mapped[str] = mapped_column(String(100), nullable=False)
    Contact: Mapped[str] = mapped_column(String(20), nullable=False)
    Address: Mapped[str] = mapped_column(Text, nullable=False)
