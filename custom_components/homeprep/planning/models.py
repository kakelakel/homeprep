"""Domain models for HomePrep planning."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

TARGET_SCHEMA_VERSION = 4
HOUSEHOLD_SCHEMA_VERSION = 2

TARGET_TYPES = {"quantity", "count", "coverage", "presence", "capability", "checklist"}
TARGET_ORIGINS = {"custom", "recommendation"}


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_household_profile(
    data: dict[str, Any] | None = None,
    household_id: str | None = None,
) -> dict[str, Any]:
    data = data or {}
    now = utcnow_iso()
    stable_id = str(data.get("id") or household_id or uuid4())

    return {
        "id": stable_id,
        "country_code": str(data.get("country_code") or "").upper() or None,
        "adults": max(0, int(data.get("adults", 1))),
        "children": max(0, int(data.get("children", 0))),
        "pets": max(0, int(data.get("pets", 0))),
        "preparedness_days": max(1, int(data.get("preparedness_days", 7))),
        "created_at": data.get("created_at", now),
        "updated_at": data.get("updated_at", now),
        "revision": max(1, int(data.get("revision", 1))),
        "schema_version": HOUSEHOLD_SCHEMA_VERSION,
    }


def normalize_household_profile(
    data: dict[str, Any] | None,
    household_id: str | None = None,
) -> dict[str, Any]:
    return create_household_profile(data or {}, household_id)


def _normalize_requirements(value: Any) -> list[dict[str, Any]]:
    requirements: list[dict[str, Any]] = []
    for index, raw in enumerate(value or []):
        if not isinstance(raw, dict):
            continue
        requirement_id = str(raw.get("id") or f"requirement_{index + 1}").strip()
        label = str(raw.get("label") or requirement_id).strip()
        if not requirement_id or not label:
            continue
        requirements.append({
            "id": requirement_id,
            "label": label,
            "description": raw.get("description"),
            "matcher": dict(raw.get("matcher") or {}),
            "required": bool(raw.get("required", True)),
        })
    return requirements


def create_target(
    data: dict[str, Any],
    household_id: str | None = None,
) -> dict[str, Any]:
    now = utcnow_iso()
    target_type = str(data.get("target_type", "quantity"))
    if target_type not in TARGET_TYPES:
        raise ValueError(f"Unsupported target type: {target_type}")

    origin = str(data.get("origin", "custom"))
    if origin not in TARGET_ORIGINS:
        raise ValueError(f"Unsupported target origin: {origin}")

    matcher = dict(data.get("matcher") or {})
    requirements = _normalize_requirements(data.get("requirements"))
    if not matcher and target_type in {"quantity", "count"}:
        raise ValueError("A numeric target requires a matcher")

    completed = {str(value) for value in (data.get("completed_requirement_ids") or [])}
    valid_requirement_ids = {item["id"] for item in requirements}

    return {
        "id": str(data.get("id") or uuid4()),
        "household_id": str(data.get("household_id") or household_id or ""),
        "name": str(data["name"]).strip(),
        "category": data.get("category"),
        "target_type": target_type,
        "matcher": matcher,
        "unit": data.get("unit"),
        "minimum_value": data.get("minimum_value"),
        "target_value": data.get("target_value"),
        "current_value": data.get("current_value"),
        "requirements": requirements,
        "completed_requirement_ids": sorted(completed & valid_requirement_ids),
        "priority": str(data.get("priority", "normal")),
        "enabled": bool(data.get("enabled", True)),
        "notes": data.get("notes"),
        "origin": origin,
        "source_profile_id": data.get("source_profile_id"),
        "source_recommendation_id": data.get("source_recommendation_id"),
        "source_profile_version": data.get("source_profile_version"),
        "created_at": data.get("created_at", now),
        "updated_at": data.get("updated_at", now),
        "deleted_at": data.get("deleted_at"),
        "revision": max(1, int(data.get("revision", 1))),
        "schema_version": TARGET_SCHEMA_VERSION,
    }


def normalize_target(
    data: dict[str, Any],
    household_id: str | None = None,
) -> dict[str, Any]:
    migrated = dict(data)
    if migrated.get("target_type") in {"presence", "capability"} and not migrated.get("requirements"):
        migrated["requirements"] = [{
            "id": "ready",
            "label": migrated.get("name") or "Requirement is ready",
            "description": "Confirm when this preparedness capability is available and usable.",
            "matcher": {},
            "required": True,
        }]

    normalized = create_target(migrated, household_id)
    normalized["id"] = str(data.get("id") or normalized["id"])
    normalized["created_at"] = data.get("created_at", normalized["created_at"])
    normalized["updated_at"] = data.get("updated_at", normalized["updated_at"])
    normalized["deleted_at"] = data.get("deleted_at")
    normalized["revision"] = max(1, int(data.get("revision", 1)))
    return normalized
