"""Domain models for HomePrep shopping list entries."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

SHOPPING_SCHEMA_VERSION = 1
SHOPPING_STATUSES = {"pending", "purchased", "ignored"}
SHOPPING_SOURCES = {"manual", "inventory_expired", "target_shortage", "plan_requirement", "container_requirement", "asset_maintenance"}


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_shopping_item(data: dict[str, Any], household_id: str | None = None) -> dict[str, Any]:
    now = utcnow_iso()
    name = str(data.get("name") or "").strip()
    if not name:
        raise ValueError("Shopping item name is required")
    status = str(data.get("status") or "pending")
    if status not in SHOPPING_STATUSES:
        raise ValueError(f"Unsupported shopping status: {status}")
    source_type = str(data.get("source_type") or "manual")
    if source_type not in SHOPPING_SOURCES:
        raise ValueError(f"Unsupported shopping source: {source_type}")
    return {
        "id": str(data.get("id") or uuid4()),
        "household_id": str(data.get("household_id") or household_id or ""),
        "name": name,
        "quantity": max(0.0, float(data.get("quantity", 1) or 0)),
        "unit": str(data.get("unit") or "piece"),
        "category": str(data.get("category") or "other"),
        "container_id": data.get("container_id") or None,
        "source_type": source_type,
        "source_id": data.get("source_id") or None,
        "reason": str(data.get("reason") or "").strip() or None,
        "status": status,
        "notes": str(data.get("notes") or "").strip() or None,
        "purchased_at": data.get("purchased_at"),
        "ignored_at": data.get("ignored_at"),
        "created_at": data.get("created_at", now),
        "updated_at": data.get("updated_at", now),
        "deleted_at": data.get("deleted_at"),
        "revision": max(1, int(data.get("revision", 1))),
        "schema_version": SHOPPING_SCHEMA_VERSION,
    }


def normalize_shopping_item(data: dict[str, Any], household_id: str | None = None) -> dict[str, Any]:
    result = create_shopping_item(data, household_id)
    result["id"] = str(data.get("id") or result["id"])
    result["created_at"] = data.get("created_at", result["created_at"])
    result["updated_at"] = data.get("updated_at", result["updated_at"])
    result["deleted_at"] = data.get("deleted_at")
    result["revision"] = max(1, int(data.get("revision", 1)))
    return result
