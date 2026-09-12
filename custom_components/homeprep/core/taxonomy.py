"""Canonical taxonomy definitions for HomePrep."""

from typing import Any


CATEGORIES: dict[str, str] = {
    "food": "Food",
    "water": "Water",
    "medicine": "Medicine",
    "first_aid": "First aid",
    "hygiene": "Hygiene",
    "lighting": "Lighting",
    "power": "Power",
    "communication": "Communication",
    "fire_safety": "Fire safety",
    "tools": "Tools",
    "shelter_warmth": "Shelter & warmth",
    "cooking": "Cooking",
    "documents": "Documents",
    "cash": "Cash",
    "pet_supplies": "Pet supplies",
    "other": "Other",
}


CATEGORY_GROUPS: dict[str, str] = {
    "food": "Essentials",
    "water": "Essentials",
    "cooking": "Essentials",
    "shelter_warmth": "Essentials",

    "medicine": "Health",
    "first_aid": "Health",
    "hygiene": "Health",

    "fire_safety": "Safety",

    "lighting": "Utilities",
    "power": "Utilities",
    "communication": "Utilities",

    "tools": "Household",
    "pet_supplies": "Household",

    "documents": "Administration",
    "cash": "Administration",

    "other": "Other",
}


CATEGORY_SMART: dict[str, dict[str, Any]] = {
    "food": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "can",
            "jar",
            "bag",
            "portion",
            "meal",
            "serving",
            "gram",
            "kilogram",
        ],
    },

    "water": {
        "default_unit": "liter",
        "preferred_units": [
            "liter",
            "milliliter",
            "canister",
            "bottle",
            "gallon_us",
            "gallon_imperial",
        ],
    },

    "medicine": {
        "default_unit": "tablet",
        "preferred_units": [
            "tablet",
            "blister_pack",
            "capsule",
            "dose",
            "bottle",
            "milliliter",
            "ampoule",
            "vial",
        ],
    },

    "first_aid": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "box",
            "roll",
            "sheet",
            "bottle",
            "tube",
        ],
    },

    "hygiene": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "roll",
            "bottle",
            "tube",
            "milliliter",
            "liter",
        ],
    },

    "lighting": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "set",
        ],
    },

    "power": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "set",
            "watt_hour",
            "kilowatt_hour",
        ],
    },

    "communication": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "pack",
        ],
    },

    "fire_safety": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "pack",
            "kilogram",
            "liter",
        ],
    },

    "tools": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "pair",
            "pack",
        ],
    },

    "shelter_warmth": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "pair",
            "pack",
            "meter",
            "square_meter",
            "foot",
            "square_foot",
        ],
    },

    "cooking": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "pack",
            "bottle",
            "canister",
            "liter",
            "kilogram",
        ],
    },

    "documents": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "set",
            "sheet",
        ],
    },

    "cash": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
        ],
    },

    "pet_supplies": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "bag",
            "can",
            "bottle",
            "liter",
            "kilogram",
        ],
    },

    "other": {
        "default_unit": "piece",
        "preferred_units": [
            "piece",
            "pack",
            "set",
        ],
    },
}


ITEM_TYPES: dict[str, str] = {
    "consumable": "Consumable",
    "equipment": "Equipment",
}


