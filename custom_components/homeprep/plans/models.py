"""Domain models for HomePrep preparedness plans."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

PLAN_SCHEMA_VERSION = 1
PLAN_TYPES = {"fire", "flood", "evacuation", "power_outage", "communication", "shelter", "other"}


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_check_item(item: dict[str, Any]) -> dict[str, Any]:
    label = str(item.get("label") or "").strip()
    if not label:
        raise ValueError("Checklist item label is required")
    return {
        "id": str(item.get("id") or uuid4()),
        "label": label,
        "description": str(item.get("description") or "").strip() or None,
        "completed": bool(item.get("completed", False)),
    }


def create_plan(data: dict[str, Any], household_id: str | None = None) -> dict[str, Any]:
    now = utcnow_iso()
    name = str(data.get("name") or "").strip()
    if not name:
        raise ValueError("Plan name is required")
    plan_type = str(data.get("plan_type") or "other")
    if plan_type not in PLAN_TYPES:
        raise ValueError(f"Unsupported plan type: {plan_type}")
    checklist = [normalize_check_item(item) for item in data.get("checklist", [])]
    return {
        "id": str(data.get("id") or uuid4()),
        "household_id": str(data.get("household_id") or household_id or ""),
        "name": name,
        "plan_type": plan_type,
        "description": str(data.get("description") or "").strip() or None,
        "meeting_point": str(data.get("meeting_point") or "").strip() or None,
        "enabled": bool(data.get("enabled", True)),
        "checklist": checklist,
        "notes": str(data.get("notes") or "").strip() or None,
        "created_at": data.get("created_at", now),
        "updated_at": data.get("updated_at", now),
        "deleted_at": data.get("deleted_at"),
        "revision": max(1, int(data.get("revision", 1))),
        "schema_version": PLAN_SCHEMA_VERSION,
    }


def normalize_plan(data: dict[str, Any], household_id: str | None = None) -> dict[str, Any]:
    result = create_plan(data, household_id)
    result["id"] = str(data.get("id") or result["id"])
    result["created_at"] = data.get("created_at", result["created_at"])
    result["updated_at"] = data.get("updated_at", result["updated_at"])
    result["deleted_at"] = data.get("deleted_at")
    result["revision"] = max(1, int(data.get("revision", 1)))
    return result
