from __future__ import annotations

from sqlalchemy import Date, Enum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base
from models.base import SerializableMixin


class Payment(Base, SerializableMixin):
    __tablename__ = "PAYMENT"

    Payment_ID: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    Paymentdate: Mapped[str] = mapped_column(Date, nullable=False)
    Mode: Mapped[str] = mapped_column(Enum("Cash", "UPI", "Card", "Bank Transfer", name="payment_mode"), nullable=False)
    Student_ID: Mapped[int] = mapped_column(ForeignKey("STUDENT.S_ID", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
