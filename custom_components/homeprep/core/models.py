"""Domain models for HomePrep."""

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from .taxonomy import (
    normalize_category,
    normalize_item_type,
    normalize_unit,
    validate_category,
    validate_item_type,
    validate_unit,
)


ITEM_SCHEMA_VERSION = 2


def utcnow_iso() -> str:
    """Return the current UTC timestamp as ISO 8601."""

    return datetime.now(timezone.utc).isoformat()


def create_item(
    data: dict[str, Any],
    household_id: str | None = None,
) -> dict[str, Any]:
    """Create a new HomePrep item."""

    now = utcnow_iso()

    return {
        "id": str(data.get("id") or uuid4()),
        "household_id": str(data.get("household_id") or household_id or ""),
        "name": data["name"],
        "category": validate_category(data["category"]),
        "item_type": validate_item_type(data["item_type"]),
        "quantity": data["quantity"],
        "unit": validate_unit(data["unit"]),
        "expires_at": data.get("expires_at"),
        "last_checked": data.get("last_checked"),
        "next_check_at": data.get("next_check_at"),
        "notes": data.get("notes"),
        "created_at": data.get("created_at", now),
        "updated_at": data.get("updated_at", now),
        "deleted_at": data.get("deleted_at"),
        "revision": max(1, int(data.get("revision", 1))),
        "schema_version": ITEM_SCHEMA_VERSION,
    }


def normalize_item(
    item: dict[str, Any],
    household_id: str | None = None,
) -> dict[str, Any]:
    """Normalize an item loaded from storage."""

    normalized = dict(item)
    now = utcnow_iso()

    normalized["category"] = normalize_category(normalized.get("category", "other"))
    normalized["item_type"] = normalize_item_type(normalized.get("item_type", "equipment"))
    normalized["unit"] = normalize_unit(normalized.get("unit", "piece"))
    normalized.setdefault("id", str(uuid4()))
    normalized["household_id"] = str(normalized.get("household_id") or household_id or "")
    normalized.setdefault("created_at", normalized.get("updated_at", now))
    normalized.setdefault("updated_at", normalized["created_at"])
    normalized.setdefault("deleted_at", None)
    normalized.setdefault("revision", 1)
    normalized["schema_version"] = ITEM_SCHEMA_VERSION

    return normalized
