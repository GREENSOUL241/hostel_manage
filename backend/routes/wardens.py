from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database.connection import SessionLocal
from models.hostel import Hostel
from models.warden import Warden
from schemas.warden import WardenCreate, WardenUpdate
from services.common import conflict, not_found, success_response
from utils.auth import get_current_admin

router = APIRouter(prefix="/wardens", tags=["wardens"], dependencies=[Depends(get_current_admin)])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def list_wardens(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=1000),
    search: str | None = None,
    db: Session = Depends(get_db),
):
    filters = []
    if search:
        search_term = f"%{search}%"
        filters.append(or_(Warden.Name.ilike(search_term), Warden.Contact.ilike(search_term)))

    query = select(Warden)
    count_query = select(func.count()).select_from(Warden)
    if filters:
        query = query.where(and_(*filters))
        count_query = count_query.where(and_(*filters))

    wardens = db.scalars(query.order_by(Warden.Warden_ID).offset((page - 1) * limit).limit(limit)).all()
    payload = []
    for warden in wardens:
        item = warden.to_dict()
        hostel = db.query(Hostel).filter(Hostel.Warden_ID == warden.Warden_ID).first()
        item["manages_hostel"] = hostel.Hostel_name if hostel else None
        payload.append(item)
    return success_response(payload)


@router.get("/{warden_id}")
def get_warden(warden_id: int, db: Session = Depends(get_db)):
    warden = db.get(Warden, warden_id)
    if not warden:
        raise not_found("Warden not found")
    item = warden.to_dict()
    hostel = db.query(Hostel).filter(Hostel.Warden_ID == warden.Warden_ID).first()
    item["manages_hostel"] = hostel.Hostel_name if hostel else None
    return success_response(item)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_warden(warden_in: WardenCreate, db: Session = Depends(get_db)):
    warden = Warden(**warden_in.model_dump())
    db.add(warden)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise conflict("Warden already exists") from exc
    db.refresh(warden)
    return success_response(warden.to_dict(), "Warden created")


@router.put("/{warden_id}")
def update_warden(warden_id: int, warden_in: WardenUpdate, db: Session = Depends(get_db)):
    warden = db.get(Warden, warden_id)
    if not warden:
        raise not_found("Warden not found")
    for key, value in warden_in.model_dump(exclude_unset=True).items():
        setattr(warden, key, value)
    db.commit()
    db.refresh(warden)
    return success_response(warden.to_dict(), "Warden updated")


@router.delete("/{warden_id}")
def delete_warden(warden_id: int, db: Session = Depends(get_db)):
    warden = db.get(Warden, warden_id)
    if not warden:
        raise not_found("Warden not found")
    db.delete(warden)
    db.commit()
    return success_response(message="Warden deleted")
