from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.admin import Admin
from models.student import Student
from models.student_auth import StudentAuth
from schemas.admin import AdminRead
from schemas.student_auth import LoginRequest, StudentRegisterRequest
from services.common import success_response
from utils.auth import create_access_token, get_current_admin, get_db
from utils.hashing import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: StudentRegisterRequest, db: Session = Depends(get_db)):
    if not payload.email.endswith("@apsit.edu.in"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only @apsit.edu.in emails allowed")

    student = Student(
        Fname=payload.Fname,
        Minit=payload.Minit,
        Lname=payload.Lname,
        GENDER=payload.GENDER,
        ADDRESS=payload.ADDRESS,
        Room_No=None,
    )
    db.add(student)
    try:
        db.flush()
        student_auth = StudentAuth(
            email=payload.email,
            password=hash_password(payload.password),
            S_ID=student.S_ID,
            is_verified=True,
        )
        db.add(student_auth)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"message": "Student registration failed"}) from exc

    token = create_access_token({"sub": payload.email, "role": "student", "id": student.S_ID})
    return success_response({"access_token": token, "token_type": "bearer", "role": "student"}, "Student registered")


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if payload.username:
        admin = db.query(Admin).filter(Admin.username == payload.username).first()
        if admin and verify_password(payload.password, admin.password):
            token = create_access_token({"sub": admin.username, "role": "admin", "id": admin.admin_id})
            return success_response({"access_token": token, "token_type": "bearer", "role": "admin"}, "Login successful")

    student_email = payload.email or (payload.username if payload.username and "@" in payload.username else None)
    if student_email:
        student_auth = db.query(StudentAuth).filter(StudentAuth.email == student_email).first()
        if student_auth and verify_password(payload.password, student_auth.password) and student_auth.S_ID is not None:
            token = create_access_token({"sub": student_auth.email, "role": "student", "id": student_auth.S_ID})
            return success_response({"access_token": token, "token_type": "bearer", "role": "student"}, "Login successful")

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"message": "Invalid credentials"})


@router.get("/me")
def me(current_admin: Admin = Depends(get_current_admin)):
    return success_response(AdminRead.model_validate(current_admin).model_dump(), "OK")
