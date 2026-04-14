from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base
from models.base import SerializableMixin


class Booking(Base, SerializableMixin):
    __tablename__ = "BOOKINGS"

    booking_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    S_ID: Mapped[int] = mapped_column(ForeignKey("STUDENT.S_ID", ondelete="CASCADE"), nullable=False)
    Room_No: Mapped[int] = mapped_column(ForeignKey("ROOMS.Room_No", ondelete="CASCADE"), nullable=False)
    Hostel_name: Mapped[str] = mapped_column(ForeignKey("HOSTEL.Hostel_name", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("pending", "approved", "rejected", "cancelled", name="booking_status"),
        nullable=False,
        default="pending",
        server_default="pending",
    )
    booked_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.current_timestamp())
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
