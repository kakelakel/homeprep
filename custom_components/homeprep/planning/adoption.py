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
    """Resolve a recommendation transparently and conservatively."""
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
    pets = int(household.get("pets") or 0)
    people = adults + children

    notes: list[str] = []

    result["calculated"] = {
        "preparedness_days": days,
        "people": people,
        "adults": adults,
        "children": children,
        "pets": pets,
        "calculation_notes": notes,
    }

    if kind == "quantity_per_person_per_day":
        minimum_rate = float(rule["minimum"])
        target_rate = float(rule.get("target", minimum_rate))

        result["calculated"].update(
            {
                "minimum_value": minimum_rate * people * days,
                "target_value": target_rate * people * days,
                "unit": rule["unit"],
                "rate_basis": "person_per_day",
                "minimum_rate": minimum_rate,
                "target_rate": target_rate,
            }
        )

        notes.append(
            f"Calculated for {people} people over {days} days."
        )

    elif kind == "quantity_per_adult_per_day":
        minimum_rate = float(rule["minimum"])
        target_rate = float(
            rule.get("maximum", rule.get("target", minimum_rate))
        )

        result["calculated"].update(
            {
                "minimum_value": minimum_rate * adults * days,
                "target_value": target_rate * adults * days,
                "unit": rule["unit"],
                "rate_basis": "adult_per_day",
                "minimum_rate": minimum_rate,
                "target_rate": target_rate,
            }
        )

        notes.append(
            f"Quantified source rate applies to {adults} adults over {days} days."
        )

        if children:
            notes.append(
                f"{children} children are in the household but are not included "
                "in this numeric source rule."
            )

    elif kind == "quantity_per_person_total":
        per_person = float(rule["value"])

        result["calculated"].update(
            {
                "minimum_value": per_person * people,
                "target_value": per_person * people,
                "unit": rule["unit"],
                "rate_basis": "person_total",
                "per_person_value": per_person,
            }
        )

        notes.append(
            f"Calculated for {people} people."
        )

    elif kind == "coverage_days":
        value = int(rule.get("days") or days)

        result["calculated"].update(
            {
                "minimum_value": value,
                "target_value": value,
                "unit": "day",
                "rate_basis": "coverage_days",
            }
        )

    elif kind in {"presence", "capability"}:
        result["calculated"].update(
            {
                "minimum_value": 1,
                "target_value": 1,
                "unit": None,
                "rate_basis": kind,
            }
        )

    else:
        result["calculated"]["advisory_only"] = True
        notes.append(
            "This recommendation is advisory only and has no safe numeric conversion."
        )

    if pets and recommendation.get("pet_adjustment_note"):
        notes.append(recommendation["pet_adjustment_note"])

    if recommendation.get("household_adjustment_note"):
        notes.append(recommendation["household_adjustment_note"])

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
    notes = []

    if recommendation.get("advisory_note"):
        notes.append(recommendation["advisory_note"])

    notes.extend(
        calculated.get("calculation_notes") or []
    )

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
            "notes": "\n".join(notes) if notes else None,
            "origin": "recommendation",
            "source_profile_id": profile["id"],
            "source_recommendation_id": recommendation["id"],
            "source_profile_version": profile["version"],
        }
    )
