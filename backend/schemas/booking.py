from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import Field

from schemas.base import ORMModel


BookingStatus = Literal["pending", "approved", "rejected", "cancelled"]


class BookingCreate(ORMModel):
    Room_No: int
    Hostel_name: str = Field(min_length=1, max_length=100)


class BookingRead(ORMModel):
    booking_id: int
    S_ID: int
    Room_No: int
    Hostel_name: str
    status: BookingStatus
    booked_at: datetime
    approved_at: datetime | None


class StudentPaymentCreate(ORMModel):
    Paymentdate: date
    Mode: Literal["Cash", "UPI", "Card", "Bank Transfer"]
