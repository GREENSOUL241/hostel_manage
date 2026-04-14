from __future__ import annotations

from sqlalchemy.inspection import inspect

from database.connection import Base


class SerializableMixin:
    def to_dict(self) -> dict:
        return {attr.key: getattr(self, attr.key) for attr in inspect(self).mapper.column_attrs}
