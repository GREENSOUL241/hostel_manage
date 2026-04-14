from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from models.booking import Booking
from models.hostel import Hostel
from models.room import Room
from models.student import Student
from services.common import not_found, success_response
from utils.auth import get_current_admin, get_db

router = APIRouter(prefix="/bookings", tags=["bookings"], dependencies=[Depends(get_current_admin)])


def _booking_payload(db: Session, booking: Booking) -> dict:
    student = db.get(Student, booking.S_ID)
    room = db.get(Room, booking.Room_No)
    hostel = db.get(Hostel, booking.Hostel_name)

    data = booking.to_dict()
    data["student_name"] = (
        f"{student.Fname} {student.Minit or ''} {student.Lname}".replace("  ", " ").strip() if student else None
    )
    data["room"] = room.to_dict() if room else None
    data["hostel"] = hostel.to_dict() if hostel else None
    return data


@router.get("")
def list_bookings(status: str | None = None, db: Session = Depends(get_db)):
    query = select(Booking)
    if status in {"pending", "approved", "rejected"}:
        query = query.where(Booking.status == status)

    bookings = db.scalars(query.order_by(Booking.booked_at.desc(), Booking.booking_id.desc())).all()
    payload = [_booking_payload(db, booking) for booking in bookings]
    return success_response(payload)


@router.get("/{booking_id}")
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise not_found("Booking not found")
    return success_response(_booking_payload(db, booking))


@router.put("/{booking_id}/approve")
def approve_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise not_found("Booking not found")

    if booking.status != "pending":
        raise HTTPException(status_code=400, detail={"message": "Only pending bookings can be approved"})

    room = db.get(Room, booking.Room_No)
    student = db.get(Student, booking.S_ID)
    if not room:
        raise not_found("Room not found")
    if not student:
        raise not_found("Student not found")

    if room.S_ID is not None and room.S_ID != booking.S_ID:
        raise HTTPException(status_code=409, detail={"message": "Room is already assigned"})

    booking.status = "approved"
    booking.approved_at = datetime.now(timezone.utc)
    room.S_ID = booking.S_ID
    student.Room_No = booking.Room_No

    competing_bookings = db.scalars(
        select(Booking).where(
            and_(
                Booking.Room_No == booking.Room_No,
                Booking.status == "pending",
                Booking.booking_id != booking.booking_id,
            )
        )
    ).all()
    for item in competing_bookings:
        item.status = "rejected"

    db.commit()
    db.refresh(booking)
    return success_response(_booking_payload(db, booking), "Booking approved. Room assigned to student.")


@router.put("/{booking_id}/reject")
def reject_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise not_found("Booking not found")

    if booking.status != "pending":
        raise HTTPException(status_code=400, detail={"message": "Only pending bookings can be rejected"})

    booking.status = "rejected"
    db.commit()
    db.refresh(booking)
    return success_response(_booking_payload(db, booking), "Booking rejected.")
