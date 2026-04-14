from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from database.connection import Base, engine
from routes.auth import router as auth_router
from routes.bookings import router as bookings_router
from routes.hostels import router as hostels_router
from routes.payments import router as payments_router
from routes.rooms import router as rooms_router
from routes.student_portal import router as student_portal_router
from routes.students import router as students_router
from routes.wardens import router as wardens_router

# Create FastAPI app
app = FastAPI(title="Hostel Management System", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(students_router, prefix="/api/v1")
app.include_router(rooms_router, prefix="/api/v1")
app.include_router(hostels_router, prefix="/api/v1")
app.include_router(wardens_router, prefix="/api/v1")
app.include_router(payments_router, prefix="/api/v1")
app.include_router(student_portal_router, prefix="/api/v1")
app.include_router(bookings_router, prefix="/api/v1")

# Optional: auto-create tables (only if enabled)
@app.on_event("startup")
def maybe_create_tables():
    if os.getenv("AUTO_CREATE_TABLES", "false").lower() == "true":
        Base.metadata.create_all(bind=engine)

# Root endpoint
@app.get("/")
def root():
    return {
        "success": True,
        "data": {"service": "Hostel Management System API"},
        "message": "OK"
    }

# Health check
@app.get("/health")
def health():
    return {
        "success": True,
        "data": {"status": "healthy"},
        "message": "OK"
    }

# HTTP exception handler
@app.exception_handler(HTTPException)
def http_exception_handler(_: Request, exc: HTTPException):
    detail = exc.detail if isinstance(exc.detail, dict) else {"message": str(exc.detail)}
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "message": detail.get("message", "Request failed")
        },
    )

# Validation error handler
@app.exception_handler(RequestValidationError)
def validation_exception_handler(_: Request, exc: RequestValidationError):
    message = exc.errors()[0]["msg"] if exc.errors() else "Validation failed"
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "data": None,
            "message": message
        },
    )

# Generic error handler
@app.exception_handler(Exception)
def generic_exception_handler(_: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "message": str(exc)
        },
    )