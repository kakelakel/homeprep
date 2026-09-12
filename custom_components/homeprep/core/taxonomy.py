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


ITEM_TYPES: dict[str, str] = {
    "consumable": "Consumable",
    "equipment": "Equipment",
}


UNITS: dict[str, dict[str, str | None]] = {
    # General counts
    "piece": {
        "label": "Piece",
        "symbol": "pcs",
    },
    "pair": {
        "label": "Pair",
        "symbol": None,
    },
    "set": {
        "label": "Set",
        "symbol": None,
    },

    # Packaging
    "pack": {
        "label": "Pack",
        "symbol": None,
    },
    "box": {
        "label": "Box",
        "symbol": None,
    },
    "carton": {
        "label": "Carton",
        "symbol": None,
    },
    "crate": {
        "label": "Crate",
        "symbol": None,
    },
    "bag": {
        "label": "Bag",
        "symbol": None,
    },
    "sachet": {
        "label": "Sachet",
        "symbol": None,
    },
    "bottle": {
        "label": "Bottle",
        "symbol": None,
    },
    "can": {
        "label": "Can",
        "symbol": None,
    },
    "jar": {
        "label": "Jar",
        "symbol": None,
    },
    "tube": {
        "label": "Tube",
        "symbol": None,
    },
    "roll": {
        "label": "Roll",
        "symbol": None,
    },
    "sheet": {
        "label": "Sheet",
        "symbol": None,
    },
    "bucket": {
        "label": "Bucket",
        "symbol": None,
    },
    "canister": {
        "label": "Canister",
        "symbol": None,
    },

    # Medicine / first aid
    "blister_pack": {
        "label": "Blister pack",
        "symbol": None,
    },
    "tablet": {
        "label": "Tablet",
        "symbol": None,
    },
    "capsule": {
        "label": "Capsule",
        "symbol": None,
    },
    "dose": {
        "label": "Dose",
        "symbol": None,
    },
    "ampoule": {
        "label": "Ampoule",
        "symbol": None,
    },
    "vial": {
        "label": "Vial",
        "symbol": None,
    },

    # Food
    "portion": {
        "label": "Portion",
        "symbol": None,
    },
    "meal": {
        "label": "Meal",
        "symbol": None,
    },
    "serving": {
        "label": "Serving",
        "symbol": None,
    },

    # Volume
    "milliliter": {
        "label": "Milliliter",
        "symbol": "ml",
    },
    "centiliter": {
        "label": "Centiliter",
        "symbol": "cl",
    },
    "deciliter": {
        "label": "Deciliter",
        "symbol": "dl",
    },
    "liter": {
        "label": "Liter",
        "symbol": "L",
    },
    "cubic_meter": {
        "label": "Cubic meter",
        "symbol": "m³",
    },

    # Mass
    "gram": {
        "label": "Gram",
        "symbol": "g",
    },
    "kilogram": {
        "label": "Kilogram",
        "symbol": "kg",
    },

    # Length
    "centimeter": {
        "label": "Centimeter",
        "symbol": "cm",
    },
    "meter": {
        "label": "Meter",
        "symbol": "m",
    },

    # Area
    "square_meter": {
        "label": "Square meter",
        "symbol": "m²",
    },

    # Energy
    "watt_hour": {
        "label": "Watt-hour",
        "symbol": "Wh",
    },
    "kilowatt_hour": {
        "label": "Kilowatt-hour",
        "symbol": "kWh",
    },

    # Generic fallback
    "other": {
        "label": "Other",
        "symbol": None,
    },
}


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
    # Piece
    "piece": "piece",
    "pieces": "piece",
    "pcs": "piece",
    "pc": "piece",
    "st": "piece",
    "styck": "piece",

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

    # Volume
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

    # Mass
    "g": "gram",
    "gram": "gram",

    "kg": "kilogram",
    "kilogram": "kilogram",

    # Length
    "cm": "centimeter",
    "centimeter": "centimeter",

    "m": "meter",
    "meter": "meter",

    # Area
    "m2": "square_meter",
    "m²": "square_meter",
    "square meter": "square_meter",
    "square_meter": "square_meter",

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


def _key(value: Any) -> str:
    """Normalize a taxonomy lookup value."""

    if value is None:
        return ""

    return str(value).strip().casefold()


def normalize_category(value: Any) -> str:
    """Normalize a category value."""

    raw = str(value or "").strip()

    if raw in CATEGORIES:
        return raw

    return CATEGORY_ALIASES.get(
        _key(raw),
        raw,
    )


def normalize_item_type(value: Any) -> str:
    """Normalize an item type value."""

    raw = str(value or "").strip()

    if raw in ITEM_TYPES:
        return raw

    return ITEM_TYPE_ALIASES.get(
        _key(raw),
        raw,
    )


def normalize_unit(value: Any) -> str:
    """Normalize a unit value."""

    raw = str(value or "").strip()

    if raw in UNITS:
        return raw

    return UNIT_ALIASES.get(
        _key(raw),
        raw,
    )


def validate_category(value: Any) -> str:
    """Return a valid canonical category."""

    normalized = normalize_category(value)

    if normalized not in CATEGORIES:
        raise ValueError(
            f"Unknown HomePrep category: {value}"
        )

    return normalized


def validate_item_type(value: Any) -> str:
    """Return a valid canonical item type."""

    normalized = normalize_item_type(value)

    if normalized not in ITEM_TYPES:
        raise ValueError(
            f"Unknown HomePrep item type: {value}"
        )

    return normalized


def validate_unit(value: Any) -> str:
    """Return a valid canonical unit."""

    normalized = normalize_unit(value)

    if normalized not in UNITS:
        raise ValueError(
            f"Unknown HomePrep unit: {value}"
        )

    return normalized


def get_taxonomy() -> dict[str, Any]:
    """Return taxonomy data for frontend clients."""

    return {
        "categories": [
            {
                "id": item_id,
                "label": label,
            }
            for item_id, label
            in CATEGORIES.items()
        ],
        "item_types": [
            {
                "id": item_id,
                "label": label,
            }
            for item_id, label
            in ITEM_TYPES.items()
        ],
        "units": [
            {
                "id": item_id,
                "label": data["label"],
                "symbol": data["symbol"],
            }
            for item_id, data
            in UNITS.items()
        ],
    }
