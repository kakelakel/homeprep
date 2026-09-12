"""Domain models for HomePrep."""

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


ITEM_SCHEMA_VERSION = 1


def utcnow_iso() -> str:
    """Return the current UTC timestamp as ISO 8601."""
    return datetime.now(timezone.utc).isoformat()


def create_item(data: dict[str, Any]) -> dict[str, Any]:
    """Create a new HomePrep item."""

    now = utcnow_iso()

    return {
        "id": str(uuid4()),
        "name": data["name"],
        "category": data["category"],
        "item_type": data["item_type"],
        "quantity": data["quantity"],
        "unit": data["unit"],
        "expires_at": data.get("expires_at"),
        "last_checked": data.get("last_checked"),
        "next_check_at": data.get("next_check_at"),
        "notes": data.get("notes"),
        "created_at": now,
        "updated_at": now,
        "revision": 1,
        "schema_version": ITEM_SCHEMA_VERSION,
    }


def normalize_item(item: dict[str, Any]) -> dict[str, Any]:
    """Normalize an item loaded from storage.

    This allows older HomePrep items to be upgraded without
    breaking existing installations.
    """

    normalized = dict(item)

    now = utcnow_iso()

    normalized.setdefault(
        "created_at",
        normalized.get("updated_at", now),
    )

    normalized.setdefault(
        "updated_at",
        normalized["created_at"],
    )

    normalized.setdefault("revision", 1)
    normalized.setdefault("schema_version", ITEM_SCHEMA_VERSION)

    return normalized
