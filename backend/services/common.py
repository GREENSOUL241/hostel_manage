from __future__ import annotations

from math import ceil
from typing import Any

from fastapi import HTTPException, status


def success_response(data: Any = None, message: str = "OK") -> dict[str, Any]:
    return {"success": True, "data": data, "message": message}


def error_response(message: str, code: int) -> HTTPException:
    return HTTPException(status_code=code, detail={"success": False, "data": None, "message": message})


def paginate(items: list[Any], total: int, page: int, limit: int) -> dict[str, Any]:
    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": ceil(total / limit) if limit else 1,
    }


def not_found(message: str) -> HTTPException:
    return error_response(message, status.HTTP_404_NOT_FOUND)


def conflict(message: str) -> HTTPException:
    return error_response(message, status.HTTP_409_CONFLICT)
