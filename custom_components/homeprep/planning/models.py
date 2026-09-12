"""Domain models for HomePrep planning."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

TARGET_SCHEMA_VERSION = 2
HOUSEHOLD_SCHEMA_VERSION = 1

TARGET_TYPES = {
    "quantity",
    "count",
    "coverage",
    "presence",
    "capability",
}

TARGET_ORIGINS = {
    "custom",
    "recommendation",
}


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_household_profile(
    data: dict[str, Any] | None = None,
) -> dict[str, Any]:
    data = data or {}
    now = utcnow_iso()

    return {
        "country_code": str(data.get("country_code") or "").upper() or None,
        "adults": max(0, int(data.get("adults", 1))),
        "children": max(0, int(data.get("children", 0))),
        "pets": max(0, int(data.get("pets", 0))),
        "preparedness_days": max(1, int(data.get("preparedness_days", 7))),
        "created_at": data.get("created_at", now),
        "updated_at": now,
        "schema_version": HOUSEHOLD_SCHEMA_VERSION,
    }


def normalize_household_profile(
    data: dict[str, Any] | None,
) -> dict[str, Any]:
    return create_household_profile(data or {})


def create_target(data: dict[str, Any]) -> dict[str, Any]:
    now = utcnow_iso()

    target_type = str(data.get("target_type", "quantity"))
    if target_type not in TARGET_TYPES:
        raise ValueError(f"Unsupported target type: {target_type}")

    origin = str(data.get("origin", "custom"))
    if origin not in TARGET_ORIGINS:
        raise ValueError(f"Unsupported target origin: {origin}")

    matcher = dict(data.get("matcher") or {})
    if not matcher:
        raise ValueError("A target requires a matcher")

    return {
        "id": str(data.get("id") or uuid4()),
        "name": str(data["name"]).strip(),
        "category": data.get("category"),
        "target_type": target_type,
        "matcher": matcher,
        "unit": data.get("unit"),
        "minimum_value": data.get("minimum_value"),
        "target_value": data.get("target_value"),
        "current_value": data.get("current_value"),
        "priority": str(data.get("priority", "normal")),
        "enabled": bool(data.get("enabled", True)),
        "notes": data.get("notes"),
        "origin": origin,
        "source_profile_id": data.get("source_profile_id"),
        "source_recommendation_id": data.get("source_recommendation_id"),
        "source_profile_version": data.get("source_profile_version"),
        "created_at": data.get("created_at", now),
        "updated_at": now,
        "revision": int(data.get("revision", 1)),
        "schema_version": TARGET_SCHEMA_VERSION,
    }


def normalize_target(data: dict[str, Any]) -> dict[str, Any]:
    normalized = create_target(data)
    normalized["id"] = str(data.get("id") or normalized["id"])
    normalized["created_at"] = data.get(
        "created_at",
        normalized["created_at"],
    )
    normalized["updated_at"] = data.get(
        "updated_at",
        normalized["updated_at"],
    )
    normalized["revision"] = max(1, int(data.get("revision", 1)))
    return normalized
