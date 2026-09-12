"""Canonical taxonomy definitions for HomePrep."""

from typing import Any


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Item types
# ---------------------------------------------------------------------------

ITEM_TYPES: dict[str, str] = {
    "consumable": "Consumable",
    "equipment": "Equipment",
}


# ---------------------------------------------------------------------------
# Units
#
# system:
#   neutral       = not tied to a measurement system
#   metric        = SI / metric
#   customary     = shared customary units used in both US and UK contexts
#   us_customary  = US-specific units
#   imperial      = UK Imperial-specific units
# ---------------------------------------------------------------------------

UNITS: dict[str, dict[str, str | None]] = {
    # -----------------------------------------------------------------------
    # Count
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Packaging
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Medicine / first aid
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Food
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Metric volume
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # US customary volume
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Imperial volume
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Metric mass
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Customary / Imperial mass
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Metric length
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Customary length
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Metric area
    # -----------------------------------------------------------------------

    "square_meter": {
        "label": "Square meter",
        "symbol": "m²",
        "group": "Area",
        "system": "metric",
    },

    # -----------------------------------------------------------------------
    # Customary area
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Customary cubic volume
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Energy
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # Other
    # -----------------------------------------------------------------------

    "other": {
        "label": "Other",
        "symbol": None,
        "group": "Other",
        "system": "neutral",
    },
}


# ---------------------------------------------------------------------------
# Legacy aliases
# ---------------------------------------------------------------------------

CATEGORY_ALIASES: dict[str, str] = {
    "food": "food",
    "mat": "food",

    "water": "water",
    "vatten": "water",
    "drink": "water",
    "dryck": "water",

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
    # Count
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

    # Packaging
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

    "crate": "crate",

    "bag": "bag",
    "påse": "bag",
    "pase": "bag",

    "sachet": "sachet",

    "bottle": "bottle",
    "flaska": "bottle",

    "can": "can",
    "burk": "can",

    "jar": "jar",

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

    # Medicine
    "blister pack": "blister_pack",
    "blister_pack": "blister_pack",
    "tablettkarta": "blister_pack",
    "blister": "blister_pack",

    "tablet": "tablet",
    "tablett": "tablet",

    "capsule": "capsule",
    "kapsel": "capsule",

    "dose": "dose",
    "dos": "dose",

    "ampoule": "ampoule",
    "ampull": "ampoule",

    "vial": "vial",

    # Food
    "portion": "portion",

    "meal": "meal",
    "måltid": "meal",
    "maltid": "meal",

    "serving": "serving",

    # Metric volume
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
    "cubic meter": "cubic_meter",
    "cubic_meter": "cubic_meter",

    # US volume
    "fluid_ounce_us": "fluid_ounce_us",
    "us fluid ounce": "fluid_ounce_us",

    "cup_us": "cup_us",
    "us cup": "cup_us",

    "pint_us": "pint_us",
    "us pint": "pint_us",

    "quart_us": "quart_us",
    "us quart": "quart_us",

    "gallon_us": "gallon_us",
    "us gallon": "gallon_us",

    # Imperial volume
    "fluid_ounce_imperial": "fluid_ounce_imperial",
    "imperial fluid ounce": "fluid_ounce_imperial",

    "pint_imperial": "pint_imperial",
    "imperial pint": "pint_imperial",

    "quart_imperial": "quart_imperial",
    "imperial quart": "quart_imperial",

    "gallon_imperial": "gallon_imperial",
    "imperial gallon": "gallon_imperial",

    # Metric mass
    "mg": "milligram",
    "milligram": "milligram",

    "g": "gram",
    "gram": "gram",

    "kg": "kilogram",
    "kilogram": "kilogram",

    # Customary mass
    "oz": "ounce",
    "ounce": "ounce",

    "lb": "pound",
    "lbs": "pound",
    "pound": "pound",

    "stone": "stone",

    # Metric length
    "mm": "millimeter",
    "millimeter": "millimeter",

    "cm": "centimeter",
    "centimeter": "centimeter",

    "m": "meter",
    "meter": "meter",

    "km": "kilometer",
    "kilometer": "kilometer",

    # Customary length
    "in": "inch",
    "inch": "inch",

    "ft": "foot",
    "foot": "foot",
    "feet": "foot",

    "yd": "yard",
    "yard": "yard",

    "mi": "mile",
    "mile": "mile",

    # Area
    "m2": "square_meter",
    "m²": "square_meter",
    "square meter": "square_meter",
    "square_meter": "square_meter",

    "in2": "square_inch",
    "in²": "square_inch",
    "square inch": "square_inch",

    "ft2": "square_foot",
    "ft²": "square_foot",
    "square foot": "square_foot",

    "yd2": "square_yard",
    "yd²": "square_yard",
    "square yard": "square_yard",

    # Cubic customary
    "in3": "cubic_inch",
    "in³": "cubic_inch",
    "cubic inch": "cubic_inch",

    "ft3": "cubic_foot",
    "ft³": "cubic_foot",
    "cubic foot": "cubic_foot",

    # Energy
    "wh": "watt_hour",
    "watt-hour": "watt_hour",
    "watt_hour": "watt_hour",

    "kwh": "kilowatt_hour",
    "kilowatt-hour": "kilowatt_hour",
    "kilowatt_hour": "kilowatt_hour",

    # Generic
    "other": "other",
    "övrigt": "other",
    "ovrigt": "other",
}


# ---------------------------------------------------------------------------
# Normalization and validation
# ---------------------------------------------------------------------------

def _key(value: Any) -> str:
    """Normalize a taxonomy lookup value."""

    if value is None:
        return ""

    return str(value).strip().casefold()


def normalize_category(value: Any) -> str:
    """Normalize a category value."""

    raw = str(
        value or ""
    ).strip()

    if raw in CATEGORIES:
        return raw

    return CATEGORY_ALIASES.get(
        _key(raw),
        raw,
    )


def normalize_item_type(value: Any) -> str:
    """Normalize an item type value."""

    raw = str(
        value or ""
    ).strip()

    if raw in ITEM_TYPES:
        return raw

    return ITEM_TYPE_ALIASES.get(
        _key(raw),
        raw,
    )


def normalize_unit(value: Any) -> str:
    """Normalize a unit value."""

    raw = str(
        value or ""
    ).strip()

    if raw in UNITS:
        return raw

    return UNIT_ALIASES.get(
        _key(raw),
        raw,
    )


def validate_category(value: Any) -> str:
    """Return a valid canonical category."""

    normalized = normalize_category(
        value
    )

    if normalized not in CATEGORIES:
        raise ValueError(
            f"Unknown HomePrep category: {value}"
        )

    return normalized


def validate_item_type(value: Any) -> str:
    """Return a valid canonical item type."""

    normalized = normalize_item_type(
        value
    )

    if normalized not in ITEM_TYPES:
        raise ValueError(
            f"Unknown HomePrep item type: {value}"
        )

    return normalized


def validate_unit(value: Any) -> str:
    """Return a valid canonical unit."""

    normalized = normalize_unit(
        value
    )

    if normalized not in UNITS:
        raise ValueError(
            f"Unknown HomePrep unit: {value}"
        )

    return normalized


# ---------------------------------------------------------------------------
# Frontend taxonomy
# ---------------------------------------------------------------------------

def get_taxonomy() -> dict[str, Any]:
    """Return taxonomy data for frontend clients."""

    return {
        "categories": [
            {
                "id": category_id,
                "label": label,
                "group": CATEGORY_GROUPS.get(
                    category_id,
                    "Other",
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
