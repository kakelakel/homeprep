"""Convert official recommendations into editable personal targets."""

from __future__ import annotations

from copy import deepcopy
from typing import Any

from .models import create_target


def calculate_recommendation(
    recommendation: dict[str, Any],
    household: dict[str, Any],
    profile: dict[str, Any],
) -> dict[str, Any]:
    """Resolve a recommendation for a household.

    The calculation is intentionally transparent and conservative.
    Unsupported or conditional guidance remains advisory instead of being
    guessed into a numeric target.
    """
    result = deepcopy(recommendation)
    rule = recommendation.get("rule") or {}
    kind = rule.get("kind")

    days = int(
        household.get("preparedness_days")
        or profile.get("default_duration_days")
        or 7
    )

    adults = int(household.get("adults") or 0)
    children = int(household.get("children") or 0)
    people = adults + children

    result["calculated"] = {
        "preparedness_days": days,
        "people": people,
        "adults": adults,
        "children": children,
    }

    if kind == "quantity_per_adult_per_day":
        minimum = float(rule["minimum"]) * adults * days
        maximum = (
            float(rule["maximum"]) * adults * days
            if rule.get("maximum") is not None
            else minimum
        )

        result["calculated"].update(
            {
                "minimum_value": minimum,
                "target_value": maximum,
                "unit": rule["unit"],
            }
        )

    elif kind == "quantity_per_person_total":
        value = float(rule["value"]) * people

        result["calculated"].update(
            {
                "minimum_value": value,
                "target_value": value,
                "unit": rule["unit"],
            }
        )

    elif kind == "coverage_days":
        value = int(rule.get("days") or days)

        result["calculated"].update(
            {
                "minimum_value": value,
                "target_value": value,
                "unit": "day",
            }
        )

    elif kind in {"presence", "capability"}:
        result["calculated"].update(
            {
                "minimum_value": 1,
                "target_value": 1,
                "unit": None,
            }
        )

    else:
        result["calculated"]["advisory_only"] = True

    return result


def adopt_recommendation(
    recommendation: dict[str, Any],
    household: dict[str, Any],
    profile: dict[str, Any],
) -> dict[str, Any]:
    """Create an independent personal target from official guidance."""
    resolved = calculate_recommendation(
        recommendation,
        household,
        profile,
    )

    calculated = resolved.get("calculated") or {}

    return create_target(
        {
            "name": recommendation["title"],
            "category": recommendation.get("category"),
            "target_type": recommendation["target_type"],
            "matcher": recommendation.get("matcher") or {
                "category": recommendation.get("category")
            },
            "unit": calculated.get("unit"),
            "minimum_value": calculated.get("minimum_value"),
            "target_value": calculated.get("target_value"),
            "priority": recommendation.get("priority", "normal"),
            "notes": recommendation.get("advisory_note"),
            "origin": "recommendation",
            "source_profile_id": profile["id"],
            "source_recommendation_id": recommendation["id"],
            "source_profile_version": profile["version"],
        }
    )
