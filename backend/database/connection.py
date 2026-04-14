from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv

# Load backend/.env regardless of current working directory.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


class Base(DeclarativeBase):
    pass


@lru_cache(maxsize=1)
def get_database_url() -> str:
    return os.getenv(
        "DATABASE_URL",
        "mysql+mysqlconnector://root:YOUR_PASSWORD@localhost:3306/hostel_management",
    )


DATABASE_URL = get_database_url()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)