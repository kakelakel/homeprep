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


def _evaluate_requirements(
    target: dict[str, Any],
    inventory: list[dict[str, Any]],
) -> dict[str, Any] | None:
    requirements = list(target.get("requirements") or [])
    if not requirements:
        return None

    confirmed = set(target.get("completed_requirement_ids") or [])
    result_requirements: list[dict[str, Any]] = []
    completed_required = 0
    required_count = 0

    for requirement in requirements:
        requirement_id = requirement["id"]
        matcher = dict(requirement.get("matcher") or {})
        required = bool(requirement.get("required", True))
        matched_items = [
            item
            for item in inventory
            if matcher and item_matches(item, matcher)
        ]

        complete = requirement_id in confirmed or bool(matched_items)

        if required:
            required_count += 1
            if complete:
                completed_required += 1

        result_requirements.append(
            {
                **requirement,
                "complete": complete,
                "completion_source": (
                    "inventory" if matched_items else "manual" if complete else None
                ),
                "matching_count": len(matched_items),
            }
        )

    if required_count == 0:
        status = "met"
    elif completed_required == required_count:
        status = "met"
    elif completed_required > 0:
        status = "below_target"
    else:
        status = "below_minimum"

    return _result(
        target,
        current_value=completed_required,
        minimum_value=required_count,
        target_value=required_count,
        status=status,
        matching_count=sum(r["matching_count"] for r in result_requirements),
        incompatible_count=0,
        requirements=result_requirements,
        progress_label=(
            "Ready"
            if status == "met"
            else f"{completed_required} of {required_count} ready"
        ),
    )


def evaluate_target(
    target: dict[str, Any],
    inventory: list[dict[str, Any]],
) -> dict[str, Any]:
    """Return target progress in a form intended for human-facing UI."""
    target_type = target["target_type"]

    if target_type in {"presence", "capability", "checklist"}:
        requirement_result = _evaluate_requirements(target, inventory)
        if requirement_result is not None:
            return requirement_result

    matching = [
        item
        for item in inventory
        if item_matches(item, target.get("matcher") or {})
    ]

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
            progress_label="Ready" if current else "Not ready",
        )

    if target_type == "count":
        current = sum(
            float(item.get("quantity") or 0)
            for item in matching
        )
        return _numeric_result(target, current, len(matching), 0)

    if target_type == "coverage":
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
                progress_label="Not assessed",
            )

        result = _numeric_result(
            target,
            float(current),
            len(matching),
            0,
        )
        result["progress_label"] = (
            f"{_display_number(current)} {target.get('unit') or ''}".strip()
        )
        return result

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
            progress_label="Not measurable",
        )

    current = 0.0
    incompatible = 0

    for item in matching:
        quantity = float(item.get("quantity") or 0)
        item_unit = item.get("unit")
        converted = convert_value(quantity, item_unit, target_unit)

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


def _display_number(value: Any) -> str:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return str(value)

    return str(int(number)) if number.is_integer() else f"{number:g}"


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

    unit = target.get("unit") or ""
    return _result(
        target,
        current_value=current,
        minimum_value=minimum,
        target_value=desired,
        status=status,
        matching_count=matching_count,
        incompatible_count=incompatible_count,
        progress_label=f"{_display_number(current)} {unit}".strip(),
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
    requirements: list[dict[str, Any]] | None = None,
    progress_label: str | None = None,
) -> dict[str, Any]:
    return {
        "target_id": target["id"],
        "name": target["name"],
        "target_type": target.get("target_type"),
        "status": status,
        "current_value": current_value,
        "minimum_value": minimum_value,
        "target_value": target_value,
        "unit": target.get("unit"),
        "matching_count": matching_count,
        "incompatible_count": incompatible_count,
        "requirements": requirements or [],
        "progress_label": progress_label,
    }
