"""Domain models for HomePrep recurring tasks."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

TASK_SCHEMA_VERSION = 1

RECURRENCE_TYPES = {"days", "weeks", "months", "years"}
RESCHEDULE_MODES = {"completion", "scheduled"}


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_task(data: dict[str, Any]) -> dict[str, Any]:
    now = utcnow_iso()
    name = str(data["name"]).strip()
    if not name:
        raise ValueError("Task name is required")

    recurrence_type = str(data.get("recurrence_type", "months"))
    if recurrence_type not in RECURRENCE_TYPES:
        raise ValueError(f"Unsupported recurrence type: {recurrence_type}")

    recurrence_interval = int(data.get("recurrence_interval", 1))
    if recurrence_interval < 1:
        raise ValueError("recurrence_interval must be at least 1")

    reschedule_mode = str(data.get("reschedule_mode", "completion"))
    if reschedule_mode not in RESCHEDULE_MODES:
        raise ValueError(f"Unsupported reschedule mode: {reschedule_mode}")

    return {
        "id": str(data.get("id") or uuid4()),
        "name": name,
        "category": data.get("category"),
        "linked_item_id": data.get("linked_item_id"),
        "recurrence_type": recurrence_type,
        "recurrence_interval": recurrence_interval,
        "reschedule_mode": reschedule_mode,
        "last_completed_at": data.get("last_completed_at"),
        "next_due_at": data.get("next_due_at"),
        "reminder_before_days": max(0, int(data.get("reminder_before_days", 0))),
        "enabled": bool(data.get("enabled", True)),
        "notes": data.get("notes"),
        "completion_count": max(0, int(data.get("completion_count", 0))),
        "created_at": data.get("created_at", now),
        "updated_at": now,
        "revision": max(1, int(data.get("revision", 1))),
        "schema_version": TASK_SCHEMA_VERSION,
    }


def normalize_task(data: dict[str, Any]) -> dict[str, Any]:
    return create_task(data)
