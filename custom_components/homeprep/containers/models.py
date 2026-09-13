"""Domain models for HomePrep preparedness containers."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

CONTAINER_SCHEMA_VERSION = 2
CONTAINER_TYPES = {
    "bag",
    "box_crate",
    "water_container",
    "cabinet_storage",
    "vehicle_storage",
    "other",
}

LEGACY_CONTAINER_TYPES = {
    "go_bag": "bag",
    "prep_crate": "box_crate",
    "first_aid_kit": "bag",
    "vehicle_kit": "vehicle_storage",
    "storage": "cabinet_storage",
}


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_container(data: dict[str, Any], household_id: str | None = None) -> dict[str, Any]:
    now = utcnow_iso()
    name = str(data.get("name") or "").strip()
    if not name:
        raise ValueError("Container name is required")
    container_type = str(data.get("container_type") or "other")
    container_type = LEGACY_CONTAINER_TYPES.get(container_type, container_type)
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
    migrated = dict(data)
    migrated["container_type"] = LEGACY_CONTAINER_TYPES.get(str(migrated.get("container_type") or "other"), str(migrated.get("container_type") or "other"))
    result = create_container(migrated, household_id)
    result["id"] = str(data.get("id") or result["id"])
    result["created_at"] = data.get("created_at", result["created_at"])
    result["updated_at"] = data.get("updated_at", result["updated_at"])
    result["deleted_at"] = data.get("deleted_at")
    result["revision"] = max(1, int(data.get("revision", 1)))
    return result
