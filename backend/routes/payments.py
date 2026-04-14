from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database.connection import SessionLocal
from models.payment import Payment
from models.student import Student
from schemas.payment import PaymentCreate
from services.common import conflict, not_found, success_response
from utils.auth import get_current_admin

router = APIRouter(prefix="/payments", tags=["payments"], dependencies=[Depends(get_current_admin)])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def list_payments(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=1000),
    student_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
):
    filters = []
    if student_id is not None:
        filters.append(Payment.Student_ID == student_id)
    if date_from is not None:
        filters.append(Payment.Paymentdate >= date_from)
    if date_to is not None:
        filters.append(Payment.Paymentdate <= date_to)

    query = select(Payment)
    count_query = select(func.count()).select_from(Payment)
    if filters:
        query = query.where(and_(*filters))
        count_query = count_query.where(and_(*filters))

    payments = db.scalars(query.order_by(Payment.Paymentdate.desc()).offset((page - 1) * limit).limit(limit)).all()
    payload = []
    for payment in payments:
        item = payment.to_dict()
        student = db.get(Student, payment.Student_ID)
        item["student_name"] = f"{student.Fname} {student.Minit or ''} {student.Lname}".replace("  ", " ").strip() if student else None
        payload.append(item)
    return success_response(payload)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_payment(payment_in: PaymentCreate, db: Session = Depends(get_db)):
    if not db.get(Student, payment_in.Student_ID):
        raise not_found("Student not found")
    payment = Payment(**payment_in.model_dump())
    db.add(payment)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise conflict("Payment could not be created") from exc
    db.refresh(payment)
    item = payment.to_dict()
    student = db.get(Student, payment.Student_ID)
    item["student_name"] = f"{student.Fname} {student.Minit or ''} {student.Lname}".replace("  ", " ").strip() if student else None
    return success_response(item, "Payment created")


@router.delete("/{payment_id}")
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.get(Payment, payment_id)
    if not payment:
        raise not_found("Payment not found")
    db.delete(payment)
    db.commit()
    return success_response(message="Payment deleted")
