from __future__ import annotations

# 🔹 SQLAlchemy imports for column types and relationships
from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

# 🔹 Base class for all models (DB connection)
from database.connection import Base

# 🔹 Mixin to convert objects to JSON (for API responses)
from models.base import SerializableMixin


# 🔹 Student table model
class Student(Base, SerializableMixin):
    __tablename__ = "STUDENT"  # Name of the table in MySQL

    # 🔸 Primary Key (Auto Increment)
    S_ID: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # 🔸 First Name (Required)
    Fname: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    # 🔸 Middle Initial (Optional)
    Minit: Mapped[str | None] = mapped_column(
        String(1),
        nullable=True
    )

    # 🔸 Last Name (Required)
    Lname: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    # 🔸 Gender (Enum: only specific values allowed)
    GENDER: Mapped[str] = mapped_column(
        Enum("M", "F", "Other", name="student_gender"),
        nullable=False
    )

    # 🔸 Address (Required, long text)
    ADDRESS: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # 🔸 Room Number (Foreign Key → ROOMS table)
    Room_No: Mapped[int | None] = mapped_column(
        ForeignKey(
            "ROOMS.Room_No",
            ondelete="SET NULL",   # If room deleted → set null
            onupdate="CASCADE"     # If room changes → update here
        ),
        nullable=True
    )