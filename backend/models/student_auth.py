from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base
from models.base import SerializableMixin


class StudentAuth(Base, SerializableMixin):
    __tablename__ = "STUDENT_AUTH"

    student_auth_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    S_ID: Mapped[int | None] = mapped_column(ForeignKey("STUDENT.S_ID", ondelete="CASCADE", onupdate="CASCADE"), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="1")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.current_timestamp())
