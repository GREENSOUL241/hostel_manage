from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import String, and_, func, or_, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database.connection import SessionLocal
from models.room import Room
from models.student import Student
from schemas.student import StudentCreate, StudentRead, StudentUpdate
from services.common import conflict, not_found, success_response
from utils.auth import get_current_admin

router = APIRouter(prefix="/students", tags=["students"], dependencies=[Depends(get_current_admin)])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def serialize_student(student: Student) -> dict:
    return student.to_dict()


@router.get("")
def list_students(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=1000),
    search: str | None = None,
    gender: str | None = None,
    room_no: int | None = None,
    db: Session = Depends(get_db),
):
    filters = []
    if search:
        search_term = f"%{search}%"
        filters.append(or_(Student.Fname.ilike(search_term), Student.Lname.ilike(search_term), func.cast(Student.S_ID, String).ilike(search_term)))
    if gender:
        filters.append(Student.GENDER == gender)
    if room_no is not None:
        filters.append(Student.Room_No == room_no)

    query = select(Student)
    count_query = select(func.count()).select_from(Student)
    if filters:
        query = query.where(and_(*filters))
        count_query = count_query.where(and_(*filters))

    items = db.scalars(query.order_by(Student.S_ID).offset((page - 1) * limit).limit(limit)).all()
    payload = [serialize_student(item) for item in items]
    return success_response(payload)


@router.get("/{s_id}")
def get_student(s_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, s_id)
    if not student:
        raise not_found("Student not found")
    return success_response(serialize_student(student))


@router.post("", status_code=status.HTTP_201_CREATED)
def create_student(student_in: StudentCreate, db: Session = Depends(get_db)):
    student = Student(**student_in.model_dump())
    if student.Room_No is not None:
        room = db.get(Room, student.Room_No)
        if not room:
            raise not_found("Room not found")
        if room.S_ID is not None:
            raise conflict("Room is already occupied")
    db.add(student)
    try:
        db.flush()
        if student.Room_No is not None:
            room = db.get(Room, student.Room_No)
            room.S_ID = student.S_ID
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise conflict("Student already exists or room assignment conflicts") from exc
    db.refresh(student)
    return success_response(serialize_student(student), "Student created")


@router.put("/{s_id}")
def update_student(s_id: int, student_in: StudentUpdate, db: Session = Depends(get_db)):
    student = db.get(Student, s_id)
    if not student:
        raise not_found("Student not found")

    incoming = student_in.model_dump(exclude_unset=True)
    new_room_no = incoming.get("Room_No", student.Room_No)
    if new_room_no is not None and new_room_no != student.Room_No:
        room = db.get(Room, new_room_no)
        if not room:
            raise not_found("Room not found")
        if room.S_ID is not None and room.S_ID != student.S_ID:
            raise conflict("Room is already occupied")
        previous_room = db.get(Room, student.Room_No) if student.Room_No is not None else None
        if previous_room:
            previous_room.S_ID = None
        room.S_ID = student.S_ID

    for key, value in incoming.items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)
    return success_response(serialize_student(student), "Student updated")


@router.delete("/{s_id}")
def delete_student(s_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, s_id)
    if not student:
        raise not_found("Student not found")
    room = db.query(Room).filter(Room.S_ID == student.S_ID).first()
    if room:
        room.S_ID = None
    db.delete(student)
    db.commit()
    return success_response(message="Student deleted")


@router.post("/{s_id}/assign-room/{room_no}")
def assign_room(s_id: int, room_no: int, db: Session = Depends(get_db)):
    student = db.get(Student, s_id)
    room = db.get(Room, room_no)
    if not student:
        raise not_found("Student not found")
    if not room:
        raise not_found("Room not found")
    if room.S_ID is not None and room.S_ID != student.S_ID:
        raise conflict("Room is already occupied")

    previous_room = db.query(Room).filter(Room.S_ID == student.S_ID).first()
    if previous_room and previous_room.Room_No != room.Room_No:
        previous_room.S_ID = None

    student.Room_No = room.Room_No
    room.S_ID = student.S_ID
    db.commit()
    db.refresh(student)
    return success_response(serialize_student(student), "Room assigned to student")
