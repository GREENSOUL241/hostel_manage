from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from models.booking import Booking
from models.hostel import Hostel
from models.payment import Payment
from models.room import Room
from models.student import Student
from models.student_auth import StudentAuth
from schemas.booking import BookingCreate, StudentPaymentCreate
from schemas.student_auth import StudentProfileUpdate
from services.common import not_found, success_response
from utils.auth import get_current_student, get_db

router = APIRouter(prefix="/student", tags=["student-portal"], dependencies=[Depends(get_current_student)])


@router.get("/profile")
def get_profile(current_auth: StudentAuth = Depends(get_current_student), db: Session = Depends(get_db)):
    student = db.get(Student, current_auth.S_ID)
    if not student:
        raise not_found("Student not found")

    payload = student.to_dict()
    payload["email"] = current_auth.email
    return success_response(payload)


@router.put("/profile")
def update_profile(
    payload: StudentProfileUpdate,
    current_auth: StudentAuth = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    student = db.get(Student, current_auth.S_ID)
    if not student:
        raise not_found("Student not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)
    data = student.to_dict()
    data["email"] = current_auth.email
    return success_response(data, "Profile updated")


@router.get("/rooms/available")
def get_available_rooms(
    hostel_name: str | None = None,
    room_type: str | None = None,
    floor_no: int | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
):
    active_room_subquery = (
        select(Booking.Room_No)
        .where(Booking.status.in_(["pending", "approved"]))
        .distinct()
    )

    query = select(Room).where(and_(Room.S_ID.is_(None), Room.Room_No.not_in(active_room_subquery)))
    if room_type:
        query = query.where(Room.Room_Type == room_type)
    if floor_no is not None:
        query = query.where(Room.Floor_no == floor_no)

    rooms = db.scalars(query.order_by(Room.Room_No)).all()
    hostels = db.scalars(select(Hostel).order_by(Hostel.Hostel_name)).all()
    default_hostel = hostels[0] if hostels else None

    payload = []
    for room in rooms:
        latest_booking = db.scalars(
            select(Booking).where(Booking.Room_No == room.Room_No).order_by(Booking.booking_id.desc()).limit(1)
        ).first()

        linked_hostel = db.get(Hostel, latest_booking.Hostel_name) if latest_booking else default_hostel
        if hostel_name and (not linked_hostel or linked_hostel.Hostel_name != hostel_name):
            continue

        room_data = room.to_dict()
        room_data["Hostel_name"] = linked_hostel.Hostel_name if linked_hostel else None
        room_data["Hostel_Location"] = linked_hostel.Hostel_Location if linked_hostel else None
        payload.append(room_data)

    return success_response(payload)


@router.post("/book", status_code=status.HTTP_201_CREATED)
def book_room(payload: BookingCreate, current_auth: StudentAuth = Depends(get_current_student), db: Session = Depends(get_db)):
    student_id = current_auth.S_ID

    active_booking = db.scalars(
        select(Booking)
        .where(and_(Booking.S_ID == student_id, Booking.status.in_(["pending", "approved"])))
        .order_by(Booking.booking_id.desc())
        .limit(1)
    ).first()
    if active_booking:
        raise HTTPException(status_code=400, detail={"message": "You already have an active booking"})

    room = db.get(Room, payload.Room_No)
    if not room:
        raise not_found("Room not found")
    if room.S_ID is not None:
        raise HTTPException(status_code=400, detail={"message": "Room is already occupied"})

    hostel = db.get(Hostel, payload.Hostel_name)
    if not hostel:
        raise not_found("Hostel not found")

    same_room_active_booking = db.scalars(
        select(Booking).where(and_(Booking.Room_No == payload.Room_No, Booking.status.in_(["pending", "approved"]))).limit(1)
    ).first()
    if same_room_active_booking:
        raise HTTPException(status_code=400, detail={"message": "Room already has an active booking"})

    booking = Booking(S_ID=student_id, Room_No=payload.Room_No, Hostel_name=payload.Hostel_name, status="pending")
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return success_response(booking.to_dict(), "Booking submitted")


@router.get("/booking")
def get_my_booking(current_auth: StudentAuth = Depends(get_current_student), db: Session = Depends(get_db)):
    booking = db.scalars(
        select(Booking)
        .where(Booking.S_ID == current_auth.S_ID)
        .order_by(Booking.booking_id.desc())
        .limit(1)
    ).first()

    if not booking:
        return success_response(None, "No booking found")

    room = db.get(Room, booking.Room_No)
    hostel = db.get(Hostel, booking.Hostel_name)

    payload = booking.to_dict()
    payload["room"] = room.to_dict() if room else None
    payload["hostel"] = hostel.to_dict() if hostel else None
    return success_response(payload)


@router.delete("/booking/{booking_id}")
def cancel_my_booking(booking_id: int, current_auth: StudentAuth = Depends(get_current_student), db: Session = Depends(get_db)):
    booking = db.get(Booking, booking_id)
    if not booking or booking.S_ID != current_auth.S_ID:
        raise not_found("Booking not found")

    if booking.status != "pending":
        raise HTTPException(status_code=400, detail={"message": "Only pending bookings can be cancelled"})

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return success_response(booking.to_dict(), "Booking cancelled")


@router.get("/payments")
def get_my_payments(current_auth: StudentAuth = Depends(get_current_student), db: Session = Depends(get_db)):
    payments = db.scalars(
        select(Payment)
        .where(Payment.Student_ID == current_auth.S_ID)
        .order_by(Payment.Paymentdate.desc(), Payment.Payment_ID.desc())
    ).all()
    return success_response([payment.to_dict() for payment in payments])


@router.post("/payments", status_code=status.HTTP_201_CREATED)
def make_payment(
    payload: StudentPaymentCreate,
    current_auth: StudentAuth = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    approved_booking = db.scalars(
        select(Booking)
        .where(and_(Booking.S_ID == current_auth.S_ID, Booking.status == "approved"))
        .order_by(Booking.booking_id.desc())
        .limit(1)
    ).first()
    if not approved_booking:
        raise HTTPException(status_code=400, detail={"message": "Payment is allowed only after booking approval"})

    payment = Payment(
        Paymentdate=payload.Paymentdate,
        Mode=payload.Mode,
        Student_ID=current_auth.S_ID,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return success_response(payment.to_dict(), "Payment submitted")
