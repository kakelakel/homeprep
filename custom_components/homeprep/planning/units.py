"""Safe unit conversion for HomePrep target evaluation.

Only dimensions with unambiguous conversions are supported.
Packaging/count units are deliberately not converted.
"""

from __future__ import annotations

from typing import Any

UNIT_DIMENSIONS: dict[str, tuple[str, float]] = {
    # Volume, base litre
    "milliliter": ("volume", 0.001),
    "centiliter": ("volume", 0.01),
    "deciliter": ("volume", 0.1),
    "liter": ("volume", 1.0),
    "cubic_meter": ("volume", 1000.0),
    "fluid_ounce_us": ("volume", 0.0295735295625),
    "cup_us": ("volume", 0.2365882365),
    "pint_us": ("volume", 0.473176473),
    "quart_us": ("volume", 0.946352946),
    "gallon_us": ("volume", 3.785411784),
    "fluid_ounce_imperial": ("volume", 0.0284130625),
    "pint_imperial": ("volume", 0.56826125),
    "quart_imperial": ("volume", 1.1365225),
    "gallon_imperial": ("volume", 4.54609),

    # Mass, base kilogram
    "milligram": ("mass", 0.000001),
    "gram": ("mass", 0.001),
    "kilogram": ("mass", 1.0),
    "ounce": ("mass", 0.028349523125),
    "pound": ("mass", 0.45359237),
    "stone": ("mass", 6.35029318),

    # Energy, base Wh
    "watt_hour": ("energy", 1.0),
    "kilowatt_hour": ("energy", 1000.0),

    # Count-compatible canonical units
    "piece": ("count", 1.0),
    "pair": ("count", 2.0),
    "dozen": ("count", 12.0),
}


def convert_value(
    value: float | int,
    from_unit: str,
    to_unit: str,
) -> float | None:
    """Convert value when both units share a known dimension."""
    if from_unit == to_unit:
        return float(value)

    source = UNIT_DIMENSIONS.get(from_unit)
    target = UNIT_DIMENSIONS.get(to_unit)

    if not source or not target:
        return None

    if source[0] != target[0]:
        return None

    base_value = float(value) * source[1]
    return base_value / target[1]
