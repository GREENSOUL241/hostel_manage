from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import Field

from schemas.base import ORMModel


PaymentMode = Literal["Cash", "UPI", "Card", "Bank Transfer"]


class PaymentBase(ORMModel):
    Paymentdate: date
    Mode: PaymentMode
    Student_ID: int


class PaymentCreate(PaymentBase):
    pass


class PaymentRead(PaymentBase):
    Payment_ID: int
