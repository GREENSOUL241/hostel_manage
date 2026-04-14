from __future__ import annotations

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base
from models.base import SerializableMixin


class Student(Base, SerializableMixin):
    __tablename__ = "STUDENT"

    S_ID: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    Fname: Mapped[str] = mapped_column(String(50), nullable=False)
    Minit: Mapped[str | None] = mapped_column(String(1), nullable=True)
    Lname: Mapped[str] = mapped_column(String(50), nullable=False)
    GENDER: Mapped[str] = mapped_column(Enum("M", "F", "Other", name="student_gender"), nullable=False)
    ADDRESS: Mapped[str] = mapped_column(Text, nullable=False)
    Room_No: Mapped[int | None] = mapped_column(ForeignKey("ROOMS.Room_No", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
