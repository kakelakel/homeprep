"""Domain models for HomePrep preparedness containers."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

CONTAINER_SCHEMA_VERSION = 1
CONTAINER_TYPES = {
    "go_bag",
    "prep_crate",
    "water_container",
    "first_aid_kit",
    "vehicle_kit",
    "storage",
    "other",
}


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_container(data: dict[str, Any], household_id: str | None = None) -> dict[str, Any]:
    now = utcnow_iso()
    name = str(data.get("name") or "").strip()
    if not name:
        raise ValueError("Container name is required")
    container_type = str(data.get("container_type") or "other")
    if container_type not in CONTAINER_TYPES:
        raise ValueError(f"Unsupported container type: {container_type}")
    return {
        "id": str(data.get("id") or uuid4()),
        "household_id": str(data.get("household_id") or household_id or ""),
        "name": name,
        "container_type": container_type,
        "location": str(data.get("location") or "").strip() or None,
        "description": str(data.get("description") or "").strip() or None,
        "last_checked_at": data.get("last_checked_at") or None,
        "next_check_at": data.get("next_check_at") or None,
        "notes": str(data.get("notes") or "").strip() or None,
        "created_at": data.get("created_at", now),
        "updated_at": data.get("updated_at", now),
        "deleted_at": data.get("deleted_at"),
        "revision": max(1, int(data.get("revision", 1))),
        "schema_version": CONTAINER_SCHEMA_VERSION,
    }


def normalize_container(data: dict[str, Any], household_id: str | None = None) -> dict[str, Any]:
    result = create_container(data, household_id)
    result["id"] = str(data.get("id") or result["id"])
    result["created_at"] = data.get("created_at", result["created_at"])
    result["updated_at"] = data.get("updated_at", result["updated_at"])
    result["deleted_at"] = data.get("deleted_at")
    result["revision"] = max(1, int(data.get("revision", 1)))
    return result
