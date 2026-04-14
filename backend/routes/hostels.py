from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database.connection import SessionLocal
from models.hostel import Hostel
from models.warden import Warden
from schemas.hostel import HostelCreate, HostelUpdate
from services.common import conflict, not_found, success_response
from utils.auth import get_current_admin

router = APIRouter(prefix="/hostels", tags=["hostels"], dependencies=[Depends(get_current_admin)])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def list_hostels(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=1000),
    search: str | None = None,
    db: Session = Depends(get_db),
):
    filters = []
    if search:
        search_term = f"%{search}%"
        filters.append(or_(Hostel.Hostel_name.ilike(search_term), Hostel.Hostel_Location.ilike(search_term)))

    query = select(Hostel)
    count_query = select(func.count()).select_from(Hostel)
    if filters:
        query = query.where(and_(*filters))
        count_query = count_query.where(and_(*filters))

    hostels = db.scalars(query.order_by(Hostel.Hostel_name).offset((page - 1) * limit).limit(limit)).all()
    payload = []
    for hostel in hostels:
        item = hostel.to_dict()
        warden = db.get(Warden, hostel.Warden_ID) if hostel.Warden_ID else None
        item["warden"] = warden.to_dict() if warden else None
        payload.append(item)
    return success_response(payload)


@router.get("/{hostel_name}")
def get_hostel(hostel_name: str, db: Session = Depends(get_db)):
    hostel = db.get(Hostel, hostel_name)
    if not hostel:
        raise not_found("Hostel not found")
    item = hostel.to_dict()
    warden = db.get(Warden, hostel.Warden_ID) if hostel.Warden_ID else None
    item["warden"] = warden.to_dict() if warden else None
    return success_response(item)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_hostel(hostel_in: HostelCreate, db: Session = Depends(get_db)):
    hostel = Hostel(**hostel_in.model_dump())
    if hostel.Warden_ID is not None and not db.get(Warden, hostel.Warden_ID):
        raise not_found("Warden not found")
    db.add(hostel)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise conflict("Hostel already exists or assignment conflicts") from exc
    db.refresh(hostel)
    item = hostel.to_dict()
    item["warden"] = db.get(Warden, hostel.Warden_ID).to_dict() if hostel.Warden_ID else None
    return success_response(item, "Hostel created")


@router.put("/{hostel_name}")
def update_hostel(hostel_name: str, hostel_in: HostelUpdate, db: Session = Depends(get_db)):
    hostel = db.get(Hostel, hostel_name)
    if not hostel:
        raise not_found("Hostel not found")

    incoming = hostel_in.model_dump(exclude_unset=True)
    if "Warden_ID" in incoming and incoming["Warden_ID"] is not None:
        if not db.get(Warden, incoming["Warden_ID"]):
            raise not_found("Warden not found")

    for key, value in incoming.items():
        setattr(hostel, key, value)

    db.commit()
    db.refresh(hostel)
    item = hostel.to_dict()
    item["warden"] = db.get(Warden, hostel.Warden_ID).to_dict() if hostel.Warden_ID else None
    return success_response(item, "Hostel updated")


@router.delete("/{hostel_name}")
def delete_hostel(hostel_name: str, db: Session = Depends(get_db)):
    hostel = db.get(Hostel, hostel_name)
    if not hostel:
        raise not_found("Hostel not found")
    db.delete(hostel)
    db.commit()
    return success_response(message="Hostel deleted")


@router.post("/{hostel_name}/assign-warden/{warden_id}")
def assign_warden(hostel_name: str, warden_id: int, db: Session = Depends(get_db)):
    hostel = db.get(Hostel, hostel_name)
    warden = db.get(Warden, warden_id)
    if not hostel:
        raise not_found("Hostel not found")
    if not warden:
        raise not_found("Warden not found")
    hostel.Warden_ID = warden.Warden_ID
    db.commit()
    db.refresh(hostel)
    item = hostel.to_dict()
    item["warden"] = warden.to_dict()
    return success_response(item, "Warden assigned to hostel")