UNITS: dict[str, dict[str, str | None]] = {
    # Count
    "piece": {
        "label": "Piece",
        "symbol": "pcs",
        "group": "Count",
        "system": "neutral",
    },
    "pair": {
        "label": "Pair",
        "symbol": None,
        "group": "Count",
        "system": "neutral",
    },
    "set": {
        "label": "Set",
        "symbol": None,
        "group": "Count",
        "system": "neutral",
    },
    "dozen": {
        "label": "Dozen",
        "symbol": "doz",
        "group": "Count",
        "system": "neutral",
    },

    # Packaging
    "pack": {
        "label": "Pack",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "box": {
        "label": "Box",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "carton": {
        "label": "Carton",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "crate": {
        "label": "Crate",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "bag": {
        "label": "Bag",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "sachet": {
        "label": "Sachet",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "bottle": {
        "label": "Bottle",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "can": {
        "label": "Can",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "jar": {
        "label": "Jar",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "tube": {
        "label": "Tube",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "roll": {
        "label": "Roll",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "sheet": {
        "label": "Sheet",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "bucket": {
        "label": "Bucket",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },
    "canister": {
        "label": "Canister",
        "symbol": None,
        "group": "Packaging",
        "system": "neutral",
    },

    # Medicine
    "blister_pack": {
        "label": "Blister pack",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },
    "tablet": {
        "label": "Tablet",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },
    "capsule": {
        "label": "Capsule",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },
    "dose": {
        "label": "Dose",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },
    "ampoule": {
        "label": "Ampoule",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },
    "vial": {
        "label": "Vial",
        "symbol": None,
        "group": "Medicine",
        "system": "neutral",
    },

    # Food
    "portion": {
        "label": "Portion",
        "symbol": None,
        "group": "Food",
        "system": "neutral",
    },
    "meal": {
        "label": "Meal",
        "symbol": None,
        "group": "Food",
        "system": "neutral",
    },
    "serving": {
        "label": "Serving",
        "symbol": None,
        "group": "Food",
        "system": "neutral",
    },

    # Metric volume
    "milliliter": {
        "label": "Milliliter",
        "symbol": "ml",
        "group": "Volume",
        "system": "metric",
    },
    "centiliter": {
        "label": "Centiliter",
        "symbol": "cl",
        "group": "Volume",
        "system": "metric",
    },
    "deciliter": {
        "label": "Deciliter",
        "symbol": "dl",
        "group": "Volume",
        "system": "metric",
    },
    "liter": {
        "label": "Liter",
        "symbol": "L",
        "group": "Volume",
        "system": "metric",
    },
    "cubic_meter": {
        "label": "Cubic meter",
        "symbol": "m³",
        "group": "Volume",
        "system": "metric",
    },

    # US customary volume
    "fluid_ounce_us": {
        "label": "US fluid ounce",
        "symbol": "fl oz",
        "group": "Volume",
        "system": "us_customary",
    },
    "cup_us": {
        "label": "US cup",
        "symbol": "cup",
        "group": "Volume",
        "system": "us_customary",
    },
    "pint_us": {
        "label": "US pint",
        "symbol": "pt",
        "group": "Volume",
        "system": "us_customary",
    },
    "quart_us": {
        "label": "US quart",
        "symbol": "qt",
        "group": "Volume",
        "system": "us_customary",
    },
    "gallon_us": {
        "label": "US gallon",
        "symbol": "gal",
        "group": "Volume",
        "system": "us_customary",
    },

    # Imperial volume
    "fluid_ounce_imperial": {
        "label": "Imperial fluid ounce",
        "symbol": "fl oz",
        "group": "Volume",
        "system": "imperial",
    },
    "pint_imperial": {
        "label": "Imperial pint",
        "symbol": "pt",
        "group": "Volume",
        "system": "imperial",
    },
    "quart_imperial": {
        "label": "Imperial quart",
        "symbol": "qt",
        "group": "Volume",
        "system": "imperial",
    },
    "gallon_imperial": {
        "label": "Imperial gallon",
        "symbol": "gal",
        "group": "Volume",
        "system": "imperial",
    },

    # Metric mass
    "milligram": {
        "label": "Milligram",
        "symbol": "mg",
        "group": "Mass",
        "system": "metric",
    },
    "gram": {
        "label": "Gram",
        "symbol": "g",
        "group": "Mass",
        "system": "metric",
    },
    "kilogram": {
        "label": "Kilogram",
        "symbol": "kg",
        "group": "Mass",
        "system": "metric",
    },

    # Customary mass
    "ounce": {
        "label": "Ounce",
        "symbol": "oz",
        "group": "Mass",
        "system": "customary",
    },
    "pound": {
        "label": "Pound",
        "symbol": "lb",
        "group": "Mass",
        "system": "customary",
    },
    "stone": {
        "label": "Stone",
        "symbol": "st",
        "group": "Mass",
        "system": "imperial",
    },

    # Metric length
    "millimeter": {
        "label": "Millimeter",
        "symbol": "mm",
        "group": "Length",
        "system": "metric",
    },
    "centimeter": {
        "label": "Centimeter",
        "symbol": "cm",
        "group": "Length",
        "system": "metric",
    },
    "meter": {
        "label": "Meter",
        "symbol": "m",
        "group": "Length",
        "system": "metric",
    },
    "kilometer": {
        "label": "Kilometer",
        "symbol": "km",
        "group": "Length",
        "system": "metric",
    },

    # Customary length
    "inch": {
        "label": "Inch",
        "symbol": "in",
        "group": "Length",
        "system": "customary",
    },
    "foot": {
        "label": "Foot",
        "symbol": "ft",
        "group": "Length",
        "system": "customary",
    },
    "yard": {
        "label": "Yard",
        "symbol": "yd",
        "group": "Length",
        "system": "customary",
    },
    "mile": {
        "label": "Mile",
        "symbol": "mi",
        "group": "Length",
        "system": "customary",
    },

    # Area
    "square_meter": {
        "label": "Square meter",
        "symbol": "m²",
        "group": "Area",
        "system": "metric",
    },
    "square_inch": {
        "label": "Square inch",
        "symbol": "in²",
        "group": "Area",
        "system": "customary",
    },
    "square_foot": {
        "label": "Square foot",
        "symbol": "ft²",
        "group": "Area",
        "system": "customary",
    },
    "square_yard": {
        "label": "Square yard",
        "symbol": "yd²",
        "group": "Area",
        "system": "customary",
    },

    # Cubic customary
    "cubic_inch": {
        "label": "Cubic inch",
        "symbol": "in³",
        "group": "Volume",
        "system": "customary",
    },
    "cubic_foot": {
        "label": "Cubic foot",
        "symbol": "ft³",
        "group": "Volume",
        "system": "customary",
    },

    # Energy
    "watt_hour": {
        "label": "Watt-hour",
        "symbol": "Wh",
        "group": "Energy",
        "system": "neutral",
    },
    "kilowatt_hour": {
        "label": "Kilowatt-hour",
        "symbol": "kWh",
        "group": "Energy",
        "system": "neutral",
    },

    "other": {
        "label": "Other",
        "symbol": None,
        "group": "Other",
        "system": "neutral",
    },
}


CATEGORY_ALIASES: dict[str, str] = {
    "food": "food",
    "mat": "food",

    "water": "water",
    "vatten": "water",
    "drink": "water",

    "medicine": "medicine",
    "medicin": "medicine",
    "läkemedel": "medicine",
    "lakemedel": "medicine",

    "first aid": "first_aid",
    "first_aid": "first_aid",
    "första hjälpen": "first_aid",
    "forsta hjalpen": "first_aid",

    "hygiene": "hygiene",
    "hygien": "hygiene",

    "lighting": "lighting",
    "belysning": "lighting",

    "power": "power",
    "ström": "power",
    "strom": "power",
    "el": "power",

    "communication": "communication",
    "kommunikation": "communication",

    "fire safety": "fire_safety",
    "fire_safety": "fire_safety",
    "brandskydd": "fire_safety",

    "tools": "tools",
    "verktyg": "tools",

    "shelter & warmth": "shelter_warmth",
    "shelter_warmth": "shelter_warmth",
    "värme": "shelter_warmth",
    "varme": "shelter_warmth",

    "cooking": "cooking",
    "matlagning": "cooking",

    "documents": "documents",
    "dokument": "documents",

    "cash": "cash",
    "kontanter": "cash",

    "pet supplies": "pet_supplies",
    "pet_supplies": "pet_supplies",
    "husdjur": "pet_supplies",

    "other": "other",
    "övrigt": "other",
    "ovrigt": "other",
}


ITEM_TYPE_ALIASES: dict[str, str] = {
    "consumable": "consumable",
    "förbrukningsvara": "consumable",
    "forbrukningsvara": "consumable",

    "equipment": "equipment",
    "utrustning": "equipment",
}


UNIT_ALIASES: dict[str, str] = {
    "piece": "piece",
    "pieces": "piece",
    "pcs": "piece",
    "pc": "piece",
    "st": "piece",
    "styck": "piece",

    "pair": "pair",
    "par": "pair",

    "set": "set",

    "dozen": "dozen",
    "doz": "dozen",

    "pack": "pack",
    "package": "pack",
    "paket": "pack",
    "förpackning": "pack",
    "forpackning": "pack",

    "box": "box",
    "låda": "box",
    "lada": "box",

    "carton": "carton",
    "kartong": "carton",

    "bag": "bag",
    "påse": "bag",
    "pase": "bag",

    "bottle": "bottle",
    "flaska": "bottle",

    "can": "can",
    "burk": "can",

    "tube": "tube",
    "tub": "tube",

    "roll": "roll",
    "rulle": "roll",

    "sheet": "sheet",
    "ark": "sheet",

    "bucket": "bucket",
    "hink": "bucket",

    "canister": "canister",
    "dunk": "canister",

    "blister pack": "blister_pack",
    "blister_pack": "blister_pack",
    "tablettkarta": "blister_pack",

    "tablet": "tablet",
    "tablett": "tablet",

    "capsule": "capsule",
    "kapsel": "capsule",

    "dose": "dose",
    "dos": "dose",

    "portion": "portion",
    "meal": "meal",
    "serving": "serving",

    "ml": "milliliter",
    "milliliter": "milliliter",

    "cl": "centiliter",
    "centiliter": "centiliter",

    "dl": "deciliter",
    "deciliter": "deciliter",

    "l": "liter",
    "liter": "liter",
    "litre": "liter",

    "m3": "cubic_meter",
    "m³": "cubic_meter",
    "kubik": "cubic_meter",
    "kubikmeter": "cubic_meter",

    "mg": "milligram",
    "milligram": "milligram",

    "g": "gram",
    "gram": "gram",

    "kg": "kilogram",
    "kilogram": "kilogram",

    "oz": "ounce",
    "ounce": "ounce",

    "lb": "pound",
    "lbs": "pound",
    "pound": "pound",

    "stone": "stone",

    "mm": "millimeter",
    "millimeter": "millimeter",

    "cm": "centimeter",
    "centimeter": "centimeter",

    "m": "meter",
    "meter": "meter",

    "km": "kilometer",
    "kilometer": "kilometer",

    "in": "inch",
    "inch": "inch",

    "ft": "foot",
    "foot": "foot",
    "feet": "foot",

    "yd": "yard",
    "yard": "yard",

    "mi": "mile",
    "mile": "mile",

    "wh": "watt_hour",
    "watt-hour": "watt_hour",

    "kwh": "kilowatt_hour",
    "kilowatt-hour": "kilowatt_hour",

    "other": "other",
    "övrigt": "other",
    "ovrigt": "other",
}


def _key(value: Any) -> str:
    """Normalize a taxonomy lookup value."""

    if value is None:
        return ""

    return str(value).strip().casefold()


def normalize_category(value: Any) -> str:
    """Normalize category."""

    raw = str(value or "").strip()

    if raw in CATEGORIES:
        return raw

    return CATEGORY_ALIASES.get(
        _key(raw),
        raw,
    )


def normalize_item_type(value: Any) -> str:
    """Normalize item type."""

    raw = str(value or "").strip()

    if raw in ITEM_TYPES:
        return raw

    return ITEM_TYPE_ALIASES.get(
        _key(raw),
        raw,
    )


def normalize_unit(value: Any) -> str:
    """Normalize unit."""

    raw = str(value or "").strip()

    if raw in UNITS:
        return raw

    return UNIT_ALIASES.get(
        _key(raw),
        raw,
    )


def validate_category(value: Any) -> str:
    """Validate category."""

    normalized = normalize_category(value)

    if normalized not in CATEGORIES:
        raise ValueError(
            f"Unknown HomePrep category: {value}"
        )

    return normalized


def validate_item_type(value: Any) -> str:
    """Validate item type."""

    normalized = normalize_item_type(value)

    if normalized not in ITEM_TYPES:
        raise ValueError(
            f"Unknown HomePrep item type: {value}"
        )

    return normalized


def validate_unit(value: Any) -> str:
    """Validate unit."""

    normalized = normalize_unit(value)

    if normalized not in UNITS:
        raise ValueError(
            f"Unknown HomePrep unit: {value}"
        )

    return normalized


def get_taxonomy() -> dict[str, Any]:
    """Return taxonomy for frontend clients."""

    return {
        "categories": [
            {
                "id": category_id,
                "label": label,
                "group": CATEGORY_GROUPS.get(
                    category_id,
                    "Other",
                ),
                "default_unit": (
                    CATEGORY_SMART.get(
                        category_id,
                        {},
                    ).get(
                        "default_unit"
                    )
                ),
                "preferred_units": (
                    CATEGORY_SMART.get(
                        category_id,
                        {},
                    ).get(
                        "preferred_units",
                        [],
                    )
                ),
            }
            for category_id, label
            in CATEGORIES.items()
        ],

        "item_types": [
            {
                "id": item_type_id,
                "label": label,
            }
            for item_type_id, label
            in ITEM_TYPES.items()
        ],

        "units": [
            {
                "id": unit_id,
                "label": data["label"],
                "symbol": data["symbol"],
                "group": data["group"],
                "system": data["system"],
            }
            for unit_id, data
            in UNITS.items()
        ],
    }
