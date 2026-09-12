"""Evaluate HomePrep personal targets against inventory."""

from __future__ import annotations

from typing import Any

from .units import convert_value


def item_matches(
    item: dict[str, Any],
    matcher: dict[str, Any],
) -> bool:
    """Match an inventory item using conservative explicit rules."""
    if "item_id" in matcher and item.get("id") != matcher["item_id"]:
        return False

    if (
        "category" in matcher
        and item.get("category") != matcher["category"]
    ):
        return False

    if (
        "item_type" in matcher
        and item.get("item_type") != matcher["item_type"]
    ):
        return False

    name_contains = matcher.get("name_contains")
    if name_contains:
        if str(name_contains).lower() not in str(
            item.get("name", "")
        ).lower():
            return False

    return True


def evaluate_target(
    target: dict[str, Any],
    inventory: list[dict[str, Any]],
) -> dict[str, Any]:
    """Return target progress without guessing incompatible quantities."""
    matching = [
        item
        for item in inventory
        if item_matches(item, target["matcher"])
    ]

    target_type = target["target_type"]

    if target_type in {"presence", "capability"}:
        current = bool(matching)

        return _result(
            target,
            current_value=1 if current else 0,
            minimum_value=1,
            target_value=1,
            status="met" if current else "below_minimum",
            matching_count=len(matching),
            incompatible_count=0,
        )

    if target_type == "count":
        current = sum(
            float(item.get("quantity") or 0)
            for item in matching
        )

        return _numeric_result(
            target,
            current,
            len(matching),
            0,
        )

    if target_type == "coverage":
        # Coverage is an explicit value maintained by the user/app.
        # Inventory cannot safely infer "days of food" from arbitrary items.
        current = target.get("current_value")

        if current is None:
            return _result(
                target,
                current_value=None,
                minimum_value=target.get("minimum_value"),
                target_value=target.get("target_value"),
                status="unknown",
                matching_count=len(matching),
                incompatible_count=0,
            )

        return _numeric_result(
            target,
            float(current),
            len(matching),
            0,
        )

    # quantity
    target_unit = target.get("unit")
    if not target_unit:
        return _result(
            target,
            current_value=None,
            minimum_value=target.get("minimum_value"),
            target_value=target.get("target_value"),
            status="unknown",
            matching_count=len(matching),
            incompatible_count=len(matching),
        )

    current = 0.0
    incompatible = 0

    for item in matching:
        quantity = float(item.get("quantity") or 0)
        item_unit = item.get("unit")

        converted = convert_value(
            quantity,
            item_unit,
            target_unit,
        )

        if converted is None:
            incompatible += 1
            continue

        current += converted

    return _numeric_result(
        target,
        current,
        len(matching),
        incompatible,
    )


def _numeric_result(
    target: dict[str, Any],
    current: float,
    matching_count: int,
    incompatible_count: int,
) -> dict[str, Any]:
    minimum = target.get("minimum_value")
    desired = target.get("target_value")

    if minimum is not None and current < float(minimum):
        status = "below_minimum"
    elif desired is not None and current < float(desired):
        status = "below_target"
    else:
        status = "met"

    return _result(
        target,
        current_value=current,
        minimum_value=minimum,
        target_value=desired,
        status=status,
        matching_count=matching_count,
        incompatible_count=incompatible_count,
    )


def _result(
    target: dict[str, Any],
    *,
    current_value: Any,
    minimum_value: Any,
    target_value: Any,
    status: str,
    matching_count: int,
    incompatible_count: int,
) -> dict[str, Any]:
    return {
        "target_id": target["id"],
        "name": target["name"],
        "status": status,
        "current_value": current_value,
        "minimum_value": minimum_value,
        "target_value": target_value,
        "unit": target.get("unit"),
        "matching_count": matching_count,
        "incompatible_count": incompatible_count,
    }
