"""Domain models for HomePrep recurring tasks."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

TASK_SCHEMA_VERSION = 4

RECURRENCE_TYPES = {"days", "weeks", "months", "years"}
RESCHEDULE_MODES = {"completion", "scheduled"}
TASK_KINDS = {"general", "inspection", "container_inspection"}


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_task(
    data: dict[str, Any],
    household_id: str | None = None,
) -> dict[str, Any]:
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

    task_kind = str(data.get("task_kind", "general"))
    if task_kind not in TASK_KINDS:
        raise ValueError(f"Unsupported task kind: {task_kind}")

    return {
        "id": str(data.get("id") or uuid4()),
        "household_id": str(data.get("household_id") or household_id or ""),
        "name": name,
        "task_kind": task_kind,
        "category": data.get("category"),
        "linked_item_id": data.get("linked_item_id"),
        "linked_container_id": data.get("linked_container_id"),
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
        "updated_at": data.get("updated_at", now),
        "deleted_at": data.get("deleted_at"),
        "revision": max(1, int(data.get("revision", 1))),
        "schema_version": TASK_SCHEMA_VERSION,
    }


def normalize_task(
    data: dict[str, Any],
    household_id: str | None = None,
) -> dict[str, Any]:
    """Normalize legacy tasks without losing their identity/history."""
    normalized = create_task(data, household_id)
    normalized["id"] = str(data.get("id") or normalized["id"])
    normalized["created_at"] = data.get("created_at", normalized["created_at"])
    normalized["updated_at"] = data.get("updated_at", normalized["updated_at"])
    normalized["deleted_at"] = data.get("deleted_at")
    normalized["revision"] = max(1, int(data.get("revision", 1)))
    normalized["completion_count"] = max(0, int(data.get("completion_count", 0)))
    normalized["last_completed_at"] = data.get("last_completed_at")
    return normalized
