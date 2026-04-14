from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import String, and_, func, or_, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database.connection import SessionLocal
from models.room import Room
from models.student import Student
from schemas.room import RoomCreate, RoomUpdate
from services.common import conflict, not_found, success_response
from utils.auth import get_current_admin

router = APIRouter(prefix="/rooms", tags=["rooms"], dependencies=[Depends(get_current_admin)])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def list_rooms(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=1000),
    search: str | None = None,
    Room_Type: str | None = None,
    db: Session = Depends(get_db),
):
    filters = []
    if search:
        search_term = f"%{search}%"
        filters.append(or_(func.cast(Room.Room_No, String).ilike(search_term), func.cast(Room.Floor_no, String).ilike(search_term), Room.Room_Type.ilike(search_term)))
    if Room_Type:
        filters.append(Room.Room_Type == Room_Type)

    query = select(Room)
    count_query = select(func.count()).select_from(Room)
    if filters:
        query = query.where(and_(*filters))
        count_query = count_query.where(and_(*filters))

    rooms = db.scalars(query.order_by(Room.Room_No).offset((page - 1) * limit).limit(limit)).all()
    payload = []
    for room in rooms:
        item = room.to_dict()
        student = db.get(Student, room.S_ID) if room.S_ID else None
        item["assigned_student"] = student.to_dict() if student else None
        item["status"] = "Occupied" if room.S_ID else "Vacant"
        payload.append(item)
    return success_response(payload)


@router.get("/{room_no}")
def get_room(room_no: int, db: Session = Depends(get_db)):
    room = db.get(Room, room_no)
    if not room:
        raise not_found("Room not found")
    item = room.to_dict()
    student = db.get(Student, room.S_ID) if room.S_ID else None
    item["assigned_student"] = student.to_dict() if student else None
    item["status"] = "Occupied" if room.S_ID else "Vacant"
    return success_response(item)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_room(room_in: RoomCreate, db: Session = Depends(get_db)):
    room = Room(**room_in.model_dump())
    if room.S_ID is not None:
        student = db.get(Student, room.S_ID)
        if not student:
            raise not_found("Student not found")
        existing_room = db.query(Room).filter(Room.S_ID == student.S_ID).first()
        if existing_room:
            previous_student_id = existing_room.S_ID
            existing_room.S_ID = None
            previous_student = db.get(Student, previous_student_id)
            if previous_student and previous_student.Room_No == existing_room.Room_No:
                previous_student.Room_No = None
        student.Room_No = room.Room_No
    db.add(room)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise conflict("Room already exists or assignment conflicts") from exc
    db.refresh(room)
    return success_response(room.to_dict(), "Room created")


@router.put("/{room_no}")
def update_room(room_no: int, room_in: RoomUpdate, db: Session = Depends(get_db)):
    room = db.get(Room, room_no)
    if not room:
        raise not_found("Room not found")

    incoming = room_in.model_dump(exclude_unset=True)
    new_student_id = incoming.get("S_ID", room.S_ID)
    if new_student_id != room.S_ID:
        if new_student_id is not None:
            student = db.get(Student, new_student_id)
            if not student:
                raise not_found("Student not found")
            existing_room = db.query(Room).filter(Room.S_ID == new_student_id).first()
            if existing_room and existing_room.Room_No != room.Room_No:
                previous_student = db.get(Student, existing_room.S_ID)
                existing_room.S_ID = None
                if previous_student and previous_student.Room_No == existing_room.Room_No:
                    previous_student.Room_No = None
            student.Room_No = room.Room_No
        if room.S_ID is not None:
            previous_student = db.get(Student, room.S_ID)
            if previous_student and previous_student.Room_No == room.Room_No:
                previous_student.Room_No = None
        room.S_ID = new_student_id

    for key, value in incoming.items():
        setattr(room, key, value)

    db.commit()
    db.refresh(room)
    item = room.to_dict()
    student = db.get(Student, room.S_ID) if room.S_ID else None
    item["assigned_student"] = student.to_dict() if student else None
    item["status"] = "Occupied" if room.S_ID else "Vacant"
    return success_response(item, "Room updated")


@router.delete("/{room_no}")
def delete_room(room_no: int, db: Session = Depends(get_db)):
    room = db.get(Room, room_no)
    if not room:
        raise not_found("Room not found")
    student = db.get(Student, room.S_ID) if room.S_ID else None
    if student and student.Room_No == room.Room_No:
        student.Room_No = None
    db.delete(room)
    db.commit()
    return success_response(message="Room deleted")
