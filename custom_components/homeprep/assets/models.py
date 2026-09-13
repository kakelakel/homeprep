"""Domain models for HomePrep household assets."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

ASSET_SCHEMA_VERSION = 2
ASSET_TYPES = {
    "water_shutoff",
    "isolation_valve",
    "floor_drain",
    "leak_sensor",
    "backflow_valve",
    "sump_pump",
    "smoke_alarm",
    "fire_extinguisher",
    "electrical_panel",
    "generator",
    "other",
}


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_asset(data: dict[str, Any], household_id: str | None = None) -> dict[str, Any]:
    now = utcnow_iso()
    name = str(data.get("name") or "").strip()
    if not name:
        raise ValueError("Asset name is required")
    asset_type = str(data.get("asset_type") or "other")
    if asset_type not in ASSET_TYPES:
        raise ValueError(f"Unsupported asset type: {asset_type}")
    return {
        "id": str(data.get("id") or uuid4()),
        "household_id": str(data.get("household_id") or household_id or ""),
        "name": name,
        "asset_type": asset_type,
        "location": str(data.get("location") or "").strip() or None,
        "description": str(data.get("description") or "").strip() or None,
        "instructions": str(data.get("instructions") or "").strip() or None,
        "last_checked_at": data.get("last_checked_at") or None,
        "next_check_at": data.get("next_check_at") or None,
        "notes": str(data.get("notes") or "").strip() or None,
        "image_id": data.get("image_id"),
        "image_token": data.get("image_token"),
        "image_content_type": data.get("image_content_type"),
        "image_filename": data.get("image_filename"),
        "created_at": data.get("created_at", now),
        "updated_at": data.get("updated_at", now),
        "deleted_at": data.get("deleted_at"),
        "revision": max(1, int(data.get("revision", 1))),
        "schema_version": ASSET_SCHEMA_VERSION,
    }


def normalize_asset(data: dict[str, Any], household_id: str | None = None) -> dict[str, Any]:
    result = create_asset(data, household_id)
    result["id"] = str(data.get("id") or result["id"])
    result["created_at"] = data.get("created_at", result["created_at"])
    result["updated_at"] = data.get("updated_at", result["updated_at"])
    result["deleted_at"] = data.get("deleted_at")
    result["revision"] = max(1, int(data.get("revision", 1)))
    return result
